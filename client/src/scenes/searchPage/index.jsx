import { useTheme } from "@emotion/react";
import { Close, Search } from "@mui/icons-material";
import { Box, Button, IconButton, InputAdornment, TextField, Typography, useMediaQuery } from "@mui/material";
import FlexBetween from "components/FlexBetween";
import Playlist from "components/Playlist";
import Profile from "components/Profile";
import Song from "components/Song";
import WidgetWrapper from "components/WidgetWrapper";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import debounce from 'lodash.debounce';
import Chart from "components/Chart";
import RecentSearch from "components/RecentSearch";
import { setCurrentPlaylist } from "state";
import { useNavigate } from "react-router-dom";
import NavWidget from "scenes/widgets/NavWidget";
import LibraryWidget from "scenes/widgets/LibraryWidget";

const SearchPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const token = useSelector((state) => state.token);
    const user = useSelector((state) => state.user);

    let userId
    if (user) {
        userId = user._id.toString();
    }

    const [filter, setFilter] = useState('All');
    const [recentSearches, setRecentSearches] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [fetchedSongs, setFetchedSongs] = useState([]);
    const [fetchedPlaylists, setFetchedPlaylists] = useState([]);
    const [fetchedProfiles, setFetchedProfiles] = useState([]);

    const { palette } = useTheme();
    const primary = palette.primary.main;
    const backgroundSwitch = palette.background.switch;
    const neutralLight = palette.neutral.light;

    const isNonMobileScreens = useMediaQuery("(min-width:1000px)");

    const BASE_URL = process.env.REACT_APP_BEATBOND_API_BASE_URL;

    const fetchSearchResults = debounce(async() => {
        try {
            const response = await axios.get(`${BASE_URL}/search?text=${searchText}&filter=${filter}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            });
            const { songs, playlists, profiles } = response.data;
            setFetchedSongs(songs);
            setFetchedPlaylists(playlists);
            setFetchedProfiles(profiles);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }, 300);

    useEffect(() => {
        if (searchText && user) {
            fetchSearchResults();
        }
    }, [searchText, filter]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const fetchRecentSearches = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/search/recent/${userId}`, {
                    headers: { Authorization: `Bearer ${token}`},
                });
                setRecentSearches(response.data.recentSearches);
            } catch (error) {
                console.error('Error fetching recent searches:', error);
            }
        };
        if (user) {
            fetchRecentSearches();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSearchClick = async (searchItem, type) => {
        try {
            const newSearchItem = {...searchItem, type: type};

            const existingIndex = recentSearches.findIndex(item => 
                item._id === newSearchItem._id && item.type === newSearchItem.type 
            );
            
            let updatedRecentSearches;

            if (existingIndex > -1) {
                updatedRecentSearches = [
                    newSearchItem,
                    ...recentSearches.slice(0, existingIndex),
                    ...recentSearches.slice(existingIndex + 1)
                ];
            } else {
                updatedRecentSearches = [newSearchItem, ...recentSearches];
            }

            updatedRecentSearches = updatedRecentSearches.slice(0, 6);
    
            setRecentSearches(updatedRecentSearches);
    
            await axios.post(`${BASE_URL}/search/recent`, { userId: userId, newSearchItem } ,{
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (type === "song") {
                dispatch(setCurrentPlaylist("recentSearch"));
            }
        
        } catch (error) {
            console.error('Error fetching recent searches:', error);
        }
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
    };

    const clearHistory = async () => {
        try {
            await axios.delete(`${BASE_URL}/search/clear`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            setRecentSearches([]);
        } catch (error) {
            console.error('Failed to clear history', error);
        }
    }
    
    return(
        <Box display="flex" width="100%" height={isNonMobileScreens ? "100%" : "auto"} mb={isNonMobileScreens? "0" :"12rem"}>
            <WidgetWrapper width="100%" mt={isNonMobileScreens ? "0rem" : "1rem"} display="flex" flexDirection="column">
                <FlexBetween width="100%" pb="1rem">
                    <TextField
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        autoFocus
                        placeholder="What do you want to listen to?"
                        sx={{ 
                            backgroundColor: neutralLight, 
                            width: '300px',
                            borderRadius: 6, 
                            '& .MuiInputBase-root': {
                                borderRadius: 6, 
                            },
                        }}
                        InputProps={{
                            startAdornment:
                                <InputAdornment position="start" sx={{ paddingLeft: "5px"}}>
                                    <Search />
                                </InputAdornment>,
                            endAdornment:
                                <InputAdornment position="end">
                                    {searchText ? <IconButton onClick={() => {setSearchText('')}}>
                                        <Close />
                                    </IconButton> : <></>}
                                </InputAdornment>
                        }}
                    />
                </FlexBetween>
                {searchText && user ? <Box display="flex" gap="1rem" pb="1rem">
                    <Button
                        variant="contained"
                        size="medium"
                        sx={{
                            textTransform: 'none',
                            borderRadius: 5,
                            backgroundColor: filter === 'All' ? primary : neutralLight,
                            color: backgroundSwitch,
                            boxShadow: 'none',  
                        }}
                        onClick={() => handleFilterChange('All')}
                    >
                        All
                    </Button>
                    <Button
                        variant="contained"
                        size="medium"
                        sx={{
                            textTransform: 'none',
                            borderRadius: 5,
                            backgroundColor: filter === 'Songs' ? primary : neutralLight,
                            color: backgroundSwitch,
                            boxShadow: 'none',  
                        }}
                        onClick={() => handleFilterChange('Songs')}
                    >
                        Songs
                    </Button>
                    <Button
                        variant="contained"
                        size="medium"
                        sx={{
                            textTransform: 'none',
                            borderRadius: 5,
                            backgroundColor: filter === 'Playlists' ? primary : neutralLight,
                            color: backgroundSwitch,
                            boxShadow: 'none',  
                        }}
                        onClick={() => handleFilterChange('Playlists')}
                    >
                        Playlists
                    </Button>
                    <Button
                        variant="contained"
                        size="medium"
                        sx={{
                            textTransform: 'none',
                            borderRadius: 5,
                            backgroundColor: filter === 'Profiles' ? primary : neutralLight,
                            color: backgroundSwitch,
                            boxShadow: 'none',  
                        }}
                        onClick={() => handleFilterChange('Profiles')}
                    >
                        Profiles
                    </Button>
                </Box> : <></>}
                {searchText && user ? <Box 
                    sx={{ 
                        height: '34.6rem', 
                        overflowY: 'auto',
                        overflowX: "hidden",
                        '&::-webkit-scrollbar': {
                            width: '0.5em'
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'rgba(0,0,0,.3)',
                        },
                    }}
                >
                    {(filter === "All" || filter === "Songs") && <Box>
                        <Typography 
                            variant="h3"
                            fontWeight="bold"  
                            color={backgroundSwitch} 
                        >
                            Songs
                        </Typography>
                        <Box pt="1rem">
                            {fetchedSongs.map((song) => (
                                <Song key={song._id} song={song} playlist={"recentSearch"} handleSearchClick={handleSearchClick}/>
                            ))}
                        </Box>
                    </Box>}
                    {(filter === "All" || filter === "Playlists") && <Box pt="0.5rem">
                        <Typography 
                            variant="h3"
                            fontWeight="bold"  
                            color={backgroundSwitch} 
                        >
                            Playlists
                        </Typography>
                        <Box 
                            display="flex" 
                            sx={ 
                                fetchedPlaylists?.length > 8 ? {
                                    justifyContent: "center",
                                } : {
                                    paddingLeft: isNonMobileScreens ? "1rem" : "7.25%"
                                }
                            }
                        >
                            <Box sx={ 
                                fetchedPlaylists?.length > 8 ? {
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(10rem, 1fr))",
                                    gap: "1rem", 
                                    pt: "1rem",
                                    alignItems: "start",
                                    justifyItems: "center",
                                    width: "100%"
                                } : {
                                    display: "flex", 
                                    justifyContent: "start",
                                    flexWrap: "wrap",
                                    pt: "1rem",
                                    gap: "1rem"
                                } 
                            }>
                                {fetchedPlaylists.map((playlist) => (
                                    <Playlist key={playlist._id} playlist={playlist} handleSearchClick={handleSearchClick}/>
                                ))}
                            </Box>
                        </Box>
                    </Box>}
                    {(filter === "All" || filter === "Profiles") && <Box pt="0.5rem">
                        <Typography 
                            variant="h3"
                            fontWeight="bold"  
                            color={backgroundSwitch} 
                        >
                            Profiles
                        </Typography>
                        <Box 
                            display="flex" 
                            sx={ 
                                fetchedProfiles?.length > 8 ? {
                                    justifyContent: "center",
                                } : {
                                    paddingLeft: isNonMobileScreens ? "1rem" : "7.25%"
                                }
                            }
                        >
                            <Box sx={ 
                                fetchedProfiles?.length > 8 ? {
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(10rem, 1fr))",
                                    gap: "1rem", 
                                    pt: "1rem",
                                    alignItems: "start",
                                    justifyItems: "center",
                                    width: "100%"
                                } : {
                                    display: "flex", 
                                    justifyContent: "start",
                                    flexWrap: "wrap",
                                    pt: "1rem",
                                    gap: "1rem"
                                } 
                            }>
                                {fetchedProfiles.map((profile) => (
                                        <Profile key={profile._id} user={profile} handleSearchClick={handleSearchClick}/>
                                ))}
                            </Box>
                        </Box>
                    </Box>}
                </Box> 
                : <Box 
                    sx={{ 
                        height: '37.7rem', 
                        overflowY: 'auto',
                        overflowX: "hidden",
                        '&::-webkit-scrollbar': {
                            width: '0.5em'
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'rgba(0,0,0,.3)',
                        },
                    }}
                >   
                    {user && recentSearches.length > 0 ? 
                        <Box pb="1rem">
                            <FlexBetween>
                                <Typography 
                                    variant="h3"
                                    fontWeight="bold"  
                                    color={backgroundSwitch} 
                                >
                                    Recent searches
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="small"
                                    sx={{
                                        textTransform: 'none',
                                        borderRadius: 5,
                                        backgroundColor: neutralLight,
                                        color: backgroundSwitch,
                                        boxShadow: 'none',  
                                    }}
                                    onClick={clearHistory}
                                >
                                    Clear history
                                </Button>
                            </FlexBetween>
                            <Box 
                                display="flex" 
                                sx={ 
                                    recentSearches?.length > 5 ? {
                                        justifyContent: "center",
                                    } : {
                                        paddingLeft: isNonMobileScreens ? "1rem" : "7.25%"
                                    }
                                }
                            >
                                <Box sx={ 
                                    recentSearches?.length > 5 ? {
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fit, minmax(13rem, 1fr))",
                                        gap: "1rem", 
                                        pt: "1rem",
                                        alignItems: "start",
                                        justifyItems: "center",
                                        width: "100%"
                                    } : {
                                        display: "flex", 
                                        justifyContent: "start",
                                        flexWrap: "wrap",
                                        pt: "1rem",
                                        gap: "1.5rem"
                                    } 
                                }>
                                    {recentSearches.map((searchItem) => (
                                            <RecentSearch key={`recent-${searchItem._id}`} searchItem={searchItem} type={searchItem.type} handleSearchClick={handleSearchClick}/>
                                    ))}
                                </Box>
                            </Box>
                        </Box>: <></>
                    }
                    <Box>
                        <Typography 
                            variant="h3"
                            fontWeight="bold"  
                            color={backgroundSwitch} 
                        >
                            Browse Spotify Charts
                        </Typography>
                    </Box>
                    <Box display="flex" justifyContent="center">
                        <Box 
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(13rem, 1fr))",
                                gap: "1rem", 
                                pt: "1rem",
                                alignItems: "start",
                                justifyItems: "center",
                                width: "100%"
                            }}
                        >
                            <Chart 
                                chartId={"37i9dQZEVXbMDoHDwVN2tF"} 
                                name={"Top 50 - Global"} 
                                picturePath={"https://charts-images.scdn.co/assets/locale_en/regional/daily/region_global_large.jpg"} 
                                description={"Your daily update of the most played tracks right now - Global."}/>
                            <Chart 
                                chartId={"37i9dQZEVXbKj23U1GF4IR"} 
                                name={"Top 50 - Canada"} 
                                picturePath={"https://charts-images.scdn.co/assets/locale_en/regional/daily/region_ca_large.jpg"} 
                                description={"Your daily update of the most played tracks right now - Canada."}/>
                            <Chart 
                                chartId={"37i9dQZEVXbNG2KDcFcKOF"} 
                                name={"Top Songs - Global"} 
                                picturePath={"https://charts-images.scdn.co/assets/locale_en/regional/weekly/region_global_large.jpg"} 
                                description={"Your weekly update of the most played tracks right now - Global."}/>
                            <Chart 
                                chartId={"37i9dQZEVXbMda2apknTqH"} 
                                name={"Top Songs - Canada"} 
                                picturePath={"https://charts-images.scdn.co/assets/locale_en/regional/weekly/region_ca_large.jpg"} 
                                description={"Your weekly update of the most played tracks right now - Canada."}/>
                            <Chart 
                                chartId={"37i9dQZEVXbLiRSasKsNU9"} 
                                name={"Viral 50 - Global"} 
                                picturePath={"https://charts-images.scdn.co/assets/locale_en/viral/daily/region_global_large.jpg"} 
                                description={"Your daily update of the most viral tracks right now - Global."}/>
                            <Chart 
                                chartId={"37i9dQZEVXbKfIuOAZrk7G"} 
                                name={"Viral 50 - Global"} 
                                picturePath={"https://charts-images.scdn.co/assets/locale_en/viral/daily/region_ca_large.jpg"} 
                                description={"Your daily update of the most viral tracks right now - Canada."}/>
                        </Box>
                    </Box>
                    {!user && <Box pt="1rem">
                        <Box pb="1rem">
                            <Typography 
                                variant="h3"
                                fontWeight="bold"  
                                color={backgroundSwitch} 
                            >
                                Log in to search
                            </Typography>
                        </Box>
                        <Box pb="1rem">
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
                    </Box>}
                </Box>}
            </WidgetWrapper>
        </Box>
    );
}

export default SearchPage;