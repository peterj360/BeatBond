import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

const authOptions = {
    method: 'POST',
    url: 'https://accounts.spotify.com/api/token',
    headers: {
        Authorization: "Basic " + Buffer.from(client_id + ":" + client_secret).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
    },
    params: new URLSearchParams({ grant_type: "client_credentials" }),
};

const getAccessToken = async () => {
    try {
        const response = await axios(authOptions);
        return response.data.access_token;
    } catch (error) {
        console.error("Error in getting access token: ", error);
        return null;
    }
};

export { getAccessToken };