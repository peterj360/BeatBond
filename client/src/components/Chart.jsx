import { Box, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Chart = ({ chartId, name, picturePath, description }) => {
    const { palette } = useTheme();
    const navigate = useNavigate();
    
    const backgroundSwitch = palette.background.switch;
    const main = palette.neutral.main;
    const backgroundMedium = palette.background.medium;
    const neutralLight = palette.neutral.light;

    return (
        <Box 
            display="flex" 
            flexDirection="column" 
            justifyContent="center" 
            alignItems="center" 
            sx={{
                backgroundColor: backgroundMedium, 
                borderRadius: 4,
                width: "13rem",
                height: "15rem",
                padding: "1rem",
                "&:hover": { backgroundColor: neutralLight, cursor: "pointer"},
                flexShrink: 1 
            }}
            onClick={() => navigate(`/chart/${chartId}`)}
        >
            <Box width="10rem" height="10rem">
                <img 
                    style={{ objectFit: "cover", width: "100%", height: "100%" }}
                    alt="song"
                    src={picturePath}
                />
            </Box>
            <Box display="flex" flexDirection="column" pt="1rem" alignItems="flex-start" width="100%">
                <Typography
                    variant="h5"
                    fontWeight="bold"  
                    color={backgroundSwitch}
                    sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'}}
                >
                    {name}
                </Typography>
                <Typography
                    variant="h6" 
                    color={main}
                    sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'}}
                >
                    {description}
                </Typography>
            </Box>
        </Box>
    );
};

export default Chart;