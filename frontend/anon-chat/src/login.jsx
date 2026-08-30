import {useState} from "react";
import axios from "axios";
import {Link,useNavigate} from "react-router-dom";
import "./Login.css";

function Login(){

    const [roomName,setroomName]=useState("");
    const [roomPassword,setroomPassword]=useState("");
    const [roomStatus,setroomStatus]=useState("");
    const [userName,setuserName]=useState("");

    const navigate=useNavigate();

    const handleNameChange=(event)=>{
        setroomName(event.target.value);
    };

    const handlePasswordChange=(event)=>{
        setroomPassword(event.target.value);
    };

    const handleUserName=(event)=>{
        setuserName(event.target.value);
    };

    const handleSubmitButton=async()=>{
        if(
            userName.trim()==="" ||
            roomName.trim()==="" ||
            roomPassword.trim()===""
        ){
            setroomStatus("Please fill in all fields");
            return;
        }

        try{

            const response=await axios.post(
                "http://localhost:3000/roomCheck",
                {
                    name:roomName,
                    passWord:roomPassword,
                    userName:userName
                }
            );

            if(response.data.message){

                navigate(
                    `/room/${response.data.roomId}?name=${encodeURIComponent(userName)}`
                );

            }else if(response.data.roomFull){

                setroomStatus("Room is full");

            }else{

                setroomStatus("No Room Found");

            }

        }catch(error){

            console.log("Room check error:",error);

            setroomStatus("Something went wrong");

        }
    };

    return(
        <div className="login-page">

            <div className="login-card">

                <h1>Anon Chat</h1>

                <p className="login-subtitle">
                    Join a private conversation
                </p>

                <div className="form-group">

                    <label>User Name</label>

                    <input
                        type="text"
                        onChange={handleUserName}
                        value={userName}
                        placeholder="Enter your user name"
                    />

                </div>

                <div className="form-group">

                    <label>Room Name</label>

                    <input
                        type="text"
                        onChange={handleNameChange}
                        value={roomName}
                        placeholder="Enter room name"
                    />

                </div>

                <div className="form-group">

                    <label>Room Password</label>

                    <input
                        type="password"
                        onChange={handlePasswordChange}
                        value={roomPassword}
                        placeholder="Enter room password"
                    />

                </div>

                <button
                    className="login-button"
                    onClick={handleSubmitButton}
                >
                    Join Room
                </button>

                <Link
                    className="create-link"
                    to="/create"
                >
                    Create a Room
                </Link>

                {roomStatus && (
                    <p className="room-status">
                        {roomStatus}
                    </p>
                )}

            </div>

        </div>
    );
}

export default Login;