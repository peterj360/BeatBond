import { Box } from "@mui/material";

const UserImage = ({ image, size="60px"}) => {
    const S3_BASE_URL = process.env.REACT_APP_S3_BASE_URL;
    
    return (
        <Box width={size} height={size}>
            <img 
                style={{ objectFit: "cover", borderRadius: "50%"}}
                width={size}
                height={size}
                alt="user"
                src={`${S3_BASE_URL}/${image}`}
            />
        </Box>
    );
}

export default UserImage;