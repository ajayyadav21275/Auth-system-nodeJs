const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const router = require('./Routes/Router');
const cors = require("cors");

const app = express();

const server = http.createServer(app);

// SOCKET SERVER
const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());


app.use('/api', router);


// SOCKET CONNECTION
io.on("connection", (socket) => {

  console.log("Connected:", socket.id);

  socket.on("message", (data) => {

    console.log("Message:", data);

    io.emit("message", data);

  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });

});

const PORT = 8000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});