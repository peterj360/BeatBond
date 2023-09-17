import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    mode: "dark",
    user: null,
    token: null,
    posts: [],
    playlists: [],
    likedSongs: null,
    currentSong: null,
    nextSong: null,
    currentPlaylist: null,
    isPlaying: false,
    resetSongTimeFlag: false,
};

export const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        setMode: (state) => {
            state.mode = state.mode === "light" ? "dark" : "light";
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
        setLogin: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
        },
        setLogout: (state) => {
            state.user = null;
            state.token = null;
            state.posts = [];
            state.playlists = [];
            state.likedSongs = null;
            state.currentSong = null;
            state.nextSong = null;
            state.currentPlaylist = null;
            state.isPlaying = false;
            state.resetSongTimeFlag = false;
        },
        setFollowing: (state, action) => {
            if (state.user) {
                state.user.following = action.payload.following;
            } else {
                console.error("user following non-existent");
            }
        },
        removeUserPost: (state, action) => {
            state.user.posts = state.user.posts.filter(post => post._id !== action.payload.post);
        },
        setLikedPosts: (state, action) => {
            const { postId, userId, liked } = action.payload;
            
            const post = state.posts.find(post => post._id === postId);
            if (post) {
                if (liked) {
                    post.likes[String(userId)] = true;
                } else {
                    delete post.likes[String(userId)];
                }
            }
        },
        addPost: (state, action) => {
            return {
                ...state,
                posts: [action.payload.post, ...state.posts]
            };
        },
        setPosts: (state, action) => {
            state.posts = action.payload.posts;
        },
        appendPosts: (state, action) => {
            const newPosts = action.payload.posts.filter(
                newPost => !state.posts.some(existingPost => existingPost._id === newPost._id)
            );
            state.posts = [...state.posts, ...newPosts];
        },
        setPost: (state, action) => {
            const updatedPosts = state.posts.map((post) => {
              if (post._id === action.payload.post._id) return action.payload.post;
              return post;
            });
            state.posts = updatedPosts;
        },
        cleanPosts: (state) => {
            return {
                ...state,
                posts: state.posts.filter(post => post._id)
            };
        },
        deletePost: (state, action) => {
            state.posts = state.posts.filter(post => post._id !== action.payload.postId);
        },
        setCurrentSong: (state, action) => {
            state.currentSong = action.payload
        },
        setNextSong: (state) => {
            if (!state.currentPlaylist || !state.currentPlaylist.songs.length) return;
        
            const currentIndex = state.currentPlaylist.songs.findIndex(
              (song) => song === state.currentSong
            );
        
            if (currentIndex === -1) return;
        
            state.currentSong = state.currentPlaylist.songs[
              (currentIndex + 1) % state.currentPlaylist.songs.length
            ];
        },
        setCurrentPlaylist: (state, action) => {
            state.currentPlaylist = action.payload
        },
        toggleIsPlaying: (state, action) => {
            if (typeof action.payload === 'boolean') {
                state.isPlaying = action.payload;
            } else {
                state.isPlaying = !state.isPlaying;
            }
        },
        pauseSong: (state) => {
            state.isPlaying = false;
        },
        playSong: (state) => {
            state.isPlaying = true;
        },
        resetCurrentSongTime: (state) => {
            state.resetSongTimeFlag = !state.resetSongTimeFlag;
        },
        setPlaylists: (state, action) => {
            state.playlists = action.payload.playlists;
        },
        addPlaylist: (state, action) => {
            state.playlists.push(action.payload.playlist);
        },
        setLikedSongs: (state, action) => {
            state.likedSongs = action.payload.likedSongs;
        },
        addLikedSongs: (state, action) => {
            state.likedSongs.songs.push(action.payload.song);
        },
        removeLikedSongs: (state, action) => {
            state.likedSongs.songs = state.likedSongs.songs.filter(song => song._id !== action.payload.song._id);
        },
    }
})

export const { setMode, setUser, setLogin, setLogout, setFollowing, removeUserPost, setLikedPosts, addPost, appendPosts, setPosts, setPost, cleanPosts, deletePost, setCurrentSong, setNextSong, setCurrentPlaylist, toggleIsPlaying, pauseSong, playSong, resetCurrentSongTime, setPlaylists, addPlaylist, setLikedSongs, addLikedSongs, removeLikedSongs } = appSlice.actions;

export default appSlice.reducer;