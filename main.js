const { app, BrowserWindow, ipcMain } = require("electron");

const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path.replace("app.asar", "app.asar.unpacked");

const ffmpeg = require("fluent-ffmpeg");
const pathToFfmpeg = require("ffmpeg-static");

const videoOutputDirectory = path.join(__dirname, "/video/output");
const videoInputDirectory = path.join(__dirname, "/video/input");

const args = ["-i", `${videoInputDirectory}\\bunny.mp4`, `${videoOutputDirectory}\\bunny.ogg`];

const createNewWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    mainWindow.loadFile("index.html");
};

app.on("ready", createNewWindow);
app.on("window-all-closed", () => {
    app.quit();
});

app.on("quit", (event) => {
    // if (convertionProcess) {
    //     event.preventDefault();
    //     convertionProcess.kill();
    //     app.quit();
    // }
});

// Channels to listen to ipcRenderer
ipcMain.on("convert-to-ogg", (event) => {
    // convertionProcess = ffmpeg(`${videoInputDirectory}/bunny.mp4`)
    //     .on("progress", function (progress) {
    //         event.sender.send("convert-to-ogg-progress", progress);
    //     })
    //     .on("error", function (err) {
    //         console.log("An error occurred: " + err.message);
    //     })
    //     .on("end", function () {
    //         event.sender.send("convert-to-ogg-done");
    //     })
    //     .save(`${videoOutputDirectory}/bunny.ogg`);

    const convertionProcess = spawn(ffmpegPath, args);

    convertionProcess.stdout.on("data", (data) => {
        console.log("Output Data: ", data.toString());
        event.sender.send("convert-to-ogg-progress", data.toString());
    });

    convertionProcess.stderr.on("data", (data) => {
        console.log("Error Data: ", data.toString());
        event.sender.send("convert-to-ogg-progress", data.toString());
    });

    convertionProcess.on("error", (error) => console.log(`error: ${error.message}`));

    convertionProcess.on("exit", (code, signal) => {
        if (code) console.log(`Process exit with code: ${code}`);
        if (signal) console.log(`Process killed with signal: ${signal}`);
        console.log(`Done ✅`);
        event.sender.send("convert-to-ogg-done");
    });
});

ipcMain.on("delete-ogg-video", (event, args) => {
    fs.unlinkSync(`${videoOutputDirectory}\\bunny.ogg`);
    event.sender.send("video-deleted");
});

ipcMain.on("dom-is-ready", (event, args) => {
    event.sender.send("ffmpeg-path", ffmpegPath);
});
