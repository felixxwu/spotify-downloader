import { listSpotifyPlaylistTracks } from './spotify.js'
import { playlists } from './playlists.js'
import { getDownloadedFiles, ytdlp } from './ytdlp.js'
import { searchYouTube } from './youtube.js'
import fs from 'fs'
import process from 'node:process'

for (const playlist of playlists) {
  await processPlaylist(playlist)
}

async function processPlaylist(playlist) {
  const spotifyTracks = await listSpotifyPlaylistTracks(playlist.id)

  let i = 1
  for (const track of spotifyTracks) {

    process.stdout.write(`(${i++}/${spotifyTracks.length}) ${track.name}: `)
    const ytid = await searchYouTube(track.name, playlist)
    await ytdlp(ytid, playlist, track.name)
    await new Promise(resolve => setTimeout(resolve, 50))
    process.stdout.write(`Done.`)
    console.log('')
  }

  const downloadedFiles = getDownloadedFiles(playlist)
  for (const file of downloadedFiles) {
    if (!file.name || !file.ytid) continue
    const foundSpotifyTrack = spotifyTracks.find((track) => track.name === file.name)
    if (!foundSpotifyTrack) {
      console.log('Deleting:', file.name)
      fs.unlinkSync(`download/${playlist.name}/${file.name} [${file.ytid}].mp3`)
    }
  }

}