import { Box, useMediaQuery, useTheme } from "@mui/material";
import LibraryWidget from "scenes/widgets/LibraryWidget";
import GlobalAudioPlayer from "scenes/globalAudioPlayer";
import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "scenes/navbar";
import { useEffect } from "react";
import axios from "axios";
import { setLikedSongs, setPlaylists } from "state";
import NavWidget from "scenes/widgets/NavWidget";

const MainLayout = () => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user);
    let _id;
    if (user) {
        _id = user._id; 
    }
    const currentSong = useSelector((state) => state.currentSong);
    const token = useSelector((state) => state.token);

    const BASE_URL = process.env.REACT_APP_BEATBOND_API_BASE_URL;
    // const { palette } = useTheme();
    // const scroll = palette.neutral.light



    const isNonMobileScreens = useMediaQuery("(min-width:1000px)");

    useEffect(() => {
        if (user) {
            getAllPlaylists();
            getAllLikedSongs();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const getAllPlaylists = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/playlist/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            dispatch(setPlaylists({ playlists : response.data.playlists}));
        } catch (error) {
            console.error("Error fetching playlists:", error);
        }
    }

    const getAllLikedSongs = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/songs/likedSongs`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            dispatch(setLikedSongs({ likedSongs : response.data.likedSongs}));
        } catch (error) {
            console.error("Error fetching playlists:", error);
        }
    }

    return (
        <Box width="100vw" height="100vh" minHeight="600px" display="flex" flexDirection="column" overflowY="auto">
            <Box mb="6rem">
                <Navbar />
            </Box>
            <Box display="flex" flexDirection={isNonMobileScreens ? "row" : "column"} width="100vw" height={isNonMobileScreens ? "calc(100vh - 88px - 7rem)" : "100%"} padding={"0rem 2rem"} gap="1rem">
                <Box 
                    display="flex" 
                    flexDirection="column" 
                    width={isNonMobileScreens ? "17vw" : "100%"} 
                    height={isNonMobileScreens ? "calc(100vh - 88px - 7rem)" : "calc(100vh - 176px - 7rem)"}
                    position={isNonMobileScreens ? "fixed" : "relative"} 
                    gap="1rem">
                    <Box flexShrink={0} sx={{ height: "auto" }}>
                        <NavWidget />
                    </Box>

                    <Box flexGrow={1} overflow="hidden">
                        <LibraryWidget />
                    </Box>
                </Box>
                <Box 
                    display="flex" 
                    flexDirection="column" 
                    width="100%" 
                    height="100%" 
                    overflow={user ? undefined : "hidden"} 
                    gap="1rem" 
                    ml={isNonMobileScreens ? "18vw": "0"}
                >
                    <Outlet />
                </Box>
            </Box>
            <Box
                display="flex"
                height={isNonMobileScreens ? "88px": "175px" }
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: "transparent" 
                }}
            >
                {currentSong && <GlobalAudioPlayer userId={ currentSong }/>}
            </Box>
        </Box>
    );
}

export default MainLayout;