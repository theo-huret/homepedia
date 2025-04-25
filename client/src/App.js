import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomePage from './pages/HomePage';
import ExplorerPage from './pages/ExplorerPage';
import AnalysePage from './pages/AnalysePage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { AppProvider, useAppContext } from './context/AppContext';
import authService from './services/authService';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#ff9800',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    }
  },
});

const AuthHandler = () => {
  const { setUser } = useAppContext();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      localStorage.setItem('token', token);

      const fetchUser = async () => {
        try {
          const response = await authService.getCurrentUser();
          if (response.success) {
            setUser(response.data);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des informations utilisateur:', error);
        }
      };

      fetchUser();

      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [setUser]);

  return null;
};

function App() {
  return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppProvider>
          <Router>
            <AuthHandler />
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/explorer" element={<ExplorerPage />} />
                <Route path="/analyse" element={<AnalysePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Routes>
            </main>
            <Footer />
          </Router>
        </AppProvider>
      </ThemeProvider>
  );
}

export default App;