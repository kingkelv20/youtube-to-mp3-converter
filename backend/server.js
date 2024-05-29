const express = require('express');
const bodyParser = require('body-parser');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Endpoint for conversion
app.post('/convert', async (req, res) => {
  try {
    const { url } = req.body;

    // Validate YouTube URL
    if (!ytdl.validateURL(url)) {
      throw new Error('Invalid YouTube URL');
    }

    // Fetch video info
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, ''); // Remove special characters
    const outputDir = path.join(__dirname, 'output');
    const outputPath = path.join(outputDir, `${title}.mp3`);

    // Create output directory if not exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // Convert to MP3
    ffmpeg()
      .input(url)
      .on('error', (err) => {
        throw new Error(err.message);
      })
      .outputOptions('-f mp3')
      .output(outputPath)
      .on('end', () => {
        console.log('Conversion complete');
        res.json({ downloadURL: `/download/${title}.mp3` });
      })
      .run();
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ error: err.message });
  }
});

// Endpoint for downloading MP3 file
app.get('/download/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, 'output', filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

