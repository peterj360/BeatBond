import { Box, Typography, useTheme, Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setFollowing } from "state";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import FlexBetween from "./FlexBetween";

const RecommendedUser = ({user}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const token = useSelector((state) => state.token);
    const loggedInUserId = useSelector((state) => state.user._id);
    const following = useSelector((state) => state.user.following);
    const [isFollowing, setIsFollowing] = useState(false);

    const { palette } = useTheme();
    const primary = palette.primary.main;
    const primaryLight = palette.primary.light;
    const medium = palette.neutral.medium;
    const backgroundSwitch = palette.background.switch;
    const neutralDark = palette.neutral.dark;

    const BASE_URL = process.env.REACT_APP_BEATBOND_API_BASE_URL;
    const S3_BASE_URL = process.env.REACT_APP_S3_BASE_URL;

    const toggleFollowing = async () => {
        try {
            let updatedFollowing;
            let response;
            if (isFollowing) {
                response = await axios.delete(`${BASE_URL}/users/${loggedInUserId}/follow/${user._id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
                updatedFollowing = following.filter(id => id !== user._id);
            } else {
                response = await axios.post(`${BASE_URL}/users/${loggedInUserId}/follow/${user._id}`, {}, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
                updatedFollowing = [...following, user._id];
            }
            if (response.status === 200) {
                dispatch(setFollowing({ following: updatedFollowing }));
                setIsFollowing(!isFollowing);
            }
        } catch (error) {
            console.error("Error patching following", error);
        }
    };

    return (
        <FlexBetween p="1rem" gap="1rem" width="20rem"> 
           <Box display="flex" alignItems="center" gap="0.5rem">
                <Box width={"45px"} height={"45px"}>
                    <img 
                        style={{ objectFit: "cover", borderRadius: "50%"}}
                        width={"45px"}
                        height={"45px"}
                        alt="user"
                        src={`${S3_BASE_URL}/${user.picturePath}`}
                    />
                </Box>
                <Box display="flex" flexDirection="column" justifyContent="space-between">
                    <Typography 
                        variant="h4"
                        color={neutralDark}
                        fontWeight="500"
                        sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', "&:hover": { color: primaryLight, cursor: "pointer" } }}
                        onClick={() => navigate(`/profile/${user._id}`)}
                    >
                        {user.username} 
                    </Typography>
                    <Typography color={medium}>{user.firstName} {user.lastName}</Typography>
                </Box>
           </Box>
           <Button
                variant="contained"
                size="medium"
                sx={{
                    textTransform: 'none',
                    borderRadius: 5,
                    backgroundColor:  primary,
                    color: backgroundSwitch,
                    boxShadow: 'none',  
                }}
                onClick={toggleFollowing}
            >
                {isFollowing ? "Unfollow" : "Follow"}
            </Button>
        </FlexBetween>
    );
};

export default RecommendedUser;