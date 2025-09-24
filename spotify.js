import { spotifyQueriesPerMinute } from './config.js';
import { getToken } from './getToken.js';
import { triggerRateLimiter } from './rateLimit.js';
import { retry } from './retry.js';

const v1 = 'https://api.spotify.com/v1';

/**
 * @param endpoint {string}
 * @returns {Promise<void>}
 */
export async function spotifyAPI(endpoint) {
  return await retry(5, 10, async () => {
    process.stdout.write(`Querying Spotify: ${endpoint} - `);
    const token = await getToken();
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer  ${token}`,
      },
    });
    const data = await response.json();
    if (!data.items) {
      throw Error('Spotify failed to fetch tracks.');
    }

    await triggerRateLimiter('spotify', spotifyQueriesPerMinute, 'm');
    console.log('');
    return data;
  });
}

async function fetchSpotifyUntilNextIsNull(endpoint) {
  const data = await spotifyAPI(endpoint);

  if (data.next === null) {
    return data.items;
  } else {
    const nextItems = await fetchSpotifyUntilNextIsNull(data.next);
    return data.items.concat(nextItems);
  }
}

/**
 * @param playlistId
 * @returns {Promise<{spid: string, name: string}[]>}
 */
export async function listSpotifyPlaylistTracks(playlistId) {
  const items = await fetchSpotifyUntilNextIsNull(`${v1}/playlists/${playlistId}/tracks`);
  console.log('Loaded', items.length, 'tracks from Spotify');

  return items.filter(Boolean).map(item => {
    return {
      spid: item.track.id,
      name: `${item.track?.artists?.map(artist => artist.name).join(', ')} - ${item.track.name}`,
    };
  });
}
