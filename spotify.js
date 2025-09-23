import { getToken } from './getToken.js'

const v1 = 'https://api.spotify.com/v1'

/**
 * @param endpoint {string}
 * @returns {Promise<void>}
 */
export async function spotifyAPI(endpoint) {
  console.log('Query Spotify:', endpoint)

  try {
    const token = await getToken()
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer  ${token}`,
      },
    })
    const data = (await response.json())
    if (!data.items) {
      throw Error('Spotify failed to fetch tracks.')
    }
    return data
  } catch (e) {
    console.error(e)
    console.log('Spotify request failed, trying again in 100s')
    await new Promise(resolve => setTimeout(resolve, 100000))
    return spotifyAPI(endpoint)
  }
}

async function fetchSpotifyUntilNextIsNull(endpoint) {
  const data = await spotifyAPI(endpoint)

  if (data.next === null) {
    return data.items
  } else {
    const nextItems = await fetchSpotifyUntilNextIsNull(data.next)
    return data.items.concat(nextItems)
  }
}

/**
 * @param playlistId
 * @returns {Promise<{spid: string, name: string}[]>}
 */
export async function listSpotifyPlaylistTracks(playlistId) {
  const items = await fetchSpotifyUntilNextIsNull(`${v1}/playlists/${playlistId}/tracks`)
  console.log('Loaded', items.length, 'tracks from Spotify')

  return items.filter(Boolean).map(item => {
    return ({
      spid: item.track.id,
      name: `${item.track?.artists?.map(artist => artist.name)} - ${item.track.name}`,
    })
  })
}
