import { Close, Edit, ManageAccountsOutlined } from "@mui/icons-material";
import { Box, Typography, Divider, useTheme, useMediaQuery, IconButton, Modal, TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Button, CircularProgress } from "@mui/material";
import UserImage from "components/UserImage";
import FlexBetween from "components/FlexBetween";
import WidgetWrapper from "components/WidgetWrapper";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setUser } from "state";
import Dropzone from "react-dropzone";

const UserWidget = ({ userId, picturePath }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const token = useSelector((state) => state.token);
    const user = useSelector((state) => state.user);

    const [open, setOpen] = useState(false);
    const [showEditIcon, setShowEditIcon] = useState(false);
    const [privacyValue, setPrivacyValue] = useState(user?.privacy);
    const [firstNameText, setFirstNameText] = useState(user?.firstName);
    const [lastNameText, setLastNameText] = useState(user?.lastName);
    const [usernameText, setUsernameText] = useState(user?.usernameText);
    const [profileImage, setProfileImage] = useState(null);

    const { palette } = useTheme();
    const primary = palette.primary.main;
    const primaryLight = palette.primary.light;
    const main = palette.neutral.main;
    const medium = palette.neutral.medium;
    const backgroundSwitch = palette.background.switch;
    const alt = palette.background.alt;
    const neutralLight = palette.neutral.light;
    const neutralDark = palette.neutral.dark;

    const BASE_URL = process.env.REACT_APP_BEATBOND_API_BASE_URL;
    const S3_BASE_URL = process.env.REACT_APP_S3_BASE_URL;

    const isNonMobileScreens = useMediaQuery("(min-width:1000px)");

    const myProfile = userId === user._id;

    const getUser = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data.user;
            dispatch(setUser(data));
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    useEffect(() => {
        getUser();
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        setFirstNameText(user.firstName);
        setLastNameText(user.lastName);
        setUsernameText(user.username);
        setPrivacyValue(user.privacy);
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!user) {
        return <CircularProgress />;
    }

    const {
        firstName,
        lastName,
        username,
        followers,
        following,
        posts,
        songs,
        playlists,
    } = user;

    const handleRadioChange = (event) => {
        setPrivacyValue(event.target.value);
    };

    const handleModalOpen = () => {
        if (myProfile) {
            setOpen(true);
        }
    }

    const handleModalClose = () => {
        if (profileImage) {
            URL.revokeObjectURL(profileImage);
        }
        setOpen(false);
    }

    const handleSaveUser = async () => {
        try { 
            const formData = new FormData();
            if (firstNameText) {
                formData.append("firstName", firstNameText);
            }
            if (lastNameText) {
                formData.append("lastName", lastNameText);
            }
            if (usernameText) {
                formData.append("username", usernameText);
            }
            if (profileImage) {
                formData.append("picture", profileImage);
            }
            if (privacyValue) {
                formData.append("privacy", privacyValue);
            }

            const response = await axios.put(`${BASE_URL}/users/${userId}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
            });
            dispatch(setUser(response.data.user));

            handleModalClose();

            if (profileImage) {
                URL.revokeObjectURL(profileImage);
            }
        } catch (error) {
            console.error("An error occurred while saving profile: ", error);
        }
    }

    return (
        <WidgetWrapper sx={ isNonMobileScreens ? { width: "100%",  } : {}}>
            <FlexBetween pb="1.1rem">
                <FlexBetween gap="0.5rem">
                    <UserImage image={picturePath} size="40px"/>
                    <Box>
                        <Typography 
                            variant="h4"
                            color={neutralDark}
                            fontWeight="500"
                            fontSize="1rem"
                            sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', "&:hover": { color: primaryLight, cursor: "pointer" } }}
                            onClick={() => navigate(`/profile/${userId}`)}
                        >
                            {firstName} {lastName}
                        </Typography>
                        <Typography color={medium} fontSize="0.75rem" >{username}</Typography>
                    </Box>
                </FlexBetween>
                <IconButton 
                    onClick={handleModalOpen} sx={{ backgroundColor: neutralLight, "&:hover": {backgroundColor: primary}, }}
                >
                    <ManageAccountsOutlined sx={{ color: neutralDark }}/>    
                </IconButton>
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
                                <Dropzone acceptedFiles=".jpg,.jpeg,.png" multiple={false} onDrop={(acceptedFiles) => setProfileImage(acceptedFiles[0])}>
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
                                                    alt="user"
                                                    src={profileImage ?  URL.createObjectURL(profileImage) :`${S3_BASE_URL}/${user?.picturePath}`}
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
                                <Box display="flex" justifyContent="space-between" gap="1rem">
                                    <TextField
                                        size="small"
                                        required
                                        id="outlined-basic" label="First name" variant="outlined"
                                        value={firstNameText}
                                        onChange={(e) => setFirstNameText(e.target.value)}
                                        placeholder="Enter your first name"
                                        sx={{ backgroundColor: neutralLight, borderRadius: 2, maxWidth: "7.5rem"}}

                                    />
                                    <TextField
                                        size="small"
                                        required
                                        id="outlined-basic" label="Last name" variant="outlined"
                                        value={lastNameText}
                                        onChange={(e) => setLastNameText(e.target.value)}
                                        placeholder="Enter your last name"
                                        sx={{ backgroundColor: neutralLight, borderRadius: 2, maxWidth: "7.5rem"}}
                                    />
                                </Box>
                                <TextField
                                        size="small"
                                        required
                                        id="outlined-basic" label="Username" variant="outlined"
                                        value={usernameText}
                                        onChange={(e) => setUsernameText(e.target.value)}
                                        placeholder="Enter your username"
                                        sx={{ backgroundColor: neutralLight, borderRadius: 2,}}
                                    />
                                <FormControl>
                                    <FormLabel>Profile Privacy</FormLabel>
                                    <RadioGroup
                                        value={privacyValue}
                                        onChange={handleRadioChange}
                                        row
                                    >
                                        <FormControlLabel value="Private" control={<Radio />} label="Private"/>
                                        <FormControlLabel value="Public" control={<Radio />} label="Public"/>
                                    </RadioGroup>
                                </FormControl>
                            </Box>
                        </Box>
                        <Divider/>
                        <Button 
                            variant="text" 
                            onClick={handleSaveUser} 
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
            </FlexBetween>

            <Divider />

            <Box p="1rem 0">
                <FlexBetween mb="0.5rem">
                    <Typography color={medium}>Followers</Typography>
                    <Typography color={main} fontWeight="500">{followers?.length || 0}</Typography>
                </FlexBetween>
                <FlexBetween>
                    <Typography color={medium}>Following</Typography>
                    <Typography color={main} fontWeight="500">{following?.length || 0}</Typography>
                </FlexBetween>
            </Box>

            <Divider />

            <Box p="1rem 0 0 0">
                <FlexBetween mb="0.5rem">
                    <Typography color={medium}>{posts?.length || 0} Posts</Typography> {/*cant do postsState?.length cause it will always be max 10 */}
                    <Typography color={medium}>{songs?.length || 0} Songs</Typography>
                    <Typography color={medium}>{playlists?.length || 0} Playlists</Typography>
                </FlexBetween>
            </Box>

        </WidgetWrapper>
    )
};

export default UserWidget;