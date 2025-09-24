import fs from 'fs';
import process from 'node:process';
import { retry } from './retry.js';

export async function searchYouTube(trackname, playlist) {
  return await retry(5, 10, async () => {
    const mapping = getMapping(playlist);
    const ytid = mapping.find(localTrack => localTrack.name === trackname)?.ytid;
    // local cache hit, return early
    if (ytid) return ytid;

    process.stdout.write('Searching ... ');
    fs.mkdirSync('mappings', { recursive: true });

    const res = await fetch(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(trackname)}&sp=EgIQAQ%253D%253D`
    );
    const data = await res.text();
    const queriedYTID = data.split('watch?')[1].slice(2, 13);
    mapping.push({
      name: trackname,
      ytid: queriedYTID,
    });

    fs.writeFileSync(`mappings/${playlist.name}.json`, JSON.stringify(mapping), 'utf8');
    return queriedYTID;
  });
}

export function getMapping(playlist) {
  try {
    return JSON.parse(fs.readFileSync(`mappings/${playlist.name}.json`, 'utf8'));
  } catch (e) {
    return [];
  }
}
