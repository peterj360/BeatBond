import redis from "redis";
import dotenv from "dotenv";

dotenv.config();

let client;

const initRedisClient = async () => {
  if (!client) {
    console.log('Checking REDIS_URL:', process.env.REDIS_URL);
    
    client = redis.createClient(process.env.REDIS_URL);

    client.on("connect", () => {
      console.log("Connected to Redis");
    });

    client.on("error", (err) => {
      console.error(`Error connecting to Redis: ${err}`);
    });

    client.on("end", () => {
      console.log("Redis client connection closed");
    });

    await client.connect();
  }
};

export { initRedisClient, client };