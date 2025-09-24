import fs from 'fs';
import process from 'node:process';

export async function searchYouTube(query, playlist) {
  const mapping = getMapping(playlist);
  const ytid = mapping.find(localTrack => localTrack.name === query)?.ytid;
  // local cache hit, return early
  if (ytid) return ytid;

  try {
    process.stdout.write('Searching ... ');
    fs.mkdirSync('mappings', { recursive: true });

    const res = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);
    const data = await res.text();
    const queriedYTID = data.split('watch?')[1].slice(2, 13);
    mapping.push({
      name: query,
      ytid: queriedYTID,
    });

    fs.writeFileSync(`mappings/${playlist.name}.json`, JSON.stringify(mapping), 'utf8');
    return queriedYTID;
  } catch (e) {
    console.log('');
    console.log(e);
    console.log('');
    process.stdout.write('Failed, trying again in 10s... ');
    await new Promise(resolve => setTimeout(resolve, 10000));
    return await searchYouTube(query, playlist);
  }
}

export function getMapping(playlist) {
  try {
    return JSON.parse(fs.readFileSync(`mappings/${playlist.name}.json`, 'utf8'));
  } catch (e) {
    return [];
  }
}
