// import express from "express";
// import bcrypt from "bcrypt";
// import User from "../models/user.js";

// const router = express.Router();

// router.post("/", async (req, res) => {
//     try {
//         const user = await User.findOne({ email: req.body.email });
//         if (!user) {
//             return res.status(400).json({ message: "Invalid email or password"});
//         }
//         const validPassword = await bcrypt.compare(req.body.password, user.password);
//         if (!validPassword) {
//             return res.status(400).json({ message: "Invalid email or password"});
//         }
//         const token = user.generateToken();
//         res.status(200).json({data: token, message: "Signing in please wait..."});
//     } catch (error) {
//         res.status(500).json({message: error.message});
//     }
// });

// export default router;