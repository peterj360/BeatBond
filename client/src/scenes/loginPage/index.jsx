import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import Form from "./Form";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isNonMobileScreens = useMediaQuery("(mind-width: 1000px");

    return <Box>
        <Box width="100%" backgroundColor={theme.palette.background.alt} p="1rem 6%" textAlign="center">
            <Box>
                <Typography fontWeight="bold" fontSize="32px" color="primary" onClick={() => navigate('/')} sx={{ cursor: 'pointer', display: 'inline-block' }}> 
                    BeatBond
                </Typography>
            </Box>
        </Box>
        <Box width={isNonMobileScreens ? "50%" : "93%"} p="2rem" m="2rem auto" borderRadius="1.5rem" backgroundColor={theme.palette.background.alt}>
            <Typography fontWeight="500" variant="h5" sx={{ mb: "1.5rem" }}> 
                Welcome to BeatBond, the Social Media for Music Lovers!
            </Typography>
            <Form/>
        </Box>

    </Box>;
};

export default LoginPage;