import { s3 } from '../BackBlaze/client.mjs';
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import QRCode from "qrcode";
import File from "../Models/FileModel.mjs";
import { Router } from "express";
import generateId from "../utilis/Id.js";
import { rate } from '../rate/ratelimiter.mjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

dotenv.config();

export const route = Router();
route.post('/download', async (req, res) => {
  try {
    const {password,id} = req.body;
    if (!id) return res.status(400).json({ message: "fileId required" });

    const file = await File.findOne({ id: id });
    if (!file) return res.status(404).json({ message: "File not found" });
    const isValid = bcrypt.compareSync(password, file.password);
    if (!isValid) return res.status(401).json({ message: "Invalid password" });    
    const originalFileName = file.filekey.split('-').slice(1).join('-');
    const command = new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: file.filekey,
      ResponseContentDisposition: `attachment; filename="${originalFileName}"`
    });
    
    const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    res.json({ downloadUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
