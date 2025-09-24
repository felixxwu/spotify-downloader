import fs from 'fs';
import process from 'node:process';
import { sleepDurationBetweenDownloads, useFirefoxCookies } from './config.js';
import { exec } from 'child_process';
import util from 'util';
import { createFilePath, getDownloadedFiles } from './file.js';
import { retry } from './retry.js';

const execute = util.promisify(exec);

/**
 *
 * @param ytid {string}
 * @returns {Promise<void>}
 */
export async function ytdlp(ytid, playlist, filename) {
  await retry(5, 10, async () => {
    fs.mkdirSync('download', { recursive: true });
    fs.mkdirSync(`download/${playlist.name}`, { recursive: true });
    const downloadedFiles = getDownloadedFiles(playlist);
    if (downloadedFiles.find(file => file.ytid === ytid)) {
      return;
    }
    process.stdout.write('Downloading ... ');

    const options = `-f "bestaudio" -x --audio-format wav`;
    const output = `--output "${createFilePath(playlist, { name: filename, ytid, normalised: false })}"`;
    const url = `https://www.youtube.com/watch?v=${ytid}`;
    const cookies = useFirefoxCookies ? '--cookies-from-browser firefox' : '';
    await execute(`yt-dlp ${options} ${output} ${url} ${cookies}`);

    process.stdout.write('Sleeping ... ');
    await new Promise(resolve => setTimeout(resolve, sleepDurationBetweenDownloads));
  });
}
