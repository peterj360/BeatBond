import { Box, Typography, useTheme, useMediaQuery} from "@mui/material";
import WidgetWrapper from "components/WidgetWrapper";
import { useState } from "react";
import {  Search, Home, HomeOutlined, SearchOutlined } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

const NavWidget = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [isHomeHovered, setIsHomeHovered] = useState(false);
    const [isSearchHovered, setIsSearchHovered] = useState(false);

    const { palette } = useTheme();
    const backgroundSwitch = palette.background.switch;
    const neutralLight = palette.neutral.light;
    const neutralDark = palette.neutral.dark;

    const isNonMobileScreens = useMediaQuery("(min-width:1000px)");

    const handleMouseEnterHome = () => {
        setIsHomeHovered(true);
    };

    const handleMouseLeaveHome = () => {
        setIsHomeHovered(false);
    };

    const handleMouseEnterSearch = () => {
        setIsSearchHovered(true);
    };

    const handleMouseLeaveSearch = () => {
        setIsSearchHovered(false);
    };

    return(
        <WidgetWrapper sx={ isNonMobileScreens ? { width: "100%", minHeight: "7.1rem" } : {}}>
            <Box display="flex" flexDirection="column" gap="1rem" pb="0.75rem" width="100%">
                <Box 
                    display="flex" 
                    justifyContent="start" 
                    alignItems="center" 
                    gap="0.5rem"
                    sx={{"&:hover": { cursor: "pointer",}}}
                    onClick={() => navigate("/home")}
                    onMouseEnter={handleMouseEnterHome}
                    onMouseLeave={handleMouseLeaveHome} 
                    width="max-content"
                >
                    {location.pathname === '/home' ? (
                        <Home sx={{ color: backgroundSwitch, fontSize: "1.5rem" }} />
                    ) : (
                        <HomeOutlined sx={{ color: isHomeHovered ? neutralLight : neutralDark, fontSize: "1.5rem" }} />
                    )}
                    <Typography 
                        variant="h4" 
                        fontWeight="500" 
                        sx={ location.pathname === '/home' ?
                            { color: backgroundSwitch} :
                            { color: isHomeHovered ? neutralLight : neutralDark, whiteSpace: 'nowrap'}
                        } 
                    >
                        Home
                    </Typography>
                </Box>
                <Box 
                    display="flex" 
                    justifyContent="start" 
                    alignItems="center" 
                    gap="0.5rem"
                    sx={{"&:hover": { cursor: "pointer",}}}
                    onClick={() => navigate("/search")}
                    onMouseEnter={handleMouseEnterSearch}
                    onMouseLeave={handleMouseLeaveSearch} 
                    width="max-content"
                >
                    {location.pathname === '/search' ? (
                        <Search sx={{ color: backgroundSwitch, fontSize: "1.5rem",  }} />
                    ) : (
                        <SearchOutlined sx={{ color: isSearchHovered ? neutralLight : neutralDark, fontSize: "1.5rem" }} />
                    )}
                    <Typography 
                        variant="h4" 
                        fontWeight="500" 
                        sx={ location.pathname === '/search' ?
                            { color: backgroundSwitch} :
                            { color: isSearchHovered ? neutralLight : neutralDark, whiteSpace: 'nowrap'}
                        } 
                    >
                        Search
                    </Typography>
                </Box>
            </Box>
        </WidgetWrapper>
    );
};

export default NavWidget