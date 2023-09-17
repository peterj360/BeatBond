import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts, appendPosts } from "state";
import PostWidget from "./PostWidget";
import axios from "axios";
import { Box, Button, CircularProgress, IconButton, Typography, useMediaQuery } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import WidgetWrapper from "components/WidgetWrapper";
import { useTheme } from "@emotion/react";
import RecommendedUser from "components/RecommendedUser";
import { useNavigate } from "react-router-dom";

const PostsWidget = ({ userId, isProfile = false }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const posts = useSelector((state) => state.posts);
    const user = useSelector((state) => state.user);
    const token = useSelector((state) => state.token);

    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [recommendedUsers, setRecommendedUsers] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { palette } = useTheme();
    const main = palette.neutral.main;
    const primary = palette.primary.main;
    const backgroundSwitch = palette.background.switch;
    const neutralLight = palette.neutral.light;
    const neutralDark = palette.neutral.dark;
    const neutralSwitch = palette.neutral.switch;

    const BASE_URL = process.env.REACT_APP_BEATBOND_API_BASE_URL;

    const isNonMobileScreens = useMediaQuery("(min-width:1000px)");

    const getPosts = async (page = 1) => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${BASE_URL}/posts?page=${page}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.currentPage === response.data.totalPages || response.data.totalPages  === 0) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }
            dispatch(setPosts({ posts: response.data.feedPosts }));
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching posts:", error);
            setIsLoading(false);
        }
    }

    const getUserPosts = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/posts/${userId}`, {
                headers: { Authorization: `Bearer ${token}`},
            });
            dispatch(setPosts({ posts: response.data.posts }));
        } catch (error) {
            console.error(`Error fetching posts for user: ${userId}`, error);
        }
    }

    const getRecommendedUsers = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/users/recommended`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRecommendedUsers(response.data.users);
        } catch (error) {
            console.error("Error fetching recommended users:", error);
        }
    };

    useEffect(() => {
        if (isProfile) {
            getUserPosts();
        } else {
            if (user) {
                getPosts();
            }
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (posts?.length === 0 && user) {
            getRecommendedUsers();
        }
    }, [posts]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleLoadMore = async () => {
        setCurrentPage(prevPage => prevPage + 1);
        try {
            const response = await axios.get(`${BASE_URL}/posts?page=${currentPage + 1}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.currentPage === response.data.totalPages ) {
                setHasMore(false);
            }
            dispatch(appendPosts({ posts: response.data.feedPosts }));
        } catch (error) {
            console.error("Error fetching more posts:", error);
        }
    }

    const handleDone = () => {
        getPosts();
    }

    return (
        <Box mb={isNonMobileScreens ? "5rem" : "10rem"}>
            {posts.length > 0 ? posts.filter(post => post !== undefined && post !== null).map(
                ({
                    _id,
                    user,
                    song,
                    caption,
                    likes,
                    comments,
                }) => (
                    <PostWidget
                        key={_id}
                        postId={_id}
                        postUserId={user._id}
                        username={user.username}
                        song={song}
                        caption={caption}
                        likes={likes}
                        comments={comments}
                        userPicturePath={user.picturePath}
                        picturePath={song.picturePath}
                    />
                )
            ) : isLoading ? 
                <WidgetWrapper height="44.2rem" sx={{ display: "flex",justifyContent: "center", alignItems: "center" }}>
                    <CircularProgress />
                </WidgetWrapper> :
                <WidgetWrapper height="44.2rem" mb="2rem">
                    {userId ? <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                        <Box>
                            <Typography variant="h2" fontWeight="500" color={neutralDark} sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: "0 1rem"}}>
                                No Posts to display
                            </Typography>
                        </Box>
                        <Box pt="1rem">
                            <Typography variant="h4" fontWeight="500" color={main} sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: "0 1rem"}}>
                                Follow users to see posts
                            </Typography>
                        </Box>
                        <Box pt="2rem">
                            <Typography variant="h3" fontWeight="500" color={neutralSwitch} sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: "0 1rem"}}>
                                Suggested for you
                            </Typography>
                        </Box>
                        {recommendedUsers && (
                            <Box display="flex" alignItems="center" flexDirection="column" p="1rem 0" width="100%">
                                {recommendedUsers.map((user) => (
                                    <RecommendedUser key={user._id} user={user} />
                                ))}
                            </Box>
                        )}
                        <Button
                            variant="contained"
                            size="medium"
                            sx={{
                                textTransform: 'none',
                                borderRadius: 5,
                                backgroundColor:  neutralLight,
                                color: backgroundSwitch,
                                boxShadow: 'none',  
                            }}
                            onClick={handleDone}
                            disabled={user?.following.length < 1}
                        >
                            Done
                        </Button>
                    </Box> : <Box display="flex" height="90%" flexDirection="column" alignItems="center" justifyContent="space-evenly" gap="1rem">
                        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap="1rem">
                            <Box>
                                <Typography variant="h2" fontWeight="500" color={neutralDark} sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                    No Posts to display
                                </Typography>
                            </Box>
                            <Box >
                                <Typography variant="h4" fontWeight="500" color={main} sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                    Login to see posts
                                </Typography>
                            </Box>
                            <Box>
                                <Button
                                    variant="contained"
                                    size="large"
                                    sx={{
                                        textTransform: 'none',
                                        borderRadius: 5,
                                        backgroundColor: primary,
                                        color: backgroundSwitch,
                                        boxShadow: 'none',  
                                    }}
                                    onClick={() => navigate(`/login`)}
                                >
                                    Login
                                </Button>
                            </Box>
                        </Box>
                        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap="1rem">
                            <Box>
                                <Typography variant="h2" fontWeight="500" color={neutralDark} sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                    Don't have an account?
                                </Typography>
                            </Box>
                            <Box >
                                <Typography variant="h4" fontWeight="500" color={main} sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                    Create an account
                                </Typography>
                            </Box>
                            <Box>
                                <Button
                                    variant="contained"
                                    size="large"
                                    sx={{
                                        textTransform: 'none',
                                        borderRadius: 5,
                                        backgroundColor: primary,
                                        color: backgroundSwitch,
                                        boxShadow: 'none',  
                                    }}
                                    onClick={() => navigate(`/signup`)}
                                >
                                    Sign up
                                </Button>
                            </Box>
                        </Box>
                    </Box>}
            </WidgetWrapper>}
            {hasMore && (
                <Box display="flex" justifyContent="center">
                    <IconButton onClick={() => handleLoadMore()} >
                        <ExpandMore />
                    </IconButton>
                </Box>
            )}
        </Box>
    )
}

export default PostsWidget;