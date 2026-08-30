import pg from "pg";

const {Pool}=pg;

const pool=new Pool({
    user:"postgres",
    host:"localhost",
    database:"YOUR_DB",
    password:"YOUR_PASSWORD",
    port:5432
});

const messagePool=new Pool({
    user:"postgres",
    host:"localhost",
    database:"YOUR_DB",
    password:"YOUR_PASSWORD",
    port:5432
});

export {messagePool,pool};