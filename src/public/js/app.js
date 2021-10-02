const socket = io();

const myFace = document.getElementById("myFace");
const muteButton = document.getElementById("mute");
const cameraButton = document.getElementById("camera");
const cameraOption = document.getElementById("cameras");

let myStream;
let muted = false;
let cameraOff = false;

const getCameras = async () => {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === "videoinput");
        cameras.forEach(camera => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            cameraOption.append(option);
        })
    } catch (e) {
        console.log(e)
    }
}

const getMedia = async () => {
    try {
        myStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        })
        myFace.srcObject = myStream;
        await getCameras();
    } catch (e) {
        console.log(e);
    }
}

getMedia();

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

muteButton.addEventListener("click", handleMuteButton);
cameraButton.addEventListener("click", handleCameraButton);