import { createClient } from "redis";
export const client = createClient({
  url: "redis://redis:6379",
});

client.on('error', err => console.log('error'));
await client.connect();
console.log('connected');