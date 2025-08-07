import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, 
    Table, TableBody, TableCell, TableHead, TableRow, Paper, IconButton,
    Select, MenuItem, FormControl, InputLabel, Typography, Box, Grid,
    Tabs, Tab
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import CronScheduler from './CronScheduler';

// Define types
interface FileProcessingConfig {
    id: number;
    bankOrTPPId: number;
    bankOrTPPName: string; // For display purposes
    directoryPath: string;
    fileNamePattern: string;
    scheduleTime: string;
    fileType: string;
    createdAt: string;
}

interface BankOrTpp {
    id: number;
    code: string;
    name: string;
    type: 'BANK' | 'TPP';
}

const FileConfigManagement: React.FC = () => {
    const [configs, setConfigs] = useState<FileProcessingConfig[]>([]);
    const [banks, setBanks] = useState<BankOrTpp[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentConfig, setCurrentConfig] = useState<Partial<FileProcessingConfig> | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [configToDelete, setConfigToDelete] = useState<number | null>(null);
    const [currentTab, setCurrentTab] = useState<number>(0);
    const { token } = useAuth();

    // API endpoints
    const configEndpoint = '/api/admin/file-configs';
    const banksEndpoint = '/api/admin/banks';

    // Fetch file configurations
    const fetchConfigs = async () => {
        if (!token) {
            setError('Authentication token not found.');
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(configEndpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);
            const data = await response.json();
            setConfigs(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch banks/TPPs for dropdown
    const fetchBanks = async () => {
        if (!token) return;
        try {
            const response = await fetch(banksEndpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`Error fetching banks: ${response.status}`);
            const data = await response.json();
            setBanks(data);
        } catch (err: any) {
            console.error("Failed to fetch banks:", err);
        }
    };

    useEffect(() => {
        if (token) {
            fetchConfigs();
            fetchBanks();
        }
    }, [token]);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    const handleOpenModal = (config: Partial<FileProcessingConfig> | null = null) => {
        setCurrentConfig(config ? { ...config } : {
            bankOrTPPId: banks.length > 0 ? banks[0].id : 0,
            directoryPath: '',
            fileNamePattern: '',
            scheduleTime: '0 0 * * *', // Default CRON expression (midnight every day)
            fileType: 'CSV'
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentConfig(null);
    };

    const handleSave = async () => {
        if (!currentConfig || !token) return;

        const isNew = !currentConfig.id;
        const method = isNew ? 'POST' : 'PUT';
        const url = isNew ? configEndpoint : `${configEndpoint}/${currentConfig.id}`;

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(currentConfig)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Failed to save: ${errorData}`);
            }
            handleCloseModal();
            fetchConfigs(); // Refresh list
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleOpenDeleteDialog = (id: number) => {
        setConfigToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setConfigToDelete(null);
    };

    const handleDelete = async () => {
        if (configToDelete === null || !token) return;
        
        try {
            const response = await fetch(`${configEndpoint}/${configToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to delete');
            fetchConfigs(); // Refresh list
            handleCloseDeleteDialog();
        } catch (err: any) {
            setError(err.message);
            handleCloseDeleteDialog();
        }
    };

    // Helper to find bank/TPP name
    const getBankOrTppName = (id: number) => {
        const found = banks.find(bank => bank.id === id);
        return found ? found.name : 'Unknown';
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error} <Button onClick={fetchConfigs}>Retry</Button></div>;

    return (
        <Paper>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={currentTab} onChange={handleTabChange} aria-label="file config tabs">
                    <Tab label="File Configurations" />
                    <Tab label="Column Mappings" />
                    <Tab label="Import Logs" />
                </Tabs>
            </Box>

            {currentTab === 0 && (
                <>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">File Processing Configurations</Typography>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={() => handleOpenModal()}
                        >
                            Add New Configuration
                        </Button>
                    </Box>
                    
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Bank/TPP</TableCell>
                                <TableCell>Directory Path</TableCell>
                                <TableCell>File Pattern</TableCell>
                                <TableCell>Schedule (CRON)</TableCell>
                                <TableCell>File Type</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {configs.map(config => (
                                <TableRow key={config.id}>
                                    <TableCell>{getBankOrTppName(config.bankOrTPPId)}</TableCell>
                                    <TableCell>{config.directoryPath}</TableCell>
                                    <TableCell>{config.fileNamePattern}</TableCell>
                                    <TableCell>{config.scheduleTime}</TableCell>
                                    <TableCell>{config.fileType}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleOpenModal(config)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleOpenDeleteDialog(config.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                        <IconButton>
                                            <SettingsIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </>
            )}

            {currentTab === 1 && (
                <Typography>Column Mapping Component (To be implemented)</Typography>
            )}

            {currentTab === 2 && (
                <Typography>Import Logs Component (To be implemented)</Typography>
            )}

            {/* Add/Edit Configuration Dialog */}
            <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
                <DialogTitle>
                    {currentConfig?.id ? 'Edit File Configuration' : 'Add New File Configuration'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <Box>
                            <FormControl fullWidth>
                                <InputLabel>Bank/TPP</InputLabel>
                                <Select
                                    value={currentConfig?.bankOrTPPId || ''}
                                    onChange={(e) => setCurrentConfig({ 
                                        ...currentConfig, 
                                        bankOrTPPId: e.target.value as number 
                                    })}
                                >
                                    {banks.map(bank => (
                                        <MenuItem key={bank.id} value={bank.id}>
                                            {bank.name} ({bank.type})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                        <Box>
                            <TextField
                                fullWidth
                                label="Directory Path"
                                value={currentConfig?.directoryPath || ''}
                                onChange={(e) => setCurrentConfig({
                                    ...currentConfig,
                                    directoryPath: e.target.value
                                })}
                                placeholder="/path/to/files"
                            />
                        </Box>
                        <Box>
                            <TextField
                                fullWidth
                                label="File Name Pattern"
                                value={currentConfig?.fileNamePattern || ''}
                                onChange={(e) => setCurrentConfig({
                                    ...currentConfig,
                                    fileNamePattern: e.target.value
                                })}
                                placeholder="*.csv"
                                helperText="Glob pattern for matching files"
                            />
                        </Box>
                        <Box>
                            <CronScheduler
                                value={currentConfig?.scheduleTime || '0 0 * * *'}
                                onChange={(cronExpression) => setCurrentConfig({
                                    ...currentConfig,
                                    scheduleTime: cronExpression
                                })}
                                label="Schedule"
                            />
                        </Box>
                        <Box>
                            <FormControl fullWidth>
                                <InputLabel>File Type</InputLabel>
                                <Select
                                    value={currentConfig?.fileType || 'CSV'}
                                    onChange={(e) => setCurrentConfig({
                                        ...currentConfig,
                                        fileType: e.target.value as string
                                    })}
                                >
                                    <MenuItem value="CSV">CSV</MenuItem>
                                    <MenuItem value="EXCEL">Excel</MenuItem>
                                    <MenuItem value="XML">XML</MenuItem>
                                    <MenuItem value="JSON">JSON</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Cancel</Button>
                    <Button onClick={handleSave} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                aria-labelledby="delete-dialog-title"
            >
                <DialogTitle id="delete-dialog-title">Confirm Deletion</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this configuration? This action cannot be undone.
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default FileConfigManagement;
