import http from "http";
// import WebSocket from "ws";
import { Server } from "socket.io";
import express from "express";
import { instrument } from "@socket.io/admin-ui";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log("Listening on http://localhost:3000 ✅");
// app.listen(3000, handleListen);

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true
    }
});

instrument(wsServer, {
    auth: false
});

const publicRooms = () => {
    const { sockets: { adapter: { sids, rooms } } } = wsServer
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined) {
            publicRooms.push(key)
        }
    })
    return publicRooms;
}

const countRoom = (roomName) => wsServer.sockets.adapter.rooms.get(roomName)?.size;

wsServer.on("connection", socket => {
    socket["nickname"] = "anonymous";
    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`)
    });
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        wsServer.sockets.emit("room_change", publicRooms())
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname, countRoom(room)) - 1);
    })
    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms())
    });
    socket.on("new_message", (message, roomName, done) => {
        socket.to(roomName).emit("new_message", socket.nickname, message);
        done();
    })
    socket.on("nickname", (nickname) => {
        socket["nickname"] = nickname
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