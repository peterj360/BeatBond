import { Box, Typography, useTheme } from "@mui/material";
import { useSelector } from "react-redux";
import { Favorite, GraphicEq } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Playlist = ({ playlist, isLikedSongs }) => {
    const navigate = useNavigate();

    const isPlaying = useSelector((state) => state.isPlaying);
    const currentPlaylist = useSelector((state) => state.currentPlaylist);

    const { palette } = useTheme();
    const primary = palette.primary.main;
    const main = palette.neutral.main;
    const neutralLight = palette.neutral.light;

    const S3_BASE_URL = process.env.REACT_APP_S3_BASE_URL;
    
    return(
        <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center" 
            sx={{"&:hover": { backgroundColor: neutralLight, borderRadius: 3, }}}
            p="0.5rem 0.5rem"
            onClick={() => {isLikedSongs ? navigate(`/liked-songs`) : navigate(`/playlist/${playlist._id}`)}}
        >
            <Box display="flex" gap="1rem">
                <Box 
                    display="flex" 
                    width="55px" 
                    height="55px" 
                    sx={ 
                        isLikedSongs ? { 
                            backgroundColor: primary, 
                            borderRadius: 2,
                            justifyContent: "center", 
                            alignItems: "center"
                        } : {}
                    }
                >
                    {isLikedSongs ? <Favorite sx={{color: 'white'}}/> :<img 
                        style={{ objectFit: "cover", borderRadius: 8}}
                        width="100%"
                        height="100%"
                        alt="playlist"
                        src={`${S3_BASE_URL}/${playlist.picturePath}`}
                    />}
                </Box>
                <Box display="flex" flexDirection="column" justifyContent="center" gap="0.5rem">
                    <Typography
                        variant="h5" 
                        fontWeight="500"
                        sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '205px'}}
                    >
                        {playlist?.name}
                    </Typography>
                    <Typography variant="h7" color={main} sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'}}>
                    { isLikedSongs ? 
                        (`${playlist?.songs?.length ?? 0} ${playlist?.songs?.length === 1 ? 'song' : 'songs'}`) : 
                        ("Playlist • " + playlist?.user?.username) }
                    </Typography>
                </Box>
            </Box>
            <Box pr="0.5rem">
                {isPlaying && currentPlaylist?._id === playlist._id ? <GraphicEq sx={{ color: main }}/> : <></>}
            </Box>
        </Box>
    );
}

export default Playlist;