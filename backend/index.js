import express from "express";
import cors from "cors";
import roomValidation from "./routes/roomChecker.js";
import roomCreation from "./routes/roomCreation.js";
import messageGetter from "./routes/messageLoader.js";
import messageStorer from "./routes/messageStorer.js";
import leaveRoom from "./routes/leaveRoom.js";
const app=express();

app.use(express.json());
app.use(cors());

app.use("/roomCheck",roomValidation);
app.use("/createRoom",roomCreation);
app.use("/getMessages",messageGetter);
app.use("/messageStorer",messageStorer);
app.use("/leaveRoom",leaveRoom);
app.listen(3000,()=>{
    console.log("Server is listening on Port 3000");
});