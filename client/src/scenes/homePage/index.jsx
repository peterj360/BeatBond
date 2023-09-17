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
        <Box display={isNonMobileScreens ? "flex" : "column"} width="100%" padding={isNonMobileScreens ? "0 0 0 1rem" : "0 0 40% 0"}>
                {user && <Box
                    display="flex" 
                    flexDirection="column" 
                    order={3}
                    width={isNonMobileScreens ? "23rem" : "100%"}
                >
                    <Box 
                        display="flex" 
                        flexDirection="column" 
                        order={3} 
                        gap="1rem"
                        width={isNonMobileScreens ? "23rem" : "100%"}
                    >
                        {!isNonMobileScreens && (<>
                            <NavWidget />
                            <LibraryWidget />
                        </>)}
                        <UserWidget userId={_id} picturePath={picturePath}/>
                        <CreatePostWidget picturePath={picturePath} />
                    </Box>
                </Box>}
                <Box pr={isNonMobileScreens ? "1rem": ""}
                    width={isNonMobileScreens ? "100%" : "100%" } 
                    mt={isNonMobileScreens ? undefined : "2rem"} 
                    order={2}
                >
                    <PostsWidget userId={_id}/>
                </Box>
        </Box>
    );
};

export default HomePage;