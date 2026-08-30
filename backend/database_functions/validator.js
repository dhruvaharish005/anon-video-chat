import {pool} from "../db.js";
async function validateRoom(roomPassword,roomName){
    const result=await pool.query(`SELECT id,room_name FROM room_list WHERE room_name=$1 AND room_password=$2 `,[roomName,roomPassword]);
    if(result.rows.length==0){
        return null;
    }else{
        return result.rows[0];
    }
}
export default validateRoom;