import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
    ListItem, 
    ListItemIcon, 
    ListItemText, 
    ListItemButton, 
    Divider, 
    Collapse,
    IconButton,
    Box,
    Typography,
    Button
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SettingsIcon from '@mui/icons-material/Settings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TableChartIcon from '@mui/icons-material/TableChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LockIcon from '@mui/icons-material/Lock';
import LockResetIcon from '@mui/icons-material/LockReset';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LanguageIcon from '@mui/icons-material/Language';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { ReactComponent as Logo } from '../assets/logo.svg';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { language, isRTL, toggleLanguage } = useLanguage();
    const { t } = useTranslation();
    const [usersOpen, setUsersOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className={`dashboard-container ${isRTL ? 'rtl' : ''}`}>
            {/* Mobile Menu Toggle */}
            <div className="mobile-header">
                <IconButton 
                    className="menu-toggle"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    sx={{ color: 'white' }}
                >
                    {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
                </IconButton>
                <Box className="mobile-logo">
                    <Logo style={{ height: '40px', width: 'auto' }} />
                </Box>
                <IconButton onClick={toggleLanguage} sx={{ color: 'white' }}>
                    <LanguageIcon />
                    <Typography variant="caption" sx={{ ml: 0.5, color: 'white' }}>
                        {language.toUpperCase()}
                    </Typography>
                </IconButton>
            </div>

            {/* Sidebar */}
            <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <Box className="logo-container">
                        <Logo style={{ height: '50px', width: 'auto' }} />
                    </Box>
                    <Typography variant="h6" className="admin-title">
                        {t('adminPanel')}
                    </Typography>
                </div>
                
                <nav>
                    <ul>
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => setUsersOpen(!usersOpen)}>
                                <ListItemIcon>
                                    <PeopleIcon />
                                </ListItemIcon>
                                <ListItemText primary={t('users')} />
                                {usersOpen ? <ExpandLess /> : <ExpandMore />}
                            </ListItemButton>
                        </ListItem>
                        <Collapse in={usersOpen} timeout="auto" unmountOnExit>
                            <ListItem disablePadding sx={{ pl: 4 }}>
                                <ListItemButton component={Link} to="/dashboard/users" onClick={() => setSidebarOpen(false)}>
                                    <ListItemIcon>
                                        <PeopleIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={t('userList')} />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding sx={{ pl: 4 }}>
                                <ListItemButton component={Link} to="/dashboard/create-user" onClick={() => setSidebarOpen(false)}>
                                    <ListItemIcon>
                                        <PersonAddIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={t('createUser')} />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding sx={{ pl: 4 }}>
                                <ListItemButton component={Link} to="/dashboard/change-password" onClick={() => setSidebarOpen(false)}>
                                    <ListItemIcon>
                                        <LockIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={t('changePassword')} />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding sx={{ pl: 4 }}>
                                <ListItemButton component={Link} to="/dashboard/reset-password" onClick={() => setSidebarOpen(false)}>
                                    <ListItemIcon>
                                        <LockResetIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={t('resetPassword')} />
                                </ListItemButton>
                            </ListItem>
                        </Collapse>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} to="/dashboard/banks-and-tpps" onClick={() => setSidebarOpen(false)}>
                                <ListItemIcon>
                                    <AccountBalanceIcon />
                                </ListItemIcon>
                                <ListItemText primary={t('bankTppManagement')} />
                            </ListItemButton>
                        </ListItem>
                        <Divider sx={{ my: 1 }} />
                        <ListItem disablePadding>
                            <ListItemButton component={Link} to="/dashboard/file-configs" onClick={() => setSidebarOpen(false)}>
                                <ListItemIcon>
                                    <SettingsIcon />
                                </ListItemIcon>
                                <ListItemText primary={t('fileConfigurations')} />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} to="/dashboard/column-mappings" onClick={() => setSidebarOpen(false)}>
                                <ListItemIcon>
                                    <TableChartIcon />
                                </ListItemIcon>
                                <ListItemText primary={t('columnMappings')} />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} to="/dashboard/header-definitions" onClick={() => setSidebarOpen(false)}>
                                <ListItemIcon>
                                    <ViewColumnIcon />
                                </ListItemIcon>
                                <ListItemText primary={"Header Definitions"} />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} to="/dashboard/institution-converter" onClick={() => setSidebarOpen(false)}>
                                <ListItemIcon>
                                    <SwapHorizIcon />
                                </ListItemIcon>
                                <ListItemText primary={t('institutionConverter')} />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} to="/dashboard/import-logs" onClick={() => setSidebarOpen(false)}>
                                <ListItemIcon>
                                    <AssessmentIcon />
                                </ListItemIcon>
                                <ListItemText primary={t('importLogs')} />
                            </ListItemButton>
                        </ListItem>
                        <Divider sx={{ my: 1 }} />
                        <ListItem disablePadding>
                            <ListItemButton component={Link} to="/dashboard/business-intelligence" onClick={() => setSidebarOpen(false)}>
                                <ListItemIcon>
                                    <BarChartIcon />
                                </ListItemIcon>
                                <ListItemText primary={t('businessIntelligence')} />
                            </ListItemButton>
                        </ListItem>

                    </ul>
                </nav>
                
                <div className="sidebar-footer">
                    <Button 
                        onClick={toggleLanguage} 
                        startIcon={<LanguageIcon />}
                        className="language-toggle"
                        fullWidth
                        variant="outlined"
                        sx={{ mb: 2 }}
                    >
                        {language === 'en' ? 'العربية' : 'English'}
                    </Button>
                    <button onClick={handleLogout} className="logout-button">
                        {t('logout')}
                    </button>
                </div>
            </div>
            
            {/* Overlay for mobile */}
            {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
            <div className="content">
                <Outlet />
            </div>
        </div>
    );
};

export default Dashboard;
