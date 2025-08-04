import React, { useEffect, useState } from 'react';
import { 
    Container, Typography, Grid, Paper, Box, 
    FormControl, InputLabel, Select, MenuItem, 
    TextField, Button, CircularProgress,
    Card, CardContent, CardHeader
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import './BusinessIntelligence.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

interface DateRange {
    startDate: Date | null;
    endDate: Date | null;
}

const BusinessIntelligence: React.FC = () => {
    const [reportType, setReportType] = useState<string>('transaction-volume');
    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        endDate: new Date()
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [chartData, setChartData] = useState<any>(null);
    const [reportSummary, setReportSummary] = useState<any>(null);

    useEffect(() => {
        // Fetch report summary on component mount
        fetchReportSummary();
    }, []);

    useEffect(() => {
        // Fetch chart data when report type or date range changes
        if (reportType) {
            fetchChartData();
        }
    }, [reportType, dateRange]);

    const fetchReportSummary = async () => {
        try {
            const response = await axios.get('/api/bi/report-summary');
            setReportSummary(response.data);
        } catch (err) {
            console.error('Error fetching report summary:', err);
        }
    };

    const fetchChartData = async () => {
        if (!dateRange.startDate || !dateRange.endDate) return;

        setIsLoading(true);
        setError(null);
        
        try {
            const startDateStr = dateRange.startDate.toISOString().split('T')[0];
            const endDateStr = dateRange.endDate.toISOString().split('T')[0];
            
            const response = await axios.get(`/api/bi/${reportType}`, {
                params: {
                    startDate: startDateStr,
                    endDate: endDateStr
                }
            });
            
            setChartData(response.data);
        } catch (err: any) {
            console.error(`Error fetching ${reportType} data:`, err);
            setError(err.message || 'An error occurred while fetching data');
        } finally {
            setIsLoading(false);
        }
    };

    const processReports = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/api/bi/process-reports');
            alert(`${response.data.message}`);
            // Refresh data after processing
            fetchReportSummary();
            fetchChartData();
        } catch (err: any) {
            console.error('Error processing reports:', err);
            setError(err.message || 'An error occurred while processing reports');
        } finally {
            setIsLoading(false);
        }
    };

    // Render chart based on report type and data
    const renderChart = () => {
        if (!chartData) return null;

        switch (reportType) {
            case 'transaction-volume':
                return renderTransactionVolumeCharts();
            case 'atm-transactions':
                return renderATMTransactionCharts();
            case 'pos-terminals':
                return renderPOSTerminalCharts();
            default:
                return <Typography>Select a report type to view charts</Typography>;
        }
    };

    const renderTransactionVolumeCharts = () => {
        if (!chartData.channelTransactions || !chartData.successFailureRatio) return null;

        const channelLabels = Object.keys(chartData.channelTransactions || {});
        const channelData = Object.values(chartData.channelTransactions || {});

        const transactionsByChannelData = {
            labels: channelLabels,
            datasets: [{
                label: 'Transaction Count by Channel',
                data: channelData,
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                ]
            }]
        };

        // Success/failure ratio pie chart
        const successCount = chartData.successFailureRatio.successCount || 0;
        const failedCount = chartData.successFailureRatio.failedCount || 0;
        
        const successRatioData = {
            labels: ['Success', 'Failed'],
            datasets: [{
                data: [successCount, failedCount],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 99, 132, 0.6)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        };

        return (
            <Grid container spacing={3}>
                <Grid item xs={12} md={6} component="div">
                    <Card>
                        <CardHeader title="Transactions by Channel" />
                        <CardContent>
                            <Box height={300}>
                                <Bar 
                                    data={transactionsByChannelData} 
                                    options={{ 
                                        maintainAspectRatio: false,
                                        responsive: true
                                    }} 
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6} component="div">
                    <Card>
                        <CardHeader title="Transaction Success/Failure Ratio" />
                        <CardContent>
                            <Box height={300}>
                                <Pie 
                                    data={successRatioData} 
                                    options={{ 
                                        maintainAspectRatio: false,
                                        responsive: true
                                    }} 
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        );
    };

    const renderATMTransactionCharts = () => {
        if (!chartData.successFailureRatio || !chartData.topATMs) return null;

        // Success/failure ratio pie chart
        const successCount = chartData.successFailureRatio.successCount || 0;
        const failedCount = chartData.successFailureRatio.failedCount || 0;
        
        const successRatioData = {
            labels: ['Success', 'Failed'],
            datasets: [{
                data: [successCount, failedCount],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 99, 132, 0.6)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        };

        // Top ATMs by transaction volume
        const topATMs = chartData.topATMs.slice(0, 5); // Display top 5
        const atmLabels = topATMs.map((item: any) => item.atmId);
        const atmData = topATMs.map((item: any) => item.totalCount);
        
        const topATMsData = {
            labels: atmLabels,
            datasets: [{
                label: 'Transaction Count',
                data: atmData,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        };

        return (
            <Grid container spacing={3}>
                <Grid item xs={12} md={6} component="div">
                    <Card>
                        <CardHeader title="ATM Transaction Success/Failure Ratio" />
                        <CardContent>
                            <Box height={300}>
                                <Pie 
                                    data={successRatioData} 
                                    options={{ 
                                        maintainAspectRatio: false,
                                        responsive: true
                                    }} 
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6} component="div">
                    <Card>
                        <CardHeader title="Top ATMs by Transaction Volume" />
                        <CardContent>
                            <Box height={300}>
                                <Bar 
                                    data={topATMsData} 
                                    options={{ 
                                        maintainAspectRatio: false,
                                        responsive: true,
                                        indexAxis: 'y' as const
                                    }} 
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        );
    };

    const renderPOSTerminalCharts = () => {
        if (!chartData.activeTerminalsByMCC || !chartData.terminalLifecycle) return null;

        // Active Terminals by MCC
        const mccData = chartData.activeTerminalsByMCC.slice(0, 5); // Display top 5
        const mccLabels = mccData.map((item: any) => item.mccDescription);
        const mccCounts = mccData.map((item: any) => item.activeCount);
        
        const terminalsByMCCData = {
            labels: mccLabels,
            datasets: [{
                label: 'Active Terminals',
                data: mccCounts,
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                ]
            }]
        };

        // Terminal lifecycle stats
        const issuedCount = chartData.terminalLifecycle.issuedCount || 0;
        const decomCount = chartData.terminalLifecycle.decomCount || 0;
        
        const lifecycleData = {
            labels: ['Issued', 'Decommissioned'],
            datasets: [{
                data: [issuedCount, decomCount],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 99, 132, 0.6)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        };

        return (
            <Grid container spacing={3}>
                <Grid item xs={12} md={6} component="div">
                    <Card>
                        <CardHeader title="Active Terminals by Merchant Category" />
                        <CardContent>
                            <Box height={300}>
                                <Bar 
                                    data={terminalsByMCCData} 
                                    options={{ 
                                        maintainAspectRatio: false,
                                        responsive: true
                                    }} 
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6} component="div">
                    <Card>
                        <CardHeader title="Terminal Lifecycle" />
                        <CardContent>
                            <Box height={300}>
                                <Pie 
                                    data={lifecycleData} 
                                    options={{ 
                                        maintainAspectRatio: false,
                                        responsive: true
                                    }} 
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        );
    };

    return (
        <Container maxWidth="xl" className="bi-container">
            <Typography variant="h4" gutterBottom>Business Intelligence</Typography>
            
            <Paper className="controls-paper">
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={3} component="div">
                        <FormControl fullWidth>
                            <InputLabel>Report Type</InputLabel>
                            <Select
                                value={reportType}
                                label="Report Type"
                                onChange={(e) => setReportType(e.target.value)}
                            >
                                <MenuItem value="transaction-volume">Transaction Volume</MenuItem>
                                <MenuItem value="atm-transactions">ATM Transactions</MenuItem>
                                <MenuItem value="pos-terminals">POS Terminals</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={3} component="div">
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Start Date"
                                value={dateRange.startDate}
                                onChange={(newValue: Date | null) => setDateRange(prev => ({ ...prev, startDate: newValue }))}
                                slotProps={{
                                    textField: { fullWidth: true }
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    
                    <Grid item xs={12} md={3} component="div">
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="End Date"
                                value={dateRange.endDate}
                                onChange={(newValue: Date | null) => setDateRange(prev => ({ ...prev, endDate: newValue }))}
                                slotProps={{
                                    textField: { fullWidth: true }
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    
                    <Grid item xs={12} md={3} component="div">
                        <Button 
                            variant="contained" 
                            fullWidth
                            onClick={processReports}
                            disabled={isLoading}
                        >
                            Process New Reports
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
            
            {isLoading ? (
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Paper className="error-paper">
                    <Typography color="error">{error}</Typography>
                </Paper>
            ) : (
                <Box mt={4}>
                    {renderChart()}
                </Box>
            )}
        </Container>
    );
};

export default BusinessIntelligence;
