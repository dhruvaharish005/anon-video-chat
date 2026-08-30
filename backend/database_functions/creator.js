import {pool} from "../db.js";

async function roomCreation(name,password){
    const result=await pool.query(
        `INSERT INTO room_list(room_name,room_password) VALUES ($1,$2)`,
        [name,password]
    );

    return result.rowCount>0;
}

export default roomCreation;