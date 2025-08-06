import React, { useEffect, useState } from 'react';
import { 
    Container, Typography, Paper, Box, 
    FormControl, InputLabel, Select, MenuItem, 
    TextField, Button, CircularProgress,
    Card, CardContent, CardHeader
} from '@mui/material';
import './BusinessIntelligence.css';

// Enhanced chart component with proper data visualization
const EnhancedChart: React.FC<{ title: string; data: any }> = ({ title, data }) => {
    // Handle different data formats from backend
    let dataPoints = 0;
    if (data?.chartData && Array.isArray(data.chartData)) {
        dataPoints = data.chartData.length;
    } else if (data?.datasets?.[0]?.data) {
        dataPoints = data.datasets[0].data.length;
    } else if (Array.isArray(data)) {
        dataPoints = data.length;
    }

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toLocaleString();
    };

    const formatCurrency = (num: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(num);
    };

    const renderReportSpecificData = () => {
        if (!data || dataPoints === 0) {
            return (
                <Typography variant="body2" color="warning.main" sx={{ mt: 2 }}>
                    ⚠️ No data available for selected date range
                </Typography>
            );
        }

        switch (title) {
            case 'transaction-volume':
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ textAlign: 'center', minWidth: '120px' }}>
                                <Typography variant="h4" color="primary">
                                    {formatCurrency(data.totalVolume || 0)}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Total Volume
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center', minWidth: '120px' }}>
                                <Typography variant="h4" color="secondary">
                                    {formatNumber(data.totalTransactions || 0)}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Total Transactions
                                </Typography>
                            </Box>
                        </Box>
                        <Typography variant="body2" color="success.main" align="center">
                            📈 {dataPoints} transaction records processed
                        </Typography>
                    </Box>
                );

            case 'atm-transactions':
                const successRate = data.totalSuccessCount && data.totalFailedCount 
                    ? ((data.totalSuccessCount / (data.totalSuccessCount + data.totalFailedCount)) * 100).toFixed(1)
                    : '0';
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ textAlign: 'center', minWidth: '100px' }}>
                                <Typography variant="h5" color="success.main">
                                    {formatNumber(data.totalSuccessCount || 0)}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Successful
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center', minWidth: '100px' }}>
                                <Typography variant="h5" color="error">
                                    {formatNumber(data.totalFailedCount || 0)}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Failed
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center', minWidth: '100px' }}>
                                <Typography variant="h5" color="primary">
                                    {successRate}%
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Success Rate
                                </Typography>
                            </Box>
                        </Box>
                        <Typography variant="body2" color="info.main" align="center">
                            💰 Total Amount: {formatCurrency(data.totalAmount || 0)}
                        </Typography>
                    </Box>
                );

            case 'atm-terminals':
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ textAlign: 'center', minWidth: '120px' }}>
                                <Typography variant="h4" color="primary">
                                    {formatNumber(data.totalTerminals || 0)}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Total Terminals
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center', minWidth: '120px' }}>
                                <Typography variant="h4" color="success.main">
                                    {formatNumber(data.activeTerminals || 0)}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Active Terminals
                                </Typography>
                            </Box>
                        </Box>
                        <Typography variant="body2" color="success.main" align="center">
                            🏧 {dataPoints} terminal records from multiple institutions
                        </Typography>
                    </Box>
                );

            case 'pos-terminals':
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ textAlign: 'center', minWidth: '120px' }}>
                                <Typography variant="h4" color="primary">
                                    {formatNumber(data.totalTerminals || 0)}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Total POS Terminals
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center', minWidth: '120px' }}>
                                <Typography variant="h4" color="success.main">
                                    {formatNumber(data.activeTerminals || 0)}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Active Terminals
                                </Typography>
                            </Box>
                        </Box>
                        <Typography variant="body2" color="success.main" align="center">
                            💳 {dataPoints} POS terminal records processed
                        </Typography>
                    </Box>
                );

            case 'pos-transactions':
                const posSuccessRate = data.totalSuccessTransactions && data.totalFailedTransactions 
                    ? ((data.totalSuccessTransactions / (data.totalSuccessTransactions + data.totalFailedTransactions)) * 100).toFixed(1)
                    : '0';
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ textAlign: 'center', minWidth: '100px' }}>
                                <Typography variant="h5" color="success.main">
                                    {formatNumber(data.totalSuccessTransactions || 0)}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Successful
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center', minWidth: '100px' }}>
                                <Typography variant="h5" color="error">
                                    {formatNumber(data.totalFailedTransactions || 0)}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Failed
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center', minWidth: '100px' }}>
                                <Typography variant="h5" color="primary">
                                    {posSuccessRate}%
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Success Rate
                                </Typography>
                            </Box>
                        </Box>
                        <Typography variant="body2" color="info.main" align="center">
                            💰 Total Amount: {formatCurrency(data.totalAmount || 0)}
                        </Typography>
                    </Box>
                );

            case 'card-lifecycle':
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ textAlign: 'center', minWidth: '100px' }}>
                                <Typography variant="h5" color="success.main">
                                    {formatNumber(data.totalIssued || 0)}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Cards Issued
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center', minWidth: '100px' }}>
                                <Typography variant="h5" color="warning.main">
                                    {formatNumber(data.totalExpired || 0)}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Cards Expired
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center', minWidth: '100px' }}>
                                <Typography variant="h5" color="error">
                                    {formatNumber(data.totalCancelled || 0)}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Cards Cancelled
                                </Typography>
                            </Box>
                        </Box>
                        <Typography variant="body2" color="success.main" align="center">
                            💳 {dataPoints} card lifecycle records processed
                        </Typography>
                    </Box>
                );

            case 'ecommerce-activity':
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ textAlign: 'center', minWidth: '120px' }}>
                                <Typography variant="h4" color="primary">
                                    {formatNumber(data.totalEnabledCards || 0)}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    E-commerce Enabled
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center', minWidth: '120px' }}>
                                <Typography variant="h4" color="success.main">
                                    {formatNumber(data.totalTransactions || 0)}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Online Transactions
                                </Typography>
                            </Box>
                        </Box>
                        <Typography variant="body2" color="info.main" align="center">
                            💰 Total Volume: {formatCurrency(data.totalVolume || 0)}
                        </Typography>
                    </Box>
                );

            default:
                return (
                    <Typography variant="body2" color="success.main" align="center">
                        📊 {dataPoints} data points loaded
                    </Typography>
                );
        }
    };
    
    return (
        <Box 
            sx={{ 
                minHeight: 300, 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f8f9fa',
                border: '2px solid #e9ecef',
                borderRadius: 2,
                padding: 3
            }}
        >
            <Typography variant="h5" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                📈 {title.replace('-', ' ').toUpperCase()} ANALYTICS
            </Typography>
            {renderReportSpecificData()}
        </Box>
    );
};

