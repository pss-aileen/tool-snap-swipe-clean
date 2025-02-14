const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const IMAGE_DIR = path.join(__dirname, 'public/images');
const TRASH_DIR = path.join(__dirname, 'public/trash');

// 静的ファイルを提供（フロントエンド）
app.use(express.static('public'));
app.use(express.json()); // JSONデータの受け取り

// 📌 画像一覧を取得するAPI
app.get('/get-images', (req, res) => {
  fs.readdir(IMAGE_DIR, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to load images' });
    }
    res.json(files);
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
