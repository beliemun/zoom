const socket = io();

const myFace = document.getElementById("myFace");
const peerFace = document.getElementById("peerFace");
const muteButton = document.getElementById("mute");
const cameraButton = document.getElementById("camera");
const cameraOption = document.getElementById("cameras");

const welcome = document.getElementById("welcome")
const call = document.getElementById("call")

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;

const getCameras = async () => {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === "videoinput");
        const currentCamera = myStream.getVideoTracks()[0];
        cameras.forEach(camera => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            if (currentCamera.label === camera.label) {
                option.selected = true;
            }
            cameraOption.append(option);
        })
    } catch (e) {
        console.log(e)
    }
}

const getMedia = async (deviceId) => {
    const initialConstrains = {
        audio: false,
        video: { facingMode: "user" }
    }
    const cameraConstrains = {
        audio: false,
        video: {
            deviceId: { exact: deviceId }
        }
    }
    try {
        myStream = await navigator.mediaDevices.getUserMedia(deviceId ? cameraConstrains : initialConstrains)
        myFace.srcObject = myStream;
        if (!deviceId) {
            await getCameras();
        }
    } catch (e) {
        console.log(e);
    }
}

const handleMuteButton = () => {
    myStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
    muted = !muted
    if (muted) {
        muteButton.innerText = "Unmute"
    } else {
        muteButton.innerText = "Mute"
    }
}
const handleCameraButton = () => {
    myStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
    cameraOff = !cameraOff
    if (cameraOff) {
        cameraButton.innerText = "Turn Camera On"
    } else {
        cameraButton.innerText = "Turn Camera Off"
    }
}

const handleCameraChange = async () => {
    await getMedia(cameraOption.value);
    if (myPeerConnection) {
        const videoTrack = myStream.getVideoTracks()[0];
        const videoSender = myPeerConnection.getSenders().find(sender => sender.track.kind === "video")
        videoSender.replaceTrack(videoTrack);
    }
}

muteButton.addEventListener("click", handleMuteButton);
cameraButton.addEventListener("click", handleCameraButton);
cameraOption.addEventListener("input", handleCameraChange);

const welcomeForm = welcome.querySelector("form");

const initCall = async () => {
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}

const handleWelcomeSubmit = async (event) => {
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    await initCall();
    socket.emit("join_room", input.value)
    roomName = input.value;
    input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Socket Code

socket.on("welcome", async () => {
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    socket.emit("offer", offer, roomName);
    console.log("sent the offer.");
})

socket.on("offer", async (offer) => {
    console.log("received the offer.")
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName);
    console.log("sent the answer.");
})

socket.on("answer", answer => {
    console.log("recieved the answer.");
    myPeerConnection.setRemoteDescription(answer);
})

socket.on("ice", ice => {
    myPeerConnection.addIceCandidate(ice);
    console.log("recieved candidate.");
})

// RTC Code

const handleIce = (data) => {
    socket.emit("ice", data, roomName);
    console.log("sent candidate.");
}

const handleAddStream = (data) => {
    console.log("My stream:", myStream);
    console.log("Peer`s stream:", data.streams[0]);
    peerFace.srcObject = data.streams[0];
    console.log("done.");
}

const makeConnection = () => {
    myPeerConnection = new RTCPeerConnection({
        iceServers: [
            {
                urls: [
                    "turn:13.250.13.83:3478?transport=udp"
                ],
                username: "YzYNCouZM1mhqhmseWk6",
                credential: "YzYNCouZM1mhqhmseWk6"
            }
        ]
    });
    myPeerConnection.addEventListener("icecandidate", handleIce);
    myPeerConnection.addEventListener("track", handleAddStream);
    myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream));
}