interface ReportSummary {
    reportTypes: string[];
    dateRange: {
        startDate: string;
        endDate: string;
    };
}

interface ChartData {
    labels?: string[];
    datasets?: {
        label: string;
        data: number[];
        backgroundColor?: string[];
        borderColor?: string[];
        borderWidth?: number;
    }[];
    // Backend response format
    chartData?: any[];
    summary?: any;
    totalVolume?: number;
    totalTransactions?: number;
    [key: string]: any; // Allow any additional properties from backend
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
            const response = await fetch('/api/bi/report-summary', {
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
                case 'atm-terminals':
                    endpoint = '/api/bi/atm-terminals';
                    break;
                case 'pos-terminals':
                    endpoint = '/api/bi/pos-terminals';
                    break;
                case 'pos-transactions':
                    endpoint = '/api/bi/pos-transactions';
                    break;
                case 'card-lifecycle':
                    endpoint = '/api/bi/card-lifecycle';
                    break;
                case 'ecommerce-activity':
                    endpoint = '/api/bi/ecommerce-activity';
                    break;
                default:
                    return;
            }
            
            const params = new URLSearchParams();
            
            console.log('Date Range State:', dateRange);
            
            // Ensure proper date format (YYYY-MM-DD)
            const formatDate = (dateStr: string) => {
                if (!dateStr) return '';
                const date = new Date(dateStr);
                if (isNaN(date.getTime())) return dateStr; // Return original if invalid
                return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
            };
            
            if (dateRange.startDate) {
                const formattedStartDate = formatDate(dateRange.startDate);
                console.log('Original startDate:', dateRange.startDate, 'Formatted:', formattedStartDate);
                params.append('startDate', formattedStartDate);
            }
            if (dateRange.endDate) {
                const formattedEndDate = formatDate(dateRange.endDate);
                console.log('Original endDate:', dateRange.endDate, 'Formatted:', formattedEndDate);
                params.append('endDate', formattedEndDate);
            }
            
            console.log('Final URL params:', params.toString());
            
            const response = await fetch(`${endpoint}?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('API Response Status:', response.status);
            console.log('API Response Headers:', response.headers);
            
            if (response.ok) {
                const data = await response.json();
                console.log('API Response Data:', data);
                setChartData(data);
            } else {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                setError(`API Error: ${response.status} - ${errorText}`);
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
                            <EnhancedChart title={selectedReportType} data={chartData} />
                        </CardContent>
                    </Card>
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <Card>
                        <CardHeader title="Data Summary" />
                        <CardContent>
                            <Typography variant="body2">
                                Report Type: {selectedReportType.replace('-', ' ').toUpperCase()}
                                <br />
                                Data Points: {(() => {
                                    if (chartData?.chartData && Array.isArray(chartData.chartData)) {
                                        return chartData.chartData.length;
                                    } else if (chartData?.datasets?.[0]?.data) {
                                        return chartData.datasets[0].data.length;
                                    } else if (Array.isArray(chartData)) {
                                        return chartData.length;
                                    }
                                    return 0;
                                })()}
                                <br />
                                Date Range: {dateRange.startDate || 'All'} - {dateRange.endDate || 'All'}
                                <br />
                                Status: {chartData ? ((() => {
                                    const count = (chartData as any)?.chartData?.length || (chartData as any)?.datasets?.[0]?.data?.length || (Array.isArray(chartData) ? chartData.length : 0);
                                    return count > 0 ? '✅ Data Loaded' : '⚠️ No Data';
                                })()) : '⏳ Loading...'}
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
                                <MenuItem value="atm-terminals">ATM Terminals</MenuItem>
                                <MenuItem value="pos-terminals">POS Terminals</MenuItem>
                                <MenuItem value="pos-transactions">POS Transactions</MenuItem>
                                <MenuItem value="card-lifecycle">Card Lifecycle</MenuItem>
                                <MenuItem value="ecommerce-activity">E-Commerce Activity</MenuItem>
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
                    
                    <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                        <Button 
                            variant="contained" 
                            color="secondary" 
                            onClick={processReports}
                            disabled={processing}
                            fullWidth
                            sx={{ 
                                height: '56px',
                                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                                boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
                            }}
                        >
                            {processing ? (
                                <>
                                    <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                                    Processing CSV Reports...
                                </>
                            ) : (
                                <>
                                    📊 PROCESS CSV REPORTS
                                </>
                            )}
                        </Button>
                        <Typography variant="caption" display="block" sx={{ mt: 0.5, textAlign: 'center', color: 'text.secondary' }}>
                            Import CSV files from sample-data/reports directory
                        </Typography>
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
