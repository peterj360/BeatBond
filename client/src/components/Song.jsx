import { FavoriteBorderOutlined, FavoriteOutlined, MoreHorizOutlined, PlayArrow, Pause, Equalizer } from "@mui/icons-material";
import { Box, Typography, IconButton, useTheme, Menu, MenuItem } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { pauseSong, playSong, setCurrentPlaylist, setCurrentSong, resetCurrentSongTime, addLikedSongs, removeLikedSongs, setPlaylists } from "state";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";

const Song = ({ song, playlist, position, myPlaylist, handleSearchClick}) => {
    const { _id, title, artist, filePath, picturePath, duration } = song;

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const currentSongPlaying = useSelector((state) => state.currentSong);
    const isPlaying = useSelector((state) => state.isPlaying);
    const currentPlaylist = useSelector((state) => state.currentPlaylist);
    const token = useSelector((state) => state.token);
    const posts = useSelector((state) => state.posts);
    const loggedInUserId = useSelector((state) => state.user._id);
    const likedSongs = useSelector((state) => state.likedSongs);
    const isLiked = likedSongs.songs?.some(likedSong => likedSong._id === song._id);
    const playlists = useSelector((state) => state.playlists);

    const [isHovered, setIsHovered] = useState(false);
    const [addPlaylistAnchorEl, setAddPlaylistAnchorEl] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);

    const { palette } = useTheme();
    const primary = palette.primary.main;
    const main = palette.neutral.main;
    const backgroundSwitch = palette.background.switch;
    const neutralLight = palette.neutral.light;

    const BASE_URL = process.env.REACT_APP_BEATBOND_API_BASE_URL;
    const S3_BASE_URL = process.env.REACT_APP_S3_BASE_URL;

    const handleMenuOpen = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = (event) => {
        if (event) {
            event.stopPropagation();
        }
        setAnchorEl(null);
    };

    const handleAddPlaylistMenuOpen = (event) => {
        event.stopPropagation();
        setAddPlaylistAnchorEl(event.currentTarget);
    };

    const handleAddPlaylistMenuClose = (event) => {
        if (event) {
          event.stopPropagation();
        }
        setAddPlaylistAnchorEl(null);
    };

    const handleAddToPlaylist = async (playlistId, songId, event) => {
        event.stopPropagation();
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

    const handleRemoveFromPlaylist = async (playlistId, songId, event) => {
        event.stopPropagation();
        try {
            const response = await axios.put(`${BASE_URL}/playlist/${playlistId}/remove-song`, {
                songId: songId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            
            const updatedPlaylists = playlists.map((playlist) => {
                return playlist._id === response.data.playlist._id ? response.data.playlist : playlist;
            });
            dispatch(setPlaylists({ playlists: updatedPlaylists})); 
            handleMenuClose();
        } catch (error) {
            console.error('Error removing song:', error);
        }
    };

    const handlePlay = () => {
        if (handleSearchClick) {
            handleSearchClick(song, "song");
        }
        if (currentSongPlaying?.filePath === filePath) {
            if (currentPlaylist !== playlist) {
                dispatch(resetCurrentSongTime());
                dispatch(setCurrentSong(song));
                dispatch(playSong());
                dispatch(setCurrentPlaylist(playlist));  
            } 
            else if (isPlaying) {
                dispatch(pauseSong());
            } else {
                dispatch(playSong());
            }
        } else {
            dispatch(setCurrentSong(song));
            dispatch(setCurrentPlaylist(playlist));
            dispatch(playSong());
        }
    };

    const formatDuration = (duration) => {
        const totalSeconds = Math.round(duration); 
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const formattedMinutes = minutes > 0 ? minutes.toString() : minutes.toString().padStart(1, '0');
        return `${formattedMinutes}:${seconds.toString().padStart(2, '0')}`;
    }

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const handleLikeClick = async (event) => {
        event.stopPropagation();
        setAnchorEl(null);
        try {
            const response = await axios.put(`${BASE_URL}/songs/${_id}/like`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            });
            if (response.data.message === "Added to your liked songs") {
                dispatch(addLikedSongs({ song: song }));
            } else if (response.data.message === "Removed from your liked songs") {
                dispatch(removeLikedSongs({ song: song }));
            }
            const relevantPost = posts.find(post => post.song._id === _id);
            if (relevantPost) {
                await axios.patch(`${BASE_URL}/posts/${relevantPost._id}/like`, { userId: loggedInUserId }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                });
            }
        } catch (error) {
            console.error("Error toggling like status", error);
        }
    }

    const handleGoToArtist = async (event) => {
        event.stopPropagation();
        setAnchorEl(null);
        try {
            const response = await axios.get(`${BASE_URL}/users/song/${_id}`, {
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

    return (
        <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center" 
            p={playlist ? "0.5rem 1rem" :"0.5rem 0.5rem"} 
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave} 
            sx={{"&:hover": { backgroundColor: neutralLight, borderRadius: 2, }}}
            onClick={handlePlay}
        >
            <Box display="flex" alignItems="center" gap="1rem" style={{ overflow: 'hidden' }}>
                {(playlist && playlist !== "recentSearch") && <Box width={15} display="flex" justifyContent="center" alignItems="center">
                    {isHovered ? 
                        (isPlaying && currentSongPlaying?._id === song?._id && currentPlaylist === playlist ? <Pause sx={{ color: main }}/> : <PlayArrow sx={{ color: main }}/>) :
                        isPlaying && currentSongPlaying?._id === song?._id && currentPlaylist === playlist ? <Equalizer sx={{ color: primary }}/> :
                        <Typography variant="h5" color={currentSongPlaying?._id === song?._id && currentPlaylist === playlist ? primary : main}>
                            {position}
                        </Typography>}
                </Box>}
                <Box position="relative" width="40px" height="40px">
                    <img 
                        style={{ objectFit: "cover", width: "100%", height: "100%" }}
                        alt="song"
                        src={`${S3_BASE_URL}/${picturePath}`}
                    />
                    {((!playlist || playlist === "recentSearch") && isHovered) && (
                        <Box 
                            display="flex" 
                            justifyContent="center" 
                            alignItems="center" 
                            position="absolute"
                            top={0}
                            left={0}
                            bottom={0}
                            right={0}
                            zIndex={3}
                        >
                            {isPlaying && currentSongPlaying?._id === song?._id && currentPlaylist === playlist ? <Pause sx={{ color: "white" }}/> : <PlayArrow sx={{ color: "white" }}/>}
                        </Box>
                    )}
                    {((!playlist || playlist === "recentSearch") && isHovered) && (
                        <Box
                            position="absolute"
                            top={0}
                            left={0}
                            bottom={0}
                            right={0}
                            bgcolor="rgba(0, 0, 0, 0.5)"
                            zIndex={2}
                        >
                        </Box>
                    )}
                </Box>
                <Box style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    <Typography 
                        variant="h5" 
                        fontWeight="500" 
                        color={currentSongPlaying?._id === song?._id && currentPlaylist === playlist ? primary : backgroundSwitch} 
                        sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'}}>
                        {title}
                    </Typography>
                    <Typography variant="h7" color={main} sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'}}>
                        {artist}
                    </Typography>
                </Box>
            </Box>
            <Box display="flex" alignItems="center" gap="1rem" >
                <IconButton onClick={(event) => handleLikeClick(event)}>
                    {isLiked ? (
                        <FavoriteOutlined sx={{ color: primary}} />
                    ) : (
                        <FavoriteBorderOutlined />
                    )}
                </IconButton>
                <Typography variant="h5" color={main} >
                        {formatDuration(duration)}
                </Typography>
                <IconButton onClick={handleMenuOpen} sx={{ "&:hover": {backgroundColor: primary}, }}>
                        <MoreHorizOutlined sx={{ color: main }}/>    
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
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
                            <MenuItem onClick={(event) => handleAddToPlaylist(playlist._id, _id, event)} key={playlist._id}>
                                {playlist.name}
                            </MenuItem>
                        ))}
                    </Menu>
                    {(myPlaylist && playlist?.songs?.includes(song) && !likedSongs?.songs?.includes(song)) && <MenuItem onClick={(event) => handleRemoveFromPlaylist(playlist._id, _id, event)}>Remove from playlist</MenuItem>}
                    {isLiked ? <MenuItem onClick={(event) => handleLikeClick(event)}>Remove from your Liked Songs</MenuItem> :
                    <MenuItem onClick={(event) => handleLikeClick(event)}>Add to your Liked Songs</MenuItem>}
                    <MenuItem onClick={(event) => handleGoToArtist(event)}>Go to artist</MenuItem>
                </Menu>
            </Box>
        </Box>
    );
};

export default Song;