import process from 'node:process';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';

const execute = util.promisify(exec);

const target = -12;

export async function normalise(playlist, filename, ytid) {
  process.stdout.write(`Reading RMS ... `);

  try {
    const path = `download/${playlist.name}/${filename} [${ytid}].flac`;
    const rms = await getStat('RMS lev dB', path);
    const peak = await getStat('Pk lev dB', path);
    const dbChange = Math.min(-peak, target - rms);
    const mult = Math.pow(10, dbChange / 20);
    // process.stdout.write(`rms ${rms} peak ${peak} dbChange ${dbChange} `)
    await normaliseFile(path, mult);
  } catch (e) {
    process.stdout.write('Failed, retrying in 10s ... ');
    await new Promise(resolve => setTimeout(resolve, 10000));
    return await normalise(playlist, filename, ytid);
  }
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
