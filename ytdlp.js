import fs from 'fs';
import process from 'node:process';
import { useFirefoxCookies } from './config.js';
import { exec } from 'child_process';
import util from 'util';

const execute = util.promisify(exec);

/**
 *
 * @param ytid {string}
 * @returns {Promise<void>}
 */
export async function ytdlp(ytid, playlist, filename) {
  fs.mkdirSync('download', { recursive: true });
  fs.mkdirSync(`download/${playlist.name}`, { recursive: true });
  const downloadedFiles = getDownloadedFiles(playlist);
  if (downloadedFiles.find(file => file.ytid === ytid)) {
    return;
  }
  process.stdout.write('Downloading ... ');
  try {
    const options = `--embed-thumbnail -f "bestaudio" -x --audio-format flac`;
    const output = `--output "download/${playlist.name}/${filename} [${ytid}].flac"`;
    const url = `https://www.youtube.com/watch?v=${ytid}`;
    const cookies = useFirefoxCookies ? '--cookies-from-browser firefox' : '';
    await execute(`yt-dlp ${options} ${output} ${url} ${cookies}`);
  } catch (e) {
    console.log(e);
    process.stdout.write('Failed, trying again in 10s... ');
    await new Promise(resolve => setTimeout(resolve, 10000));
    await ytdlp(ytid, playlist, filename);
  }
}

export function getDownloadedFiles(playlist) {
  const files = fs.readdirSync(`download/${playlist.name}`).filter(file => file.endsWith('.flac'));
  return files.map(file => ({ ytid: file.slice(-17, -6), name: file.slice(0, -19) }));
}

export function getSafeFilename(filename) {
  return filename
    .replace(/[^a-z0-9 \[\]()]]/gi, '_')
    .replaceAll('/', '_')
    .replaceAll(':', '_');
}
