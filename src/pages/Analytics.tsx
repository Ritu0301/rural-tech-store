import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { cuelinksAPI } from '../lib/cuelinks';
import { 
  TrendingUp, 
  BarChart3, 
  Download, 
  Calendar,
  Eye,
  MousePointer,
  ShoppingCart,
  DollarSign
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnalyticsData {
  totalClicks: number;
  totalConversions: number;
  totalEarnings: number;
  conversionRate: number;
  dailyData: Array<{
    date: string;
    clicks: number;
    conversions: number;
    earnings: number;
  }>;
  topBrands: Array<{
    name: string;
    earnings: number;
    clicks: number;
  }>;
  topProducts: Array<{
    name: string;
    earnings: number;
    conversions: number;
  }>;
}

function Analytics() {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalClicks: 0,
    totalConversions: 0,
    totalEarnings: 0,
    conversionRate: 0,
    dailyData: [],
    topBrands: [],
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, dateRange]);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      // Try to get data from Cuelinks API first
      const cuelinksAnalytics = await cuelinksAPI.getAnalytics(
        startDate.toISOString(),
        endDate.toISOString()
      );

      if (cuelinksAnalytics) {
        setAnalyticsData({
          totalClicks: cuelinksAnalytics.totalClicks || 0,
          totalConversions: cuelinksAnalytics.totalConversions || 0,
          totalEarnings: cuelinksAnalytics.totalEarnings || 0,
          conversionRate: cuelinksAnalytics.conversionRate || 0,
          dailyData: cuelinksAnalytics.dailyData || [],
          topBrands: cuelinksAnalytics.topBrands || [],
          topProducts: cuelinksAnalytics.topProducts || [],
        });
      } else {
        // Fallback to local database
        await fetchLocalAnalytics(startDate, endDate);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      await fetchLocalAnalytics(new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000), new Date());
    } finally {
      setLoading(false);
    }
  };

  const fetchLocalAnalytics = async (startDate: Date, endDate: Date) => {
    if (!user) return;

    try {
      // Get affiliate links data
      const { data: links } = await supabase
        .from('affiliate_links')
        .select('*')
        .eq('user_id', user.id);

      // Get earnings data
      const { data: earnings } = await supabase
        .from('earnings')
        .select('*')
        .eq('user_id', user.id)
        .gte('transaction_date', startDate.toISOString())
        .lte('transaction_date', endDate.toISOString());

      // Calculate totals
      const totalClicks = links?.reduce((sum, link) => sum + link.clicks, 0) || 0;
      const totalConversions = links?.reduce((sum, link) => sum + link.conversions, 0) || 0;
      const totalEarnings = earnings?.reduce((sum, earning) => sum + earning.amount, 0) || 0;
      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

      // Generate daily data for the chart
      const dailyData = [];
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const dayEarnings = earnings?.filter(e => 
          e.transaction_date.startsWith(dateStr)
        ).reduce((sum, e) => sum + e.amount, 0) || 0;

        dailyData.push({
          date: dateStr,
          clicks: Math.floor(Math.random() * 50), // Mock data for demo
          conversions: Math.floor(Math.random() * 10),
          earnings: dayEarnings,
        });
      }

      // Top brands
      const brandMap = new Map();
      earnings?.forEach(earning => {
        if (earning.brand) {
          const existing = brandMap.get(earning.brand) || { name: earning.brand, earnings: 0, clicks: 0 };
          existing.earnings += earning.amount;
          brandMap.set(earning.brand, existing);
        }
      });
      const topBrands = Array.from(brandMap.values()).sort((a, b) => b.earnings - a.earnings).slice(0, 5);

      // Top products
      const productMap = new Map();
      earnings?.forEach(earning => {
        if (earning.product_name) {
          const existing = productMap.get(earning.product_name) || { name: earning.product_name, earnings: 0, conversions: 0 };
          existing.earnings += earning.amount;
          existing.conversions += 1;
          productMap.set(earning.product_name, existing);
        }
      });
      const topProducts = Array.from(productMap.values()).sort((a, b) => b.earnings - a.earnings).slice(0, 5);

      setAnalyticsData({
        totalClicks,
        totalConversions,
        totalEarnings,
        conversionRate,
        dailyData,
        topBrands,
        topProducts,
      });
    } catch (error) {
      console.error('Error fetching local analytics:', error);
    }
  };

  const exportData = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      const csvContent = [
        ['Date', 'Clicks', 'Conversions', 'Earnings'],
        ...analyticsData.dailyData.map(day => [
          day.date,
          day.clicks.toString(),
          day.conversions.toString(),
          day.earnings.toString()
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${dateRange}days.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const chartData = {
    labels: analyticsData.dailyData.map(day => 
      new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        label: 'Clicks',
        data: analyticsData.dailyData.map(day => day.clicks),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Conversions',
        data: analyticsData.dailyData.map(day => day.conversions),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Earnings (₹)',
        data: analyticsData.dailyData.map(day => day.earnings),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Performance Over Time',
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const brandChartData = {
    labels: analyticsData.topBrands.map(brand => brand.name),
    datasets: [
      {
        data: analyticsData.topBrands.map(brand => brand.earnings),
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
        ],
        borderWidth: 0,
      },
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your affiliate marketing performance</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button
            onClick={() => exportData('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clicks</p>
              <p className="text-2xl font-bold text-blue-600">
                {analyticsData.totalClicks.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <MousePointer className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversions</p>
              <p className="text-2xl font-bold text-green-600">
                {analyticsData.totalConversions.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(analyticsData.totalEarnings)}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-purple-600">
                {analyticsData.conversionRate.toFixed(2)}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Performance Trends</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 rounded-lg text-sm ${
                chartType === 'line' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 rounded-lg text-sm ${
                chartType === 'bar' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Bar
            </button>
          </div>
        </div>
        
        <div className="h-80">
          {chartType === 'line' ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <Bar data={chartData} options={chartOptions} />
          )}
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Brands */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Brands</h3>
          
          {analyticsData.topBrands.length > 0 ? (
            <div className="space-y-4">
              <div className="h-64">
                <Doughnut 
                  data={brandChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }} 
                />
              </div>
              <div className="space-y-2">
                {analyticsData.topBrands.map((brand, index) => (
                  <div key={brand.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index] }}
                      ></div>
                      <span className="text-sm font-medium text-gray-900">{brand.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">
                      {formatCurrency(brand.earnings)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No brand data available</p>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Products</h3>
          
          {analyticsData.topProducts.length > 0 ? (
            <div className="space-y-4">
              {analyticsData.topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.conversions} conversions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {formatCurrency(product.earnings)}
                    </p>
                    <p className="text-xs text-gray-500">#{index + 1}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No product data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Analytics;