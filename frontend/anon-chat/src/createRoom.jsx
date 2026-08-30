import {Link} from "react-router-dom";
import {useState} from "react";
import axios from "axios";
import "./CreateRoom.css";

function CreateRoom(){

    const [createName,setcreateName]=useState("");
    const [createPass,setcreatePass]=useState("");

    const handlecreateNameChange=(events)=>{
        setcreateName(events.target.value);
    };

    const handlecreatePassChange=(events)=>{
        setcreatePass(events.target.value);
    };

    const handleClick=async()=>{
        const create_status=await axios.post(
            "http://localhost:3000/createRoom",
            {
                name:createName,
                password:createPass
            }
        );

        console.log(create_status.data.message);
    };

    return(
        <div className="create-page">

            <div className="create-card">

                <h1>Create a Room</h1>

                <p className="create-subtitle">
                    Create a private room and invite your friends
                </p>

                <div className="form-group">
                    <label>Room Name</label>

                    <input
                        onChange={handlecreateNameChange}
                        value={createName}
                        placeholder="Enter room name"
                    />
                </div>

                <div className="form-group">
                    <label>Room Password</label>

                    <input
                        type="password"
                        onChange={handlecreatePassChange}
                        value={createPass}
                        placeholder="Enter room password"
                    />
                </div>

                <button
                    className="create-button"
                    onClick={handleClick}
                >
                    Create Room
                </button>

                <Link
                    className="join-link"
                    to="/join"
                >
                    Already have a room? Join one
                </Link>

            </div>

        </div>
    );
}

export default CreateRoom;