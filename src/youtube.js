import fs from 'fs';
import process from 'node:process';
import { retry } from './retry.js';
import { maxRetries } from '../config.js';

export async function searchYouTube(trackname, playlist) {
  return await retry(maxRetries, 10, async () => {
    const mapping = getMapping(playlist);
    const ytid = mapping.find(localTrack => localTrack.name === trackname)?.ytid;
    // local cache hit, return early
    if (ytid) return ytid;
    if (ytid === null) {
      process.stdout.write('Skipping ... ');
      return null;
    }

    process.stdout.write('Searching ... ');
    fs.mkdirSync('mappings', { recursive: true });

    const res = await fetch(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(trackname)}&sp=EgIQAQ%253D%253D`
    );

    const data = await res.text();
    const links = data.split('watch?');

    if (links.length <= 1) {
      process.stdout.write('No videos found ... ');
      addToMapping(trackname, null, playlist);
      return null;
    }

    const queriedYTID = links[1].slice(2, 13);
    addToMapping(trackname, queriedYTID, playlist);
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

export function addToMapping(trackname, ytid, playlist) {
  const mapping = getMapping(playlist);

  mapping.push({
    name: trackname,
    ytid: ytid,
  });

  fs.writeFileSync(`mappings/${playlist.name}.json`, JSON.stringify(mapping), 'utf8');
}
