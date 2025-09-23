import { exec } from 'child_process'
import util from 'util'
import fs from 'fs'

const execute = util.promisify(exec)

/**
 *
 * @param ytid {string}
 * @returns {Promise<void>}
 */
export async function ytdlp(ytid, playlist, filename) {
  fs.mkdirSync('download', { recursive: true })
  fs.mkdirSync(`download/${playlist.name}`, { recursive: true })
  const downloadedFiles = getDownloadedFiles(playlist)
  if (downloadedFiles.find(file => file.ytid === ytid)) {
    return
  }
  console.log('Downloading:', filename)
  try {
    await execute(`yt-dlp -t mp3 --embed-thumbnail --output "download/${playlist.name}/${filename} [${ytid}].mp3" https://www.youtube.com/watch?v=${ytid}`)
  } catch (e) {
    console.error(e)
    console.log('Download failed, trying again in 10s')
    await new Promise(resolve => setTimeout(resolve, 10000))
    ytdlp(ytid, playlist, filename)
  }
}

export function getDownloadedFiles(playlist) {
  const files = fs.readdirSync(`download/${playlist.name}`)
  return files.map(file => ({ ytid: file.slice(-16, -5), name: file.slice(0, -18) }))
}