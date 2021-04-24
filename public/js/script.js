const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const peers = {};
const myPeer = new Peer(undefined, {
  host: "/",
  port: "3001",
});

const myVideo = document.createElement("video");
myVideo.muted = true;

const myScreen = document.createElement("video");
myScreen.muted = true;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    // tumi new call e dhukle tomar nijer browser e nijer video pathaba
    addVideoStream(myVideo, stream);
    const recieved = document.createElement("video");

    // tumi new join korle first e onnora tomake call korbe ar stream send korba
    myPeer.on("call", (call) => {
      call.answer(stream);

      call.on("stream", (stream) => {
        addVideoStream(recieved, stream);
      });
    });

    socket.on("user-connected", (newUserId) => {
      connectToNewUser(newUserId, stream);
    });
  });

// keu chole gele or video remove kore dewa
socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

myPeer.on("open", (id) => {
  socket.emit("joinroom", roomId, id);
});

// pore jara ase
function connectToNewUser(newUserId, stream) {
  const call = myPeer.call(newUserId, stream);
  const newUserVideo = document.createElement("video");
  call.on("stream", (newVideoStream) => {
    addVideoStream(newUserVideo, newVideoStream);
  });
  call.on("close", () => {
    newUserVideo.remove();
  });
  peers[newUserId] = call;
  console.log(peers);
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}
