const socket = io();

const roomContainer = document.getElementById("roomContainer");
const roomForm = roomContainer.querySelector("form");

const messageContainer = document.getElementById("messageContainer");
const nicknameForm = messageContainer.querySelector("#nickname");
const messageForm = messageContainer.querySelector("#message");


messageContainer.hidden = true;

let roomName;
let nickname = "You";

const addMessage = (message) => {
    const ul = messageContainer.querySelector("ul");
    const li = document.createElement("li");
    li.innerHTML = message;
    ul.appendChild(li);
}

const showRoom = () => {
    roomContainer.hidden = true;
    messageContainer.hidden = false;
    const h3 = messageContainer.querySelector("h3");
    h3.innerHTML = `Room: ${roomName}`
}

const handleRoomSubmit = (event) => {
    event.preventDefault();
    const input = roomForm.querySelector("input");
    roomName = input.value;
    socket.emit("enter_room", input.value, showRoom);
    input.value = "";
}

const handleNicknameSubmit = (event) => {
    event.preventDefault();
    const input = nicknameForm.querySelector("input");
    nickname = input.value;
    socket.emit("nickname", input.value);
}

const handleMessageSubmit = (event) => {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`${nickname}: ${input.value}`)
        input.value = "";
    })
}

roomForm.addEventListener("submit", handleRoomSubmit);
nicknameForm.addEventListener("submit", handleNicknameSubmit);
messageForm.addEventListener("submit", handleMessageSubmit);

socket.on("welcome", (nickname, count) => {
    addMessage(`${nickname} joined!`);
    const h3 = messageContainer.querySelector("h3");
    h3.innerHTML = `Room: ${roomName}(${count})`
});
socket.on("bye", (nickname, count) => {
    addMessage(`${nickname} left.`);
    const h3 = messageContainer.querySelector("h3");
    h3.innerHTML = `Room: ${roomName}(${count})`
})
socket.on("new_message", (nickname, message) => {
    addMessage(`${nickname}: ${message}`);
})
socket.on("room_change", (rooms) => {
    const ul = roomContainer.querySelector("ul");
    ul.innerHTML = "";
    rooms.forEach((room) => {
        const li = document.createElement("li");
        li.innerText = room
        ul.append(li);
    })
})