const { ipcRenderer } = require("electron");

const oggVideo = document.getElementById("ogg-video");
const oggSource = document.createElement("source");
const oggButton = document.getElementById("ogg-btn");

const messages = document.querySelector(".messages");
const message = document.getElementById("message");

const deleteButton = document.getElementById("delete-btn");

ipcRenderer.send("dom-is-ready");
ipcRenderer.on("ffmpeg-path", (event, args) => {
    console.log(args);
});

const showMessage = (msg, duration) => {
    messages.style.display = "block";
    message.innerText = msg;
    setTimeout(() => {
        message.innerText = "";
        messages.style.display = "none";
    }, duration);
};

const showLoading = (msg) => {
    message.innerText = msg;
};

oggButton.addEventListener("click", () => {
    ipcRenderer.send("convert-to-ogg");
    showMessage("Converting to ogg...", 3000);
});

deleteButton.addEventListener("click", () => {
    ipcRenderer.send("delete-ogg-video");
});

ipcRenderer.on("convert-to-ogg-done", () => {
    showMessage("Conversion done! Loading your ogg video...", 3000);

    oggSource.setAttribute("src", "./video/output/bunny.ogg");
    oggSource.setAttribute("type", "video/ogg");

    oggVideo.appendChild(oggSource);
    oggVideo.load();
    oggVideo.play();
});

ipcRenderer.on("convert-to-ogg-progress", (event, progress) => {
    // let percent = (progress.timemark.split(":")[2] * 100) / 10;
    // console.log(percent);
    // let msg = `${percent.toPrecision(2)}% done`;
    console.log("data: ", progress);
    messages.style.display = "block";
    showLoading(progress);
});

ipcRenderer.on("generate-random-number-done", (event, randomNumber) => {
    randomNum.innerText = randomNumber;
});

ipcRenderer.on("video-delete", (event, args) => {
    oggVideo = null;
    oggSource = null;
});
