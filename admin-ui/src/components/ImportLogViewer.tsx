import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Table, TableBody, TableCell, TableHead, TableRow, Paper, 
    Typography, Box, FormControl, InputLabel, Select, MenuItem,
    Chip, TextField, Button, Grid, IconButton
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DescriptionIcon from '@mui/icons-material/Description';

// Define types
interface ImportLog {
    id: number;
    fileProcessingConfigId: number;
    fileName: string;
    timestamp: string;
    status: 'SUCCESS' | 'FAILED' | 'PROCESSING';
    recordsProcessed: number;
    errorMessage: string | null;
}

interface FileProcessingConfig {
    id: number;
    bankOrTPPId: number;
    bankOrTPPName?: string;
    directoryPath: string;
    fileNamePattern: string;
}

const ImportLogViewer: React.FC = () => {
    const [logs, setLogs] = useState<ImportLog[]>([]);
    const [configs, setConfigs] = useState<FileProcessingConfig[]>([]);
    const [selectedConfigId, setSelectedConfigId] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { token } = useAuth();

    // API endpoints
    const logsEndpoint = '/api/admin/import-logs';
    const configLogsEndpoint = (configId: number) => `/api/admin/import-logs/config/${configId}`;
    const configsEndpoint = '/api/admin/file-configs';

    // Fetch all file configs for dropdown selector
    const fetchConfigs = async () => {
        if (!token) {
            setError('Authentication token not found.');
            return;
        }
        
        try {
            const response = await fetch(configsEndpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const data = await response.json();
            setConfigs(data);
        } catch (err: any) {
            console.error("Failed to fetch configs:", err);
            setError(err.message);
        }
    };

    // Fetch import logs with optional filters
    const fetchLogs = async () => {
        if (!token) {
            setError('Authentication token not found.');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            let url = logsEndpoint;
            
            // Apply status filter if not "all"
            if (selectedStatus !== 'all') {
                url += `?status=${selectedStatus}`;
            }
            
            // If a specific config is selected, use the config-specific endpoint
            if (selectedConfigId !== 'all') {
                url = configLogsEndpoint(parseInt(selectedConfigId));
            }
            
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            
            const data = await response.json();
            setLogs(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial data loading
    useEffect(() => {
        if (token) {
            fetchConfigs();
            fetchLogs();
        }
    }, [token]);

    // Refetch logs when filters change
    useEffect(() => {
        if (token) {
            fetchLogs();
        }
    }, [selectedConfigId, selectedStatus, token]);

    // Handle filter changes
    const handleConfigChange = (event: React.ChangeEvent<HTMLInputElement> | { target: { value: string } }) => {
        setSelectedConfigId(event.target.value);
    };

    const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement> | { target: { value: string } }) => {
        setSelectedStatus(event.target.value);
    };

    // Handle search
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    // Filter logs based on search term
    const filteredLogs = logs.filter(log => 
        log.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.errorMessage && log.errorMessage.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Helper to get status chip color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUCCESS': return 'success';
            case 'FAILED': return 'error';
            case 'PROCESSING': return 'warning';
            default: return 'default';
        }
    };

    // Format date for better display
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    // Get config name by ID
    const getConfigName = (configId: number) => {
        const config = configs.find(c => c.id === configId);
        return config ? `${config.fileNamePattern} (${config.directoryPath})` : `Config #${configId}`;
    };

    if (isLoading && !logs.length) return <div>Loading...</div>;

    return (
        <Paper sx={{ p: 2 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Import Logs
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                    Monitor file import activities and results
                </Typography>
            </Box>

            {/* Filters */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
                <Box sx={{ flex: { xs: '1 1 100%', md: '4 1 0%' } }}>
                    <FormControl fullWidth>
                        <InputLabel>File Configuration</InputLabel>
                        <Select
                            value={selectedConfigId}
                            onChange={handleConfigChange}
                            label="File Configuration"
                        >
                            <MenuItem value="all">All Configurations</MenuItem>
                            {configs.map(config => (
                                <MenuItem key={config.id} value={config.id.toString()}>
                                    {config.fileNamePattern}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                <Box sx={{ flex: { xs: '1 1 100%', md: '3 1 0%' } }}>
                    <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={selectedStatus}
                            onChange={handleStatusChange}
                            label="Status"
                        >
                            <MenuItem value="all">All Statuses</MenuItem>
                            <MenuItem value="SUCCESS">Success</MenuItem>
                            <MenuItem value="FAILED">Failed</MenuItem>
                            <MenuItem value="PROCESSING">Processing</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Box sx={{ flex: { xs: '1 1 100%', md: '4 1 0%' } }}>
                    <TextField
                        fullWidth
                        label="Search"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search by filename or error message"
                    />
                </Box>
                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 0%' } }}>
                    <Button 
                        onClick={fetchLogs}
                        variant="outlined"
                        fullWidth
                        sx={{ height: '100%' }}
                        startIcon={<RefreshIcon />}
                    >
                        Refresh
                    </Button>
                </Box>
            </Box>

            {error && (
                <Box sx={{ mb: 2, p: 1, bgcolor: '#fff3f3', color: '#d32f2f', borderRadius: 1 }}>
                    Error: {error}
                    <Button size="small" onClick={fetchLogs} sx={{ ml: 1 }}>
                        Retry
                    </Button>
                </Box>
            )}

            {filteredLogs.length > 0 ? (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Timestamp</TableCell>
                            <TableCell>Configuration</TableCell>
                            <TableCell>File Name</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Records Processed</TableCell>
                            <TableCell>Error</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredLogs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell>{formatDate(log.timestamp)}</TableCell>
                                <TableCell>{getConfigName(log.fileProcessingConfigId)}</TableCell>
                                <TableCell>{log.fileName}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={log.status} 
                                        color={getStatusColor(log.status) as "success" | "error" | "warning" | "default"}
                                        size="small" 
                                    />
                                </TableCell>
                                <TableCell>{log.recordsProcessed}</TableCell>
                                <TableCell>
                                    {log.errorMessage && 
                                        <Typography 
                                            variant="body2" 
                                            color="error"
                                            sx={{
                                                maxWidth: '300px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {log.errorMessage}
                                        </Typography>
                                    }
                                </TableCell>
                                <TableCell>
                                    <IconButton title="View Details">
                                        <DescriptionIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
                    No import logs found with the current filters.
                </Typography>
            )}
        </Paper>
    );
};

export default ImportLogViewer;
