import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

// Serve all images and static files from the root
app.use(express.static(__dirname));

app.listen(PORT, () => {
  console.log(`Map-Bubbly server running at http://localhost:${PORT}`);
  console.log(`Serving files from: ${__dirname}`);
});
