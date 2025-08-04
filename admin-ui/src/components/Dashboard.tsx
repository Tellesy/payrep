import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

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
                        <li><Link to="/dashboard/users">User List</Link></li>
                        <li><Link to="/dashboard/create-user">Create User</Link></li>
                        <li><Link to="/dashboard/change-password">Change Password</Link></li>
                        <li><Link to="/dashboard/reset-password">Reset Password</Link></li>
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
