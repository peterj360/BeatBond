import { Box, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Playlist = ({ playlist, handleSearchClick }) => {
    const navigate = useNavigate();

    const { palette } = useTheme();
    const main = palette.neutral.main;
    const backgroundMedium = palette.background.medium;
    const backgroundSwitch = palette.background.switch;
    const neutralLight = palette.neutral.light;

    const S3_BASE_URL = process.env.REACT_APP_S3_BASE_URL;

    const handleClick = () => {
        navigate(`/playlist/${playlist._id}`);
        if (handleSearchClick) {
            handleSearchClick(playlist, "playlist");
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
                flexShrink: 1 
            }}
            onClick={handleClick}
        >
            <Box width="7.65rem" height="7.65rem">
                <img 
                    style={{ objectFit: "cover", width: "100%", height: "100%" }}
                    alt="playlist"
                    src={`${S3_BASE_URL}/${playlist.picturePath}`}
                />
            </Box>
            <Box display="flex" flexDirection="column" pt="1rem" alignItems="flex-start" width="100%">
                <Typography
                    variant="h5"
                    fontWeight="bold"  
                    color={backgroundSwitch}
                    sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'}}
                >
                    {playlist.name}
                </Typography>
                <Typography
                    variant="h6" 
                    color={main}
                >
                    Playlist
                </Typography>
            </Box>
        </Box>
    );
};

export default Playlist;