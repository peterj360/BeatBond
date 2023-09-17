import User from "../models/user.js";
import Song from "../models/song.js"

export const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).populate({
            path: 'posts',
            populate: {
                path: 'song'
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User does not exist' });
        }

        res.status(200).json({ message: "User fetched successfully", user: user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getRecommendedUsers = async (req, res) => {
    try {
        const usersWithPosts = await User.find({ "posts.0": { $exists: true } }).exec();
        
        const sortedUsers = usersWithPosts.sort((a, b) => b.followers.length - a.followers.length);

        const topUsers = sortedUsers.slice(0, 5);

        if (!topUsers.length) {
            return res.status(404).json({ message: 'No users found' });
        }

        res.status(200).json({ message: "Users fetched successfully", users: topUsers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserFollowers = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select("-password -__v");
        
        if (!user) {
            return res.status(404).json({ message: 'User does not exist' });
        }
        
        const followers = await Promise.all(user.followers.map((id) => User.findById(id)));
        const formattedFollowers = followers.map(
            ({ _id, username, picturePath, followers, following, playlists }) => {
                return { _id, username, picturePath, followers, following, playlists };
            }
        );
        res.status(200).json({ message: "Followers list fetched successfully", data: formattedFollowers});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserFollowing = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select("-password -__v");

        if (!user) {
            return res.status(404).json({ message: 'User does not exist' });
        }

        const following = await Promise.all(user.following.map((id) => User.findById(id)));
        const formattedFollowing = following.map(
            ({ _id, username, picturePath, followers, following, playlists }) => {
                return { _id, username, picturePath, followers, following, playlists };
            }
        );
        res.status(200).json({ message: "Following list fetched successfully", data: formattedFollowing});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserBySongId = async (req, res) => {
    try {
        const { songId } = req.params;

        const song = await Song.findById(songId);
        const userId = song.user;

        res.status(200).json({ message: "User fetched successfully", userId: userId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const followUser = async (req, res) => {
    try {
        const { id, targetUserId } = req.params;
        const user = await User.findById(id).select("-password -__v");
        const targetUser = await User.findById(targetUserId).select("-password -__v");

        if (!user || !targetUser) {
            return res.status(404).json({ message: 'User or target user does not exist' });
        }

        if(!user.following.includes(targetUserId)) {
            user.following.push(targetUser._id);
            targetUser.followers.push(user._id);
        } else {
            return res.status(400).json({ message: 'You are already following this user'})
        }

        await user.save();
        await targetUser.save();

        res.status(200).json({ message: "Followed user successfully"});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const unfollowUser = async (req, res) => {
    try {
        const { id, targetUserId } = req.params;
        const user = await User.findById(id).select("-password -__v");
        const targetUser = await User.findById(targetUserId).select("-password -__v");

        if (!user || !targetUser) {
            return res.status(404).json({ message: 'User or target user does not exist' });
        }

        user.following = user.following.filter((followingId) => followingId.toString() !== targetUser._id.toString());
        targetUser.followers = targetUser.followers.filter((followerId) => followerId.toString() !== user._id.toString());

        await user.save();
        await targetUser.save();

        res.status(200).json({ message: "Unfollowed user successfully"});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const removeFollower = async (req, res) => {
    try {
        const { id, targetUserId } = req.params;
        const user = await User.findById(id).select("-password -__v");
        const targetUser = await User.findById(targetUserId).select("-password -__v");

        if (!user || !targetUser) {
            return res.status(404).json({ message: 'User or target user does not exist' });
        }

        user.followers = user.followers.filter((followerId) => followerId.toString() !== targetUser._id.toString());
        targetUser.following = targetUser.following.filter((followingId) => followingId.toString() !== user._id.toString());

        await user.save();
        await targetUser.save();

        res.status(200).json({ message: "Follower removed successfully"});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const editUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (String(user._id) !== userId) {
            return res.status(403).json({ message: 'You are not authorized to edit this user' });
        }

        const { firstName, lastName, username, privacy } = req.body;

        let picturePath = null;
        if (req.file) {
            picturePath = req.file.key; 
        }

        if (firstName) {
            user.firstName = firstName;
        }
        if (lastName) {
            user.lastName = lastName;
        }
        if (username) {
            user.username = username;
        }
        if (picturePath) {
            user.picturePath = picturePath;
        }
        if (privacy) {
            user.privacy = privacy;
        }

        const updatedUser = await user.save();

        res.status(200).json({ message: 'User edited succesfully', user: updatedUser });
    } catch (error) {
        console.error("Error editing user", error);
        res.status(500).json({ message: error.message });
    }
}