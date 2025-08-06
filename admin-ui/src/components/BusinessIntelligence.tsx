import React, { useEffect, useState } from 'react';
import { 
    Container, Typography, Paper, Box, 
    FormControl, InputLabel, Select, MenuItem, 
    TextField, Button, CircularProgress,
    Card, CardContent, CardHeader
} from '@mui/material';
import './BusinessIntelligence.css';

// Mock chart component since we can't install chart.js dependencies
const MockChart: React.FC<{ title: string; data: any }> = ({ title, data }) => (
    <Box 
        sx={{ 
            height: 300, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: 1
        }}
    >
        <Typography variant="body1" color="textSecondary">
            {title} Chart Placeholder
            <br />
            <small>Data points: {data?.datasets?.[0]?.data?.length || 0}</small>
        </Typography>
    </Box>
);

interface ReportSummary {
    reportTypes: string[];
    dateRange: {
        startDate: string;
        endDate: string;
    };
}

interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor?: string[];
        borderColor?: string[];
        borderWidth?: number;
    }[];
}

interface DateRange {
    startDate: string;
    endDate: string;
}

const BusinessIntelligence: React.FC = () => {
    const [selectedReportType, setSelectedReportType] = useState<string>('transaction-volume');
    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: '',
        endDate: ''
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [processing, setProcessing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<ReportSummary | null>(null);
    const [chartData, setChartData] = useState<ChartData | null>(null);

    useEffect(() => {
        fetchReportSummary();
    }, []);

    useEffect(() => {
        if (selectedReportType) {
            fetchChartData();
        }
    }, [selectedReportType, dateRange]);

    const fetchReportSummary = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/bi/summary', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setSummary(data);
            }
        } catch (error) {
            console.error('Error fetching report summary:', error);
        }
    };

    const fetchChartData = async () => {
        if (!selectedReportType) return;
        
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            let endpoint = '';
            
            switch (selectedReportType) {
                case 'transaction-volume':
                    endpoint = '/api/bi/transaction-volume';
                    break;
                case 'atm-transactions':
                    endpoint = '/api/bi/atm-transactions';
                    break;
                case 'pos-terminals':
                    endpoint = '/api/bi/pos-terminals';
                    break;
                default:
                    return;
            }
            
            const params = new URLSearchParams();
            if (dateRange.startDate) {
                params.append('startDate', dateRange.startDate);
            }
            if (dateRange.endDate) {
                params.append('endDate', dateRange.endDate);
            }
            
            const response = await fetch(`${endpoint}?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setChartData(data);
            }
        } catch (error) {
            console.error('Error fetching chart data:', error);
            setError('Failed to fetch chart data');
        } finally {
            setLoading(false);
        }
    };

    const processReports = async () => {
        setProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/bi/process-reports?directory=sample-data/reports', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                // Refresh summary after processing
                await fetchReportSummary();
                alert('Reports processed successfully!');
            } else {
                alert('Error processing reports. Please try again.');
            }
        } catch (error) {
            console.error('Error processing reports:', error);
            alert('Error processing reports. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const renderChart = () => {
        if (!chartData) return null;

        return (
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <Card>
                        <CardHeader title="Chart Visualization" />
                        <CardContent>
                            <MockChart title={selectedReportType} data={chartData} />
                        </CardContent>
                    </Card>
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <Card>
                        <CardHeader title="Data Summary" />
                        <CardContent>
                            <Typography variant="body2">
                                Report Type: {selectedReportType}
                                <br />
                                Data Points: {chartData?.datasets?.[0]?.data?.length || 0}
                                <br />
                                Date Range: {dateRange.startDate || 'All'} - {dateRange.endDate || 'All'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        );
    };

    return (
        <Container maxWidth="xl" className="business-intelligence-container">
            <Typography variant="h4" component="h1" gutterBottom>
                Business Intelligence Dashboard
            </Typography>
            
            <Paper className="controls-paper">
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                        <FormControl fullWidth>
                            <InputLabel>Report Type</InputLabel>
                            <Select
                                value={selectedReportType}
                                onChange={(e) => setSelectedReportType(e.target.value)}
                                label="Report Type"
                            >
                                <MenuItem value="transaction-volume">Transaction Volume</MenuItem>
                                <MenuItem value="atm-transactions">ATM Transactions</MenuItem>
                                <MenuItem value="pos-terminals">POS Terminals</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    
                    <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
                        <TextField
                            label="Start Date"
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Box>
                    
                    <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
                        <TextField
                            label="End Date"
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Box>
                    
                    <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
                        <Button 
                            variant="contained" 
                            fullWidth
                            onClick={processReports}
                            disabled={processing}
                        >
                            {processing ? <CircularProgress size={24} /> : 'Process Reports'}
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {loading && (
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                </Box>
            )}

            {error && (
                <Typography color="error" variant="body1" align="center">
                    Error: {error}
                </Typography>
            )}

            <Box mt={4}>
                {renderChart()}
            </Box>
        </Container>
    );
};

export default BusinessIntelligence;
