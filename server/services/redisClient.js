import redis from "redis";
import dotenv from "dotenv";

dotenv.config();

const redis_host = process.env.REDIS_HOST;
const redis_port = process.env.REDIS_PORT;

let client;

const initRedisClient = async () => {
  if (!client) {
    client = redis.createClient({
      host: redis_host,
      port: redis_port
    });

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