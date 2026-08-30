import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { decr_user } from "./database_functions/redis_client.js";

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors());

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    socket.roomId = null;
    socket.userName = null;
    socket.hasLeft = false;


    // =========================
    // JOIN ROOM
    // =========================

    socket.on("join-room", (data) => {

        const roomId = String(data.roomId);
        const userName = data.userName;

        socket.join(roomId);

        socket.roomId = roomId;
        socket.userName = userName;
        socket.hasLeft = false;

        console.log(
            `User ${userName} joined room ${roomId}`
        );

        // Tell EVERY OTHER user that this user joined
        socket.to(roomId).emit("user-joined", {
            socketId: socket.id,
            userName: userName
        });
    });


    // =========================
    // WEBRTC OFFER
    // =========================

    socket.on("offer", (data) => {

        socket.to(data.target).emit("offer", {
            sender: socket.id,
            offer: data.offer
        });

    });


    // =========================
    // WEBRTC ANSWER
    // =========================

    socket.on("answer", (data) => {

        socket.to(data.target).emit("answer", {
            sender: socket.id,
            answer: data.answer
        });

    });


    // =========================
    // ICE CANDIDATE
    // =========================

    socket.on("ice-candidate", (data) => {

        socket.to(data.target).emit("ice-candidate", {
            sender: socket.id,
            candidate: data.candidate
        });

    });


    // =========================
    // CHAT MESSAGE
    // =========================

    socket.on("send_messages", (data) => {

        io.to(data.roomId).emit("receive_messages", {
            userName: data.userName,
            message: data.message
        });

    });


    // =========================
    // LEAVE ROOM
    // =========================

    socket.on("leave-room", async () => {

        if (!socket.roomId || socket.hasLeft) {
            return;
        }

        const roomId = socket.roomId;
        const userName = socket.userName;

        // IMPORTANT:
        // Mark as left BEFORE calling Redis.
        // This prevents leave-room + disconnect
        // from decrementing twice.

        socket.hasLeft = true;

        socket.roomId = null;
        socket.userName = null;

        await decr_user(roomId);

        socket.leave(roomId);

        // Tell other users to remove this user's video
        socket.to(roomId).emit("user-left", {
            socketId: socket.id
        });

        console.log(
            `User ${userName} left room ${roomId}`
        );

    });


    // =========================
    // DISCONNECT
    // =========================

    socket.on("disconnect", async () => {

        // If the user already manually left,
        // DO NOT decrement Redis again.

        if (socket.hasLeft || !socket.roomId) {

            console.log(
                "Disconnected:",
                socket.id
            );

            return;
        }

        const roomId = socket.roomId;
        const userName = socket.userName;

        socket.hasLeft = true;

        socket.roomId = null;
        socket.userName = null;

        await decr_user(roomId);

        socket.to(roomId).emit("user-left", {
            socketId: socket.id
        });

        console.log(
            `User ${userName} disconnected from room ${roomId}`
        );

    });

});


server.listen(5000, () => {

    console.log(
        "Socket server is listening on Port 5000"
    );

});