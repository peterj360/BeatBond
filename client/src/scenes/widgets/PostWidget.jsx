import { ChatBubbleOutlineOutlined, FavoriteBorderOutlined, FavoriteOutlined, PlayCircleFilled, PauseCircleFilled, MoreHorizOutlined } from "@mui/icons-material";
import { Box, Typography, Divider, IconButton, useTheme, InputBase, InputAdornment, Button, useMediaQuery, Modal, } from "@mui/material";
import FlexBetween from "components/FlexBetween";
import Following from "components/Following";
import WidgetWrapper from "components/WidgetWrapper";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPost, setCurrentSong, pauseSong, playSong, setCurrentPlaylist, addLikedSongs, removeLikedSongs } from "state";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PostWidget = ({postId, postUserId, username, song, caption, likes, comments, userPicturePath, picturePath}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const token = useSelector((state) => state.token);
    const loggedInUserId = useSelector((state) => state.user._id);
    const currentSongPlaying = useSelector((state) => state.currentSong);
    const isPlaying = useSelector((state) => state.isPlaying);
    const likedSongs = useSelector((state) => state.likedSongs);
    const isLiked = likedSongs?.songs?.some(likedSong => likedSong._id === song._id);

    const [open, setOpen] = useState(false);
    const [localComments, setLocalComments] = useState(comments);
    const [showButton, setShowButton] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [selectedComment, setSelectedComment] = useState(null);
    const [commentLikeStatus, setCommentLikeStatus] = useState(
        localComments?.reduce((acc, comment) => {
            if (comment?._id && comment?.likes && loggedInUserId != null) {
                return { ...acc, [comment._id]: Boolean(comment.likes[loggedInUserId]) };
            }
            return acc;
        }, {}) || {}
    );
    const likeCount = Object.keys(likes).length;
    
    const { palette } = useTheme();
    const primary = palette.primary.main;
    const main = palette.neutral.main;
    const medium = palette.neutral.medium;
    const backgroundSwitch = palette.background.switch;
    const alt = palette.background.alt;
    const neutralLight = palette.neutral.light;

    const BASE_URL = process.env.REACT_APP_BEATBOND_API_BASE_URL;
    const S3_BASE_URL = process.env.REACT_APP_S3_BASE_URL;

    const isNonMobileScreens = useMediaQuery("(min-width:1000px)");

    const handleModalOpen = (comment) => {
        setSelectedComment(comment);
        setOpen(true);
      };

    const handleModalClose = () => {
        setOpen(false);
    }

    const patchLike = async () => {
        try {
            const response = await axios.patch(`${BASE_URL}/posts/${postId}/like`, { userId: loggedInUserId },{
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            });
            const likedResponse = await axios.put(`${BASE_URL}/songs/${song._id}/like`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            });
            if (likedResponse.data.message === "Added to your liked songs") {
                dispatch(addLikedSongs({ song: song }));
            } else if (likedResponse.data.message === "Removed from your liked songs") {
                dispatch(removeLikedSongs({ song: song }));
            }
            dispatch(setPost({ post: response.data.post }));
        } catch (error) {
            console.error("Error patching like", error);
        }
    };

    const handlePlay = () => {
        if (currentSongPlaying?.filePath === song.filePath) {
            if (isPlaying) {
                dispatch(pauseSong());
            } else {
                dispatch(playSong());
            }
        } else {
            dispatch(setCurrentSong(song));
            dispatch(playSong());
        }
        dispatch(setCurrentPlaylist(null));
    };

    const handleAddComment = async () => {
        try {
            const response = await axios.post(`${BASE_URL}/posts/${postId}/comment`, { text: commentText }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            });

            dispatch(setPost({ post: response.data.post }));
        } catch (error) {
            console.error("Error adding comment", error);
        }
        setCommentText('');
    }

    const handleCommentLike = async (commentId) => {
        try {
            const response = await axios.patch(`${BASE_URL}/comments/${commentId}/like`, { userId: loggedInUserId },{
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            });
            const updatedComment = response.data.comment;
            const updatedLocalComments = localComments.map((comment) => 
                comment._id === commentId ? updatedComment : comment
            );
            setLocalComments(updatedLocalComments);
            setCommentLikeStatus({
                ...commentLikeStatus,
                [commentId]: Boolean(updatedComment.likes[loggedInUserId]),
            });
        } catch (error) {
            console.error("Error adding comment", error);
        }
    }

    const handleDeleteComment = async () => {
        try {
            await axios.delete(`${BASE_URL}/comments/${selectedComment._id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            const updatedComments = localComments.filter(comment => comment._id !== selectedComment._id);
            setLocalComments(updatedComments);
        } catch (error) {
            console.error("Error deleting comment", error);
        }
        handleModalClose();
    }

    const timeSince = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval;

        // weeks
        interval = Math.floor(seconds / 604800);
        if (interval >= 1) {
            return `${interval}w`;
        }

        // days
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) {
            return `${interval}d`;
        }

        // hours
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) {
            return `${interval}h`;
        }

        // minutes
        interval = Math.floor(seconds / 60);
        if (interval >= 1) {
            return `${interval}m`;
        }

        // seconds
        return `${Math.floor(seconds)}s`;
    }

    useEffect(() => {
        setCommentLikeStatus(
            localComments.reduce((acc, comment) => ({ ...acc, [comment._id]: Boolean(comment.likes[loggedInUserId]) }), {})
        );
    }, [localComments]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        setLocalComments(comments);
    }, [comments]);

    const formatDuration = (duration) => {
        const totalSeconds = Math.round(duration); 
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const formattedMinutes = minutes > 0 ? minutes.toString() : minutes.toString().padStart(1, '0');
        return `${formattedMinutes}:${seconds.toString().padStart(2, '0')}`;
    }

    return (
        <WidgetWrapper mb="2rem">
            <Following followingId={postUserId} username={username} userPicturePath={userPicturePath} postId={postId} songId={song._id}/>
            <Typography color={main} sx={{ mt: "1rem"}}>
                {song.title}
            </Typography>
            {picturePath && (
                <Box display="flex" justifyContent="center" height={isNonMobileScreens ? "calc(100vh - 88px - 25.5rem)" : "26.6rem"}>
                    <Box
                        onMouseEnter={() => setShowButton(true)}
                        onMouseLeave={() => setShowButton(false)}
                        onClick={() => handlePlay()} 
                        sx={{ 
                            width: "100%",
                            maxWidth: "400px",
                            height: "auto",
                            position: 'relative', 
                            cursor: 'pointer', 
                            borderRadius: "0.75rem",
                            display: "flex",
                            justifyContent: "center", 
                            overflow: 'hidden' 
                        }}
                    >
                        <img 
                            alt="post" 
                            style={{
                                objectFit: 'contain', 
                                objectPosition: 'center',
                                maxWidth: '100%',
                                maxHeight: '100%',
                                borderRadius: "0.75rem", 
                                marginTop: "0.75rem", 
                            }} 
                            src={`${S3_BASE_URL}/${picturePath}`}/>
                        <IconButton 
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                opacity: showButton ? 1 : 0,
                            }}
                        >
                            {(isPlaying && currentSongPlaying?.filePath === song.filePath) ? 
                            <PauseCircleFilled sx={{ fontSize: '4rem', color: primary }}/> : 
                            <PlayCircleFilled sx={{ fontSize: '4rem',color: primary }}/>
                            }
                        </IconButton>
                            {/* <Typography 
                                color={(isPlaying && currentSongPlaying?.filePath === song.filePath) ? primary : "white"} 
                                fontWeight="bold"
                                sx={{
                                    position: 'absolute',
                                    bottom: '0.5rem',  
                                    right: '1rem',
                                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: 2,  
                                    zIndex: 1,
                                }}
                            >
                                {formatDuration(song.duration)}
                            </Typography> */}
                    </Box>
                </Box>
                
            )}
            <FlexBetween>
                <Typography color={main} sx={{ mt: "0.5rem"}}>
                    {caption}
                </Typography>
                <Typography 
                    color={(isPlaying && currentSongPlaying?.filePath === song.filePath) ? primary : "white"} 
                    fontWeight="bold"
                    sx={{
                        backgroundColor: 'rgba(0, 0, 0, 0.25)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: 2,  
                    }}
                >
                    {formatDuration(song.duration)}
                </Typography>
            </FlexBetween>
            
            <FlexBetween m="0.2rem 0rem">
                <FlexBetween gap="1rem">
                    <FlexBetween gap="0.3rem">
                        <IconButton onClick={patchLike}>
                            {isLiked ? (
                                <FavoriteOutlined sx={{ color: primary}} />
                            ) : (
                                <FavoriteBorderOutlined />
                            )}
                        </IconButton>
                        <Typography>{likeCount}</Typography>
                    </FlexBetween>

                    <FlexBetween gap="0.3rem">
                        <IconButton onClick={() => setShowComments(!showComments)}>
                            <ChatBubbleOutlineOutlined />
                        </IconButton>
                        <Typography>{localComments.length}</Typography>
                    </FlexBetween>

                </FlexBetween>
            </FlexBetween>
            <Divider />
            <Box 
                pt="0.5rem"
                sx={{ 
                    maxHeight: '300px', 
                    overflowY: 'auto', 
                    overflowX: 'hidden', 
                    '&::-webkit-scrollbar': {
                        width: '0.5em'
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(0,0,0,.3)',  
                    }, 
                }}
            >
                <Modal
                    open={open}
                    onClose={handleModalClose}
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
                        <Button 
                            variant="text" 
                            onClick={handleDeleteComment} 
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
                        <Button 
                            variant="text" 
                            onClick={handleModalClose} 
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
                {showComments ? localComments.map((comment, i) => (
                    <Box display="flex" justifyContent="space-between" p="0.25rem 0rem" key={comment._id} maxWidth="56rem" sx={{ 
                        '&:hover .moreHorizIcon': { opacity: 1 } 
                    }}> 
                        <Box display="flex" alignItems="start" gap="0.5rem" maxWidth="90%">
                            <Box p="0.25rem 0" sx={{"&:hover": { cursor: "pointer"}}}>
                                <img 
                                    style={{ 
                                        objectFit: "cover", 
                                        borderRadius: "50%",
                                    }}
                                    width="30px"
                                    height="30px"
                                    alt="user"
                                    src={`${S3_BASE_URL}/${comment.user.picturePath}`}
                                    onClick={() => navigate(`/profile/${comment.user._id}`)}
                                />
                            </Box>   
                            <Box display="flex" flexDirection="column" maxWidth={isNonMobileScreens ? "100%" : "80%"}>
                                <Box display="flex" gap="0.5rem" alignItems="center">
                                    <Typography 
                                        sx={{ 
                                            color: backgroundSwitch, 
                                            fontWeight: 'bold', 
                                            fontSize: 12,
                                            "&:hover": { color: primary, cursor: "pointer"} 
                                        }}
                                        onClick={() => navigate(`/profile/${comment.user._id}`)}
                                    >
                                        {comment.user.username}
                                    </Typography>
                                    <Typography sx={{ color: medium, fontSize: 12 }}>
                                        {timeSince(comment.createdAt)}
                                    </Typography>
                                    {comment.user._id === loggedInUserId ? 
                                        <MoreHorizOutlined 
                                            onClick={() => handleModalOpen(comment)} 
                                            className="moreHorizIcon" 
                                            sx={{ 
                                                fontSize: "1rem", 
                                                color: medium, 
                                                opacity: 0,
                                                "&:hover": {  cursor: "pointer"} 
                                            }}
                                        />
                                    : <></>}
                                </Box>
                                <Typography 
                                    sx={{ 
                                        color: backgroundSwitch,  
                                        wordWrap: 'break-word', 
                                        overflowWrap: 'break-word',
                                        whiteSpace: 'normal',
                                        maxWidth: '100%',
                                        flexShrink: 1,
                                    }}
                                >
                                    {comment.text}
                                </Typography>
                                <Box display="flex" gap="0.5rem" alignItems="center">
                                    <Typography sx={{ color: medium }}>
                                        {Object.keys(comment.likes).length} {Object.keys(comment.likes).length === 1 ? " like": " likes"} 
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                        <Box>
                            <IconButton onClick={() => handleCommentLike(comment._id)}>   
                                {commentLikeStatus[comment._id] ? (
                                    <FavoriteOutlined sx={{ color: primary, fontSize: "1rem"}} />
                                ) : (
                                    <FavoriteBorderOutlined sx={{ fontSize: "1rem"}}/>
                                )}
                            </IconButton>
                        </Box>
                    </Box>   
                )) : <></>}
                {localComments.length > 0 && !showComments ?
                    <Box p="0.5rem 0 0 0">
                        <Typography 
                            sx={{color: medium, "&:hover": { color: main ,cursor: "pointer" } }}
                            onClick={() => {setShowComments(true)}}
                        >
                            {localComments.length > 1 ? `View all ${localComments.length} comments` : "View 1 comment"}
                        </Typography> 
                    </Box>
                    : <Box p="0.5rem 0 0 0">
                        <Typography 
                            sx={{color: medium, }}
                        >
                            {"0 comments"}
                        </Typography> 
                </Box>
                }
            </Box>
            {showComments ? 
                <Typography
                    sx={{color: medium, paddingTop: "1rem" , "&:hover": { color: main ,cursor: "pointer" } }}
                    onClick={() => {setShowComments(false)}}
                >
                    Close 
                </Typography> : <></>
            }
            <Box pt="1rem">
                <InputBase
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)} 
                    placeholder="Add a comment..."
                    fullWidth
                    endAdornment={
                        <InputAdornment position="end">
                            <Button 
                                variant="contained"
                                size="medium"
                                disabled={!commentText.trim()}
                                sx={{
                                    textTransform: 'none',
                                    borderRadius: 5
                                }}
                                onClick={handleAddComment}
                            >
                                Post
                            </Button>
                        </InputAdornment>
                    }
                />
            </Box>
        </WidgetWrapper>
    );
};

export default PostWidget;