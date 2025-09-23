import { getToken } from './getToken.js'

/**
 * @param endpoint {string}
 * @returns {Promise<void>}
 */
export async function spotifyAPI(endpoint) {
  console.log('Query Spotify:', endpoint)
  await new Promise(resolve => setTimeout(resolve, 5000))

  try {
    const token = await getToken()
    const response = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer  ${token}`,
      },
    })
    const data = (await response.json())
    if (data.tracks.items) {
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

/**
 * @param playlistId
 * @returns {Promise<{spid: string, name: string}[]>}
 */
export async function listSpotifyPlaylistTracks(playlistId) {
  const data = await spotifyAPI(`playlists/${playlistId}`)
  console.log('Loaded', data.tracks.items.length, 'tracks from Spotify')

  return data.tracks.items.map(item => {
    return ({
      spid: item.track.id,
      name: `${item.track?.artists?.map(artist => artist.name)} - ${item.track.name}`,
    })
  })
}
