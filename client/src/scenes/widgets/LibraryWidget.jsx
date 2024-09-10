import { Box, Typography, Divider, IconButton, useTheme, MenuItem, Tooltip, FormControl, Select, InputAdornment, InputBase, useMediaQuery, Button, CircularProgress} from "@mui/material";
import FlexBetween from "components/FlexBetween";
import WidgetWrapper from "components/WidgetWrapper";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addPlaylist } from "state";
import axios from "axios";
import { LibraryMusic, Add, Search, Close } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Playlist from "components/PlaylistLibrary.jsx";

const LibraryWidget = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const user = useSelector((state) => state.user);
    const token = useSelector((state) => state.token);
    const playlists = useSelector((state) => state.playlists);
    const likedSongs = useSelector((state) => state.likedSongs);

    const [showSearch, setShowSearch] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [sort, setSort] = useState('Date added');
    const [sortedPlaylists, setSortedPlaylists] = useState([]);
    const [filteredPlaylists, setFilteredPlaylists] = useState([]);

    const { palette } = useTheme();
    const primary = palette.primary.main;
    const backgroundSwitch = palette.background.switch;
    const backgroundMedium = palette.background.medium;
    const neutralLight = palette.neutral.light;
    const neutralDark = palette.neutral.dark;

    const isNonMobileScreens = useMediaQuery("(min-width:1000px)");

    const BASE_URL = process.env.REACT_APP_BEATBOND_API_BASE_URL;

    const handleCreatePlaylist = async () => {
        try {
            const response = await axios.post(`${BASE_URL}/playlist`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
            });
            dispatch(addPlaylist({ playlist: response.data.playlist}));
            navigate(`playlist/${response.data.playlist._id}`);
        } catch (error) {
            console.error("Error creating playlist", error);
        }
    }

    const filterPlaylists = () => {
        if (!sortedPlaylists) return;
    
        if (searchText === '') {
            setFilteredPlaylists(sortedPlaylists);
        } else {
            const filtered = sortedPlaylists.filter(playlist => 
                playlist.name.toLowerCase().includes(searchText.toLowerCase()) ||
                playlist.user.username.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredPlaylists(filtered);
        }
    };
    

    const sortPlaylists = (sortType) => {
        if (!playlists) return;
    
        let newSortedPlaylists;

        switch (sortType) {
            case 'Date added':
                newSortedPlaylists = [...playlists].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'Name':
                newSortedPlaylists = [...playlists].sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'Recently Played':
                newSortedPlaylists = [...playlists].sort((a, b) => new Date(b.lastPlayed) - new Date(a.lastPlayed));
                break;
            default:
                newSortedPlaylists = playlists;
        }
        setSortedPlaylists(newSortedPlaylists);
    }

    const handleChange = (event) => {
        const selectedFilter = event.target.value;
        setSort(selectedFilter);
        sortPlaylists(selectedFilter);
    };

    useEffect(() => {
        if (playlists) {
            sortPlaylists(sort);
        }
    }, [playlists]); // eslint-disable-line react-hooks/exhaustive-deps
    
    useEffect(() => {
        filterPlaylists();
    }, [searchText, sortedPlaylists]); // eslint-disable-line react-hooks/exhaustive-deps

    return(
        <Box width="100%" height="100%" display={isNonMobileScreens ? "flex" : "column"}>
            <WidgetWrapper width="100%" height="100%" display="flex" flexDirection="column">
                <FlexBetween pb="0.5rem">
                    <Box display="flex" justifyContent="center" alignItems="center" gap="0.5rem">
                        <LibraryMusic sx={{ fontSize: "1.5rem", color: neutralDark}}/>
                        <Typography variant="h4" fontWeight="500" color={neutralDark} sx={{whiteSpace: 'nowrap'}}>
                            Your Library
                        </Typography>
                    </Box>
                    <Tooltip 
                        title={<Typography sx={{ fontSize: '16px' }}>Create a new playlist</Typography>} 
                        placement="top"
                    >
                        <IconButton onClick={handleCreatePlaylist}>
                            <Add sx={{ fontSize: "1.5rem", color: neutralDark }} />
                        </IconButton>
                    </Tooltip>
                </FlexBetween>
                <Divider />
                {user ? <>
                    <FlexBetween p="0.5rem 0" gap="1rem">
                        { showSearch || searchText ? 
                            <InputBase
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onBlur={() => setShowSearch(false)}
                                autoFocus
                                placeholder="Search in Your Library"
                                sx={{ backgroundColor: neutralLight, borderRadius: 2, padding: "5px 5px", maxWidth: '180px'}}
                                startAdornment={
                                    <InputAdornment position="start" sx={{ paddingLeft: "5px"}}>
                                        <Search />
                                    </InputAdornment>
                                }
                                endAdornment={
                                    <InputAdornment position="end">
                                        {searchText ? <IconButton onClick={() => {setSearchText('')}}>
                                            <Close />
                                        </IconButton> : <></>}
                                    </InputAdornment>
                                }
                            />
                            :
                            <IconButton onClick={() => setShowSearch(true)}>
                                <Search  />
                            </IconButton>
                        }
                        <FormControl variant="standard" sx={{ m: 1 }} size="small">
                            <Select
                                labelId="demo-simple-select-standard-label"
                                id="demo-simple-select-standard" 
                                value={sort}
                                onChange={handleChange}
                                label="sort"
                            >
                                <MenuItem value="Date added">Date added</MenuItem>
                                <MenuItem value="Name">Name</MenuItem>
                            </Select>
                        </FormControl>
                    </FlexBetween>
                    <Divider />
                    <Box 
                        pt="1rem" 
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
                        {likedSongs? <Playlist key={likedSongs._id} playlist={likedSongs} isLikedSongs={true}/> : <CircularProgress />}
                        {filteredPlaylists.map((playlist) => (
                            <Playlist key={playlist?._id} playlist={playlist} isLikedSongs={false}/>
                        ))}
                    </Box>
                </> : <Box pt="1rem" height="53.5vh">
                    <Box sx={{backgroundColor: backgroundMedium, borderRadius: "0.75rem", padding: "1rem"}}>
                        <Box>
                            <Typography variant="h5" fontWeight="bold" color={backgroundSwitch} sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                Create your first playlist
                            </Typography>
                        </Box>
                        <Box p="1rem 0rem">
                            <Typography variant="h6" color={backgroundSwitch} sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                You'll need to log in first
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
                                Create playlist
                            </Button>
                        </Box>
                    </Box>
                </Box>}
            </WidgetWrapper>
        </Box>
    );
};

export default LibraryWidget