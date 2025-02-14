const express = require('express');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const app = express();
const IMAGE_DIR = path.join(__dirname, 'public/images');
const THUMB_DIR = path.join(__dirname, 'public/thumbnails');
const TRASH_DIR = path.join(__dirname, 'public/trash');

// 静的ファイルを提供（フロントエンド）
app.use(express.static('public'));
app.use('/images', express.static(IMAGE_DIR));
app.use('/thumbnails', express.static(THUMB_DIR));
app.use(express.json()); // JSONデータの受け取り

// 📌 サムネイル生成関数
async function generateThumbnails() {
  if (!fs.existsSync(THUMB_DIR)) {
    fs.mkdirSync(THUMB_DIR);
  }

  const files = await fs.readdir(IMAGE_DIR);
  for (const file of files) {
    const inputPath = path.join(IMAGE_DIR, file);
    const outputPath = path.join(THUMB_DIR, file);

    // .DS_Store 除外
    if (file === '.DS_Store') continue;

    // すでにサムネイルがあればスキップ
    if (fs.existsSync(outputPath)) continue;

    try {
      await sharp(inputPath)
        .resize(150, 150) // 幅150px、高さ150px
        .toFile(outputPath);
      console.log(`サムネイル生成: ${file}`);
    } catch (err) {
      console.error(`サムネイル生成失敗: ${file}`, err);
    }
  }
}

// 📌 サムネイル一覧取得API
app.get('/get-thumbnails', async (req, res) => {
  try {
    await generateThumbnails(); // 必要に応じてサムネイルを生成
    const files = await fs.readdir(THUMB_DIR);
    res.json(files.filter((file) => file !== '.DS_Store'));
  } catch (err) {
    res.status(500).json({ error: 'サムネイルの取得に失敗しました' });
  }
});

// サーバー起動時にサムネイル生成
generateThumbnails().then(() => {
  app.listen(3000, () => console.log('Server running on http://localhost:3000'));
});

// 📌 画像一覧を取得するAPI
app.get('/get-images', (req, res) => {
  fs.readdir(IMAGE_DIR, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to load images' });
    }
    // .DS_Store を除外
    const filteredFiles = files.filter((file) => file !== '.DS_Store');
    res.json(filteredFiles);
  });
});

// 📌 画像をゴミ箱フォルダに移動するAPI
app.post('/delete-images', (req, res) => {
  const { images } = req.body; // フロントエンドから送られた削除リスト

  if (!fs.existsSync(TRASH_DIR)) {
    fs.mkdirSync(TRASH_DIR); // ゴミ箱フォルダがなければ作成
  }

  images.forEach((image) => {
    const imagePath = path.join(IMAGE_DIR, image);
    const trashPath = path.join(TRASH_DIR, image);

    if (fs.existsSync(imagePath)) {
      fs.renameSync(imagePath, trashPath); // 画像を移動
    }
  });

  res.json({ message: '選択した画像をゴミ箱に移動しました！' });
});

// サーバー起動
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
