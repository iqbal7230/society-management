import pg from "pg"
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

pool.on("connect", ()=>{console.log("connected to database")})

pool.on("error", (err)=>{
    console.log("postgress pool error", err.message)
})

export default pool;