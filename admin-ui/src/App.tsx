import React from 'react';
import { useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import UserList from './components/UserList';
import CreateUser from './components/CreateUser';
import ChangePassword from './components/ChangePassword';
import ResetPassword from './components/ResetPassword';
import BankTppManagement from './components/BankTppManagement';
import FileConfigManagement from './components/FileConfigManagement';
import ColumnMappingManagement from './components/ColumnMappingManagement';
import InstitutionConverter from './components/InstitutionConverter';
import ImportLogViewer from './components/ImportLogViewer';
import BusinessIntelligence from './components/BusinessIntelligence';
import HeaderDefinitionManagement from './components/HeaderDefinitionManagement';
import './i18n';
import './styles/fonts.css';
import './App.css';

const App: React.FC = () => {
    const { isAuthenticated } = useAuth();

    return (
        <LanguageProvider>
            <Router>
                <div className="App">
                    <Routes>
                        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
                        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}>
                            <Route index element={<UserList />} />
                            <Route path="users" element={<UserList />} />
                            <Route path="banks-and-tpps" element={<BankTppManagement />} />
                            <Route path="file-configs" element={<FileConfigManagement />} />
                            <Route path="column-mappings" element={<ColumnMappingManagement />} />
                            <Route path="header-definitions" element={<HeaderDefinitionManagement />} />
                            <Route path="institution-converter" element={<InstitutionConverter />} />
                            <Route path="import-logs" element={<ImportLogViewer />} />
                            <Route path="business-intelligence" element={<BusinessIntelligence />} />
                            <Route path="create-user" element={<CreateUser />} />
                            <Route path="change-password" element={<ChangePassword />} />
                            <Route path="reset-password" element={<ResetPassword />} />
                        </Route>
                        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
                    </Routes>
                </div>
            </Router>
        </LanguageProvider>
    );
};

export default App;
