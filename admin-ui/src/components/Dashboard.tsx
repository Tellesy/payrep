import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ListItem, ListItemIcon, ListItemText, ListItemButton, Divider, Collapse } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SettingsIcon from '@mui/icons-material/Settings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TableChartIcon from '@mui/icons-material/TableChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LockIcon from '@mui/icons-material/Lock';
import LockResetIcon from '@mui/icons-material/LockReset';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [usersOpen, setUsersOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            <div className="sidebar">
                <h2>Admin Panel</h2>
                <nav>
                    <ul>
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => setUsersOpen(!usersOpen)}>
                                <ListItemIcon>
                                    <PeopleIcon />
                                </ListItemIcon>
                                <ListItemText primary="Users" />
                                {usersOpen ? <ExpandLess /> : <ExpandMore />}
                            </ListItemButton>
                        </ListItem>
                        <Collapse in={usersOpen} timeout="auto" unmountOnExit>
                            <ListItem disablePadding sx={{ pl: 4 }}>
                                <ListItemButton component={Link} to="/dashboard/users">
                                    <ListItemIcon>
                                        <PeopleIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="User List" />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding sx={{ pl: 4 }}>
                                <ListItemButton component={Link} to="/dashboard/create-user">
                                    <ListItemIcon>
                                        <PersonAddIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Create User" />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding sx={{ pl: 4 }}>
                                <ListItemButton component={Link} to="/dashboard/change-password">
                                    <ListItemIcon>
                                        <LockIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Change Password" />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding sx={{ pl: 4 }}>
                                <ListItemButton component={Link} to="/dashboard/reset-password">
                                    <ListItemIcon>
                                        <LockResetIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Reset Password" />
                                </ListItemButton>
                            </ListItem>
                        </Collapse>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} to="/dashboard/banks-and-tpps">
                                <ListItemIcon>
                                    <AccountBalanceIcon />
                                </ListItemIcon>
                                <ListItemText primary="Bank/TPP Management" />
                            </ListItemButton>
                        </ListItem>
                        <Divider sx={{ my: 1 }} />
                        <ListItem disablePadding>
                            <ListItemButton component={Link} to="/dashboard/file-configs">
                                <ListItemIcon>
                                    <SettingsIcon />
                                </ListItemIcon>
                                <ListItemText primary="File Configurations" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} to="/dashboard/column-mappings">
                                <ListItemIcon>
                                    <TableChartIcon />
                                </ListItemIcon>
                                <ListItemText primary="Column Mappings" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} to="/dashboard/import-logs">
                                <ListItemIcon>
                                    <AssessmentIcon />
                                </ListItemIcon>
                                <ListItemText primary="Import Logs" />
                            </ListItemButton>
                        </ListItem>
                        <Divider sx={{ my: 1 }} />
                        <ListItem disablePadding>
                            <ListItemButton component={Link} to="/dashboard/business-intelligence">
                                <ListItemIcon>
                                    <BarChartIcon />
                                </ListItemIcon>
                                <ListItemText primary="Business Intelligence" />
                            </ListItemButton>
                        </ListItem>

                    </ul>
                </nav>
                <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>
            <div className="content">
                <Outlet />
            </div>
        </div>
    );
};

export default Dashboard;
