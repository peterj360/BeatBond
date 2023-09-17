import { useTheme } from "@emotion/react";
import { Box,  CircularProgress,  Divider, Typography, useMediaQuery } from "@mui/material";
import axios from "axios";
import ChartSong from "components/ChartSong";
import FlexBetween from "components/FlexBetween";
import WidgetWrapper from "components/WidgetWrapper";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

const ChartPage = () => {
    const { chartId } = useParams();
    const token = useSelector((state) => state.token);
    const [chart, setChart] = useState();

    const { palette } = useTheme();
    const main = palette.neutral.main;
    const neutralDark = palette.neutral.dark;

    const isNonMobileScreens = useMediaQuery("(min-width:1000px)");

    const BASE_URL = process.env.REACT_APP_BEATBOND_API_BASE_URL;

    useEffect(() => {
        const getChart = async () => {
            try {
            const response = await axios.get(`${BASE_URL}/spotify/playlist/${chartId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setChart(response.data);
            } catch (error) {
                console.error("Error fetching chart:", error);
            }
        };

        getChart();
    }, [chartId]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <Box width="100%" display="flex" padding={isNonMobileScreens ? "0 0 0 1rem" : "0 0 10rem 0"}>
            { chart ?
            <WidgetWrapper width="100%" mb="1.35rem">
                <Box display="flex" flexDirection={ isNonMobileScreens ? "row" : "column" } alignItems={isNonMobileScreens ? "stretch" : "center"} p="1rem 0">
                    <Box display="flex" width="170px" pb="1rem">
                        <img 
                            style={{ objectFit: "cover", borderRadius: "10%",}}
                            width="170px"
                            height="170px"
                            alt="chart"
                            src={chart.images[0].url}
                        />
                    </Box>
                    <Box display="flex" flexDirection="column" justifyContent="space-between" width="100%" pl="1rem" pb="1rem">
                        <FlexBetween>
                            <Typography variant="h6" color={neutralDark} >
                                {`Chart`}
                            </Typography>
                        </FlexBetween>

                        <Typography 
                            variant="h1" 
                            fontWeight="500" 
                            color={neutralDark} 
                            pb="1rem" 
                            sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}
                        >
                            {"Spotify " + chart.name}
                        </Typography>

                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography 
                                variant="h5" 
                                color={neutralDark} 
                                sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'}}
                            >
                                {chart.description}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
                <Divider />
                <Box 
                    display="flex" 
                    justifyContent="space-between" 
                    alignItems="center"
                    p="0.5rem 1rem"
                >
                    <Box display="flex" gap="1rem">
                        <Typography 
                            variant="h5" 
                            fontWeight="500" 
                            color={main} 
                        >
                            #
                        </Typography>
                        <Box position="relative" width="40px"/>
                        <Typography 
                            variant="h5" 
                            fontWeight="500" 
                            color={main} 
                        >
                            Title
                        </Typography>
                    </Box>
                    <Typography 
                        variant="h5" 
                        fontWeight="500" 
                        color={main} 
                    >
                        Duration
                    </Typography>
                </Box>
                <Divider />
                <Box 
                    sx={{ 
                        height: '25.9rem', 
                        overflowY: 'auto', 
                        '&::-webkit-scrollbar': {
                            width: '0.5em'
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'rgba(0,0,0,.3)',  
                        }, 
                    }}
                >
                    {chart.tracks.items.map((item, index) => (
                        <ChartSong key={item.track.uri} track={item.track} position={index + 1} />
                    ))}

                </Box>
            </WidgetWrapper>
            : <WidgetWrapper width="100%" height="44.2rem" sx={{ display: "flex",justifyContent: "center", alignItems: "center" }}>
                <CircularProgress />
            </WidgetWrapper>}
        </Box>
    );
};

export default ChartPage;