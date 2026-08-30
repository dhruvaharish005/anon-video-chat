<div align="center">

# Anonymous Video Chat

### Real-time anonymous video chatting built with WebRTC, Socket.IO, Redis & PostgreSQL.

<br>

<img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black">
<img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white">
<img src="https://img.shields.io/badge/WebRTC-Video%20%26%20Audio-333333?style=for-the-badge">
<img src="https://img.shields.io/badge/Socket.IO-Realtime-010101?style=for-the-badge&logo=socket.io&logoColor=white">
<img src="https://img.shields.io/badge/Redis-Room%20Tracking-DC382D?style=for-the-badge&logo=redis&logoColor=white">
<img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white">

</div>

---

## About

**Anonymous Video Chat** is a real-time video communication application that allows users to create and join private rooms and communicate through video, audio, and text messaging.

The application uses **WebRTC** for peer-to-peer media communication, **Socket.IO** for real-time communication and WebRTC signaling, **Redis** for tracking active users in rooms, and **PostgreSQL** for persistent room and message storage.

---

## Features

<table>
<tr>
<th>Feature</th>
<th>Status</th>
</tr>

<tr>
<td>Anonymous usernames</td>
<td>✅ Complete</td>
</tr>

<tr>
<td>Room creation</td>
<td>✅ Complete</td>
</tr>

<tr>
<td>Password-protected rooms</td>
<td>✅ Complete</td>
</tr>

<tr>
<td>Maximum 4 users per room</td>
<td>✅ Complete</td>
</tr>

<tr>
<td>Real-time messaging</td>
<td>✅ Complete</td>
</tr>

<tr>
<td>Persistent messages</td>
<td>✅ Complete</td>
</tr>

<tr>
<td>Redis user tracking</td>
<td>✅ Complete</td>
</tr>

<tr>
<td>WebRTC video and audio</td>
<td>✅ Complete</td>
</tr>

<tr>
<td>Multi-user video</td>
<td>✅ Complete</td>
</tr>

<tr>
<td>Room cleanup</td>
<td>✅ Complete</td>
</tr>

<tr>
<td>Responsive UI</td>
<td>🚧 In Progress</td>
</tr>

<tr>
<td>Screen sharing</td>
<td>🔜 Planned</td>
</tr>

<tr>
<td>Mute / camera controls</td>
<td>🔜 Planned</td>
</tr>

<tr>
<td>TURN server</td>
<td>🔜 Planned</td>
</tr>

</table>

---

# Tech Stack

## Frontend

- React
- React Router
- Axios
- Socket.IO Client
- WebRTC
- Vite
- CSS

## Backend

- Node.js
- Express
- Socket.IO
- PostgreSQL
- Redis
- ioredis
- pg

---

# Architecture

<div align="center">

```text
                    ┌─────────────────┐
                    │   React Client  │
                    │                 │
                    │ React + WebRTC  │
                    │ Socket.IO Client│
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
             REST API                 Socket.IO
                │                         │
                ▼                         ▼
        ┌───────────────┐         ┌───────────────┐
        │   Express     │         │   Socket.IO   │
        └───────┬───────┘         └───────┬───────┘
                │                         │
        ┌───────┴───────┐         ┌───────┴───────┐
        │  PostgreSQL   │         │     Redis     │
        │               │         │               │
        │ Rooms         │         │ User Count    │
        │ Messages      │         │ Room Limits   │
        └───────────────┘         └───────┬───────┘
                                          │
                                          ▼
                                  WebRTC Signaling
                                          │
                                          ▼
                                  Video + Audio
