import { s3 } from '../BackBlaze/client.mjs';
import { PutObjectCommand, GetObjectCommand , CreateMultipartUploadCommand} from "@aws-sdk/client-s3";
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
    const { fileName, fileType , password,filesize,expiry} = req.body;
    if (!fileName || !fileType) return res.status(400).json({ message: "fileName and fileType required" });

    const id = generateId();
    const key = `uploads/${id}-${fileName}`;
    let uploadUrl;
    let strategy = 'multipart';
    let partsize;
    const filesizeinMb = filesize/(1024*1024);
    if(filesizeinMb > 50) {
      const command = new CreateMultipartUploadCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: key,
      })
      const response = await s3.send(command);
      uploadUrl = response.UploadId;
      partsize = filesize/25;
    }else{
      uploadUrl = await getSignedUrl(
        s3,
        new PutObjectCommand({ Bucket: process.env.BUCKET_NAME, Key: key }),
        { expiresIn: expiry }
      );
      strategy = 'single';
      partsize = null;
    }
    const hashedpassword = bcrypt.hashSync(password, 10);
    const qrDataUrl = await QRCode.toDataURL(`${process.env.FRONTEND_URL}/download/${id}`);

    await File.create({ id, filekey: key, password:hashedpassword });
    await DeleteQueue.addBulk([
      {
        name: "delete-file",
        data: {
          key: key,
          fileName: fileName
        },
        opts: {
          delay: expiry * 1000
        }
      },
      {
        name: "delete-db",
        data: {
          id: id,
          fileName: fileName,
          fileType: fileType,
          password: hashedpassword
        },
        opts: {
          delay: expiry * 1000
        }
      }
    ], {
      expiresIn: expiry
    });
    res.json({strategy: strategy, uploadUrl, id, qrDataUrl, partsize,key });
  } catch (err) {
    console.error(err);
    console.log("hi");
    res.status(500).json({ message: "Server error" });
  }
});
