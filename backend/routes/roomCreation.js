import express from "express";
import create from "../database_functions/creator.js";

const router=express.Router();

router.post("/",async(req,res)=>{
    const name=req.body.name;
    const password=req.body.password;

    const result=await create(name,password);

    if(result){
        res.send({
            message:"Successfully created"
        });
    }else{
        res.send({
            message:"Cant be created"
        });
    }
});

export default router;