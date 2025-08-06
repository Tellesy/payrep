import React, { useEffect, useState } from 'react';
import { 
    Container, Typography, Paper, Box, 
    FormControl, InputLabel, Select, MenuItem, 
    TextField, Button, CircularProgress,
    Card, CardContent, CardHeader
} from '@mui/material';
import './BusinessIntelligence.css';

// Simple Bar Chart Component
const SimpleBarChart: React.FC<{ data: any[]; title: string; xKey: string; yKey: string; color?: string }> = ({ data, title, xKey, yKey, color = '#1976d2' }) => {
    if (!data || data.length === 0) return null;
    
    const maxValue = Math.max(...data.map(item => item[yKey] || 0));
    const chartHeight = 200;
    
    return (
        <Box sx={{ width: '100%', p: 2 }}>
            <Typography variant="h6" align="center" gutterBottom>{title}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'end', gap: 1, height: chartHeight, overflowX: 'auto' }}>
                {data.slice(0, 10).map((item, index) => {
                    const height = maxValue > 0 ? (item[yKey] / maxValue) * (chartHeight - 40) : 0;
                    return (
                        <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' }}>
                            <Typography variant="caption" sx={{ mb: 1, fontSize: '10px' }}>
                                {typeof item[yKey] === 'number' ? item[yKey].toLocaleString() : item[yKey]}
                            </Typography>
                            <Box
                                sx={{
                                    width: '40px',
                                    height: `${height}px`,
                                    backgroundColor: color,
                                    borderRadius: '4px 4px 0 0',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: '#1565c0',
                                        transform: 'scale(1.05)'
                                    }
                                }}
                            />
                            <Typography variant="caption" sx={{ mt: 1, fontSize: '9px', textAlign: 'center', wordBreak: 'break-word' }}>
                                {item[xKey]?.toString().slice(0, 8) || 'N/A'}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};

// Simple Pie Chart Component
const SimplePieChart: React.FC<{ data: { label: string; value: number; color: string }[]; title: string }> = ({ data, title }) => {
    if (!data || data.length === 0) return null;
    
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    const radius = 80;
    const centerX = 100;
    const centerY = 100;
    
    return (
        <Box sx={{ width: '100%', p: 2 }}>
            <Typography variant="h6" align="center" gutterBottom>{title}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <svg width="200" height="200" viewBox="0 0 200 200">
                    {data.map((item, index) => {
                        const angle = (item.value / total) * 360;
                        const startAngle = currentAngle;
                        const endAngle = currentAngle + angle;
                        
                        const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
                        const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
                        const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
                        const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
                        
                        const largeArcFlag = angle > 180 ? 1 : 0;
                        
                        const pathData = [
                            `M ${centerX} ${centerY}`,
                            `L ${x1} ${y1}`,
                            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                            'Z'
                        ].join(' ');
                        
                        currentAngle += angle;
                        
                        return (
                            <path
                                key={index}
                                d={pathData}
                                fill={item.color}
                                stroke="white"
                                strokeWidth="2"
                                style={{ cursor: 'pointer' }}
                            />
                        );
                    })}
                </svg>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {data.map((item, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 16, height: 16, backgroundColor: item.color, borderRadius: '2px' }} />
                            <Typography variant="body2">
                                {item.label}: {item.value.toLocaleString()} ({((item.value / total) * 100).toFixed(1)}%)
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

// Simple Line Chart Component
const SimpleLineChart: React.FC<{ data: any[]; title: string; xKey: string; yKey: string; color?: string }> = ({ data, title, xKey, yKey, color = '#1976d2' }) => {
    if (!data || data.length === 0) return null;
    
    const maxValue = Math.max(...data.map(item => item[yKey] || 0));
    const minValue = Math.min(...data.map(item => item[yKey] || 0));
    const chartWidth = 300;
    const chartHeight = 150;
    
    const points = data.slice(0, 20).map((item, index) => {
        const x = (index / (data.length - 1)) * chartWidth;
        const y = chartHeight - ((item[yKey] - minValue) / (maxValue - minValue)) * chartHeight;
        return `${x},${y}`;
    }).join(' ');
    
    return (
        <Box sx={{ width: '100%', p: 2 }}>
            <Typography variant="h6" align="center" gutterBottom>{title}</Typography>
            <svg width={chartWidth + 40} height={chartHeight + 40} viewBox={`0 0 ${chartWidth + 40} ${chartHeight + 40}`}>
                <polyline
                    points={points}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    transform="translate(20, 20)"
                />
                {data.slice(0, 20).map((item, index) => {
                    const x = (index / (data.length - 1)) * chartWidth + 20;
                    const y = chartHeight - ((item[yKey] - minValue) / (maxValue - minValue)) * chartHeight + 20;
                    return (
                        <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="4"
                            fill={color}
                            stroke="white"
                            strokeWidth="2"
                        />
                    );
                })}
            </svg>
        </Box>
    );
};

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
        return new Intl.NumberFormat('ar-LY', {
            style: 'currency',
            currency: 'LYD',
            minimumFractionDigits: 3,
            maximumFractionDigits: 3
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
                // Prepare data for charts
                const volumeByInstitution = data.chartData ? 
                    data.chartData.reduce((acc: any, item: any) => {
                        const inst = item.institution || 'Unknown';
                        acc[inst] = (acc[inst] || 0) + (item.volume || 0);
                        return acc;
                    }, {}) : {};
                
                const volumeInstitutionData = Object.entries(volumeByInstitution).map(([name, volume]: [string, any]) => ({
                    institution: name,
                    volume: volume
                })).slice(0, 10);
                
                const pieData = Object.entries(volumeByInstitution).slice(0, 5).map(([name, volume]: [string, any], index) => ({
                    label: name,
                    value: volume,
                    color: ['#1976d2', '#dc004e', '#9c27b0', '#2e7d32', '#ed6c02'][index] || '#1976d2'
                }));
                
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                        {/* Summary Stats */}
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
                        
                        {/* Charts */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
                                <SimpleBarChart 
                                    data={volumeInstitutionData} 
                                    title="Volume by Institution" 
                                    xKey="institution" 
                                    yKey="volume" 
                                    color="#1976d2"
                                />
                            </Box>
                            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                                <SimplePieChart 
                                    data={pieData} 
                                    title="Volume Distribution"
                                />
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
                
                // Prepare data for charts
                const successFailurePieData = [
                    { label: 'Successful', value: data.totalSuccessCount || 0, color: '#2e7d32' },
                    { label: 'Failed', value: data.totalFailedCount || 0, color: '#d32f2f' }
                ];
                
                const institutionTransactionData = data.chartData ? 
                    data.chartData.reduce((acc: any, item: any) => {
                        const inst = item.institution || 'Unknown';
                        if (!acc[inst]) acc[inst] = { institution: inst, successCount: 0, failedCount: 0 };
                        acc[inst].successCount += item.successCount || 0;
                        acc[inst].failedCount += item.failedCount || 0;
                        return acc;
                    }, {}) : {};
                
                const atmInstitutionData = Object.values(institutionTransactionData).slice(0, 8);
                
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                        {/* Summary Stats */}
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
                        
                        {/* Charts */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                                <SimplePieChart 
                                    data={successFailurePieData} 
                                    title="Transaction Success Rate"
                                />
                            </Box>
                            <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
                                <SimpleBarChart 
                                    data={atmInstitutionData} 
                                    title="Successful Transactions by Institution" 
                                    xKey="institution" 
                                    yKey="successCount" 
                                    color="#2e7d32"
                                />
                            </Box>
                        </Box>
                        
                        <Typography variant="body2" color="info.main" align="center">
                            💰 Total Amount: {formatCurrency(data.totalAmount || 0)}
                        </Typography>
                    </Box>
                );

            case 'atm-terminals':
                // Prepare data for charts
                const atmTerminalsByInstitution = data.chartData ? 
                    data.chartData.reduce((acc: any, item: any) => {
                        const inst = item.institution || 'Unknown';
                        if (!acc[inst]) acc[inst] = { institution: inst, totalCount: 0, activeCount: 0 };
                        acc[inst].totalCount += item.totalCount || 0;
                        acc[inst].activeCount += item.activeCount || 0;
                        return acc;
                    }, {}) : {};
                
                const atmTerminalData = Object.values(atmTerminalsByInstitution).slice(0, 8);
                
                const atmStatusPieData = [
                    { label: 'Active', value: data.activeTerminals || 0, color: '#2e7d32' },
                    { label: 'Inactive', value: (data.totalTerminals || 0) - (data.activeTerminals || 0), color: '#d32f2f' }
                ];
                
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                        {/* Summary Stats */}
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
                        
                        {/* Charts */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
                                <SimpleBarChart 
                                    data={atmTerminalData} 
                                    title="ATM Terminals by Institution" 
                                    xKey="institution" 
                                    yKey="totalCount" 
                                    color="#1976d2"
                                />
                            </Box>
                            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                                <SimplePieChart 
                                    data={atmStatusPieData} 
                                    title="Terminal Status Distribution"
                                />
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
                            🏧 {dataPoints} terminal records from multiple institutions
                        </Typography>
                    </Box>
                );

            case 'card-lifecycle':
                // Prepare data for charts
                const cardLifecyclePieData = [
                    { label: 'Issued', value: data.totalIssued || 0, color: '#2e7d32' },
                    { label: 'Expired', value: data.totalExpired || 0, color: '#ed6c02' },
                    { label: 'Cancelled', value: data.totalCancelled || 0, color: '#d32f2f' }
                ];
                
                const cardsByInstitution = data.chartData ? 
                    data.chartData.reduce((acc: any, item: any) => {
                        const inst = item.institution || 'Unknown';
                        if (!acc[inst]) acc[inst] = { institution: inst, issued: 0, expired: 0, cancelled: 0 };
                        acc[inst].issued += item.issued || 0;
                        acc[inst].expired += item.expired || 0;
                        acc[inst].cancelled += item.cancelled || 0;
                        return acc;
                    }, {}) : {};
                
                const cardInstitutionData = Object.values(cardsByInstitution).slice(0, 8);
                
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                        {/* Summary Stats */}
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
                        
                        {/* Charts */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                                <SimplePieChart 
                                    data={cardLifecyclePieData} 
                                    title="Card Lifecycle Distribution"
                                />
                            </Box>
                            <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
                                <SimpleBarChart 
                                    data={cardInstitutionData} 
                                    title="Cards Issued by Institution" 
                                    xKey="institution" 
                                    yKey="issued" 
                                    color="#2e7d32"
                                />
                            </Box>
                        </Box>
                        
                        <Typography variant="body2" color="success.main" align="center">
                            💳 {dataPoints} card lifecycle records processed
                        </Typography>
                    </Box>
                );

            case 'ecommerce-activity':
                // Prepare data for charts
                const ecommerceCardsPieData = [
                    { label: 'E-commerce Enabled', value: data.totalEnabledCards || 0, color: '#2e7d32' },
                    { label: 'Regular Cards', value: (data.totalCards || 0) - (data.totalEnabledCards || 0), color: '#1976d2' }
                ];
                
                const ecommerceByInstitution = data.chartData ? 
                    data.chartData.reduce((acc: any, item: any) => {
                        const inst = item.institution || 'Unknown';
                        if (!acc[inst]) acc[inst] = { institution: inst, totalVolume: 0, totalTransactions: 0 };
                        acc[inst].totalVolume += item.totalVolume || 0;
                        acc[inst].totalTransactions += item.totalTransactions || 0;
                        return acc;
                    }, {}) : {};
                
                const ecommerceInstitutionData = Object.values(ecommerceByInstitution).slice(0, 8);
                
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                        {/* Summary Stats */}
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
                        
                        {/* Charts */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                                <SimplePieChart 
                                    data={ecommerceCardsPieData} 
                                    title="E-commerce Card Distribution"
                                />
                            </Box>
                            <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
                                <SimpleBarChart 
                                    data={ecommerceInstitutionData} 
                                    title="Transaction Volume by Institution" 
                                    xKey="institution" 
                                    yKey="totalVolume" 
                                    color="#1976d2"
                                />
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
