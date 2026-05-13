const { io } = require("socket.io-client");


// SERVER 8000
const socket1 = io("http://localhost:8000");

socket1.on("connect", () => {

  console.log("Connected To 8000");

  socket1.emit("message", {
    text: "Hello 8000"
  });

});

socket1.on("message", (data) => {
  console.log("8000 Response:", data);
});




// SERVER 8001
const socket2 = io("http://localhost:8001");

socket2.on("connect", () => {

  console.log("Connected To 8001");

  socket2.emit("send_message", {
    text: "Hello 8001"
  });

});

socket2.on("receive_message", (data) => {
  console.log("8001 Response:", data);
});