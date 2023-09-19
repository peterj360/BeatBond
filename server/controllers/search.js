import User from "../models/user.js";
import Song from "../models/song.js";
import Playlist from "../models/playlist.js";
import { client }  from "../services/redisClient.js";

export const search = async (req, res) => {
    try {
        const { text, filter } = req.query;

        let songs = [];
        let playlists = [];
        let artists = [];
        let profiles = [];

        const limitForAll = 8;

        if (!filter || filter === 'All' || filter === 'Songs') {
            const limit = filter === 'Songs' ? 8 : 4;
            songs = await Song.aggregate([
                {
                    $match: {
                        title: { $regex: text, $options: 'i' },
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: '$user'
                },
                {
                    $match: {
                        'user.privacy': "Public"
                    }
                },
                {
                    $limit: limit
                }
            ]);
        }

        if (!filter || filter === 'All' || filter === 'Playlists') {
            const limit = filter === 'Playlists' ? 16 : limitForAll;
            playlists = await Playlist.find({ 
                name: { $regex: text, $options: 'i' },
                privacy: 'Public'
            }).limit(limit);
        }

        if (!filter || filter === 'All' || filter === 'Artists') {
            const limit = filter === 'Artists' ? 16 : limitForAll;
            artists = await User.find({ 
                username: { $regex: text, $options: 'i' },
                'songs.0': { $exists: true }
            }).limit(limit);
        }

        if (!filter || filter === 'All' || filter === 'Profiles') {
            const limit = filter === 'Profiles' ? 16 : limitForAll;
            profiles = await User.find({ 
                username: { $regex: text, $options: 'i' }
            }).limit(limit);
        }

        res.status(200).json({ songs, playlists, artists, profiles });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getRecentSearches = async (req, res) => {
    try {
        const { userId } = req.params;
        const recentSearches = await client.lRange(`user:${userId}:recentSearches`, 0, 5);
        res.status(200).json({ recentSearches: recentSearches.map(item => JSON.parse(item)) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addRecentSearches = async (req, res) => {
    try {
        const { userId, newSearchItem } = req.body;

        const recentSearches = await client.lRange(`user:${userId}:recentSearches`, 0, -1);
        const stringifiedSearchItem = JSON.stringify(newSearchItem);

        const existingIndex = recentSearches.findIndex(item => {
            const parsedItem = JSON.parse(item);
            return parsedItem._id === newSearchItem._id && parsedItem.type === newSearchItem.type;
        });

        if (existingIndex !== -1) {
            await client.lRem(`user:${userId}:recentSearches`, 0, recentSearches[existingIndex]);
        }

        client.lPush(`user:${userId}:recentSearches`, stringifiedSearchItem, (error, reply) => {
            if (error) {
                console.error("lPush Error: ", error);
                return res.status(500).json({ message: "Redis lPush error" });
            }
            client.lTrim(`user:${userId}:recentSearches`, 0, 5);
        });

        res.status(200).send('Recent search saved');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const clearRecentSearches = async (req, res) => {
    try {
        const userId = req.user.id;

        client.del(`user:${userId}:recentSearches`, (error, reply) => {
            if (error) {
                console.error("Del Error: ", error);
                return res.status(500).json({ message: "Redis del error" });
            }
            return res.status(200).json({ message: "Recent searches cleared" });
        });
    } catch (error) {
        console.error("Error clearing recent searches", error);
        return res.status(500).json({ message: error.message });
    }
}
