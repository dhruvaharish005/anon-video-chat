import client from "../redis_server.js";
import {messagePool} from "../db.js";

async function incr_user(roomId){
    const result=await client.get(roomId);

    if(result==null){
        await client.set(roomId,1);
        return true;
    }

    if(Number(result)>=4){
        console.log("Maximum users logged in");
        return false;
    }

    await client.incr(roomId);
    return true;
}

async function decr_user(roomId){
    const result=await client.get(roomId);

    if(result==null){
        return;
    }

    if(Number(result)==1){
        await messagePool.query(`DELETE FROM room_list WHERE id=$1`,[roomId]);
        await messagePool.query(`DELETE FROM messages WHERE room_id=$1`,[roomId]);
        await client.del(roomId);
    }else{
        await client.decr(roomId);
    }
}

export {incr_user,decr_user};