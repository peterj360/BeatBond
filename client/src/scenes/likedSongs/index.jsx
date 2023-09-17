import { Box, useMediaQuery, Typography, Divider, IconButton, InputBase, InputLabel, Select, MenuItem, FormControl, InputAdornment, CircularProgress } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import WidgetWrapper from "components/WidgetWrapper";
import { useTheme } from "@emotion/react";
import FlexBetween from "components/FlexBetween";
import { PlayCircleFilled, PauseCircleFilled, Search, Close, Favorite } from "@mui/icons-material";
import Song from "components/Song";
import { pauseSong, playSong, resetCurrentSongTime, setCurrentPlaylist, setCurrentSong } from "state";

const LikedSongsPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const currentSongPlaying = useSelector((state) => state.currentSong);
    const currentPlaylist = useSelector((state) => state.currentPlaylist);
    const likedSongs = useSelector((state) => state.likedSongs);
    const isPlaying = useSelector((state) => state.isPlaying);

    const [showSearch, setShowSearch] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [sort, setSort] = useState('');
    const [sortedSongs, setSortedSongs] = useState([]);
    const [filteredSongs, setFilteredSongs] = useState([]);

    const { palette } = useTheme();
    const primary = palette.primary.main;
    const neutralDark = palette.neutral.dark;

    const isNonMobileScreens = useMediaQuery("(min-width:1000px)");

    const S3_BASE_URL = process.env.REACT_APP_S3_BASE_URL;

    const handlePlay = () => {
        if (currentPlaylist === likedSongs) {
            if (isPlaying) {
                dispatch(pauseSong());
            } else {
                dispatch(playSong());
            }
        } else {
            dispatch(setCurrentSong(likedSongs?.songs[0]));
            if (currentSongPlaying?.filePath === likedSongs?.songs[0].filePath) {
                dispatch(resetCurrentSongTime());
            }
            dispatch(playSong());
            dispatch(setCurrentPlaylist(likedSongs));   
        }
    };

    const filterSongs = () => {
        if (!sortedSongs) return;
    
        if (searchText === '') {
            setFilteredSongs(sortedSongs);
        } else {
            const filtered = sortedSongs.filter(song => 
                song.title.toLowerCase().includes(searchText.toLowerCase()) ||
                song.artist.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredSongs(filtered);
        }
    };

    const sortSongs = (sortType) => {
        if (!likedSongs || !likedSongs.songs) return;
    
        let newSortedSongs;

        switch (sortType) {
            case 'Date added':
                newSortedSongs = [...likedSongs.songs].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
                break;
            case 'Title':
                newSortedSongs = [...likedSongs.songs].sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'Artist':
                newSortedSongs = [...likedSongs.songs].sort((a, b) => a.artist.localeCompare(b.artist));
                break;
            case 'Duration':
                newSortedSongs = [...likedSongs.songs].sort((a, b) => a.duration - b.duration);
                break;
            default:
                newSortedSongs = likedSongs.songs;
        }
        setSortedSongs(newSortedSongs);
        filterSongs();
    }

    const handleChange = (event) => {
        const selectedFilter = event.target.value;
        setSort(selectedFilter);
        sortSongs(selectedFilter);
    };

    useEffect(() => {
        setSortedSongs(likedSongs.songs);
        filterSongs();
    }, [likedSongs]);  // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        sortSongs(sort);
    }, [likedSongs]);  // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        filterSongs();
    }, [searchText, sortedSongs]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <Box width="100%" display="flex" padding={isNonMobileScreens ? "0 0 0 1rem" : "0 0 10rem 0"}>
            {likedSongs ? 
                <WidgetWrapper width="100%" mb="1.35rem">
                    <Box display="flex" flexDirection={ isNonMobileScreens ? "row" : "column" } alignItems={isNonMobileScreens ? "stretch" : "center"} p="1rem 0">
                        <Box display="flex" pb='1rem'>
                            <Box 
                                display="flex" 
                                width="170px" 
                                height="170px" 
                                sx={{ 
                                    backgroundColor: palette.primary.main, 
                                    borderRadius: "10%",
                                    justifyContent: "center", 
                                    alignItems: "center"
                                }}
                            >
                                <Favorite sx={{fontSize: "3.5rem", color: 'white'}}/>
                            </Box>
                        </Box>
                        <Box display="flex" flexDirection="column" justifyContent="space-between" width="100%" pl="1rem" pb="1rem">
                            <FlexBetween>
                                <Typography variant="h6" color={neutralDark} >
                                    {`Playlist`}
                                </Typography>
                            </FlexBetween>

                            <Typography 
                                variant="h1" 
                                fontWeight="500" 
                                color={neutralDark} 
                                pb="1rem" 
                                sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}
                            >
                                {likedSongs.name}
                            </Typography>

                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography 
                                    variant="h5" 
                                    color={neutralDark} 
                                    sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'}}
                                >
                                    {likedSongs.songs.length} {likedSongs.songs.length === 1 ? " song" : " songs"}
                                </Typography>
                                <Box display="flex" alignItems="center" gap="0.5rem" >
                                    <img 
                                        style={{ objectFit: "cover", borderRadius: "50%" }}
                                        width="30px"
                                        height="30px"
                                        alt="user"
                                        src={`${S3_BASE_URL}/${likedSongs.user.picturePath}`}
                                    />
                                    <Typography 
                                        variant="h5" 
                                        color={palette.background.switch} 
                                        sx={{"&:hover": { cursor: "pointer", color: primary}}}
                                        onClick={() => {navigate(`/profile/${likedSongs?.user._id}`)}}
                                    >
                                        {likedSongs.user.username}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                    <Divider />
                    {likedSongs?.songs.length > 0 ? <FlexBetween>
                        <IconButton onClick={handlePlay}>
                            {isPlaying && currentPlaylist === likedSongs ?<PauseCircleFilled sx={{ fontSize: '4rem', color: primary}}/> : 
                            <PlayCircleFilled sx={{ fontSize: '4rem', color: primary}}/>}
                        </IconButton>
                        <FlexBetween gap="1rem">
                            { showSearch || searchText ? 
                                <InputBase
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    onBlur={() => setShowSearch(false)}
                                    autoFocus
                                    placeholder="Search in playlist"
                                    sx={{ backgroundColor: palette.neutral.light, borderRadius: 2, padding: "5px 5px", maxWidth: '180px'}}
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
                            <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                                <InputLabel id="sort-label">Sort</InputLabel>
                                <Select
                                    labelId="sort-label"
                                    id="sort-select" 
                                    value={sort}
                                    onChange={handleChange}
                                    label="sort"
                                >
                                    <MenuItem value="Date added">Date added</MenuItem>
                                    <MenuItem value="Title">Title</MenuItem>
                                    <MenuItem value="Artist">Artist</MenuItem>
                                    <MenuItem value="Duration">Duration</MenuItem>
                                </Select>
                            </FormControl>
                        </FlexBetween>
                    </FlexBetween> :
                    <Box display="flex" justifyContent="start" p="2.5rem 0rem" >
                    </Box>
                    }
                    <Divider />
                    <Box 
                        pt="1rem" 
                        sx={{ 
                            height: '370px', 
                            overflowY: 'auto', 
                            '&::-webkit-scrollbar': {
                                width: '0.5em'
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: 'rgba(0,0,0,.3)',  
                            }, 
                        }}
                    >
                        {filteredSongs.map((song, index) => (
                            <Song key={song._id} song={song} playlist={likedSongs} position={index + 1}/>
                        ))}
                        <Box p="1rem 0">
                            {likedSongs?.songs.length > 0 ? <Divider /> : 
                            <Typography variant="h2" fontWeight="500" color={neutralDark} sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: "0 1rem"}}>
                                Add songs to your collection
                            </Typography>}
                        </Box>
                    </Box>
                </WidgetWrapper>
            : <WidgetWrapper width="100%" height="44.2rem" sx={{ display: "flex",justifyContent: "center", alignItems: "center" }}>
                <CircularProgress />
            </WidgetWrapper>}
        </Box>
    );
};

export default LikedSongsPage;

