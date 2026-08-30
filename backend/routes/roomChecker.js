import express from "express";
import validateRoom from "../database_functions/validator.js";
import {incr_user} from "../database_functions/redis_client.js";

const router=express.Router();

router.post("/",async(req,res)=>{
    try{
        const roomName=req.body.name;
        const roomPass=req.body.passWord;

        const result=await validateRoom(roomPass,roomName);

        console.log("Name:",roomName);
        console.log("Password:",roomPass);

        if(result==null){
            return res.send({
                message:false
            });
        }

        const allowed=await incr_user(result.id);

        if(!allowed){
            return res.send({
                message:false,
                roomFull:true
            });
        }

        res.send({
            message:true,
            roomId:result.id,
            roomName:result.room_name
        });
    }catch(error){
        console.log(error);
        res.status(500).send({
            message:false
        });
    }
});

export default router;