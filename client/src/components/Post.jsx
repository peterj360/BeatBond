import { FavoriteOutlined, ChatBubble, Close } from "@mui/icons-material";
import { Box, Typography, IconButton, useTheme, useMediaQuery, Modal } from "@mui/material";
import { useState } from "react";
import PostWidget from "scenes/widgets/PostWidget";

const Post = ({post, user}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [open, setOpen] = useState(false);

    const { palette } = useTheme();
    const backgroundMedium = palette.background.medium;
    const alt = palette.background.alt;
    const neutralLight = palette.neutral.light;

    const isNonMobileScreens = useMediaQuery("(min-width:1000px)");

    const S3_BASE_URL = process.env.REACT_APP_S3_BASE_URL;

    const handleModalOpen = () => {
        setOpen(true);
    }

    const handleModalClose = (event) => {
        event.stopPropagation();
        setOpen(false);
    };

    return (
        <Box 
            display="flex" 
            flexDirection="column" 
            justifyContent="center" 
            alignItems="center"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)} 
            sx={{
                backgroundColor: backgroundMedium, 
                borderRadius: 4,
                width: "11rem",
                height: "11rem",
                margin: "0.5rem",
                "&:hover": { backgroundColor: neutralLight, cursor: "pointer"}, 
            }}
            onClick={() => handleModalOpen()}
        >
            <Box position="relative" width="100%" height="100%">
                <img 
                    style={{ objectFit: 'cover', width: '100%', height: '100%', borderRadius: '0.75rem' }}
                    alt="song"
                    src={`${S3_BASE_URL}/${post.song.picturePath}`}
                />
                {isHovered && (
                <Box 
                    position="absolute" 
                    top={0} 
                    left={0} 
                    right={0} 
                    bottom={0} 
                    display="flex" 
                    justifyContent="center" 
                    alignItems="center"
                    backgroundColor="rgba(0, 0, 0, 0.5)"
                >
                    <Box display="flex" gap="1.5rem">
                        <Box display="flex" gap="0.5rem">
                            <FavoriteOutlined/>
                            <Typography>
                                {Object.keys(post.likes).length}
                            </Typography>
                        </Box>
                        <Box display="flex" gap="0.5rem">
                            <ChatBubble/>
                            <Typography>
                                {post.comments.length}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
                )}
            </Box>
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
                    <Box display="flex" justifyContent="end">
                        <IconButton 
                            onClick={(event) => handleModalClose(event)} 
                        >
                            <Close />
                        </IconButton>
                    </Box>
                    <PostWidget
                        key={post?._id}
                        postId={post?._id}
                        postUserId={user?._id}
                        username={user?.username}
                        song={post?.song}
                        caption={post?.caption}
                        likes={post?.likes}
                        comments={post?.comments}
                        userPicturePath={user?.picturePath}
                        picturePath={post?.song.picturePath}
                    />
                </Box>  
            </Modal>
        </Box>
    );
};

export default Post;