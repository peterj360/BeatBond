import { MoreHorizOutlined, PersonAddOutlined, PersonRemoveOutlined } from "@mui/icons-material";
import { Box, Typography, IconButton, useTheme, Modal, Button, Divider, useMediaQuery } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setFollowing, deletePost } from "state";
import UserImage from "./UserImage";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FlexBetween from "./FlexBetween";
import { Fragment, useEffect, useState } from "react";

const Following = ({ followingId, username, subtitle, userPicturePath, postId, songId}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { _id } = useSelector((state) => state.user);
    const token = useSelector((state) => state.token);
    const following = useSelector((state) => state.user.following);
    const playlists = useSelector((state) => state.playlists);

    const [open, setOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [addToPlaylistOpen, setAddToPlaylistOpen] = useState(false);
    const [isFollowing, setIsFollowing] = useState(following.includes(followingId));
    const isUser = followingId === _id;

    const { palette } = useTheme();
    const main = palette.neutral.main;
    const medium = palette.neutral.medium;
    const mediumMain = palette.neutral.mediumMain;
    const backgroundSwitch = palette.background.switch;
    const alt = palette.background.alt;
    const neutralLight = palette.neutral.light;
    const neutralDark = palette.neutral.dark;

    const isNonMobileScreens = useMediaQuery("(min-width:1000px)");

    const BASE_URL = process.env.REACT_APP_BEATBOND_API_BASE_URL;

    const toggleFollowing = async () => {
        try {
            let updatedFollowing;
            if (isFollowing) {
                await axios.delete(`${BASE_URL}/users/${_id}/follow/${followingId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
                updatedFollowing = following.filter(id => id !== followingId);
            } else {
                await axios.post(`${BASE_URL}/users/${_id}/follow/${followingId}`, {}, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
                updatedFollowing = [...following, followingId];
            }
    
            dispatch(setFollowing({ following: updatedFollowing }));
            setIsFollowing(!isFollowing);
    
        } catch (error) {
            console.error("Error patching following", error);
        }
    };

    const handleOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const handleDeleteOpen = async () => {
        setOpen(false);
        setDeleteModalOpen(true);
    }

    const handleDeleteClose = async () => {
        setDeleteModalOpen(false);
        setOpen(true);
    }

    const handleAddToPlaylistClose = () => {
        setAddToPlaylistOpen(false);
        setOpen(true);
    }

    const handleDeletePost = async () => {
        try {
            await axios.delete(`${BASE_URL}/posts/${postId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            await axios.delete(`${BASE_URL}/songs/${songId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            dispatch(deletePost( { postId: postId }));
            setDeleteModalOpen(false);
        } catch (error) {
            console.error("Error deleting post", error);
        }
    }

    const handleAddToPlaylistOpen = () => {
        setOpen(false);
        setAddToPlaylistOpen(true);
    }

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
            
            handleAddToPlaylistClose();
            handleClose();
        } catch (error) {
            console.error('Error adding song:', error);
            handleAddToPlaylistClose();
            handleClose();
        }
    };

    useEffect(() => {
        setIsFollowing(following.includes(followingId));
    }, [following, followingId]);

    return (
        <FlexBetween>
            <FlexBetween gap="1rem">
                <UserImage image={userPicturePath} size="55px" />
                <Box 
                    onClick={() => {navigate(`/profile/${followingId}`)}}
                >
                    <Typography color={main} variant="h5" fontWeight="500" sx={{ "&:hover": {color: main, cursor: "pointer"}}}>
                        {username}
                    </Typography>
                    <Typography color={medium} fontSize="0.75rem">
                        {subtitle}
                    </Typography>
                </Box>
            </FlexBetween>
            <FlexBetween gap="1rem">
                {!isUser && (
                    <IconButton onClick={() => toggleFollowing()} sx={{ backgroundColor: neutralLight, "&:hover": {backgroundColor: main} , p: "0.6rem" }}>
                        {isFollowing ? (
                            <PersonRemoveOutlined sx={{ color: neutralDark }}/>
                        ) : (
                            <PersonAddOutlined sx={{ color: neutralDark }}/>
                        )}
                    </IconButton>
                )}
                <IconButton onClick={handleOpen} sx={{ backgroundColor: neutralLight, "&:hover": {backgroundColor: main}, p: "0.6rem" }}>
                    <MoreHorizOutlined sx={{ color: neutralDark }}/>    
                </IconButton>
                <Modal
                    open={open}
                    onClose={handleClose}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            minWidth: isNonMobileScreens ? "30rem" : "60%",
                            bgcolor: alt,
                            boxShadow: 24,
                            borderRadius: 3,
                            display: 'flex',
                            flexDirection: 'column',
                        }} 
                    >
                        {isUser && (<>
                            <Button 
                                variant="text" 
                                onClick={handleDeleteOpen} 
                                fullWidth 
                                sx={{ 
                                    color: "red",
                                    fontSize: "1rem",
                                    height: "3rem", 
                                    "&:hover": { backgroundColor: neutralLight, borderRadius: '10px 10px 0 0', },  
                                    textTransform: 'none' 
                                }}

                            >
                                Delete
                            </Button>
                            <Divider/>
                        </>)}
                        <Button 
                            variant="text" 
                            onClick={handleAddToPlaylistOpen} 
                            fullWidth 
                            sx={{ 
                                color: backgroundSwitch, 
                                fontSize: "1rem",
                                height: "3rem",
                                "&:hover": { backgroundColor: neutralLight, }, 
                                textTransform: 'none' 
                            }}
                        >
                            Add to playlist
                        </Button>
                        <Divider/>
                        <Button 
                            variant="text" 
                            onClick={handleClose} 
                            fullWidth 
                            sx={{ 
                                color: backgroundSwitch, 
                                fontSize: "1rem",
                                height: "3rem",
                                "&:hover": { backgroundColor: neutralLight, borderRadius: ' 0 0 10px 10px', }, 
                                textTransform: 'none' 
                            }}
                        >
                            Cancel
                        </Button>
                    </Box>
                </Modal>
                <Modal
                    open={deleteModalOpen}
                    onClose={handleDeleteClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            minWidth: isNonMobileScreens ? "30rem" : "60%",
                            bgcolor: alt,
                            boxShadow: 24,
                            borderRadius: 3,
                            display: 'flex',
                            flexDirection: 'column',
                        }} 
                    >
                        <Box p="1.5rem 0">
                            <Typography id="modal-modal-title" sx={{ fontSize: "1.5rem", color: backgroundSwitch, textAlign: 'center' }}>
                                Delete Post?
                            </Typography>
                            <Typography id="modal-modal-description" sx={{ fontSize: "0.9rem", color: mediumMain, textAlign: 'center' }}>
                                Are you sure you want to delete this post?
                            </Typography>
                        </Box>
                        <Divider/>
                        <Button 
                            variant="text" 
                            onClick={handleDeletePost} 
                            fullWidth 
                            sx={{ 
                                color: "red",
                                fontSize: "1rem",
                                height: "3rem", 
                                "&:hover": { backgroundColor: neutralLight,},  
                                textTransform: 'none' 
                            }}

                        >
                            Delete
                        </Button>
                        <Divider/>
                        <Button 
                            variant="text" 
                            onClick={handleDeleteClose} 
                            fullWidth 
                            sx={{ 
                                color: backgroundSwitch, 
                                fontSize: "1rem",
                                height: "3rem",
                                "&:hover": { backgroundColor: neutralLight, borderRadius: '0 0 10px 10px',},  
                                textTransform: 'none' 
                            }}
                        >
                            Cancel
                        </Button>
                    </Box>
                </Modal>

                <Modal
                    open={addToPlaylistOpen}
                    onClose={handleAddToPlaylistClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            minWidth: isNonMobileScreens ? "30rem" : "60%",
                            bgcolor: alt,
                            boxShadow: 24,
                            borderRadius: 3,
                            display: 'flex',
                            flexDirection: 'column',
                        }} 
                    >
                        <Box p="1.5rem 0">
                            <Typography id="modal-modal-title" sx={{ fontSize: "1.5rem", color: mediumMain, textAlign: 'center' }}>
                                Add to Playlist
                            </Typography>
                        </Box>
                        <Divider/>
                        {playlists.map(({ _id, name }) => (
                            <Fragment key={_id}>
                                <Button 
                                    variant="text" 
                                    onClick={() => handleAddToPlaylist(_id, songId)} 
                                    fullWidth 
                                    sx={{ 
                                        color: backgroundSwitch,
                                        fontSize: "1rem",
                                        height: "3rem", 
                                        "&:hover": { backgroundColor: neutralLight, }, 
                                        textTransform: 'none' 
                                    }}

                                >
                                    {name}
                                </Button>
                                <Divider/>
                            </Fragment>
                        ))}
                        <Divider/>
                        <Button 
                            variant="text" 
                            onClick={handleAddToPlaylistClose} 
                            fullWidth 
                            sx={{ 
                                color: backgroundSwitch, 
                                fontSize: "1rem",
                                height: "3rem",
                                "&:hover": { backgroundColor: neutralLight, borderRadius: '0 0 10px 10px',}, 
                                textTransform: 'none' 
                            }}
                        >
                            Cancel
                        </Button>
                    </Box>
                </Modal>
            </FlexBetween>
        </FlexBetween>
    );
};

export default Following;