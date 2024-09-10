import { EditOutlined, DeleteOutlined, ImageOutlined, AudioFileOutlined, MoreHorizOutlined} from "@mui/icons-material";
import { Box, Divider, Typography, InputBase, useTheme, Button, IconButton, useMediaQuery} from "@mui/material";
import Dropzone from "react-dropzone";
import UserImage from "components/UserImage";
import WidgetWrapper from "components/WidgetWrapper";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addPost, setUser } from "state";
import FlexBetween from "components/FlexBetween";
import axios from "axios";

const CreatePostWidget = ({ picturePath }) => {
    const dispatch = useDispatch();

    const { _id } = useSelector((state) => state.user);
    const token = useSelector((state) => state.token);

    const [isImage, setIsImage] = useState(false);
    const [image, setImage] = useState(null);
    const [isAudio, setIsAudio] = useState(false);
    const [audio, setAudio] = useState(null);
    const [caption, setCaption] = useState("");
    const [title, setTitle] = useState("");
    
    const { palette } = useTheme();
    const primary = palette.primary.main;
    const medium = palette.neutral.medium;
    const mediumMain = palette.neutral.mediumMain;
    const alt = palette.background.alt;
    const neutralLight = palette.neutral.light;

    const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");

    const BASE_URL = process.env.REACT_APP_BEATBOND_API_BASE_URL;

    const isDisabled = !title || !caption || !audio || !image;

    const handlePost = async () => {
        try {
            const formData = new FormData();
            formData.append("userId", _id);
            formData.append("caption", caption);
            if (image) {
                formData.append("picture", image);
            }
            if (audio) {
                formData.append("audio", audio);
            }
            formData.append("title", title);

            const postResponse = await axios.post(`${BASE_URL}/posts`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
            });
            dispatch(addPost({ post: postResponse.data.post }));

            const userResponse = await axios.get(`${BASE_URL}/users/${_id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            dispatch(setUser(userResponse.data.user));

            setImage(null);
            setIsImage(false);
            setAudio(null);
            setIsAudio(false);
            setCaption("");
            setTitle(""); 
        } catch (error) {
            console.error("Error creating post:", error);
        }
    };

    return (
        <WidgetWrapper sx={ isNonMobileScreens ? { width: "100%", height: "100%", overflow: "hidden" } : {} }>
            <Box 
                display="flex" 
                flexDirection="column" 
                justifyContent="space-between" 
                height="100%" 
                sx={{ 
                    overflowY: 'auto', 
                    overflowX: "auto",
                    '&::-webkit-scrollbar': {
                        width: '0.5em',
                        height: '0.5em'
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(0,0,0,.3)',
                    },
                    '&::-webkit-scrollbar-corner': {
                        backgroundColor: 'transparent'
                    }
                }}
            >
                <Box>
                    <FlexBetween gap="1rem">
                        <UserImage image={picturePath}/>
                        <InputBase 
                            placeholder="Title your song..."
                            onChange={(e) => setTitle(e.target.value)}
                            value={title}
                            sx={{
                                width: "100%",
                                backgroundColor: neutralLight,
                                borderRadius: "2rem",
                                padding: "0.75rem 2rem"
                            }}
                        />
                    </FlexBetween>
                    <Box pt="0.5rem">
                        <InputBase 
                                placeholder="Write a caption..."
                                onChange={(e) => setCaption(e.target.value)}
                                value={caption}
                                sx={{
                                    width: "100%",
                                    backgroundColor: neutralLight,
                                    borderRadius: "2rem",
                                    padding: "0.75rem 2rem"
                                }}
                            />
                    </Box>
                </Box>
                <Divider sx={{ margin: "1rem 0"}}/>
                <Box
                    display="flex" 
                    flexDirection="column" 
                    justifyContent="space-evenly"
                    gap="1.25rem"
                >
                    <Box border={`1px solid ${medium}`} borderRadius="1rem">
                        <Dropzone acceptedFiles=".jpg,.jpeg,.png" multiple={false} onDrop={(acceptedFiles) => setImage(acceptedFiles[0])}>
                            {({ getRootProps, getInputProps }) => (
                                <FlexBetween>
                                    <Box {...getRootProps()} p="0.25rem 1rem" sx={{"&:hover": {cursor: "pointer"}}} width="100%">
                                        <input {...getInputProps()}/>
                                        {!image ? (
                                            <Box display="flex" justifyContent="center" alignItems="center" gap="1rem">
                                                <ImageOutlined sx={{ color: mediumMain}}/>
                                                <p>Add Image Here</p>
                                            </Box>
                                        ) : (
                                            <FlexBetween>
                                                <Typography>{image.name}</Typography>
                                                <EditOutlined/>
                                            </FlexBetween>
                                        )}
                                    </Box>
                                    {image && (
                                        <IconButton onClick={() => setImage(null)} sx={{ width: "15%"}}>
                                            <DeleteOutlined />
                                        </IconButton>
                                    )}
                                </FlexBetween>
                            )}
                        </Dropzone>
                    </Box>
                    <Box border={`1px solid ${medium}`} borderRadius="1rem">
                        <Dropzone acceptedFiles=".mp3,.wav,.aac,.m4a" multiple={false} onDrop={(acceptedFiles) => setAudio(acceptedFiles[0])}>
                            {({ getRootProps, getInputProps }) => (
                                <FlexBetween>
                                    <Box {...getRootProps()} p="0.25rem 1rem" sx={{"&:hover": {cursor: "pointer"}}} width="100%">
                                        <input {...getInputProps()}/>
                                        {!audio ? (
                                            <Box display="flex" alignItems="center" justifyContent="center" gap="1rem">
                                                <AudioFileOutlined sx={{ color: mediumMain}}/>
                                                <p>Add Audio Here</p>
                                            </Box>
                                        ) : (
                                            <FlexBetween>
                                                <Typography>{audio.name}</Typography>
                                                <EditOutlined/>
                                            </FlexBetween>
                                        )}
                                    </Box>
                                    {audio && (
                                        <IconButton onClick={() => setAudio(null)} sx={{ width: "15%"}}>
                                            <DeleteOutlined />
                                        </IconButton>
                                    )}
                                </FlexBetween>
                            )}
                        </Dropzone>
                    </Box>
                </Box>
                <Divider sx={{ margin: "1rem 0"}}/>
                <Box display="flex" justifyContent="center" alignItems="center">
                    <Button type="button" disabled={isDisabled} onClick={handlePost} sx={{ color: alt, backgroundColor: isDisabled ? neutralLight : primary, borderRadius: "3rem" }}>
                        POST
                    </Button>
                </Box>
            </Box>
        </WidgetWrapper>
    );
};

export default CreatePostWidget;