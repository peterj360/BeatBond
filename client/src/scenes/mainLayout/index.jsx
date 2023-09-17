import { Box, useMediaQuery } from "@mui/material";
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
        <Box>
            <Box pb="5rem">
                <Navbar />
            </Box>
            <Box width="100vw" padding={isNonMobileScreens ? "2rem 2rem" : "2rem 2rem"} display={isNonMobileScreens ? "flex" : "block"} justifyContent="space-between" >
                {isNonMobileScreens && (
                    <Box display="flex" flexDirection="column" width="23rem">
                        <Box display="flex" flexDirection="column" width="23rem" gap="1rem">
                            <NavWidget />
                            <LibraryWidget />
                        </Box>
                    </Box>
                )}
                <Outlet />
            </Box>
            {currentSong && <GlobalAudioPlayer userId={_id}/>}
        </Box>
    );
}

export default MainLayout;