import { useSelector, useDispatch } from 'react-redux';
import { pauseSong, playSong, resetCurrentSongTime, setPost, setCurrentSong, addLikedSongs, removeLikedSongs } from 'state';
import AudioPlayer from "react-h5-audio-player";
import { Box, IconButton, Menu, MenuItem, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { MoreHorizOutlined, FavoriteBorderOutlined, FavoriteOutlined, } from "@mui/icons-material";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './index.css';

const GlobalAudioPlayer = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const currentSong = useSelector((state) => state.currentSong);
    const isPlaying = useSelector((state) => state.isPlaying);
    const shouldResetTime = useSelector((state) => state.resetSongTimeFlag);
    const posts = useSelector((state) => state.posts);
    const loggedInUserId = useSelector((state) => state.user._id);
    const likedSongs = useSelector((state) => state.likedSongs);
    const isLiked = likedSongs.songs?.some(likedSong => likedSong._id === currentSong._id);
    const token = useSelector((state) => state.token);
    const currentPlaylist = useSelector((state) => state.currentPlaylist);
    const playlists = useSelector((state) => state.playlists);

    const [anchorEl, setAnchorEl] = useState(null);
    const [addPlaylistAnchorEl, setAddPlaylistAnchorEl] = useState(null);
    const [isLooping, setIsLooping] = useState(false);
    const playerRef = useRef(null);

    const { palette } = useTheme();
    const primary = palette.primary.main;
    const main = palette.neutral.main;
    const backgroundSwitch = palette.background.switch;
    const neutralLight = palette.neutral.light;
    const background = palette.background.default;
    const neutralBase = palette.neutral.base;

    const isNonMobileScreens = useMediaQuery("(min-width:1000px)");

    const BASE_URL = process.env.REACT_APP_BEATBOND_API_BASE_URL;
    const S3_BASE_URL = process.env.REACT_APP_S3_BASE_URL;

    const handleLikeClick = async () => {
        try {
            const response = await axios.put(`${BASE_URL}/songs/${currentSong._id}/like`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            });
            if (response.data.message === "Added to your liked songs") {
                dispatch(addLikedSongs({ song: currentSong }));
            } else if (response.data.message === "Removed from your liked songs") {
                dispatch(removeLikedSongs({ song: currentSong }));
            }
            handleMenuClose();
            const relevantPost = posts.find(post => post.song._id === currentSong._id);
            if (relevantPost) {
                const response = await axios.patch(`${BASE_URL}/posts/${relevantPost._id}/like`, { userId: loggedInUserId }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                });
                dispatch(setPost({ post: response.data.post }));
            }
        } catch (error) {
            handleMenuClose();
            console.error("Error toggling like status", error);
        }
    }

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleAddPlaylistMenuOpen = (event) => {
        setAddPlaylistAnchorEl(event.currentTarget);
    };

    const handleAddPlaylistMenuClose = () => {
        setAddPlaylistAnchorEl(null);
    };

    const handleAddToPlaylist = async (playlistId, songId) => {
        try {
            await axios.put(`${BASE_URL}/playlist/${playlistId}/add-song`, {
                songId: songId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            handleAddPlaylistMenuClose();
        } catch (error) {
            console.error('Error adding song:', error);
        }
        handleMenuClose();
    };

    const handleGoToArtist = async () => {
        setAnchorEl(null);
        try {
            const response = await axios.get(`${BASE_URL}/users/song/${currentSong._id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            });
            navigate(`/profile/${response.data.userId}`);
        } catch (error) {
            console.error("Error fetching user by song id", error);
        }
    }

    useEffect(() => {
        if (isPlaying && playerRef.current.audio.current.paused) {
            playerRef.current.audio.current.play().catch(error => {
                console.error("Play error:", error);
                dispatch(pauseSong());
            });
        } else if (!isPlaying && !playerRef.current.audio.current.paused) {
            playerRef.current.audio.current.pause();
        }

        if (shouldResetTime) {
            playerRef.current.audio.current.currentTime = 0;
            dispatch(resetCurrentSongTime())
        }

    }, [isPlaying, dispatch, shouldResetTime]);

    useEffect(() => {
        const audio = playerRef.current.audio.current;
      
        const playEndedHandler = () => {
            playNextSong(); 
        };
      
        audio.addEventListener('ended', playEndedHandler);
        
        return () => {
            audio.removeEventListener('ended', playEndedHandler);
        };
    }, [currentSong, currentPlaylist]); // eslint-disable-line react-hooks/exhaustive-deps
    
    const playNextSong = () => {
        if (!currentPlaylist || currentPlaylist === "recentSearch" || currentPlaylist === "postFeed") return;  
        
        const currentIndex = currentPlaylist.songs.findIndex(song => song._id === currentSong._id);
        
        if (currentIndex === -1) return; 
      
        const nextSong = currentPlaylist.songs[currentIndex + 1];
        
        if (!nextSong) return; 
        
        dispatch(setCurrentSong(nextSong));
        dispatch(playSong());
    };

    return (
        <div style={{
            '--primary-main': primary,
            '--neutral-light': neutralLight,
            '--neutral-base': neutralBase,
            '--background-default': background,
        }}>
        {currentSong && isNonMobileScreens ? (
            <Box 
                sx={{
                    display: "flex", 
                    // position: 'fixed',
                    // bottom: 0,
                    // left: 0,
                    // right: 0,
                    width: '100vw',
                    backgroundColor: background,
                    padding: '0 1rem',
                    boxSizing: 'border-box',
                    overflowX: 'hidden',
                }}
            >
                <Box display="flex" justifyContent="left" alignItems="center" gap="1rem" sx={{ width: "20%" }}> 
                    <Box width="55px" height="55px">
                        <img 
                            style={{ objectFit: "cover", borderRadius: "10%"}}
                            width="55px"
                            height="55px"
                            alt="user"
                            src={`${S3_BASE_URL}/${currentSong.picturePath}`}
                        />
                    </Box>
                    <Box flexGrow={1}>
                        <Typography variant="h5" color={backgroundSwitch} sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                            {currentSong.title}
                        </Typography>
                        <Typography variant="h6"color={main} sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                            {currentSong.artist}
                        </Typography>
                    </Box>
                </Box>
                <AudioPlayer
                    ref={playerRef}
                    autoPlay={false} 
                    src={`${S3_BASE_URL}/${currentSong.filePath}`}
                    loop={isLooping}
                    onPlay={() => dispatch(playSong())}
                    onPause={() => dispatch(pauseSong())}
                    onLoop={() => setIsLooping(!isLooping)}
                    style={{ flex: 1 }}
                />
                <Box gap="3rem" display="flex" justifyContent="center" alignItems="center" sx={{ width: "20%"}}>
                    <IconButton onClick={handleLikeClick}>
                        {isLiked ? (
                            <FavoriteOutlined sx={{ color: primary}} />
                        ) : (
                            <FavoriteBorderOutlined />
                        )}
                    </IconButton>
                    <IconButton onClick={handleMenuOpen}>
                        <MoreHorizOutlined />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                        }}
                        transformOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                        }}
                    >
                        <MenuItem onClick={handleAddPlaylistMenuOpen}>Add to playlist</MenuItem>
                        <Menu anchorEl={addPlaylistAnchorEl}
                        open={Boolean(addPlaylistAnchorEl)}
                        onClose={handleAddPlaylistMenuClose}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        >
                            {playlists.map((playlist) => (
                                <MenuItem onClick={(event) => handleAddToPlaylist(playlist._id, currentSong._id, event)} key={playlist._id}>
                                    {playlist.name}
                                </MenuItem>
                            ))}
                        </Menu>
                        {isLiked ? <MenuItem onClick={(event) => handleLikeClick(event)}>Remove from your Liked Songs</MenuItem> :
                        <MenuItem onClick={(event) => handleLikeClick(event)}>Add to your Liked Songs</MenuItem>}
                        <MenuItem onClick={(event) => handleGoToArtist(event)}>Go to artist</MenuItem>
                    </Menu>
                </Box>    
            </Box>
        ) : <Box 
                sx={{ 
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    width: '100%',
                    backgroundColor: background,
                    padding: '0 1rem'
                }}
            >
                <Box display="flex" justifyContent="left" alignItems="center" gap="1rem" p="1rem 1rem"> 
                    <Box width="55px" height="55px">
                        <img 
                            style={{ objectFit: "cover", borderRadius: "10%"}}
                            width="55px"
                            height="55px"
                            alt="user"
                            src={`${S3_BASE_URL}/${currentSong.picturePath}`}
                        />
                    </Box>
                    <Box flexGrow={1}>
                        <Typography variant="h5" color={backgroundSwitch} sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                            {currentSong.title}
                        </Typography>
                        <Typography variant="h6"color={main} sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                            {currentSong.artist}
                        </Typography>
                    </Box>
                    <Box gap="1rem" display="flex" justifyContent="right" alignItems="center">
                        <IconButton onClick={handleLikeClick}>
                            {isLiked ? (
                                <FavoriteOutlined sx={{ color: primary}} />
                            ) : (
                                <FavoriteBorderOutlined />
                            )}
                        </IconButton>
                        <IconButton >
                            <MoreHorizOutlined />
                        </IconButton>
                    </Box>
                </Box>
                <AudioPlayer
                    ref={playerRef}
                    autoPlay={false}
                    src={`${S3_BASE_URL}/${currentSong.filePath}`}
                    loop={isLooping}
                    onPlay={() => dispatch(playSong())}
                    onPause={() => dispatch(pauseSong())}
                    onLoop={() => setIsLooping(!isLooping)}
                />
            </Box>}
        </div>
    );
};

export default GlobalAudioPlayer;