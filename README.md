# Usage

## Setup

Edit `playlists.js` to set the Spotify playlists that you want to download.

## Run

Open the folder in a terminal and run `node index.js`. The script is designed to be re-run anytime, even if the previous
run was cancelled or got stuck. Any files that are already downloaded will not be downloaded again.

Run the script again if your playlist changes, only new songs will be downloaded and anything that was removed from
the playlist will also be deleted.

## Incorrectly downloaded songs

The files are downloaded from YouTube based on a keyword search (`artist` - `title`), so it may not always find the
correct video to download from. If this is the case:

- Open the `mappings` folder
- Open the `json` file with the name of your playlist (in an IDE like VSCode)
- (Use the IDE's formatting tools to format the json - in VSCode it's `ctrl+shift+p > Format Document`)
- Locate the song that was incorrectly downloaded
- Search for the correct video on YouTube
- Copy the video id from the video (`https://www.youtube.com/watch?v=< id >`)
- Update the value of `ytid` for your song in the json file
- Re-run the script

Once the update has been made, the mapping will persist forever. The incorrectly downloaded file will also be deleted
when the script is next run.

# Dependencies

## Node js (v20 or later)

https://nodejs.org/

## yt-dlp

yt-dlp is used to download and convert songs from YouTube.

Linux / MacOS
`brew install yt-dlp`

Windows:
`winget yt-dlp`

## ffmpeg

https://ffmpeg.org/

or `brew install ffmpeg`

## SoX (Sound eXchange) (optional)

Windows
https://sourceforge.net/projects/sox/
(must be added to PATH)

Linux / MacOS
`brew install sox`

Used to read the RMS of the downloaded files and normalise them. This option is ENABLED by default, to turn it off set `useNormalisation` to `false` in `config.js`

## Firefox (optional)

yt-dlp has a workaround (https://github.com/yt-dlp/yt-dlp/wiki/FAQ#how-do-i-pass-cookies-to-yt-dlp) to get around
YouTube's rate limits when downloading videos. Without this workaround you will only be able to download a few hundred
videos before you get an error message saying that YouTube suspects you are a bot. To enable this workaround, just make
sure you have Firefox installed, and that you are logged into YouTube with a Google account, Firefox does not need to be
open. This workaround is DISABLED by default, to turn it on set `useFirefoxCookies` to `true` in `config.js`.
