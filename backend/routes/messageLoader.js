import express from "express";
import {messagePool} from "../db.js";

const router=express.Router();

router.post("/",async(req,res)=>{
    try{
        const roomId=req.body.id;

        const result=await messagePool.query(
            `SELECT sender_name,message,created_at
             FROM messages
             WHERE room_id=$1
             ORDER BY created_at DESC
             LIMIT 15`,
            [roomId]
        );

        res.send({
            messages:result.rows.reverse()
        });
    }catch(error){
        console.log("Message loading error:",error);

        res.status(500).send({
            messages:[]
        });
    }
});

export default router;