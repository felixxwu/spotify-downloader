import process from 'node:process';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
import { createFilePath, findFile } from './file.js';
import { retry } from './retry.js';
import { RMSTarget } from './config.js';

const execute = util.promisify(exec);

export async function normalise(playlist, filename, ytid) {
  await retry(5, 10, async () => {
    const { path, meta } = findFile(playlist, ytid);

    if (meta.normalised) return;
    process.stdout.write(`Reading RMS ... `);

    const rms = await getStat('RMS lev dB', path);
    const peak = await getStat('Pk lev dB', path);
    const dbChange = Math.min(-peak, RMSTarget - rms);
    const mult = Math.pow(10, dbChange / 20);
    // process.stdout.write(`rms ${rms} peak ${peak} dbChange ${dbChange} `)
    await normaliseFile(path, mult);
    fs.renameSync(path, createFilePath(playlist, { ...meta, normalised: true }));
  });
}

async function getStat(statName, path) {
  const stdout = await execute(`sox "${path}" -n stats`);
  const statRow = stdout.stderr.split('\n').find(row => row.slice(0, statName.length) === statName);
  return statRow
    .split(' ')
    .map(x => parseFloat(x))
    .find(x => !isNaN(x));
}

async function normaliseFile(path, mult) {
  if (mult === 1) return;
  process.stdout.write(`Normalising ... `);
  await execute(`sox -v ${mult} "${path}" "${path} (temp).flac"`);
  fs.renameSync(`${path} (temp).flac`, path);
}
