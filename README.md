# Usage

## Setup

Edit `playlists.js` to set the Spotify playlists that you want to download.

```jsx
{
  url: '<copy the share link from spotify>',
  name: '<can be anything, this will be the name of the folder that is created>'
}
```

## Run

Open the folder in a terminal and run `node index.js`. The script is designed to be re-run anytime, even if the previous
run was cancelled or got stuck. Any files that are already downloaded will not be downloaded again.

Run the script again if your playlist changes, only new songs will be downloaded and anything that was removed from
the playlist will also be deleted.

## Download location

By default, the files will be downloaded into a folder called `download` in this directory. To change it, change `downloadFolder` in `config.js`. For example, if you want to download the files straight to an external drive, set it to something like `E:/download`.

## Rate limits

The main bottleneck if you are downloading hundreds of videos is YouTube, they will start to suspect bot activity if you download too quickly and will start to limit your activity. A safe rate from my testing is ~60 per hour (change this by setting `youtubeDownloadsPerHour` in `config.js` if you want). This rate may be increased using Firefox cookies, but may be more risky (see Firefox section in Dependencies below).

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

yt-dlp is popular and well-maintained command line audio/video downloader used to download and convert songs from YouTube. (https://github.com/yt-dlp/yt-dlp)

Linux / MacOS
`brew install yt-dlp`

Windows:
`winget yt-dlp`

## ffmpeg

https://ffmpeg.org/
(must be added to PATH)

or `brew install ffmpeg`

## SoX (Sound eXchange) (optional, default: true)

Windows
https://sourceforge.net/projects/sox/
(must be added to PATH)

Linux / MacOS
`brew install sox`

Used to read the RMS of the downloaded files and normalise them. To turn off set `useNormalisation` to `false` in `config.js`

## Firefox (optional, default: false)

Some videos will require you to provide a login to download, it may be that the video is age-restricted or YouTube is suspecting bot activity. yt-dlp can use your account credentials from Firefox cookies (https://github.com/yt-dlp/yt-dlp/wiki/FAQ#how-do-i-pass-cookies-to-yt-dlp) to download these videos. To enable this, make sure you have Firefox installed, and that you are logged into YouTube with a Google account (Firefox does not need to be open). Then set `useFirefoxCookies` to `true` in `config.js`. With this setting enabled, the script will first try to download using an anonymous account, and only if that fails will it use the authenticated account. The rate limit set by `youtubeDownloadsPerHour` will apply independently.

CAUTION: if your download rate is set too high with `useFirefoxCookies` set to `true`, you might risk your Google account being temporarily suspended from watching videos on any device for a few days. I would recommend using a Google account that you don't watch YouTube with, or create a new one.
