import { Worker } from 'bullmq';
import { DeleteQueue } from './Queue.mjs';
import IORedis from 'ioredis';
import File  from '../Models/FileModel.mjs';
const connection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null
});

let authToken = null
let apiUrl = null

async function authorize() {
  const res = await axios.get("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
    auth: {
      username: process.env.KEY_ID,
      password: process.env.APP_KEY
    }
  })

  authToken = res.data.authorizationToken
  apiUrl = res.data.apiUrl
}
async function deleteFile(fileId, fileName) {
  if (!authToken) await authorize()
  try{
    await axios.post(
      `${apiUrl}/b2api/v2/b2_delete_file_version`,
      {
        fileId,
        fileName
      },
      {
        headers: {
          Authorization: authToken
        }
      }
    )
  }catch(err){
    console.log(err);
  }
}

export const delworker = new Worker('DeleteQueue', async (job)=>{
  switch (job.name) {
    case 'delete-file':
      await deleteFile(job.data.key, job.data.fileName)
      break;
    case 'delete-db':
      await File.findByIdAndDelete(job.data.id)
      break;
    default:
      break;
  }
},{connection})
