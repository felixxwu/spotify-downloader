import { listSpotifyPlaylistTracks } from './spotify.js'
import { playlists } from './playlists.js'
import { getDownloadedFiles, ytdlp } from './ytdlp.js'
import { searchYouTube } from './youtube.js'
import fs from 'fs'

for (const playlist of playlists) {
  await processPlaylist(playlist)
}

async function processPlaylist(playlist) {
  const spotifyTracks = await listSpotifyPlaylistTracks(playlist.id)

  for (const track of spotifyTracks) {
    const ytid = await searchYouTube(track.name, playlist)
    await ytdlp(ytid, playlist, track.name)
  }

  const downloadedFiles = getDownloadedFiles(playlist)
  for (const file of downloadedFiles) {
    const foundSpotifyTrack = spotifyTracks.find((track) => track.name === file.name)
    if (!foundSpotifyTrack) {
      console.log('Delete:', file.name)
      fs.unlinkSync(`downloads/${playlist.name}/${file.name} [${file.ytid}].mp3`)
    }
  }

}