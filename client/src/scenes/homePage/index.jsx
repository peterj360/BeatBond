import { Box, useMediaQuery } from "@mui/material";
import { useSelector } from "react-redux";
import UserWidget from "scenes/widgets/UserWidget";
import CreatePostWidget from "scenes/widgets/CreatePostWidget";
import PostsWidget from "scenes/widgets/PostsWidget";
import LibraryWidget from "scenes/widgets/LibraryWidget";
import NavWidget from "scenes/widgets/NavWidget";

const HomePage = () => {
    const user = useSelector((state) => state.user);
    const _id = user?._id;
    const picturePath = user?.picturePath;

    const isNonMobileScreens = useMediaQuery("(min-width:1000px)");

    
    return (
        <Box display={isNonMobileScreens ? "flex" : "column"} width="100%" padding={isNonMobileScreens ? "0 0 0 0" : "0 0 0 0"}>
                {user && <Box
                    display="flex" 
                    flexDirection="column"
                    gap={isNonMobileScreens ? "1rem" : "1rem"}
                >
                    <Box
                        position={isNonMobileScreens ? "fixed" : "relative"}
                        top={isNonMobileScreens ? "7rem" : "auto"} 
                        right={isNonMobileScreens ? "2rem" : "auto"}
                        display="flex" 
                        flexDirection="column" 
                        gap="1rem"
                        width={isNonMobileScreens ? "20vw" : "100%"}
                        pt={isNonMobileScreens ? "0rem" : "1rem"}
                    >
                        <UserWidget userId={_id} picturePath={picturePath}/>
                        <CreatePostWidget picturePath={picturePath} />
                    </Box>
                </Box>}
                <Box pr={isNonMobileScreens ? "1rem": ""}
                    mr={isNonMobileScreens && _id ? "20vw" : "0"}
                    width={isNonMobileScreens ? "100%" : "100%" } 
                    mt={isNonMobileScreens ? undefined : "2rem"} 
                >
                    <PostsWidget userId={_id}/>
                </Box>
        </Box>
    );
};

export default HomePage;