import { Box, useMediaQuery, Typography, Divider, IconButton, InputBase, InputLabel, Select, MenuItem, FormControl, InputAdornment, Modal, Button, Menu, TextField, CircularProgress } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from "react";
import WidgetWrapper from "components/WidgetWrapper";
import { useTheme } from "@emotion/react";
import FlexBetween from "components/FlexBetween";
import { MoreHorizOutlined, PlayCircleFilled, PauseCircleFilled, Search, Close, Edit } from "@mui/icons-material";
import Song from "components/Song";
import { pauseSong, playSong, resetCurrentSongTime, setCurrentPlaylist, setCurrentSong, setPlaylists } from "state";
import Dropzone from "react-dropzone";
import NavWidget from "scenes/widgets/NavWidget";
import LibraryWidget from "scenes/widgets/LibraryWidget";

const PlaylistPage = () => {
    const { playlistId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const token = useSelector((state) => state.token);
    const user = useSelector((state) => state.user);
    const isPlaying = useSelector((state) => state.isPlaying);
    const currentSongPlaying = useSelector((state) => state.currentSong);
    const currentPlaylist = useSelector((state) => state.currentPlaylist);
    const playlists = useSelector((state) => state.playlists);

    const [playlist, setPlaylist] = useState();
    const [showSearch, setShowSearch] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [sort, setSort] = useState('');
    const [sortedSongs, setSortedSongs] = useState([]);
    const [filteredSongs, setFilteredSongs] = useState([]);
    const [open, setOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [nameText, setNameText] = useState(playlist?.name);
    const [descriptionText, setDescriptionText] = useState(playlist?.description);
    const [showEditIcon, setShowEditIcon] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [playlistImage, setPlaylistImage] = useState(null);
    const myPlaylist = playlist?.user._id === user._id;
    
    const { palette } = useTheme();
    const primary = palette.primary.main;
    const backgroundSwitch = palette.background.switch;
    const alt = palette.background.alt;
    const neutralLight = palette.neutral.light;
    const neutralDark = palette.neutral.dark;

    const BASE_URL = process.env.REACT_APP_BEATBOND_API_BASE_URL;
    const S3_BASE_URL = process.env.REACT_APP_S3_BASE_URL;

    const isNonMobileScreens = useMediaQuery("(min-width:1000px)");

    const handlePlay = async () => {
        if (currentPlaylist === playlist) {
            if (isPlaying) {
                dispatch(pauseSong());
            } else {
                dispatch(playSong());
            }
        } else {
            dispatch(setCurrentSong(playlist.songs[0]));
            if (currentSongPlaying?.filePath === playlist.songs[0].filePath) {
                dispatch(resetCurrentSongTime());
            }
            dispatch(playSong());
            dispatch(setCurrentPlaylist(playlist));   
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
        if (!playlist || !playlist.songs) return;
    
        let newSortedSongs;

        switch (sortType) {
            case 'Date added':
                newSortedSongs = [...playlist.songs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'Title':
                newSortedSongs = [...playlist.songs].sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'Artist':
                newSortedSongs = [...playlist.songs].sort((a, b) => a.artist.localeCompare(b.artist));
                break;
            case 'Duration':
                newSortedSongs = [...playlist.songs].sort((a, b) => a.duration - b.duration);
                break;
            default:
                newSortedSongs = playlist.songs;
        }
        setSortedSongs(newSortedSongs);
        filterSongs(); 
    }

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleModalOpen = () => {
        if (myPlaylist) {
            setOpen(true);
        }
    }

    const handleModalClose = () => {
        if (playlistImage) {
            URL.revokeObjectURL(playlistImage);
        }
        setOpen(false);
        handleMenuClose();
    }

    const handleSavePlaylist = async () => {
        try { 
            const formData = new FormData();
            if (nameText) {
                formData.append("name", nameText);
            }
            if (descriptionText) {
                formData.append("description", descriptionText);
            }
            if (playlistImage) {
                formData.append("picture", playlistImage);
            }

            const response = await axios.put(`${BASE_URL}/playlist/${playlistId}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
            });

            setPlaylist(response.data.playlist);

            const updatedPlaylists = playlists.map((playlist) => {
                return playlist._id === response.data.playlist._id ? response.data.playlist : playlist;
            });
            
            dispatch(setPlaylists({ playlists: updatedPlaylists}));

            handleModalClose();
            handleMenuClose();

            if (playlistImage) {
                URL.revokeObjectURL(playlistImage);
            }
        } catch (error) {
            console.error("An error occurred while saving the playlist: ", error);
        }
    }

    const handleDeletePlaylist = async () => {
        try {
            await axios.delete(`${BASE_URL}/playlist/${playlistId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const updatedPlaylists = playlists.filter(playlist => playlist._id !== playlistId);
            dispatch(setPlaylists({ playlists: updatedPlaylists}));
            navigate(`/home`, { replace: true });
        } catch (error) {
            console.error("An error occurred while deleting the playlist: ", error);
        }
    }

    const togglePrivacy = async () => {
        try { 
            const response = await axios.put(`${BASE_URL}/playlist/${playlistId}/togglePrivacy`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setPlaylist(response.data.playlist);
            handleMenuClose();
        } catch (error) {
            console.error("An error occurred while toggling playlist privacy: ", error);
        }
    }

    const handleDeleteModalOpen = () => {
        if (myPlaylist) {
            setDeleteModalOpen(true);
        }
    }

    const handleDeleteModalClose = () => {
        setDeleteModalOpen(false);
        handleMenuClose();
    }

    const handleChange = (event) => {
        const selectedFilter = event.target.value;
        setSort(selectedFilter);
        sortSongs(selectedFilter);
    };

    useEffect(() => {
        const getPlaylist = async () => {
            try {
            const response = await axios.get(`${BASE_URL}/playlist/${playlistId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPlaylist(response.data.playlist);
            setSortedSongs(response.data.playlist.songs);
            filterSongs();
        
            } catch (error) {
            console.error("Error fetching playlist:", error);
            }
        };
        getPlaylist();
    }, [playlists, playlistId]);  // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        sortSongs(sort);
    }, [playlist]);  // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        filterSongs();
    }, [searchText, sortedSongs]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (playlist) {
            setNameText(playlist.name);
            setDescriptionText(playlist.description);
        }
    }, [playlist, open]);

    return (
        <Box width="100%" display={isNonMobileScreens ? "flex" : "column"} padding={isNonMobileScreens ? "0 0 0 1rem" : "0 0 10rem 0"}>
            <Box
                display="flex" 
                flexDirection="column" 
                gap="1rem" 
            >
            </Box>
            {playlist ? 
                <WidgetWrapper width="100%" mb="1.35rem" mt={isNonMobileScreens ? undefined : "1rem"}>
                    <Box display="flex" flexDirection={ isNonMobileScreens ? "row" : "column" } alignItems={isNonMobileScreens ? "stretch" : "center"} p="1rem 0">
                        <Box display="flex" width="170px" pb="1rem">
                            <div 
                                style={{ 
                                    position: 'relative', 
                                    cursor: myPlaylist ? 'pointer' : "default", 
                                    width: "170px", 
                                    height: "170px" 
                                }}
                                onMouseEnter={() => { if (myPlaylist) setIsHovered(true); }}
                                onMouseLeave={() => { if (myPlaylist) setIsHovered(false); }}
                                onClick={myPlaylist ? handleModalOpen : null}
                            >
                                <img 
                                    style={{ objectFit: "cover", borderRadius: "10%",}}
                                    width="170px"
                                    height="170px"
                                    alt="playlist"
                                    src={`${S3_BASE_URL}/${playlist.picturePath}`}
                                />
                                {(myPlaylist && isHovered) && (
                                    <>  
                                        <Box 
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                                borderRadius: '10%',  
                                            }}
                                        />
                                        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center"
                                            sx={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)'
                                            }}
                                        >
                                            <Edit /> 
                                            <Typography sx={{whiteSpace: 'nowrap'}}>
                                                Choose photo
                                            </Typography>
                                        </Box>
                                    </>
                                )}
                            </div>
                        </Box>
                        <Box display="flex" flexDirection="column" justifyContent="space-between" width="100%" pl="1rem" pb="1rem">
                            <FlexBetween>
                                <Typography variant="h6" color={neutralDark} >
                                    {`${playlist.privacy} Playlist`}
                                </Typography>
                                <IconButton onClick={handleMenuOpen} sx={{ backgroundColor: neutralLight, "&:hover": {backgroundColor: primary }, p: "0.6rem" }}>
                                    <MoreHorizOutlined sx={{ color: neutralDark }}/>    
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                >
                                    {myPlaylist ? <div>
                                        <MenuItem onClick={handleModalOpen}>Edit playlist details</MenuItem>
                                        <MenuItem onClick={togglePrivacy}>Make {playlist.privacy === 'Private' ? 'public' : 'private'}</MenuItem>
                                        <MenuItem onClick={handleDeleteModalOpen}>Delete playlist</MenuItem>
                                    </div> : <div>
                                        <MenuItem onClick={() => {}}>Add to your library</MenuItem>
                                        <MenuItem onClick={() => {}}>Go to playlist user profile</MenuItem>
                                    </div>}
                                </Menu>
                                <Modal
                                    open={open}
                                    onClose={handleModalClose}
                                >
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            minWidth: isNonMobileScreens ? "30rem" : "60%",
                                            bgcolor: alt,
                                            boxShadow: 24,
                                            borderRadius: 3,
                                            display: 'flex',
                                            flexDirection: 'column',
                                        }} 
                                    >   
                                        <FlexBetween p="1rem 1rem 0rem 1rem">
                                            <Typography sx={{ fontSize: "1.5rem", color: backgroundSwitch, textAlign: 'center' }}>
                                                Edit details
                                            </Typography>
                                            <IconButton onClick={handleModalClose}>
                                                <Close />
                                            </IconButton>
                                        </FlexBetween>
                                        <Box display="flex" flexDirection={isNonMobileScreens ? "row" : "column" } alignItems="center" p="1rem 1rem" gap="1rem">
                                            <Box >
                                                <Dropzone acceptedFiles=".jpg,.jpeg,.png" multiple={false} onDrop={(acceptedFiles) => setPlaylistImage(acceptedFiles[0])}>
                                                    {({ getRootProps, getInputProps }) => (
                                                        <Box {...getRootProps()} >
                                                            <input {...getInputProps()}/>
                                                            <div 
                                                                style={{ position: 'relative', cursor: 'pointer', width: "170px", height: "170px" }}
                                                                onMouseEnter={() => setShowEditIcon(true)}
                                                                onMouseLeave={() => setShowEditIcon(false)}
                                                                >
                                                                <img 
                                                                    style={{ objectFit: 'cover', borderRadius: '10%' }}
                                                                    width="170px"
                                                                    height="170px"
                                                                    alt="playlist"
                                                                    src={playlistImage ?  URL.createObjectURL(playlistImage) :`${BASE_URL}/assets/${playlist.picturePath}`}
                                                                />
                                                                {showEditIcon && (
                                                                    <>  
                                                                        <Box 
                                                                            sx={{
                                                                                position: 'absolute',
                                                                                top: 0,
                                                                                left: 0,
                                                                                right: 0,
                                                                                bottom: 0,
                                                                                backgroundColor: 'rgba(0, 0, 0, 0.5)', 
                                                                                borderRadius: '10%', 
                                                                            }}
                                                                        />
                                                                        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center"
                                                                            sx={{
                                                                                position: 'absolute',
                                                                                top: '50%',
                                                                                left: '50%',
                                                                                transform: 'translate(-50%, -50%)'
                                                                            }}
                                                                        >
                                                                            <Edit /> 
                                                                            <Typography sx={{whiteSpace: 'nowrap'}}>
                                                                                Choose photo
                                                                            </Typography>
                                                                        </Box>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </Box>
                                                    )}
                                                </Dropzone>
                                            </Box>
                                            <Box display="flex" flexDirection="column" width="100%" gap="1rem">
                                                <TextField
                                                    size="small"
                                                    required
                                                    id="outlined-basic" label="Name" variant="outlined"
                                                    value={nameText}
                                                    onChange={(e) => setNameText(e.target.value)}
                                                    placeholder="Add a name"
                                                    sx={{ backgroundColor: neutralLight, borderRadius: 2}}

                                                />
                                                <TextField
                                                    id="outlined-basic" label="Description" variant="outlined"
                                                    value={descriptionText}
                                                    onChange={(e) => setDescriptionText(e.target.value)}
                                                    placeholder="Add an optional description"
                                                    sx={{ backgroundColor: neutralLight, borderRadius: 2}}
                                                    multiline
                                                    rows={4}
                                                />
                                            </Box>
                                        </Box>
                                        <Divider/>
                                        <Button 
                                            variant="text" 
                                            onClick={handleSavePlaylist} 
                                            fullWidth 
                                            sx={{ 
                                                color: backgroundSwitch, 
                                                fontSize: "1rem",
                                                height: "3rem",
                                                "&:hover": { backgroundColor: neutralLight, borderRadius: ' 0 0 10px 10px' },  
                                                textTransform: 'none' 
                                            }}
                                        >
                                            Save
                                        </Button>

                                    </Box>
                                </Modal>
                                <Modal
                                    open={deleteModalOpen}
                                    onClose={handleDeleteModalClose}
                                >
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            minWidth: isNonMobileScreens ? "30rem" : "60%",
                                            bgcolor: alt,
                                            boxShadow: 24,
                                            borderRadius: 3,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            padding: '1rem 2rem'
                                        }} 
                                    >   
                                        <FlexBetween>
                                            <Typography sx={{ fontSize: "1.5rem", color: backgroundSwitch, textAlign: 'center' }}>
                                                Delete from Library?
                                            </Typography>
                                        </FlexBetween>
                                        <Box p="1rem 0">
                                            <Typography sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'}}>
                                                This will delete <span style={{ fontWeight: 'bold' }}>
                                                    {playlist.name}
                                                </span> from <span style={{ fontWeight: 'bold' }}>
                                                    Your Library
                                                </span>
                                            </Typography>
                                        </Box>
                                        <Box display="flex" justifyContent="space-evenly" alignItems="center" pt="1rem">
                                            <Button 
                                                size="large"
                                                sx={{
                                                    textTransform: 'none',
                                                    borderRadius: 5,
                                                    color: backgroundSwitch,
                                                    "&:hover": { backgroundColor: neutralLight },
                                                }}
                                                onClick={handleDeleteModalClose}
                                            >
                                                Cancel
                                            </Button>
                                            <Button 
                                                variant="contained" 
                                                size="large"
                                                sx={{
                                                    textTransform: 'none',
                                                    borderRadius: 5  
                                                }}
                                                onClick={handleDeletePlaylist}
                                            >
                                                Delete
                                            </Button>
                                        </Box>
                                    </Box>
                                </Modal>
                            </FlexBetween>

                            <Typography 
                                variant="h1" 
                                fontWeight="500" 
                                color={neutralDark} 
                                pb="1rem" 
                                sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', "&:hover": {cursor: myPlaylist ? "pointer" : "default"}}}
                                onClick={myPlaylist ? handleModalOpen : null}
                            >
                                {playlist.name}
                            </Typography>

                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography 
                                    variant="h5" 
                                    color={neutralDark} 
                                    sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', "&:hover": {cursor: myPlaylist ? "pointer" : "default"}}}
                                    onClick={myPlaylist ? handleModalOpen : null}
                                >
                                    {playlist.description}
                                </Typography>
                                <Box display="flex" alignItems="center" gap="0.5rem" >
                                    <img 
                                        style={{ objectFit: "cover", borderRadius: "50%" }}
                                        width="30px"
                                        height="30px"
                                        alt="user"
                                        src={`${S3_BASE_URL}/${playlist.user.picturePath}`}
                                    />
                                    <Typography 
                                        variant="h5" 
                                        color={backgroundSwitch} 
                                        sx={{"&:hover": { cursor: "pointer", color: primary}}}
                                        onClick={() => {navigate(`/profile/${playlist?.user._id}`)}}
                                    >
                                        {playlist.user.username}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                    <Divider />
                    {playlist?.songs.length > 0 ? <FlexBetween>
                        <IconButton onClick={handlePlay}>
                            {isPlaying && currentPlaylist === playlist ?<PauseCircleFilled sx={{ fontSize: '4rem', color: primary}}/> : 
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
                            <Song key={song._id} song={song} playlist={playlist} position={index + 1} myPlaylist={myPlaylist}/>
                        ))}
                        <Box p="1rem 0">
                            {playlist?.songs.length > 0 ? <Divider /> : 
                            <Typography variant="h2" fontWeight="500" color={neutralDark} sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: "0 1rem"}}>
                                Add songs to your playlist
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

export default PlaylistPage;

