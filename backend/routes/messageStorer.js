import express from "express";
import {messagePool} from "../db.js";

const router=express.Router();

router.post("/",async(req,res)=>{
    try{
        const id=req.body.id;
        const name=req.body.name;
        const message=req.body.message;

        await messagePool.query(
            `INSERT INTO messages(room_id,sender_name,message) VALUES ($1,$2,$3)`,
            [id,name,message]
        );

        res.send({
            message:"Great success"
        });
    }catch(error){
        console.log("Message storing error:",error);

        res.status(500).send({
            message:"Failed to store message"
        });
    }
});

export default router;