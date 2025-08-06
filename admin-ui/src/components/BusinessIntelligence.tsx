import React, { useEffect, useState } from 'react';
import { 
    Container, Typography, Paper, Box, 
    FormControl, InputLabel, Select, MenuItem, 
    TextField, Button, CircularProgress,
    Card, CardContent, CardHeader
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
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
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mt: 2, width: '100%' }}>
                        {/* Charts Section - Top */}
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'row',
                            gap: 3, 
                            width: '100%',
                            minHeight: '400px'
                        }}>
                            <Box sx={{ 
                                flex: '1 1 60%', 
                                minWidth: '500px',
                                p: 3,
                                backgroundColor: '#fafafa',
                                borderRadius: 2,
                                border: '1px solid #e0e0e0'
                            }}>
                                <SimpleBarChart 
                                    data={volumeInstitutionData} 
                                    title="Volume by Institution" 
                                    xKey="institution" 
                                    yKey="volume" 
                                    color="#1976d2"
                                />
                            </Box>
                            <Box sx={{ 
                                flex: '1 1 40%', 
                                minWidth: '350px',
                                p: 3,
                                backgroundColor: '#fafafa',
                                borderRadius: 2,
                                border: '1px solid #e0e0e0'
                            }}>
                                <SimplePieChart 
                                    data={pieData} 
                                    title="Volume Distribution"
                                />
                            </Box>
                        </Box>
                        
                        {/* Data Summary Section - Bottom */}
                        <Box sx={{ 
                            width: '100%',
                            p: 3,
                            backgroundColor: '#f8f9fa',
                            borderRadius: 2,
                            border: '1px solid #e0e0e0'
                        }}>
                            <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', color: 'primary.main' }}>
                                📊 Transaction Volume Summary
                            </Typography>
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-around', 
                                flexWrap: 'wrap', 
                                gap: 4,
                                alignItems: 'center'
                            }}>
                                <Box sx={{ 
                                    textAlign: 'center', 
                                    minWidth: '200px',
                                    p: 2,
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    boxShadow: 1
                                }}>
                                    <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                                        {formatCurrency(data.totalVolume || 0)}
                                    </Typography>
                                    <Typography variant="h6" color="textSecondary" sx={{ mt: 1 }}>
                                        💰 Total Volume
                                    </Typography>
                                </Box>
                                <Box sx={{ 
                                    textAlign: 'center', 
                                    minWidth: '200px',
                                    p: 2,
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    boxShadow: 1
                                }}>
                                    <Typography variant="h3" color="secondary" sx={{ fontWeight: 'bold' }}>
                                        {formatNumber(data.totalTransactions || 0)}
                                    </Typography>
                                    <Typography variant="h6" color="textSecondary" sx={{ mt: 1 }}>
                                        📈 Total Transactions
                                    </Typography>
                                </Box>
                                <Box sx={{ 
                                    textAlign: 'center', 
                                    minWidth: '200px',
                                    p: 2,
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    boxShadow: 1
                                }}>
                                    <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold' }}>
                                        {volumeInstitutionData.length}
                                    </Typography>
                                    <Typography variant="h6" color="textSecondary" sx={{ mt: 1 }}>
                                        🏦 Active Institutions
                                    </Typography>
                                </Box>
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
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mt: 2, width: '100%' }}>
                        {/* Charts Section - Top */}
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'row',
                            gap: 3, 
                            width: '100%',
                            minHeight: '400px'
                        }}>
                            <Box sx={{ 
                                flex: '1 1 40%', 
                                minWidth: '350px',
                                p: 3,
                                backgroundColor: '#fafafa',
                                borderRadius: 2,
                                border: '1px solid #e0e0e0'
                            }}>
                                <SimplePieChart 
                                    data={successFailurePieData} 
                                    title="Transaction Success Rate"
                                />
                            </Box>
                            <Box sx={{ 
                                flex: '1 1 60%', 
                                minWidth: '500px',
                                p: 3,
                                backgroundColor: '#fafafa',
                                borderRadius: 2,
                                border: '1px solid #e0e0e0'
                            }}>
                                <SimpleBarChart 
                                    data={atmInstitutionData} 
                                    title="Successful Transactions by Institution" 
                                    xKey="institution" 
                                    yKey="successCount" 
                                    color="#2e7d32"
                                />
                            </Box>
                        </Box>
                        
                        {/* Data Summary Section - Bottom */}
                        <Box sx={{ 
                            width: '100%',
                            p: 3,
                            backgroundColor: '#f8f9fa',
                            borderRadius: 2,
                            border: '1px solid #e0e0e0'
                        }}>
                            <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', color: 'primary.main' }}>
                                🏧 ATM Transaction Analytics
                            </Typography>
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-around', 
                                flexWrap: 'wrap', 
                                gap: 4,
                                alignItems: 'center'
                            }}>
                                <Box sx={{ 
                                    textAlign: 'center', 
                                    minWidth: '200px',
                                    p: 2,
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    boxShadow: 1
                                }}>
                                    <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold' }}>
                                        {formatNumber(data.totalSuccessCount || 0)}
                                    </Typography>
                                    <Typography variant="h6" color="textSecondary" sx={{ mt: 1 }}>
                                        ✅ Successful Transactions
                                    </Typography>
                                </Box>
                                <Box sx={{ 
                                    textAlign: 'center', 
                                    minWidth: '200px',
                                    p: 2,
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    boxShadow: 1
                                }}>
                                    <Typography variant="h3" color="error" sx={{ fontWeight: 'bold' }}>
                                        {formatNumber(data.totalFailedCount || 0)}
                                    </Typography>
                                    <Typography variant="h6" color="textSecondary" sx={{ mt: 1 }}>
                                        ❌ Failed Transactions
                                    </Typography>
                                </Box>
                                <Box sx={{ 
                                    textAlign: 'center', 
                                    minWidth: '200px',
                                    p: 2,
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    boxShadow: 1
                                }}>
                                    <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                                        {successRate}%
                                    </Typography>
                                    <Typography variant="h6" color="textSecondary" sx={{ mt: 1 }}>
                                        📊 Success Rate
                                    </Typography>
                                </Box>
                                <Box sx={{ 
                                    textAlign: 'center', 
                                    minWidth: '200px',
                                    p: 2,
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    boxShadow: 1
                                }}>
                                    <Typography variant="h3" color="info.main" sx={{ fontWeight: 'bold' }}>
                                        {formatCurrency(data.totalAmount || 0)}
                                    </Typography>
                                    <Typography variant="h6" color="textSecondary" sx={{ mt: 1 }}>
                                        💰 Total Amount
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                        
                        <Typography variant="body2" color="success.main" align="center">
                            📈 {dataPoints} ATM transaction records processed
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
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mt: 2, width: '100%' }}>
                        {/* Charts Section - Top */}
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'row',
                            gap: 3, 
                            width: '100%',
                            minHeight: '400px'
                        }}>
                            <Box sx={{ 
                                flex: '1 1 60%', 
                                minWidth: '500px',
                                p: 3,
                                backgroundColor: '#fafafa',
                                borderRadius: 2,
                                border: '1px solid #e0e0e0'
                            }}>
                                <SimpleBarChart 
                                    data={atmTerminalData} 
                                    title="ATM Terminals by Institution" 
                                    xKey="institution" 
                                    yKey="totalCount" 
                                    color="#1976d2"
                                />
                            </Box>
                            <Box sx={{ 
                                flex: '1 1 40%', 
                                minWidth: '350px',
                                p: 3,
                                backgroundColor: '#fafafa',
                                borderRadius: 2,
                                border: '1px solid #e0e0e0'
                            }}>
                                <SimplePieChart 
                                    data={atmStatusPieData} 
                                    title="Terminal Status Distribution"
                                />
                            </Box>
                        </Box>
                        
                        {/* Data Summary Section - Bottom */}
                        <Box sx={{ 
                            width: '100%',
                            p: 3,
                            backgroundColor: '#f8f9fa',
                            borderRadius: 2,
                            border: '1px solid #e0e0e0'
                        }}>
                            <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', color: 'primary.main' }}>
                                🏧 ATM Terminal Analytics
                            </Typography>
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-around', 
                                flexWrap: 'wrap', 
                                gap: 4,
                                alignItems: 'center'
                            }}>
                                <Box sx={{ 
                                    textAlign: 'center', 
                                    minWidth: '200px',
                                    p: 2,
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    boxShadow: 1
                                }}>
                                    <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold' }}>
                                        {formatNumber(data.activeTerminals || 0)}
                                    </Typography>
                                    <Typography variant="h6" color="textSecondary" sx={{ mt: 1 }}>
                                        ✅ Active Terminals
                                    </Typography>
                                </Box>
                                <Box sx={{ 
                                    textAlign: 'center', 
                                    minWidth: '200px',
                                    p: 2,
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    boxShadow: 1
                                }}>
                                    <Typography variant="h3" color="warning.main" sx={{ fontWeight: 'bold' }}>
                                        {formatNumber((data.totalTerminals || 0) - (data.activeTerminals || 0))}
                                    </Typography>
                                    <Typography variant="h6" color="textSecondary" sx={{ mt: 1 }}>
                                        ⚠️ Inactive Terminals
                                    </Typography>
                                </Box>
                                <Box sx={{ 
                                    textAlign: 'center', 
                                    minWidth: '200px',
                                    p: 2,
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    boxShadow: 1
                                }}>
                                    <Typography variant="h3" color="info.main" sx={{ fontWeight: 'bold' }}>
                                        {data.totalTerminals > 0 ? ((data.activeTerminals / data.totalTerminals) * 100).toFixed(1) : '0'}%
                                    </Typography>
                                    <Typography variant="h6" color="textSecondary" sx={{ mt: 1 }}>
                                        📊 Uptime Rate
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                        
                        <Typography variant="body2" color="success.main" align="center">
                            📈 {dataPoints} ATM terminal records processed
                        </Typography>
                    </Box>
                );

            case 'pos-terminals':
                // Prepare data for charts
                const posTerminalsByInstitution = data.chartData ? 
                    data.chartData.reduce((acc: any, item: any) => {
                        const inst = item.institution || 'Unknown';
                        if (!acc[inst]) acc[inst] = { institution: inst, totalCount: 0, activeCount: 0 };
                        acc[inst].totalCount += item.totalCount || 0;
                        acc[inst].activeCount += item.activeCount || 0;
                        return acc;
                    }, {}) : {};
                
                const posTerminalData = Object.values(posTerminalsByInstitution).slice(0, 8);
                
                const posStatusPieData = [
                    { label: 'Active', value: data.activeTerminals || 0, color: '#2e7d32' },
                    { label: 'Inactive', value: (data.totalTerminals || 0) - (data.activeTerminals || 0), color: '#d32f2f' }
                ];
                
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mt: 2, width: '100%' }}>
                        {/* Charts Section - Top */}
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'row',
                            gap: 3, 
                            width: '100%',
                            minHeight: '400px'
                        }}>
                            <Box sx={{ 
                                flex: '1 1 60%', 
                                minWidth: '500px',
                                p: 3,
                                backgroundColor: '#fafafa',
                                borderRadius: 2,
                                border: '1px solid #e0e0e0'
                            }}>
                                <SimpleBarChart 
                                    data={posTerminalData} 
                                    title="POS Terminals by Institution" 
                                    xKey="institution" 
                                    yKey="totalCount" 
                                    color="#9c27b0"
                                />
                            </Box>
                            <Box sx={{ 
                                flex: '1 1 40%', 
                                minWidth: '350px',
                                p: 3,
                                backgroundColor: '#fafafa',
                                borderRadius: 2,
                                border: '1px solid #e0e0e0'
                            }}>
                                <SimplePieChart 
                                    data={posStatusPieData} 
                                    title="POS Terminal Status Distribution"
                                />
                            </Box>
                        </Box>
                        
                        {/* Data Summary Section - Bottom */}
                        <Box sx={{ 
                            width: '100%',
                            p: 3,
                            backgroundColor: '#f8f9fa',
                            borderRadius: 2,
                            border: '1px solid #e0e0e0'
                        }}>
                            <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', color: 'primary.main' }}>
                                💳 POS Terminal Analytics
                            </Typography>
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-around', 
                                flexWrap: 'wrap', 
                                gap: 4,
                                alignItems: 'center'
                            }}>
                                <Box sx={{ 
                                    textAlign: 'center', 
                                    minWidth: '200px',
                                    p: 2,
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    boxShadow: 1
                                }}>
                                    <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                                        {formatNumber(data.totalTerminals || 0)}
                                    </Typography>
                                    <Typography variant="h6" color="textSecondary" sx={{ mt: 1 }}>
                                        💳 Total POS Terminals
                                    </Typography>
                                </Box>
                                <Box sx={{ 
                                    textAlign: 'center', 
                                    minWidth: '200px',
                                    p: 2,
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    boxShadow: 1
                                }}>
                                    <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold' }}>
                                        {formatNumber(data.activeTerminals || 0)}
                                    </Typography>
                                    <Typography variant="h6" color="textSecondary" sx={{ mt: 1 }}>
                                        ✅ Active Terminals
                                    </Typography>
                                </Box>
                                <Box sx={{ 
                                    textAlign: 'center', 
                                    minWidth: '200px',
                                    p: 2,
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    boxShadow: 1
                                }}>
                                    <Typography variant="h3" color="warning.main" sx={{ fontWeight: 'bold' }}>
                                        {formatNumber((data.totalTerminals || 0) - (data.activeTerminals || 0))}
                                    </Typography>
                                    <Typography variant="h6" color="textSecondary" sx={{ mt: 1 }}>
                                        ⚠️ Inactive Terminals
                                    </Typography>
                                </Box>
                                <Box sx={{ 
                                    textAlign: 'center', 
                                    minWidth: '200px',
                                    p: 2,
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    boxShadow: 1
                                }}>
                                    <Typography variant="h3" color="info.main" sx={{ fontWeight: 'bold' }}>
                                        {data.totalTerminals > 0 ? ((data.activeTerminals / data.totalTerminals) * 100).toFixed(1) : '0'}%
                                    </Typography>
                                    <Typography variant="h6" color="textSecondary" sx={{ mt: 1 }}>
                                        📊 Uptime Rate
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                        
                        <Typography variant="body2" color="success.main" align="center">
                            📈 {dataPoints} POS terminal records processed
                        </Typography>
                    </Box>
                );

            case 'pos-transactions':
                const posSuccessRate = data.totalSuccessTransactions && data.totalFailedTransactions 
                    ? ((data.totalSuccessTransactions / (data.totalSuccessTransactions + data.totalFailedTransactions)) * 100).toFixed(1)
                    : '0';
                
                // Prepare data for charts
                const posSuccessFailurePieData = [
                    { label: 'Successful', value: data.totalSuccessTransactions || 0, color: '#2e7d32' },
                    { label: 'Failed', value: data.totalFailedTransactions || 0, color: '#d32f2f' }
                ];
                
                const posTransactionsByInstitution = data.chartData ? 
                    data.chartData.reduce((acc: any, item: any) => {
                        const inst = item.institution || 'Unknown';
                        if (!acc[inst]) acc[inst] = { institution: inst, successCount: 0, failedCount: 0, totalAmount: 0 };
                        acc[inst].successCount += item.successCount || 0;
                        acc[inst].failedCount += item.failedCount || 0;
                        acc[inst].totalAmount += item.totalAmount || 0;
                        return acc;
                    }, {}) : {};
                
                const posTransactionData = Object.values(posTransactionsByInstitution).slice(0, 8);
                
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mt: 2, width: '100%' }}>
                        {/* Charts Section - Top */}
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'row',
                            gap: 3, 
                            width: '100%',
                            minHeight: '400px'
                        }}>
                            <Box sx={{ 
                                flex: '1 1 40%', 
                                minWidth: '350px',
                                p: 3,
                                backgroundColor: '#fafafa',
                                borderRadius: 2,
                                border: '1px solid #e0e0e0'
                            }}>
                                <SimplePieChart 
                                    data={posSuccessFailurePieData} 
                                    title="POS Success/Failure Distribution"
                                />
                            </Box>
                            <Box sx={{ 
                                flex: '1 1 60%', 
                                minWidth: '500px',
                                p: 3,
                                backgroundColor: '#fafafa',
                                borderRadius: 2,
                                border: '1px solid #e0e0e0'
                            }}>
                                <SimpleBarChart 
                                    data={posTransactionData} 
                                    title="POS Transactions by Institution" 
                                    xKey="institution" 
                                    yKey="successCount" 
                                    color="#9c27b0"
                                />
                            </Box>
                        </Box>
                        
                        {/* Data Summary Section - Bottom */}
                        <Box sx={{ 
                            width: '100%',
                            p: 3,
                            backgroundColor: '#f8f9fa',
                            borderRadius: 2,
                            border: '1px solid #e0e0e0'
                        }}>
                            <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', color: 'primary.main' }}>
                                💳 POS Transaction Analytics
                            </Typography>
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-around', 
                                flexWrap: 'wrap', 
                                gap: 4,
                                alignItems: 'center'
                            }}>
                                <Box sx={{ 
                                    textAlign: 'center', 
                                    minWidth: '200px',
                                    p: 2,
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    boxShadow: 1
                                }}>
                                    <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold' }}>
                                        {formatNumber(data.totalSuccessTransactions || 0)}
                                    </Typography>
                                    <Typography variant="h6" color="textSecondary" sx={{ mt: 1 }}>
                                        ✅ Successful Transactions
                                    </Typography>
                                </Box>
                                <Box sx={{ 
                                    textAlign: 'center', 
                                    minWidth: '200px',
                                    p: 2,
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    boxShadow: 1
                                }}>
                                    <Typography variant="h3" color="error" sx={{ fontWeight: 'bold' }}>
                                        {formatNumber(data.totalFailedTransactions || 0)}
                                    </Typography>
                                    <Typography variant="h6" color="textSecondary" sx={{ mt: 1 }}>
                                        ❌ Failed Transactions
                                    </Typography>
                                </Box>
                                <Box sx={{ 
                                    textAlign: 'center', 
                                    minWidth: '200px',
                                    p: 2,
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    boxShadow: 1
                                }}>
                                    <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                                        {posSuccessRate}%
                                    </Typography>
                                    <Typography variant="h6" color="textSecondary" sx={{ mt: 1 }}>
                                        📊 Success Rate
                                    </Typography>
                                </Box>
                                <Box sx={{ 
                                    textAlign: 'center', 
                                    minWidth: '200px',
                                    p: 2,
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    boxShadow: 1
                                }}>
                                    <Typography variant="h3" color="info.main" sx={{ fontWeight: 'bold' }}>
                                        {formatCurrency(data.totalAmount || 0)}
                                    </Typography>
                                    <Typography variant="h6" color="textSecondary" sx={{ mt: 1 }}>
                                        💰 Total Amount
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                        
                        <Typography variant="body2" color="success.main" align="center">
                            📈 {dataPoints} POS transaction records processed
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
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mt: 2, width: '100%' }}>
                        {/* Charts Section - Top */}
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'row',
                            gap: 3, 
                            width: '100%',
                            minHeight: '400px'
                        }}>
                            <Box sx={{ 
                                flex: '1 1 40%', 
                                minWidth: '350px',
                                p: 3,
                                backgroundColor: '#fafafa',
                                borderRadius: 2,
                                border: '1px solid #e0e0e0'
                            }}>
                                <SimplePieChart 
                                    data={cardLifecyclePieData} 
                                    title="Card Lifecycle Distribution"
                                />
                            </Box>
                            <Box sx={{ 
                                flex: '1 1 60%', 
                                minWidth: '500px',
                                p: 3,
                                backgroundColor: '#fafafa',
                                borderRadius: 2,
                                border: '1px solid #e0e0e0'
                            }}>
                                <SimpleBarChart 
                                    data={cardInstitutionData} 
                                    title="Cards Issued by Institution" 
                                    xKey="institution" 
                                    yKey="issued" 
                                    color="#2e7d32"
                                />
                            </Box>
                        </Box>
                        
                        {/* Data Summary Section - Bottom */}
                        <Box sx={{ 
                            width: '100%',
                            p: 3,
                            backgroundColor: '#f8f9fa',
                            borderRadius: 2,
                            border: '1px solid #e0e0e0'
                        }}>
                            <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', color: 'primary.main' }}>
                                💳 Card Lifecycle Analytics
                            </Typography>
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-around', 
                                flexWrap: 'wrap', 
                                gap: 4,
                                alignItems: 'center'
                            }}>
                                <Box sx={{ 
                                    textAlign: 'center', 
                                    minWidth: '200px',
                                    p: 2,
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    boxShadow: 1
                                }}>
                                    <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold' }}>
                                        {formatNumber(data.totalIssued || 0)}
                                    </Typography>
                                    <Typography variant="h6" color="textSecondary" sx={{ mt: 1 }}>
                                        🆕 Cards Issued
                                    </Typography>
                                </Box>
                                <Box sx={{ 
                                    textAlign: 'center', 
                                    minWidth: '200px',
                                    p: 2,
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    boxShadow: 1
                                }}>
                                    <Typography variant="h3" color="warning.main" sx={{ fontWeight: 'bold' }}>
                                        {formatNumber(data.totalExpired || 0)}
                                    </Typography>
                                    <Typography variant="h6" color="textSecondary" sx={{ mt: 1 }}>
                                        ⏰ Cards Expired
                                    </Typography>
                                </Box>
                                <Box sx={{ 
                                    textAlign: 'center', 
                                    minWidth: '200px',
                                    p: 2,
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    boxShadow: 1
                                }}>
                                    <Typography variant="h3" color="error" sx={{ fontWeight: 'bold' }}>
                                        {formatNumber(data.totalCancelled || 0)}
                                    </Typography>
                                    <Typography variant="h6" color="textSecondary" sx={{ mt: 1 }}>
                                        ❌ Cards Cancelled
                                    </Typography>
                                </Box>
                                <Box sx={{ 
                                    textAlign: 'center', 
                                    minWidth: '200px',
                                    p: 2,
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    boxShadow: 1
                                }}>
                                    <Typography variant="h3" color="info.main" sx={{ fontWeight: 'bold' }}>
                                        {formatNumber((data.totalIssued || 0) - (data.totalExpired || 0) - (data.totalCancelled || 0))}
                                    </Typography>
                                    <Typography variant="h6" color="textSecondary" sx={{ mt: 1 }}>
                                        ✅ Cards Active
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                        
                        <Typography variant="body2" color="success.main" align="center">
                            📈 {dataPoints} card lifecycle records processed
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
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mt: 2, width: '100%' }}>
                        {/* Charts Section - Top */}
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'row',
                            gap: 3, 
                            width: '100%',
                            minHeight: '400px'
                        }}>
                            <Box sx={{ 
                                flex: '1 1 40%', 
                                minWidth: '350px',
                                p: 3,
                                backgroundColor: '#fafafa',
                                borderRadius: 2,
                                border: '1px solid #e0e0e0'
                            }}>
                                <SimplePieChart 
                                    data={ecommerceCardsPieData} 
                                    title="E-commerce Card Distribution"
                                />
                            </Box>
                            <Box sx={{ 
                                flex: '1 1 60%', 
                                minWidth: '500px',
                                p: 3,
                                backgroundColor: '#fafafa',
                                borderRadius: 2,
                                border: '1px solid #e0e0e0'
                            }}>
                                <SimpleBarChart 
                                    data={ecommerceInstitutionData} 
                                    title="Transaction Volume by Institution" 
                                    xKey="institution" 
                                    yKey="totalVolume" 
                                    color="#1976d2"
                                />
                            </Box>
                        </Box>
                        
                        {/* Data Summary Section - Bottom */}
                        <Box sx={{ 
                            width: '100%',
                            p: 3,
                            backgroundColor: '#f8f9fa',
                            borderRadius: 2,
                            border: '1px solid #e0e0e0'
                        }}>
                            <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', color: 'primary.main' }}>
                                🛒 E-commerce Activity Analytics
                            </Typography>
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-around', 
                                flexWrap: 'wrap', 
                                gap: 4,
                                alignItems: 'center'
                            }}>
                                <Box sx={{ 
                                    textAlign: 'center', 
                                    minWidth: '200px',
                                    p: 2,
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    boxShadow: 1
                                }}>
                                    <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                                        {formatNumber(data.totalEnabledCards || 0)}
                                    </Typography>
                                    <Typography variant="h6" color="textSecondary" sx={{ mt: 1 }}>
                                        E-commerce Enabled Cards
                                    </Typography>
                                </Box>
                                <Box sx={{ 
                                    textAlign: 'center', 
                                    minWidth: '200px',
                                    p: 2,
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    boxShadow: 1
                                }}>
                                    <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold' }}>
                                        {formatNumber(data.totalTransactions || 0)}
                                    </Typography>
                                    <Typography variant="h6" color="textSecondary" sx={{ mt: 1 }}>
                                        💳 Online Transactions
                                    </Typography>
                                </Box>
                                <Box sx={{ 
                                    textAlign: 'center', 
                                    minWidth: '200px',
                                    p: 2,
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    boxShadow: 1
                                }}>
                                    <Typography variant="h3" color="info.main" sx={{ fontWeight: 'bold' }}>
                                        {formatCurrency(data.totalVolume || 0)}
                                    </Typography>
                                    <Typography variant="h6" color="textSecondary" sx={{ mt: 1 }}>
                                        💰 Total Volume
                                    </Typography>
                                </Box>
                                <Box sx={{ 
                                    textAlign: 'center', 
                                    minWidth: '200px',
                                    p: 2,
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    boxShadow: 1
                                }}>
                                    <Typography variant="h3" color="secondary" sx={{ fontWeight: 'bold' }}>
                                        {data.totalTransactions > 0 ? (data.totalVolume / data.totalTransactions).toFixed(2) : '0'}
                                    </Typography>
                                    <Typography variant="h6" color="textSecondary" sx={{ mt: 1 }}>
                                        📊 Average Transaction Value
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                        
                        <Typography variant="body2" color="success.main" align="center">
                            📈 {dataPoints} e-commerce records processed
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

