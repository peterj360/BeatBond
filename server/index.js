import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import multer from "multer";
import AWS from 'aws-sdk';
import multerS3 from 'multer-s3';
import { fileURLToPath } from "url";
import path from "path";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import postRoutes from "./routes/posts.js";
import songsRoutes from "./routes/songs.js";
import playlistRoutes from "./routes/playlist.js";
import commentRoutes from "./routes/comments.js";
import searchRoutes from "./routes/search.js";
import spotifyRoutes from "./routes/spotify.js";
import { signUp } from "./controllers/auth.js";
import { createPost } from "./controllers/posts.js";
import verifyToken from "./middleware/auth.js";
import { editPlaylist } from "./controllers/playlist.js";
import { editUser } from "./controllers/user.js";
import { initRedisClient } from "./services/redisClient.js";

// Configurations
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
const PORT = process.env.PORT || 9000;
app.use(express.json());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({policy: "cross-origin"}))
app.use(morgan("common"));
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// File Storage
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1'
});

const s3 = new AWS.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname)
    }
  })
});

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use('/songs', songsRoutes);
app.use('/playlist', playlistRoutes);
app.use('/comments', commentRoutes);
app.use('/search', searchRoutes);
app.use('/spotify', spotifyRoutes);

// Routes With Files
app.post("/auth/signup", upload.single("picture"), signUp);
app.put("/playlist/:playlistId", verifyToken, upload.single("picture"), editPlaylist);
app.put("/users/:userId", verifyToken, upload.single("picture"), editUser);
app.post("/posts", verifyToken, upload.fields([{ name: 'picture', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), createPost);

// Error Handling
app.use((err, req, res, next) => {
  console.error("Full Error Object: ", err);
  console.error("Error Stack Trace: ", err.stack);
  console.error("Error Message: ", err.message);
  res.status(500).json({ message: 'An unexpected error occurred' });
});

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {

  try {
    await initRedisClient();
  } catch (error) {
    console.error('Error initializing Redis: ', error);
  }
 
  app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
    
})
.catch((error) => console.log(`${error} did not connect`));

