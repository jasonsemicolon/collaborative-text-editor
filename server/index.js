var http = require("http");
var express = require("express");
var ShareDB = require("sharedb");
var richText = require("rich-text");
var WebSocket = require("ws");
var WebSocketJSONStream = require("@teamwork/websocket-json-stream");

ShareDB.types.register(richText.type);
var backend = new ShareDB({
  presence: true,
  doNotForwardSendPresenceErrorsToClient: true,
});
createDoc(startServer);

// Create initial document then fire callback
function createDoc(callback) {
  var connection = backend.connect();
  var doc = connection.get("collaborativeTextEditor", "richtext");
  doc.fetch(function (err) {
    if (err) throw err;
    if (doc.type === null) {
      doc.create([], "rich-text", callback);
      return;
    }
    callback();
  });
}

function startServer() {
  // Create a web server to serve files and listen to WebSocket connections
  var app = express();
  app.use(express.static("static"));
  app.use(express.static("node_modules/quill/dist"));
  var server = http.createServer(app);

  // Connect any incoming WebSocket connection to ShareDB
  var wss = new WebSocket.Server({ server: server });
  wss.on("connection", function (ws) {
    var stream = new WebSocketJSONStream(ws);
    backend.listen(stream);

    // Listen to cursor position changes
    stream.on("otherData", function (data) {
      // if (data.a === "s" && data.c === "selections") {
      console.log("Cursor position changed:", data);
      // }
    });
  });

  server.listen(8080);
  console.log("Listening on http://localhost:8080");
}
