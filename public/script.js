let images = [];
let currentIndex = 0;
let toDelete = [];

async function fetchImages() {
  const response = await fetch('/get-images');
  images = await response.json();
  console.log(images);
  showImage();

  const allImagesElement = document.getElementById('allImages');

  images.map((imgUrl, index) => {
    const li = document.createElement('li');
    const img = document.createElement('img');
    img.src = `./images/${images[index]}`;

    li.appendChild(img);
    allImagesElement.appendChild(li);
  });
}

function showImage() {
  if (currentIndex >= images.length) {
    document.getElementById('current-image').src = '';
    alert('すべての画像を分類しました！');
    return;
  }
  document.getElementById('current-image').src = `./images/${images[currentIndex]}`;
}

// 保留ボタン（次の画像へ）
document.getElementById('keep-btn').addEventListener('click', () => {
  currentIndex++;
  showImage();
});

// 削除ボタン（削除リストに追加）
document.getElementById('delete-btn').addEventListener('click', () => {
  toDelete.push(images[currentIndex]);
  currentIndex++;
  showImage();
});

// 選択した画像を削除
document.getElementById('delete-selected').addEventListener('click', async () => {
  const response = await fetch('/delete-images', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ images: toDelete }),
  });

  const result = await response.json();
  alert(result.message);
  toDelete = [];
  fetchImages();
});

// 初回読み込み
fetchImages();
