// ColorfulDrop Leaderboard Server
// デプロイ先: Render.com (無料) など
//
// === セットアップ手順 ===
// 1. GitHubにリポジトリを作成し、server.js と package.json をアップロード
// 2. https://render.com でGitHubアカウントでサインアップ
// 3. 「New +」→「Web Service」→ GitHubリポジトリを接続
// 4. Build Command: npm install / Start Command: node server.js / Instance Type: Free
// 5. デプロイ完了後のURLをコピー（例: https://your-project.onrender.com）
// 6. ColorfulDrop.html の API_URL をそのURLに書き換え

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, "leaderboard.json");

function loadBoard() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    }
  } catch (e) {}
  return [];
}

function saveBoard(board) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(board, null, 2));
}

// ランキング取得
app.get("/api/leaderboard", (req, res) => {
  res.json(loadBoard());
});

// スコア登録
app.post("/api/leaderboard", (req, res) => {
  const { name, score, level } = req.body;
  if (!name || typeof score !== "number") {
    return res.status(400).json({ error: "name and score required" });
  }
  const board = loadBoard();
  board.push({
    name: String(name).slice(0, 12),
    score: Math.floor(score),
    level: level || 1,
    date: new Date().toISOString().slice(0, 10),
  });
  board.sort((a, b) => b.score - a.score);
  const top = board.slice(0, 50);
  saveBoard(top);
  res.json(top);
});

// ヘルスチェック
app.get("/", (req, res) => {
  res.send("ColorfulDrop Leaderboard Server is running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Leaderboard server running on port ${PORT}`);
});
