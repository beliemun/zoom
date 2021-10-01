const socket = io();

const roomContainer = document.getElementById("roomContainer");
const roomForm = roomContainer.querySelector("form");

const messageContainer = document.getElementById("messageContainer");
const messageForm = messageContainer.querySelector("form");

messageContainer.hidden = true;

let roomName;

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

const handleMessageSubmit = (event) => {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You: ${input.value}`)
        input.value = "";
    })
}

roomForm.addEventListener("submit", handleRoomSubmit);
messageForm.addEventListener("submit", handleMessageSubmit);

socket.on("welcome", () => {
    addMessage("Someone Joined!");
});
socket.on("bye", () => {
    addMessage("Someone left!");
})
socket.on("new_message", (message) => {
    addMessage(message);
})