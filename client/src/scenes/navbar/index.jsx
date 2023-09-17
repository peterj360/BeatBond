import { useState } from "react";
import { Box, IconButton, InputBase, Typography, Select, MenuItem, FormControl, useTheme, useMediaQuery, Button } from "@mui/material";
import { DarkMode, LightMode, Menu, Close } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import {setMode, setLogout } from "state";
import {  useNavigate } from "react-router-dom";
import FlexBetween from "components/FlexBetween";

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const user = useSelector((state) => state.user);
    let username;
    if (user) {
        username = user.username;
    }

    const [isMobileMenuToggled, setIsMobileMenuToggled] = useState(false);

    const theme = useTheme();
    const primary = theme.palette.primary.main;
    const neutralLight = theme.palette.neutral.light;
    const dark = theme.palette.dark;
    const background = theme.palette.background.default;
    const backgroundSwitch = theme.palette.background.switch;
    const primaryLight = theme.palette.primary.light;
    const alt = theme.palette.background.alt;

    const isNonMobileScreens = useMediaQuery("(min-width: 1000px");

    return (
        <Box sx={{ position: "fixed", top: 0, zIndex: 1300, boxSizing: 'border-box', overflowX: 'hidden' }}>
            <FlexBetween padding="1rem 6%" backgroundColor={alt} width="100vw">
            <FlexBetween gap="1.75rem">
                <Typography fontWeight="bold" fontSize="clamp(1rem, 2rem, 2.25rem)" color="primary" onClick={() => navigate("/home")} sx={{"&:hover": {color: primaryLight, cursor: "pointer",}}}> 
                    BeatBond
                </Typography>
            </FlexBetween>
            {/*Desktop Nav*/}
            {isNonMobileScreens ? (
                <FlexBetween gap="2rem">
                    <IconButton onClick={() => dispatch(setMode())}>
                        {theme.palette.mode === "dark" ? (
                            <DarkMode sx={{fontsize: "25px"}}/>
                        ) : (
                            <LightMode sx={{ color: dark, fontsize: "25px"}}/>
                        )}
                    </IconButton>
                    {user ? <FormControl variant="standard" value={username}>
                        <Select 
                            value={username} 
                            sx={{ 
                                backgroundColor: neutralLight, 
                                width: "150px", 
                                borderRadius: "0.25rem",
                                p: "0.25rem 1rem", 
                                "& .MuiSvgIcon-root": {
                                    pr: "0.25rem", 
                                    width: "3rem"
                                },
                                "& .MuiSelect-select:focus": {
                                    backgroundColor: neutralLight
                                },
                            }}
                            input={<InputBase />}
                        >
                            <MenuItem value={username}>
                                <Typography>{username}</Typography>
                            </MenuItem>
                            <MenuItem onClick={() => dispatch(setLogout())}>Log Out</MenuItem>
                        </Select>
                    </FormControl> : <Box display="flex" gap="2rem">
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
                                onClick={() => navigate(`/signup`)}
                            >
                                Sign up
                            </Button>
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
                                Login
                            </Button>
                        </Box>
                    </Box>}
                </FlexBetween>
            ): (
                <IconButton onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}>
                    <Menu />
                </IconButton>
            )}
            {/*Mobile Nav*/}
            {!isNonMobileScreens && isMobileMenuToggled && (
                <Box position="fixed" right="0" bottom="0" height="100%" zIndex="10" maxWidth="500px" minWidth="300px" backgroundColor={background}>
                    <Box display="flex" justifyContent="flex-end" p="1rem">
                        <IconButton onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}>
                            <Close />
                        </IconButton>
                    </Box>

                    <FlexBetween display="flex" flexDirection="column" justifyContent="center" alignItems="center" gap="3rem">
                    <IconButton onClick={() => dispatch(setMode())} sx={{fontsize: "25px"}}>
                        {theme.palette.mode === "dark" ? (
                            <DarkMode sx={{fontsize: "25px"}}/>
                        ) : (
                            <LightMode sx={{ color: dark, fontsize: "25px"}}/>
                        )}
                    </IconButton>
                    {/* <Message sx={{fontsize: "25px"}}/>
                    <Notifications sx={{fontsize: "25px"}}/>
                    <Help sx={{fontsize: "25px"}}/> */}
                    <FormControl variant="standard" value={username}>
                        <Select 
                            value={username} 
                            sx={{ 
                                backgroundColor: neutralLight, 
                                width: "150px", 
                                borderRadius: "0.25rem",
                                p: "0.25rem 1rem", 
                                "& .MuiSvgIcon-root": {
                                    pr: "0.25rem", 
                                    width: "3rem"
                                },
                                "& .MuiSelect-select:focus": {
                                    backgroundColor: neutralLight
                                },
                            }}
                            input={<InputBase />}
                        >
                            <MenuItem value={username}>
                                <Typography>{username}</Typography>
                            </MenuItem>
                            <MenuItem onClick={() => dispatch(setLogout())}>Log Out</MenuItem>
                        </Select>
                    </FormControl>
                </FlexBetween>
                </Box>
            )}
        </FlexBetween>
        </Box>
    );
};

export default Navbar;