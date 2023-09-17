import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import HomePage from "scenes/homePage";
import LoginPage from "scenes/loginPage";
import ProfilePage from "scenes/profilePage";
import PlaylistPage from "scenes/playlistPage";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { themeSettings } from "./theme";
import MainLayout from "scenes/mainLayout";
import LikedSongsPage from "scenes/likedSongs";
import SearchPage from "scenes/searchPage";
import ChartPage from "scenes/chartPage";
import LandingPage from "scenes/landingPage";
import SignUpPage from "scenes/signUpPage";


function App() {
  const mode = useSelector((state) => state.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  const isAuth = Boolean(useSelector((state) => state.token));

  return (
    <div className="app">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Routes>
            <Route path="/" element={<MainLayout /> }>
              <Route index path="/" element={<LandingPage/>} />
              <Route path="search" element={<SearchPage/> } />
              <Route path="chart/:chartId" element={<ChartPage/> } />
            </Route>
            <Route path="/login" element={<LoginPage/>} />
            <Route path="/signup" element={<SignUpPage/>} />
            <Route path="/" element={ isAuth ? <MainLayout /> : <Navigate to="/" /> }>
              <Route index path="home" element={ <HomePage/> } />
              <Route path="playlist/:playlistId" element={ <PlaylistPage/> } />
              <Route path="liked-songs" element={ <LikedSongsPage/> } />
              <Route path="profile/:userId" element={<ProfilePage/> } />
            </Route>
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