interface FilterOptions {
    selectedBank: string;
    transactionType?: string;
    terminalStatus?: string;
    cardStatus?: string;
}

const BusinessIntelligence: React.FC = () => {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const [selectedReportType, setSelectedReportType] = useState<string>('transaction-volume');
    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: '',
        endDate: ''
    });
    const [filters, setFilters] = useState<FilterOptions>({
        selectedBank: '',
        transactionType: '',
        terminalStatus: '',
        cardStatus: ''
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<ReportSummary | null>(null);
    const [chartData, setChartData] = useState<ChartData | null>(null);
    
    // Available banks/institutions for filtering
    const availableBanks = [
        { key: 'all', label: t('allBanks') },
        { key: 'central', label: t('centralBankOfLibya') },
        { key: 'national', label: t('nationalCommercialBank') },
        { key: 'wahda', label: t('wahdaBank') },
        { key: 'sahara', label: t('saharaBank') },
        { key: 'republic', label: t('republicBank') },
        { key: 'mediterranean', label: t('mediterraneanBank') },
        { key: 'ejmaa', label: t('alEjmaaAlArabiBank') },
        { key: 'foreign', label: t('libyanForeignBank') }
    ];

    useEffect(() => {
        fetchReportSummary();
    }, []);

    useEffect(() => {
        if (selectedReportType) {
            fetchChartData();
        }
    }, [selectedReportType, dateRange, filters]);

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
            
            // Add filter parameters
            if (filters.selectedBank && filters.selectedBank !== 'All Banks') {
                params.append('institution', filters.selectedBank);
            }
            if (filters.transactionType) {
                params.append('transactionType', filters.transactionType);
            }
            if (filters.terminalStatus) {
                params.append('status', filters.terminalStatus);
            }
            if (filters.cardStatus) {
                params.append('cardStatus', filters.cardStatus);
            }
            
            console.log('Final URL params with filters:', params.toString());
            
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

    const renderChart = () => {
        if (!chartData) return null;

        // Use the enhanced stacked layout for all report types
        return (
            <Box sx={{ width: '100%' }}>
                <EnhancedChart title={selectedReportType} data={chartData} />
            </Box>
        );
    };

    return (
        <Container maxWidth="xl" className={`business-intelligence-container ${isRTL ? 'rtl' : ''}`}>
            <Typography variant="h4" component="h1" gutterBottom>
                {t('businessIntelligence')}
            </Typography>
            
            <Paper className="controls-paper">
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                        <FormControl fullWidth>
                            <InputLabel>{t('reportType')}</InputLabel>
                            <Select
                                value={selectedReportType}
                                onChange={(e) => setSelectedReportType(e.target.value)}
                                label={t('reportType')}
                            >
                                <MenuItem value="transaction-volume">{t('transactionVolume')}</MenuItem>
                                <MenuItem value="atm-transactions">{t('atmTransactions')}</MenuItem>
                                <MenuItem value="atm-terminals">{t('atmTerminals')}</MenuItem>
                                <MenuItem value="pos-terminals">{t('posTerminals')}</MenuItem>
                                <MenuItem value="pos-transactions">{t('posTransactions')}</MenuItem>
                                <MenuItem value="card-lifecycle">{t('cardLifecycle')}</MenuItem>
                                <MenuItem value="ecommerce-activity">{t('ecommerceActivity')}</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    
                    <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
                        <TextField
                            label={t('startDate')}
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
                            label={t('endDate')}
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Box>
                    
                    {/* Bank/Institution Filter */}
                    <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                        <FormControl fullWidth>
                            <InputLabel>{t('bank')}</InputLabel>
                            <Select
                                value={filters.selectedBank}
                                onChange={(e) => setFilters(prev => ({ ...prev, selectedBank: e.target.value }))}
                                label={t('bank')}
                            >
                                {availableBanks.map((bank) => (
                                    <MenuItem key={bank.key} value={bank.label}>{bank.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    
                    {/* Report-Specific Filters */}
                    {selectedReportType === 'atm-transactions' || selectedReportType === 'pos-transactions' ? (
                        <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
                            <FormControl fullWidth>
                                <InputLabel>{t('transactionType')}</InputLabel>
                                <Select
                                    value={filters.transactionType || ''}
                                    onChange={(e) => setFilters(prev => ({ ...prev, transactionType: e.target.value }))}
                                    label={t('transactionType')}
                                >
                                    <MenuItem value="">{t('allTypes')}</MenuItem>
                                    <MenuItem value="successful">{t('successfulOnly')}</MenuItem>
                                    <MenuItem value="failed">{t('failedOnly')}</MenuItem>
                                    <MenuItem value="withdrawal">{t('withdrawals')}</MenuItem>
                                    <MenuItem value="deposit">{t('deposits')}</MenuItem>
                                    <MenuItem value="balance">{t('balanceInquiry')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    ) : null}
                    
                    {selectedReportType === 'atm-terminals' || selectedReportType === 'pos-terminals' ? (
                        <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
                            <FormControl fullWidth>
                                <InputLabel>{t('terminalStatus')}</InputLabel>
                                <Select
                                    value={filters.terminalStatus || ''}
                                    onChange={(e) => setFilters(prev => ({ ...prev, terminalStatus: e.target.value }))}
                                    label={t('terminalStatus')}
                                >
                                    <MenuItem value="">{t('allStatus')}</MenuItem>
                                    <MenuItem value="active">{t('activeOnly')}</MenuItem>
                                    <MenuItem value="inactive">{t('inactiveOnly')}</MenuItem>
                                    <MenuItem value="maintenance">{t('underMaintenance')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    ) : null}
                    
                    {selectedReportType === 'card-lifecycle' ? (
                        <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
                            <FormControl fullWidth>
                                <InputLabel>{t('cardStatus')}</InputLabel>
                                <Select
                                    value={filters.cardStatus || ''}
                                    onChange={(e) => setFilters(prev => ({ ...prev, cardStatus: e.target.value }))}
                                    label={t('cardStatus')}
                                >
                                    <MenuItem value="">{t('allStatus')}</MenuItem>
                                    <MenuItem value="issued">{t('issued')}</MenuItem>
                                    <MenuItem value="active">{t('active')}</MenuItem>
                                    <MenuItem value="expired">{t('expired')}</MenuItem>
                                    <MenuItem value="cancelled">{t('cancelled')}</MenuItem>
                                    <MenuItem value="blocked">{t('blocked')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    ) : null}
                    

                    
                    {/* Clear Filters Button */}
                    <Box sx={{ flex: '0 0 auto' }}>
                        <Button 
                            variant="outlined" 
                            onClick={() => setFilters({
                                selectedBank: '',
                                transactionType: '',
                                terminalStatus: '',
                                cardStatus: ''
                            })}
                            sx={{ height: '56px' }}
                        >
                            🗑️ {t('clearFilters')}
                        </Button>
                    </Box>

                </Box>
            </Paper>

            {loading && (
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ ml: 2, alignSelf: 'center' }}>
                        {t('loading')}...
                    </Typography>
                </Box>
            )}

            {error && (
                <Typography color="error" variant="body1" align="center">
                    {t('error')}: {error}
                </Typography>
            )}

            <Box mt={4}>
                {renderChart()}
            </Box>
        </Container>
    );
};

export default BusinessIntelligence;
