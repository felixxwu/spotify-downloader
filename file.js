import fs from 'fs';

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
