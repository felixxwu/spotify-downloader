import { listSpotifyPlaylistTracks } from './spotify.js'
import { playlists } from './playlists.js'
import { getDownloadedFiles, ytdlp } from './ytdlp.js'
import { getMapping, searchYouTube } from './youtube.js'
import fs from 'fs'
import process from 'node:process'
import { normalise } from './normalise.js'
import { useNormalisation } from './confi.sg'

for (const playlist of playlists) {
  await processPlaylist(playlist)
}

async function processPlaylist(playlist) {
  console.log('Processing playlist:', playlist.name)
  const spotifyTracks = await listSpotifyPlaylistTracks(playlist.id)

  let i = 1
  for (const track of spotifyTracks) {

    const numSpaces = Math.max(0, 80 - track.name.length)
    const spaces = Array.from({ length: numSpaces }).join(' ')
    const zeros = i < 100 ? (i < 10 ? '00' : '0') : ''
    process.stdout.write(`(${zeros}${i++}/${spotifyTracks.length}) ${track.name} ${spaces}`)

    const ytid = await searchYouTube(track.name, playlist)
    await ytdlp(ytid, playlist, track.name)
    if (useNormalisation) await normalise(playlist, track.name, ytid)
    await new Promise(resolve => setTimeout(resolve, 50))
    process.stdout.write(`Done`)
    console.log('')
  }

  const downloadedFiles = getDownloadedFiles(playlist)
  for (const file of downloadedFiles) {
    if (!file.name || !file.ytid) continue
    const mapping = getMapping(playlist)
    const localTrackFound = mapping.find(localTrack => localTrack.ytid === file.ytid)
    if (!localTrackFound) {
      console.log('Deleting:', file.name)
      fs.unlinkSync(`download/${playlist.name}/${file.name} [${file.ytid}].flac`)
    }
  }

}