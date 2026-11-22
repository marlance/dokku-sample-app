// Zero-dependency server: serves the files in ./public and exposes the
// app's runtime config at /config.json so the page can show it.
// Dokku detects Node from package.json and runs the Procfile's `web` line.
const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PORT = process.env.PORT || 5000;          // Dokku sets PORT
const PUBLIC = path.join(__dirname, "public");
const STARTED = new Date().toISOString();
const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
                ".svg": "image/svg+xml", ".json": "application/json" };

function config() {
  return {
    attendee: process.env.ATTENDEE || "world",   // dokku config:set myapp ATTENDEE=...
    bgColor: process.env.BG_COLOR || "#0E7C66",  // dokku config:set myapp BG_COLOR=...
    host: os.hostname(),                         // the container this request hit
    startedAt: STARTED,                          // changes on every deploy/restart
    release: process.env.GIT_REV || "dev",       // Dokku sets GIT_REV to the commit
  };
}

http.createServer((req, res) => {
  const url = req.url.split("?")[0];
  if (url === "/healthz") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end("ok");
  }
  if (url === "/config.json") {
    res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" });
    return res.end(JSON.stringify(config()));
  }
  // Static files. normalize + prefix check keeps requests inside ./public.
  const file = path.normalize(path.join(PUBLIC, url === "/" ? "index.html" : url));
  if (!file.startsWith(PUBLIC + path.sep)) {
    res.writeHead(403);
    return res.end("forbidden");
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("not found");
    }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  });
}).listen(PORT, () => console.log(`myapp listening on ${PORT}`));
