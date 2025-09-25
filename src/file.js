import fs from 'fs';
import { addToMapping, getMapping } from './youtube.js';

export function findFile(playlist, ytid) {
  const files = listFiles(playlist);
  const file = files.find(file => getFileMeta(file).ytid === ytid);
  return { path: `download/${playlist.name}/${file}`, meta: getFileMeta(file) };
}

export function createFilePath(playlist, meta) {
  return `download/${playlist.name}/${getSafeFilename(meta.name)} [${meta.ytid}${meta.normalised ? '#N' : ''}].wav`;
}

export function getFileMeta(filePath) {
  const extension = 'wav';
  const meta = filePath.split(']').at(-2).split('[').at(-1);
  const ytid = meta.split('#')[0];
  const normalised = meta.split('#')[1] === 'N';
  const name = filePath.slice(0, -(meta.length + 4 + extension.length));
  return { ytid, name, normalised };
}

export function getDownloadedFiles(playlist) {
  const files = listFiles(playlist);
  return files.map(file => getFileMeta(file));
}

export function getSafeFilename(filename) {
  return filename.replace(/[^a-zA-Z0-9\-\[\]\(\),]+/g, ' ');
}

export function listFiles(playlist) {
  return fs.readdirSync(`download/${playlist.name}`).filter(file => file.endsWith('.wav'));
}

/**
 *
 * @returns {{playlistName: string; mappings: {name: string, ytid: string}[]}[]}
 */
export function getAllMappings() {
  const playlistNames = fs.readdirSync(`mappings`);
  return playlistNames.map(playlistName => ({
    playlistName: playlistName.split('.json')[0],
    mappings: JSON.parse(fs.readFileSync(`mappings/${playlistName}`, 'utf8')),
  }));
}

export function findInAllFiles(filename) {
  const playlistMappings = getAllMappings();
  for (const playlistMapping of playlistMappings) {
    for (const mapping of playlistMapping.mappings) {
      if (mapping.name === filename)
        return {
          playlistName: playlistMapping.playlistName,
          ytid: mapping.ytid,
        };
    }
  }
  return null;
}

export function copyFile(sourcePlaylistName, destinationPlaylist, ytid) {
  try {
    const sourceFile = findFile({ name: sourcePlaylistName }, ytid);
    fs.copyFileSync(sourceFile.path, createFilePath(destinationPlaylist, sourceFile.meta));
    return true;
  } catch (e) {
    return false;
  }
}

export function copyFileIfAlreadyDownloaded(trackname, playlist) {
  const mapping = getMapping(playlist);
  const ytid = mapping.find(localTrack => localTrack.name === trackname)?.ytid;
  // local cache hit, return early
  if (ytid) return;

  const file = findInAllFiles(trackname);
  if (file) {
    const success = copyFile(file.playlistName, playlist, file.ytid);
    addToMapping(trackname, file.ytid, playlist);
    if (success) {
      process.stdout.write(`File already downloaded, copying ... `);
    }
  }
}
