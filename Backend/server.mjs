import express from "express"
import dotenv from "dotenv"
import {route as getPreUrlRoute} from "./routes/getpreurl.mjs"
import {route as downloadRoute} from "./routes/download.mjs"

dotenv.config();
import cors from "cors"
import mongoose from "mongoose"

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.log("Failed to connect to MongoDB");
  console.log(err);
});

const app = express();
app.use(express.json());
app.use(cors());
app.use('/',getPreUrlRoute);
app.use('/',downloadRoute);
app.listen(process.env.PORT,(req,res)=>{
  console.log(`Running at Port ${process.env.PORT}`);
});