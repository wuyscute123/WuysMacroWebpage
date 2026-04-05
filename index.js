const fs = require("fs");
const path = require("path");

const mime = {
  ".html": "text/html",
  ".htm": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg",
};

export default {
  port: 15137,

  async fetch(req) {
    try {
      const url = new URL(req.url);
      let filePath = "." + decodeURIComponent(url.pathname);

      if (filePath === "./") filePath = "./index.html";

      if (!fs.existsSync(filePath)) {
        return new Response("404 Not Found", { status: 404 });
      }

      const stat = fs.statSync(filePath);
      const range = req.headers.get("range");

      const ext = path.extname(filePath).toLowerCase();
      const contentType = mime[ext] || "application/octet-stream";

      // --------------------------------------------------------
      // 🔥 Hỗ trợ Range cho video/mp3 (stream mượt)
      // --------------------------------------------------------
      if (range) {
        const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
        const start = parseInt(startStr, 10);
        const end = endStr ? parseInt(endStr, 10) : stat.size - 1;

        const chunkSize = end - start + 1;
        const file = Bun.file(filePath).slice(start, end + 1);

        return new Response(file, {
          status: 206,
          headers: {
            "Content-Range": `bytes ${start}-${end}/${stat.size}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunkSize,
            "Content-Type": contentType,
          },
        });
      }

      // --------------------------------------------------------
      // 🔥 Trường hợp file nhỏ hoặc không có Range
      // --------------------------------------------------------
      return new Response(Bun.file(filePath), {
        status: 200,
        headers: {
          "Content-Type": contentType,
        },
      });

    } catch (err) {
      return new Response("Server Error", { status: 500 });
    }
  },
};