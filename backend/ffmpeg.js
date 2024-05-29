const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ytdl = require('ytdl-core');
const path = require('path');
const fs = require('fs');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

/**
 * Convert a YouTube video URL to an MP3 file.
 * @param {string} videoUrl - The URL of the YouTube video.
 * @param {string} outputDir - The directory to save the output file.
 * @returns {Promise<string>} - The path to the saved MP3 file.
 */
const convertToMp3 = async (videoUrl, outputDir) => {
  return new Promise((resolve, reject) => {
    // Validate YouTube URL
    if (!ytdl.validateURL(videoUrl)) {
      return reject(new Error('Invalid YouTube URL'));
    }

    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    ytdl.getInfo(videoUrl)
      .then(info => {
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, ''); // Remove special characters
        const outputPath = path.join(outputDir, `${title}.mp3`);

        // Convert to MP3 using ffmpeg
        ffmpeg(ytdl(videoUrl))
          .audioBitrate(128)
          .save(outputPath)
          .on('end', () => resolve(outputPath))
          .on('error', reject);
      })
      .catch(reject);
  });
};

module.exports = { convertToMp3 };

