import express from "express"
import dotenv from "dotenv"
dotenv.config();
const app = express();

app.listen(process.env.PORT,(req,res)=>{
  console.log(`Running at Port ${process.env.PORT}`);
});