import { getAccessToken } from "../services/spotifyService.js";
import fetch from 'node-fetch';

export const getPlaylist = async (req, res) => {
    try {
        const { playlistId } = req.params
        const accessToken = await getAccessToken();
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + accessToken }
        });
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


