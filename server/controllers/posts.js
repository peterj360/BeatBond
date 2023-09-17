import Post from "../models/post.js";
import User from "../models/user.js";
import Song from "../models/song.js";
import Comment from "../models/comment.js";
import getAudioDuration from "../services/audioService.js";
import fs from "fs";
import AWS from 'aws-sdk';
import dotenv from "dotenv";

dotenv.config();

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1'
});

const s3 = new AWS.S3();

const downloadFileFromS3 = async (bucket, key) => {
    const params = {
      Bucket: bucket,
      Key: key,
    };

    const s3Object = await s3.getObject(params).promise();
  
    return s3Object.Body;
  };

export const createPost = async (req, res) => {
    try {
        const { userId, title, caption} = req.body;

        if (!req.files || !req.files.audio || !req.files.picture) {
            return res.status(400).json({ message: 'Missing required files.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User does not exist' });
        }

        const audioFilePath = req.files.audio[0].location;
        const audioFileKey = req.files.audio[0].key;
        const audioBucket = req.files.audio[0].bucket;

        if(!audioFilePath || !audioFileKey || !audioBucket) {
            return res.status(400).json({ message: 'Audio file location or key or bucket is undefined' });
        }

        const fileExtension = audioFilePath.split('.').pop();

        const audioBuffer = await downloadFileFromS3(audioBucket, audioFileKey);

        if (!audioBuffer) {
            return res.status(400).json({ message: 'Unable to read audio file' });
        }
        const duration = await getAudioDuration(audioBuffer, fileExtension);
        
        const newSong = new Song({
            title,
            artist: user.username,
            filePath: req.files.audio[0].key,
            picturePath: req.files.picture[0].key,
            duration,
            user: user._id,
        });

        const savedSong = await newSong.save();

        const newPost = new Post ({
            user,
            song: savedSong,
            caption,
            likes: {},
            comments: [],
        });
    
        const savedPost = await newPost.save();

        user.posts.push(savedPost);
        user.songs.push(savedSong);
        await user.save();

        res.status(201).json({ message: "Post created successfully", post: savedPost });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

export const getFeedPosts = async (req, res) => {
    try {
        let { page = 1, limit = 10 } = req.query;
        page = Number(page);
        limit = Number(limit);

        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User does not exist' });
        }

        const following = [...user.following, userId];

        const totalPosts = await Post.countDocuments({ user: { $in: following } });

        const feedPosts = await Post.find({ user: { $in: following } })
            .populate('song')
            .populate('user')
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'username picturePath'
                }
            })
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();

        res.status(200).json({
            message: "Feed posts fetched successfully",
            totalPages: Math.ceil(totalPosts / limit),
            currentPage: page,
            feedPosts, 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getUserPosts = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User does not exist' });
        }

        const posts = await Post.find({ user: userId }).populate('song')
            .populate('user')
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'username picturePath'
                }
            })
            .sort({ createdAt: -1 })
            .exec();

        res.status(200).json({ message: "User posts fetched successfully", posts: posts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const likePost = async (req, res) => {
    try {
        const { id } = req.params; 
        const userId = req.user.id;

        const post = await Post.findById(id).populate('song').populate('user').populate({
            path: 'comments',
            populate: {
                path: 'user',
                select: 'username picturePath'
            }
        }).exec();
        if (!post) {
            return res.status(404).json({ message: 'Post does not exist' });
        }

        const isLiked = post.likes.get(userId.toString());

        if (isLiked) {
            post.likes.delete(userId.toString());
        } else {
            post.likes.set(userId.toString(), true);
        }

        const updatedPost = await post.save();

        res.status(200).json({ message: "Liked post successfully", post: updatedPost });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const commentPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;
        const { text } = req.body;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post does not exist' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User does not exist' });
        }

        const newComment = new Comment({
            user: userId,
            text,
            likes: {},
            replies: [],
        });

        await newComment.save();

        post.comments.push(newComment._id);
        
        await post.save();

        const updatedPost = await Post.findById(postId)
            .populate('song')
            .populate('user')
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                },
            })
            .exec();

        res.status(200).json({ message: "Commented post successfully", post: updatedPost });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const deletePost = async (req, res) => {
    try {
        const { id } = req.params; 
        const userId = req.user.id;

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ message: "Post not found"});
        }

        if (post.user.toString() !== userId) {
            return res.status(403).json({ message: "Not authorized"});
        }

        await Post.deleteOne({ _id: id });

        await User.updateOne(
            { _id: userId },
            { $pull: { posts: id } }
        );

        res.status(200).json({ message: "Post deleted sucessfully"});

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}