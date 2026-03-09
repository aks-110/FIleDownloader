import { Worker } from 'bullmq';
import { DeleteQueue } from './Queue.mjs';
import IORedis from 'ioredis';
const connection = new IORedis({maxRetriesPerRequest: null});

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

const worker = new Worker('DeleteQueue', async (job)=>{
  const { key, fileName } = job.data
  console.log('got it');
  await deleteFile(key, fileName);
  console.log('deleted');
},{connection})

export default worker;
