import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Paper,
    Avatar,
    Button,
    Divider,
    Alert,
    CircularProgress
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { styled } from '@mui/material/styles';
import { useAppContext } from '../context/AppContext';

const Root = styled(Container)(({ theme }) => ({
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
}));

const ProfilePaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginBottom: theme.spacing(4),
}));

const ProfileHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(4),
}));

const LargeAvatar = styled(Avatar)(({ theme }) => ({
    width: theme.spacing(8),
    height: theme.spacing(8),
    backgroundColor: theme.palette.primary.main,
    fontSize: '2rem',
    marginRight: theme.spacing(3),
}));

const ProfileDetail = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
}));

const ProfileIcon = styled(Box)(({ theme }) => ({
    marginRight: theme.spacing(2),
    color: theme.palette.primary.main,
}));

const ActionButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(2),
}));

const ProfilePage = () => {
    const { user, logout } = useAppContext();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleLogout = () => {
        setLoading(true);
        setTimeout(() => {
            logout();
            navigate('/');
            setLoading(false);
        }, 500);
    };

    if (!user) {
        return (
            <Root maxWidth="md">
                <CircularProgress />
            </Root>
        );
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <Root maxWidth="md">
            <ProfilePaper elevation={3}>
                <ProfileHeader>
                    <LargeAvatar>{user.nom?.charAt(0).toUpperCase()}</LargeAvatar>
                    <Box>
                        <Typography variant="h4">{user.nom}</Typography>
                        <Typography variant="subtitle1" color="textSecondary">
                            {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                        </Typography>
                    </Box>
                </ProfileHeader>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                    Informations personnelles
                </Typography>

                <ProfileDetail>
                    <ProfileIcon>
                        <PersonIcon />
                    </ProfileIcon>
                    <Box>
                        <Typography variant="body2" color="textSecondary">
                            Nom
                        </Typography>
                        <Typography variant="body1">
                            {user.nom}
                        </Typography>
                    </Box>
                </ProfileDetail>

                <ProfileDetail>
                    <ProfileIcon>
                        <EmailIcon />
                    </ProfileIcon>
                    <Box>
                        <Typography variant="body2" color="textSecondary">
                            Email
                        </Typography>
                        <Typography variant="body1">
                            {user.email}
                        </Typography>
                    </Box>
                </ProfileDetail>

                <ProfileDetail>
                    <ProfileIcon>
                        <DateRangeIcon />
                    </ProfileIcon>
                    <Box>
                        <Typography variant="body2" color="textSecondary">
                            Membre depuis
                        </Typography>
                        <Typography variant="body1">
                            {formatDate(user.createdAt)}
                        </Typography>
                    </Box>
                </ProfileDetail>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <ActionButton
                        variant="contained"
                        color="error"
                        onClick={handleLogout}
                        disabled={loading}
                    >
                        {loading ? 'Déconnexion...' : 'Se déconnecter'}
                    </ActionButton>
                </Box>
            </ProfilePaper>

            <Alert severity="info">
                Pour l'instant, être connecté ne change pas votre expérience sur HOMEPEDIA. Des fonctionnalités supplémentaires pour les utilisateurs connectés seront disponibles prochainement !
            </Alert>
        </Root>
    );
};

export default ProfilePage;