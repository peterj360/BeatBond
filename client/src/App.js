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
            <Route path="/" element={<MainLayout />}>
              <Route index path="/" element={isAuth ? <Navigate to="/home" /> : <LandingPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="chart/:chartId" element={<ChartPage />} />
              <Route path="home" element={isAuth ? <HomePage /> : <Navigate to="/" />} />
              <Route path="playlist/:playlistId" element={isAuth ? <PlaylistPage /> : <Navigate to="/" />} />
              <Route path="liked-songs" element={isAuth ? <LikedSongsPage /> : <Navigate to="/" />} />
              <Route path="profile/:userId" element={isAuth ? <ProfilePage /> : <Navigate to="/" />} />
            </Route>
            <Route path="/login" element={isAuth ? <Navigate to="/home" /> : <LoginPage />} />
            <Route path="/signup" element={isAuth ? <Navigate to="/home" /> : <SignUpPage />} />
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
