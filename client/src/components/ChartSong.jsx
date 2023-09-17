import { Box, Typography, useTheme } from "@mui/material";

const ChartSong = ({ track, position }) => {
    const { palette } = useTheme();
    const backgroundSwitch = palette.background.switch;
    const main = palette.neutral.main;
    const neutralLight = palette.neutral.light;

    const formatDuration = (duration) => {
        const totalSeconds = Math.round(duration / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const formattedSeconds = seconds.toString().padStart(2, '0');
        
        return `${minutes}:${formattedSeconds}`;
    };

    return (
        <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center" 
            p="0.5rem 1rem"
            sx={{"&:hover": { backgroundColor: neutralLight, borderRadius: 2, }}}
        >
            <Box display="flex" alignItems="center" gap="1rem" style={{ overflow: 'hidden' }}>
                <Box display="flex" justifyContent="center" alignItems="center">
                    <Typography variant="h5" color={main}>
                        {position}
                    </Typography>
                </Box>
                <Box position="relative" width="40px" height="40px">
                    <img 
                        style={{ objectFit: "cover", width: "100%", height: "100%" }}
                        alt="song"
                        src={track.album?.images?.[0]?.url}
                    />
                </Box>
                <Box sx={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    <Typography 
                        variant="h5" 
                        fontWeight="500" 
                        color={backgroundSwitch} 
                        sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'}}>
                        {track.name}
                    </Typography>
                    <Typography variant="h7" color={main} sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'}}>
                        {track.artists.map((artist) => artist.name).join(", ")}
                    </Typography>
                </Box>
            </Box>
            <Box display="flex" alignItems="center" gap="1rem" >
                <Typography variant="h5" color={main} >
                        {formatDuration(track.duration_ms)}
                </Typography>
            </Box>
        </Box>
    );
};

export default ChartSong;