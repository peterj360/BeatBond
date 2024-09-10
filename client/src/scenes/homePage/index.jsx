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
        <Box display="flex" flexDirection={isNonMobileScreens ? "row": "column"} width="100%" height="100%">
                {user && <Box
                    display="flex" 
                    flexDirection="column"
                    gap="1rem"
                >
                    <Box
                        position={isNonMobileScreens ? "fixed" : "relative"}
                        top={isNonMobileScreens ? "6rem" : "auto"} 
                        right={isNonMobileScreens ? "2rem" : "auto"}
                        display="flex" 
                        flexDirection="column" 
                        gap="1rem"
                        width={isNonMobileScreens ? "17vw" : "100%"}
                        height={isNonMobileScreens ? "calc(100vh - 88px - 7rem)" : "100%"}
                        pt={isNonMobileScreens ? "0rem" : "1rem"}
                        overflow="hidden"
                    >
                        <UserWidget userId={_id} picturePath={picturePath}/>
                        <CreatePostWidget picturePath={picturePath} />
                    </Box>
                </Box>}
                <Box pr={isNonMobileScreens ? "1rem": ""}
                    mr={isNonMobileScreens && _id ? "17vw" : "0"}
                    width={"100%" } 
                    mt={isNonMobileScreens ? "0rem" : "2rem"} 
                    height="100%"
                >
                    <PostsWidget userId={_id}/>
                </Box>
        </Box>
    );
};

export default HomePage;