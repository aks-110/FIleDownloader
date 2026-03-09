import { s3 } from '../BackBlaze/client.mjs';
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import QRCode from "qrcode";
import "../Models/FileModel.mjs";
import { Router } from "express";
import generateId from "../utilis/Id.js";
import { rate } from '../rate/ratelimiter.mjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'
import File from '../Models/FileModel.mjs'
import bcrypt from 'bcrypt'
import {DeleteQueue} from '../BullMq/Queue.mjs'
dotenv.config();

export const route = Router();

route.post('/geturl',rate, async (req, res) => {
  try {
    const { fileName, fileType , password} = req.body;
    if (!fileName || !fileType) return res.status(400).json({ message: "fileName and fileType required" });

    const id = generateId();
    const key = `uploads/${id}-${fileName}`;
    const uploadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({ Bucket: process.env.BUCKET_NAME, Key: key }),
      { expiresIn: 60*60 }
    );
    const hashedpassword = bcrypt.hashSync(password, 10);
    const qrDataUrl = await QRCode.toDataURL(`${process.env.FRONTEND_URL}/download/${id}`);

    await File.create({ id, filekey: key, password:hashedpassword });
    await DeleteQueue.add(id,{
      key : key,
      fileName: fileName,
    },{
      delay: 1000*60*60
    });
    res.json({ uploadUrl, id, qrDataUrl });
  } catch (err) {
    console.error(err);
    console.log("hi");
    res.status(500).json({ message: "Server error" });
  }
});
