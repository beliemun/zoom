const messageList = document.querySelector("ul");
const nicknameForm = document.querySelector("#nickname");
const messageForm = document.querySelector("#message");
const socket = new WebSocket(`ws://${window.location.host}`)

const makeMessage = (type, payload) => JSON.stringify({ type, payload })

socket.addEventListener("open", () => {
    console.log("Connected to Server ✅")
})

socket.addEventListener("message", async (message) => {
    const li = document.createElement("li");
    li.innerHTML = await message.data.text();
    messageList.append(li);
})

socket.addEventListener("close", () => {
    console.log("Disconnected to Server ❌")
})

const handleNicknameSubmit = (event) => {
    event.preventDefault();
    const input = nicknameForm.querySelector("input");
    socket.send(makeMessage("new_message", input.value));
}

const handleMessageSubmit = (event) => {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(input.value);
    input.value = "";
}

nicknameForm.addEventListener("submit", handleNicknameSubmit);
messageForm.addEventListener("submit", handleMessageSubmit);