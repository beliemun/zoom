import http from "http";
// import WebSocket from "ws";
import SocketIO from "socket.io";
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
const wsServer = SocketIO(httpServer);

wsServer.on("connection", socket => {
    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`)
    });
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome");
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach(room => socket.to(room).emit("bye"));
    })
    socket.on("new_message", (message, roomName, done) => {
        socket.to(roomName).emit("new_message", message);
        done();
    })
})

// const onCloseSocket = () => console.log("Disconnected to Browser ❌")
// const wsServer = new WebSocket.Server({ server: httpServer });
// const sockets = [];

// wsServer.on("connection", (socket) => {
//     sockets.push(socket);
//     socket["nickname"] = "Anonymous"
//     console.log("Connected to Browser ✅");
//     socket.on("close", onCloseSocket);
//     socket.on("message", (obj) => {
//         const message = JSON.parse(obj);
//         switch (message.type) {
//             case "nickname":
//                 socket["nickname"] = message.payload;
//                 break;
//             case "new_message":
//                 sockets.forEach(s => s.send(`${socket.nickname}: ${message.payload}`));
//                 break;
//         }
//     });
// })

httpServer.listen(3000, handleListen);