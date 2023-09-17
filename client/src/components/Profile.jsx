import { Box, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Profile = ({ user, handleSearchClick }) => {
    const navigate = useNavigate();

    const { palette } = useTheme();
    const main = palette.neutral.main;
    const backgroundSwitch = palette.background.switch;
    const backgroundMedium = palette.background.medium;
    const neutralLight = palette.neutral.light;

    const S3_BASE_URL = process.env.REACT_APP_S3_BASE_URL;

    const handleClick = () => {
        navigate(`/profile/${user._id}`);
        if (handleSearchClick) {
            handleSearchClick(user, "profile");
        }
    }

    return (
        <Box 
            display="flex" 
            flexDirection="column" 
            justifyContent="center" 
            alignItems="center" 
            sx={{
                backgroundColor: backgroundMedium, 
                borderRadius: 4,
                width: "10rem",
                height: "13rem",
                padding: "1rem",
                "&:hover": { backgroundColor: neutralLight, cursor: "pointer"}, 
            }}
            onClick={handleClick}
        >
            <Box width="7.65rem" height="7.65rem">
                <img 
                    style={{ objectFit: "cover", width: "100%", height: "100%", borderRadius: "50%" }}
                    alt="song"
                    src={`${S3_BASE_URL}/${user.picturePath}`}
                />
            </Box>
            <Box display="flex" flexDirection="column" pt="1rem" alignItems="flex-start" width="100%">
                <Typography
                    variant="h5"
                    fontWeight="bold"  
                    color={backgroundSwitch}
                    sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'}}
                >
                    {user.username}
                </Typography>
                <Typography
                    variant="h6" 
                    color={main}
                >
                    Profile
                </Typography>
            </Box>
        </Box>
    );
};

export default Profile;