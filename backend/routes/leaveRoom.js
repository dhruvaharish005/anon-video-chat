import express from "express";
import {decr_user} from "../database_functions/redis_client.js";

const router=express.Router();

router.post("/",async(req,res)=>{
    try{
        const roomId=req.body.roomId;

        await decr_user(roomId);

        res.send({
            success:true
        });
    }catch(error){
        console.log(error);
        res.status(500).send({
            success:false
        });
    }
});

export default router;