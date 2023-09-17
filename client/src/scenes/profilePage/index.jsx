import { useTheme } from "@emotion/react";
import { Close, Edit, MoreHorizOutlined } from "@mui/icons-material";
import { Box, Button, CircularProgress, Divider, FormControl, FormControlLabel, FormLabel, IconButton, Menu, MenuItem, Modal, Radio, RadioGroup, TextField, Typography, useMediaQuery } from "@mui/material";
import axios from "axios";
import FlexBetween from "components/FlexBetween";
import Post from "components/Post";
import WidgetWrapper from "components/WidgetWrapper";
import { useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { setPosts, setUser } from "state";


const ProfilePage = () => {
    const { userId } = useParams();
    const dispatch = useDispatch();
    
    const token = useSelector((state) => state.token);
    const loggedInUser = useSelector((state) => state.user);
    const posts = useSelector((state) => state.posts);

    const [profile, setProfile] = useState();
    const [isHovered, setIsHovered] = useState(false);
    const [open, setOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [showEditIcon, setShowEditIcon] = useState(false);
    const [privacyValue, setPrivacyValue] = useState(profile?.privacy);
    const [firstNameText, setFirstNameText] = useState(profile?.firstName);
    const [lastNameText, setLastNameText] = useState(profile?.lastName);
    const [usernameText, setUsernameText] = useState(profile?.usernameText);
    const [profileImage, setProfileImage] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);

    const myProfile = userId === loggedInUser._id;

    const { palette } = useTheme();
    const primary = palette.primary.main;
    const backgroundSwitch = palette.background.switch;
    const alt = palette.background.alt;
    const neutralLight = palette.neutral.light;
    const neutralDark = palette.neutral.dark;

    const BASE_URL = process.env.REACT_APP_BEATBOND_API_BASE_URL;
    const S3_BASE_URL = process.env.REACT_APP_S3_BASE_URL;

    const isNonMobileScreens = useMediaQuery("(min-width:1000px)");

    const handleRadioChange = (event) => {
        setPrivacyValue(event.target.value);
    };
    
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
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
        handleMenuClose();
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

            setProfile(response.data.user);
            
            dispatch(setUser(response.data.user));

            handleModalClose();
            handleMenuClose();

            if (profileImage) {
                URL.revokeObjectURL(profileImage);
            }
        } catch (error) {
            console.error("An error occurred while saving profile: ", error);
        }
    }

    const handleFollow = async () => {
        try {
            let updatedFollowers;
            let response;
            if (isFollowing) {
                response = await axios.delete(`${BASE_URL}/users/${loggedInUser._id}/follow/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
                if (response.status === 200) {
                    updatedFollowers = profile.followers.filter(id => id !== loggedInUser._id);
                }
            } else {
                response = await axios.post(`${BASE_URL}/users/${loggedInUser._id}/follow/${userId}`, {}, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
                if (response.status === 200) {
                    updatedFollowers = [...profile.followers, loggedInUser._id];
                }
            }
    
            if (response.status === 200) {
                setProfile({ ...profile, followers: updatedFollowers });
                setIsFollowing(!isFollowing);
            }
    
        } catch (error) {
            console.error("Error toggling following", error);
        }
        handleMenuClose();
    }

    useEffect(() => {
        const getProfile = async () => {
            try {
            const response = await axios.get(`${BASE_URL}/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProfile(response.data.user);
            setIsFollowing(response.data.user.followers.includes(loggedInUser._id));
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };

        const getUserPosts = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/posts/${userId}`, {
                    headers: { Authorization: `Bearer ${token}`},
                });
                dispatch(setPosts({ posts: response.data.posts }));
            } catch (error) {
                console.error(`Error fetching posts for user: ${userId}`, error);
            }
        }
        getProfile();
        getUserPosts();
    }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (profile) {
            setFirstNameText(profile.firstName);
            setLastNameText(profile.lastName);
            setUsernameText(profile.username);
            setPrivacyValue(profile.privacy);
        }
    }, [profile, open]);

    return (
        <Box width="100%" display="flex" padding={isNonMobileScreens ? "0 0 0 1rem" : "0 0 10rem 0"}>
            { profile ?
            <WidgetWrapper width="100%" mb="1.35rem">
                <Box display="flex" flexDirection={ isNonMobileScreens ? "row" : "column" } alignItems={isNonMobileScreens ? "stretch" : "center"} p="1rem 0">
                    <Box display="flex" width="170px" pb="1rem">
                        <div 
                            style={{ 
                                position: 'relative', 
                                cursor: myProfile ?'pointer' : "default", 
                                width: "170px", 
                                height: "170px" 
                            }}
                            onMouseEnter={() => { if (myProfile) setIsHovered(true); }}
                            onMouseLeave={() => { if (myProfile) setIsHovered(false); }}
                            onClick={myProfile ? handleModalOpen : null}
                        >
                            <img 
                                style={{ objectFit: "cover", borderRadius: "10%",}}
                                width="170px"
                                height="170px"
                                alt="user"
                                src={`${S3_BASE_URL}/${profile.picturePath}`}
                            />
                            {(myProfile && isHovered) && (
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
                                {`${profile.privacy} Profile`}
                            </Typography>
                            <IconButton onClick={handleMenuOpen} sx={{ backgroundColor: neutralLight, "&:hover": {backgroundColor: primary}, p: "0.6rem" }}>
                                <MoreHorizOutlined sx={{ color: neutralDark }}/>    
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                            >
                                {myProfile ? <div>
                                    <MenuItem onClick={handleModalOpen}>Edit profile</MenuItem>
                                </div> : <div>
                                    <MenuItem onClick={handleFollow}>{isFollowing ? "Unfollow" : "Follow"}</MenuItem>
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
                                                                src={profileImage ?  URL.createObjectURL(profileImage) :`${S3_BASE_URL}/${profile.picturePath}`}
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
                        <FlexBetween>
                            <Typography 
                                variant="h1" 
                                fontWeight="500" 
                                color={neutralDark} 
                                pb="1rem" 
                                sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', "&:hover": {cursor: myProfile ? "pointer" : "default"}}}
                                onClick={myProfile ? handleModalOpen : null}
                            >
                                {profile.username}
                            </Typography>
                            {!myProfile && <Button
                                variant="contained"
                                size="medium"
                                sx={{
                                    textTransform: 'none',
                                    borderRadius: 5,
                                    backgroundColor: primary,
                                    color: backgroundSwitch,
                                    boxShadow: 'none',  
                                }}
                                onClick={handleFollow}
                            >
                                {isFollowing ? "Unfollow" : "Follow"}
                            </Button>}
                        </FlexBetween>
                        <FlexBetween width="100%">
                            <Typography 
                                variant="h5" 
                                color={neutralDark} 
                                sx={{whiteSpace: 'nowrap', maxWidth: '100%'}}
                            >
                                {profile.followers?.length + " Followers"}
                            </Typography>
                            <Typography 
                                variant="h5" 
                                color={neutralDark} 
                                sx={{whiteSpace: 'nowrap', maxWidth: '100%'}}
                            >
                                {profile.following?.length + " Following"}
                            </Typography>
                            <Typography 
                                variant="h5" 
                                color={neutralDark} 
                                sx={{whiteSpace: 'nowrap', maxWidth: '100%'}}
                            >
                                {profile.posts?.length + " Posts"}
                            </Typography>
                            <Typography 
                                variant="h5" 
                                color={neutralDark} 
                                sx={{whiteSpace: 'nowrap', maxWidth: '100%'}}
                            >
                                {profile.songs?.length + " Songs"}
                            </Typography>
                            <Typography 
                                variant="h5" 
                                color={neutralDark} 
                                sx={{whiteSpace: 'nowrap', maxWidth: '100%'}}
                            >
                                {profile.playlists?.length + " Playlists"}
                            </Typography>
                        </FlexBetween>
                    </Box>
                </Box>
                <Divider />
                <Box 
                    sx={{ 
                        height: '28.2rem', 
                        overflowY: 'auto', 
                        '&::-webkit-scrollbar': {
                            width: '0.5em'
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'rgba(0,0,0,.3)',  
                        }, 
                    }}
                >
                    <Box display="flex" justifyContent="center" p="0.5rem 0rem">
                        <Typography variant="h5" color={neutralDark} >
                            Posts
                        </Typography>
                    </Box>   
                    <Box display="flex" justifyContent="center">
                        <Box 
                            display="grid" 
                            gridTemplateColumns={"repeat(auto-fit, minmax(11rem, 1fr))"} 
                            gap="0.5rem" 
                            alignItems="start"
                            justifyItems="center"
                            width="100%"
                        >
                            {posts.map((post) => (
                                <Post key={post._id} post={post} user={profile}/>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </WidgetWrapper>
            : <WidgetWrapper width="100%" height="44.2rem" sx={{ display: "flex",justifyContent: "center", alignItems: "center" }}>
                <CircularProgress />
            </WidgetWrapper>}
        </Box>
    );
};

export default ProfilePage;