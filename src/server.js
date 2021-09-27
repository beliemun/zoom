import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log("Listening on http://localhost:3000 ✅");
// app.listen(3000, handleListen);

const httpServer = http.createServer(app);
const wsServer = new WebSocket.Server({ server: httpServer });

const onCloseSocket = () => console.log("Disconnected to Browser ❌")

const sockets = [];

wsServer.on("connection", (socket) => {
    sockets.push(socket);
    console.log("Connected to Browser ✅");
    socket.on("close", onCloseSocket);
    socket.on("message", (message) => sockets.forEach(s => s.send(message)));
})

httpServer.listen(3000, handleListen);