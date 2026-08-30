import {
    useParams,
    useSearchParams,
    useNavigate
} from "react-router-dom";

import {
    useState,
    useEffect,
    useRef
} from "react";

import { io } from "socket.io-client";

import axios from "axios";

import "./Room.css";


const socket = io("http://localhost:5000");


function Room() {

    // =========================
    // ROOM
    // =========================

    const { roomId } = useParams();

    const [searchParam] = useSearchParams();

    const navigate = useNavigate();

    const name = searchParam.get("name");


    // =========================
    // CHAT STATE
    // =========================

    const [message, setMessage] = useState("");

    const [messages, setMessages] = useState([]);


    // =========================
    // WEBRTC STATE
    // =========================

    const [remoteStreams, setRemoteStreams] = useState([]);


    // =========================
    // WEBRTC REFS
    // =========================

    const localVideoRef = useRef(null);

    const localStream = useRef(null);

    /*
        Every remote user gets
        their own RTCPeerConnection.

        Map:

        socketId -> RTCPeerConnection
    */

    const peerConnections = useRef(new Map());


    // =========================
    // MESSAGE INPUT
    // =========================

    const handleMessageChange = (event) => {

        setMessage(event.target.value);

    };


    // =========================
    // CREATE PEER CONNECTION
    // =========================

    const createPeerConnection = (remoteSocketId) => {

        /*
            If connection already exists,
            return it.
        */

        if (
            peerConnections.current.has(
                remoteSocketId
            )
        ) {

            return peerConnections.current.get(
                remoteSocketId
            );

        }


        const peer = new RTCPeerConnection({

            iceServers: [
                {
                    urls:
                        "stun:stun.l.google.com:19302"
                }
            ]

        });


        // =========================
        // ICE CANDIDATE
        // =========================

        peer.onicecandidate = (event) => {

            if (!event.candidate) {
                return;
            }


            socket.emit("ice-candidate", {

                target: remoteSocketId,

                candidate: event.candidate

            });

        };


        // =========================
        // REMOTE TRACK
        // =========================

        peer.ontrack = (event) => {

            const stream =
                event.streams[0];


            console.log(
                "Received remote stream from:",
                remoteSocketId
            );


            setRemoteStreams(
                (previousStreams) => {

                    const existing =
                        previousStreams.find(
                            (user) =>
                                user.socketId ===
                                remoteSocketId
                        );


                    if (existing) {

                        return previousStreams;

                    }


                    return [
                        ...previousStreams,

                        {
                            socketId:
                                remoteSocketId,

                            stream:
                                stream
                        }

                    ];

                }
            );

        };


        // =========================
        // ADD LOCAL TRACKS
        // =========================

        if (localStream.current) {

            localStream.current
                .getTracks()
                .forEach((track) => {

                    peer.addTrack(
                        track,
                        localStream.current
                    );

                });

        }


        // Store connection

        peerConnections.current.set(
            remoteSocketId,
            peer
        );


        return peer;

    };


    // =========================
    // WEBRTC EFFECT
    // =========================

    useEffect(() => {

        let mounted = true;


        // =========================
        // START CAMERA
        // =========================

        const startCamera = async () => {

            try {

                const stream =
                    await navigator.mediaDevices
                        .getUserMedia({

                            video: true,

                            audio: true

                        });


                if (!mounted) {

                    stream
                        .getTracks()
                        .forEach((track) => {

                            track.stop();

                        });

                    return;

                }


                localStream.current =
                    stream;


                if (localVideoRef.current) {

                    localVideoRef.current.srcObject =
                        stream;

                }


                /*
                    Join Socket.IO only after
                    camera is ready.
                */

                socket.emit(
                    "join-room",
                    {

                        roomId: roomId,

                        userName: name

                    }
                );


            } catch (error) {

                console.log(
                    "Camera/Microphone error:",
                    error
                );

            }

        };


        startCamera();


        // =========================
        // USER JOINED
        // =========================

        const handleUserJoined = async (data) => {

            try {

                console.log(
                    "New user joined:",
                    data.socketId
                );


                const remoteSocketId =
                    data.socketId;


                const peer =
                    createPeerConnection(
                        remoteSocketId
                    );


                const offer =
                    await peer.createOffer();


                await peer.setLocalDescription(
                    offer
                );


                socket.emit("offer", {

                    target:
                        remoteSocketId,

                    offer:
                        offer

                });

            } catch (error) {

                console.log(
                    "Offer creation error:",
                    error
                );

            }

        };


        socket.on(
            "user-joined",
            handleUserJoined
        );


        // =========================
        // RECEIVE OFFER
        // =========================

        const handleOffer = async (data) => {

            try {

                console.log(
                    "Received offer from:",
                    data.sender
                );


                const remoteSocketId =
                    data.sender;


                const peer =
                    createPeerConnection(
                        remoteSocketId
                    );


                await peer.setRemoteDescription(

                    new RTCSessionDescription(
                        data.offer
                    )

                );


                const answer =
                    await peer.createAnswer();


                await peer.setLocalDescription(
                    answer
                );


                socket.emit("answer", {

                    target:
                        remoteSocketId,

                    answer:
                        answer

                });

            } catch (error) {

                console.log(
                    "Offer handling error:",
                    error
                );

            }

        };


        socket.on(
            "offer",
            handleOffer
        );


        // =========================
        // RECEIVE ANSWER
        // =========================

        const handleAnswer = async (data) => {

            try {

                console.log(
                    "Received answer from:",
                    data.sender
                );


                const peer =
                    peerConnections.current.get(
                        data.sender
                    );


                if (!peer) {

                    console.log(
                        "Peer not found for answer"
                    );

                    return;

                }


                await peer.setRemoteDescription(

                    new RTCSessionDescription(
                        data.answer
                    )

                );

            } catch (error) {

                console.log(
                    "Answer handling error:",
                    error
                );

            }

        };


        socket.on(
            "answer",
            handleAnswer
        );


        // =========================
        // RECEIVE ICE
        // =========================

        const handleIceCandidate = async (data) => {

            try {

                const peer =
                    peerConnections.current.get(
                        data.sender
                    );


                if (!peer) {

                    console.log(
                        "Peer not found for ICE"
                    );

                    return;

                }


                await peer.addIceCandidate(

                    new RTCIceCandidate(
                        data.candidate
                    )

                );

            } catch (error) {

                console.log(
                    "ICE candidate error:",
                    error
                );

            }

        };


        socket.on(
            "ice-candidate",
            handleIceCandidate
        );


        // =========================
        // USER LEFT
        // =========================

        const handleUserLeft = (data) => {

            const remoteSocketId =
                data.socketId;


            console.log(
                "User left:",
                remoteSocketId
            );


            const peer =
                peerConnections.current.get(
                    remoteSocketId
                );


            if (peer) {

                peer.close();

                peerConnections.current.delete(
                    remoteSocketId
                );

            }


            setRemoteStreams(
                (previousStreams) => {

                    return previousStreams.filter(
                        (user) =>
                            user.socketId !==
                            remoteSocketId
                    );

                }
            );

        };


        socket.on(
            "user-left",
            handleUserLeft
        );


        // =========================
        // RECEIVE CHAT MESSAGE
        // =========================

        const handleReceiveMessage = (data) => {

            setMessages(
                (previousMessages) => [

                    ...previousMessages,

                    data

                ]
            );

        };


        socket.on(
            "receive_messages",
            handleReceiveMessage
        );


        // =========================
        // CLEANUP
        // =========================

        return () => {

            mounted = false;


            socket.off(
                "user-joined",
                handleUserJoined
            );

            socket.off(
                "offer",
                handleOffer
            );

            socket.off(
                "answer",
                handleAnswer
            );

            socket.off(
                "ice-candidate",
                handleIceCandidate
            );

            socket.off(
                "user-left",
                handleUserLeft
            );

            socket.off(
                "receive_messages",
                handleReceiveMessage
            );


            // Close all peer connections

            peerConnections.current
                .forEach((peer) => {

                    peer.close();

                });


            peerConnections.current.clear();


            // Stop camera

            if (localStream.current) {

                localStream.current
                    .getTracks()
                    .forEach((track) => {

                        track.stop();

                    });

                localStream.current = null;

            }

        };

    }, [roomId, name]);


    // =========================
    // LOAD OLD MESSAGES
    // =========================

    useEffect(() => {

        const messageReload = async () => {

            try {

                const result =
                    await axios.post(
                        "http://localhost:3000/getMessages",
                        {
                            id: roomId
                        }
                    );


                setMessages(
                    result.data.messages
                );


            } catch (error) {

                console.log(
                    "Error loading messages:",
                    error
                );

            }

        };


        messageReload();

    }, [roomId]);


    // =========================
    // SEND MESSAGE
    // =========================

    const handleMessageSend = async () => {

        if (message.trim() === "") {

            return;

        }


        try {

            await axios.post(
                "http://localhost:3000/messageStorer",
                {

                    id: roomId,

                    name: name,

                    message: message

                }
            );


            socket.emit(
                "send_messages",
                {

                    roomId: roomId,

                    userName: name,

                    message: message

                }
            );


            setMessage("");


        } catch (error) {

            console.log(
                "Error sending message:",
                error
            );

        }

    };


    // =========================
    // LEAVE ROOM
    // =========================

    const handleLogOut = () => {

        /*
            Socket server handles Redis
            decrement.

            Do NOT call /leaveRoom here.
        */

        socket.emit("leave-room");


        // Stop camera

        if (localStream.current) {

            localStream.current
                .getTracks()
                .forEach((track) => {

                    track.stop();

                });

            localStream.current = null;

        }


        // Close all WebRTC connections

        peerConnections.current
            .forEach((peer) => {

                peer.close();

            });


        peerConnections.current.clear();


        socket.disconnect();


        navigate("/");

    };


    // =========================
    // UI
    // =========================

    return (

        <div className="room-container">

            {/* ========================= */}
            {/* HEADER */}
            {/* ========================= */}

            <div className="room-header">

                <div>

                    <h1>
                        Anon Chat
                    </h1>

                    <div className="room-info">

                        Room ID: {roomId}

                        <br />

                        User: {name}

                    </div>

                </div>


                <button
                    className="leave-button"
                    onClick={handleLogOut}
                >
                    Leave Room
                </button>

            </div>


            {/* ========================= */}
            {/* VIDEO */}
            {/* ========================= */}

            <section className="video-section">

                <h2>
                    Video Chat
                </h2>


                <div className="video-grid">

                    {/* YOUR CAMERA */}

                    <div className="video-card">

                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            playsInline
                        />

                        <div className="video-name">

                            You ({name})

                        </div>

                    </div>


                    {/* REMOTE CAMERAS */}

                    {remoteStreams.map(
                        (user) => (

                            <div
                                className="video-card"
                                key={user.socketId}
                            >

                                <video

                                    autoPlay

                                    playsInline

                                    ref={(video) => {

                                        if (video) {

                                            video.srcObject =
                                                user.stream;

                                        }

                                    }}

                                />


                                <div className="video-name">

                                    Other User

                                </div>

                            </div>

                        )
                    )}

                </div>

            </section>


            {/* ========================= */}
            {/* CHAT */}
            {/* ========================= */}

            <section className="chat-section">

                <h2>
                    Chat
                </h2>


                <div className="chat-messages">

                    {messages.map(
                        (msg, index) => (

                            <p
                                className="chat-message"
                                key={index}
                            >

                                <span className="chat-username">

                                    {msg.sender_name ||
                                        msg.userName}

                                </span>

                                :{" "}

                                {msg.message}

                            </p>

                        )
                    )}

                </div>


                <div className="chat-input-container">

                    <input

                        className="chat-input"

                        onChange={
                            handleMessageChange
                        }

                        value={message}

                        placeholder="Type a message..."

                        onKeyDown={(event) => {

                            if (
                                event.key ===
                                "Enter"
                            ) {

                                handleMessageSend();

                            }

                        }}

                    />


                    <button
                        className="send-button"
                        onClick={
                            handleMessageSend
                        }
                    >
                        Send
                    </button>

                </div>

            </section>

        </div>

    );

}


export default Room;