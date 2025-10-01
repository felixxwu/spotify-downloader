import fs from 'fs';
import process from 'node:process';
import { youtubeDownloadsPerHour, useFirefoxCookies, maxRetries, downloadFolder } from '../config.js';
import { createFilePath, getDownloadedFiles } from './file.js';
import { retry } from './retry.js';
import { getCurrentRate, triggerRateLimiter } from './rateLimit.js';
import { execute } from './execute.js';

/**
 *
 * @param ytid {string}
 * @returns {Promise<void>}
 */
export async function ytdlp(ytid, playlist, filename) {
  if (ytid === null) return;

  await retry(maxRetries, 10, async retryCount => {
    fs.mkdirSync(downloadFolder, { recursive: true });
    fs.mkdirSync(`${downloadFolder}/${playlist.name}`, { recursive: true });
    const downloadedFiles = getDownloadedFiles(playlist);
    if (downloadedFiles.find(file => file.ytid === ytid)) {
      return;
    }

    const anonymousRate = getCurrentRate('yt', 'h');
    const wasRateLimited = anonymousRate >= youtubeDownloadsPerHour;
    const useCookies = useFirefoxCookies && (retryCount > 1 || wasRateLimited);
    if (useCookies) {
      await triggerRateLimiter('yt-cookies', youtubeDownloadsPerHour, 'h');
    } else {
      await triggerRateLimiter('yt', youtubeDownloadsPerHour, 'h');
    }

    process.stdout.write(`Downloading ${useCookies ? '(with cookies) ' : ''}... `);

    const options = `-f "bestaudio" -x --audio-format wav`;
    const output = `--output "${createFilePath(playlist, { name: filename, ytid, normalised: false })}"`;
    const url = `https://www.youtube.com/watch?v=${ytid}`;
    const cookies = useCookies ? '--cookies-from-browser firefox' : '';
    await execute(`yt-dlp ${options} ${output} ${url} ${cookies}`);
  });
}
