import express from "express";
import verifyToken from "../middleware/auth.js";
import { getRecentSearches, addRecentSearches, search } from "../controllers/search.js";

const router = express.Router();

router.get("/", verifyToken, search);

router.get("/recent/:userId", verifyToken, getRecentSearches);

router.post("/recent", verifyToken, addRecentSearches);

export default router;