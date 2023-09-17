import { PlayCircleFilled, PauseCircleFilled } from "@mui/icons-material";
import { Box, Typography, useTheme } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { pauseSong, playSong, setCurrentPlaylist, setCurrentSong, resetCurrentSongTime } from "state";
import { useNavigate } from "react-router-dom";

const RecentSearch = ({searchItem, type, handleSearchClick}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentSongPlaying = useSelector((state) => state.currentSong);
    const isPlaying = useSelector((state) => state.isPlaying);
    const currentPlaylist = useSelector((state) => state.currentPlaylist);

    const { palette } = useTheme();
    const primary = palette.primary.main;
    const main = palette.neutral.main;
    const backgroundSwitch = palette.background.switch;
    const backgroundMedium = palette.background.medium;
    const neutralLight = palette.neutral.light;

    const S3_BASE_URL = process.env.REACT_APP_S3_BASE_URL;
    const playlist = "recentSearch";

    const handleClick = () => {
        if (type === "song") {
            handlePlay();
            handleSearchClick(searchItem, "song");
        } else if (type === "playlist") {
            navigate(`/playlist/${searchItem._id}`);
            handleSearchClick(searchItem, "playlist");
        } else {
            navigate(`/profile/${searchItem._id}`);
            handleSearchClick(searchItem, "profile");
        }
    }

    const handlePlay = () => {
        if (currentSongPlaying?.filePath === searchItem.filePath) {
            if (currentPlaylist !== playlist) {
                dispatch(resetCurrentSongTime());
                dispatch(setCurrentSong(searchItem));
                dispatch(playSong());
                dispatch(setCurrentPlaylist(playlist));  
            } 
            else if (isPlaying) {
                dispatch(pauseSong());
            } else {
                dispatch(playSong());
            }
        } else {
            dispatch(setCurrentSong(searchItem));
            dispatch(setCurrentPlaylist(playlist));
            dispatch(playSong());
        }
    };

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
            }}
            onClick={() => {handleClick()}}
        >
            <Box width="9rem" height="9rem" position="relative">
                <img 
                    style={{ objectFit: "cover", width: "100%", height: "100%", borderRadius: type === "profile" ? "50%" : "" }}
                    alt="song"
                    src={`${S3_BASE_URL}/${searchItem?.picturePath}`}
                />
                {type === "song" && (
                    <Box
                        position="absolute"
                        bottom={0}
                        right={0}
                    >
                        {isPlaying && currentSongPlaying?._id === searchItem?._id && currentPlaylist === playlist ? (
                            <PauseCircleFilled sx={{ fontSize: '2rem', color: primary }}/>
                        ) : (
                            <PlayCircleFilled sx={{ fontSize: '2rem', color: primary }}/>
                        )}
                    </Box>
                )}
            </Box>
            <Box display="flex" flexDirection="column" pt="1rem" alignItems="flex-start" width="100%">
                <Typography
                    variant="h5"
                    fontWeight="bold"  
                    color={currentSongPlaying?._id === searchItem?._id && type ==="song" && currentPlaylist === playlist ? primary : backgroundSwitch}
                    sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'}}
                >
                    {type === "song" ? searchItem?.title : type === "playlist" ? searchItem?.name : searchItem?.username}
                </Typography>
                <Typography
                    variant="h6" 
                    color={main}
                >
                    {type === "song" ? searchItem?.artist : type === "playlist" ? "Playlist" : "Profile"}
                </Typography>
            </Box>
        </Box>
    );
};

export default RecentSearch;