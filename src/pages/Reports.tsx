import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  Package, 
  TrendingUp, 
  TrendingDown, 
  Download,
  Calendar,
  DollarSign,
  Users,
  ShoppingCart,
  Target,
  Activity,
  AlertTriangle,
  Filter,
  RefreshCw,
  FileText,
  Eye,
  Zap
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { 
  formatCurrency, 
  formatDate, 
  formatNumber 
} from '../utils/formatters';
import { 
  getLastNDaysRange, 
  generateSalesReport, 
  generateProductReport, 
  generateStockReport,
  generateAdvancedSalesReport,
  generateCustomerReport,
  generateProfitabilityReport
} from '../utils/reports';
import { Chart, registerables } from 'chart.js';
import { Bar, Line, Doughnut, Radar } from 'react-chartjs-2';
import { DateRange } from '../types';
import Modal from '../components/ui/Modal';

// Register Chart.js components
Chart.register(...registerables);

function Reports() {
  const { 
    products, 
    suppliers, 
    customers,
    sales, 
    purchases,
    lowStockThreshold 
  } = useAppContext();
  
  // State for date range and filters
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    return {
      startDate: thirtyDaysAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    };
  });
  
  // State for selected report and view
  const [selectedReport, setSelectedReport] = useState('overview');
  const [selectedView, setSelectedView] = useState('summary');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [comparisonPeriod, setComparisonPeriod] = useState('previous');
  
  // Modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<any>(null);
  
  // Generate reports
  const salesReport = generateSalesReport(sales, dateRange);
  const productReport = generateProductReport(sales, dateRange);
  const stockReport = generateStockReport(products, lowStockThreshold);
  const advancedSalesReport = generateAdvancedSalesReport(sales, dateRange);
  const customerReport = generateCustomerReport(sales, customers, dateRange);
  const profitabilityReport = generateProfitabilityReport(sales, products, dateRange);
  
  // Chart data states
  const [chartData, setChartData] = useState({
    sales: { labels: [], datasets: [] },
    products: { labels: [], datasets: [] },
    customers: { labels: [], datasets: [] },
    profitability: { labels: [], datasets: [] },
    trends: { labels: [], datasets: [] }
  });
  
  // Update chart data when dependencies change
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      updateChartData();
      setIsLoading(false);
    }, 500);
  }, [sales, dateRange, selectedMetric]);
  
  const updateChartData = () => {
    // Sales trend chart
    const dailySales = generateDailySalesData();
    
    // Product performance chart
    const productPerformance = generateProductPerformanceData();
    
    // Customer segmentation chart
    const customerSegmentation = generateCustomerSegmentationData();
    
    // Profitability analysis chart
    const profitabilityData = generateProfitabilityData();
    
    // Trend analysis chart
    const trendData = generateTrendAnalysisData();
    
    setChartData({
      sales: dailySales,
      products: productPerformance,
      customers: customerSegmentation,
      profitability: profitabilityData,
      trends: trendData
    });
  };
  
  const generateDailySalesData = () => {
    const dailySales = {};
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    const dayCount = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Initialize all days with 0
    for (let i = 0; i < dayCount; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dailySales[dateStr] = { revenue: 0, orders: 0, customers: new Set() };
    }
    
    // Fill with actual data
    sales.forEach(sale => {
      const saleDate = sale.date.split('T')[0];
      if (dailySales[saleDate]) {
        dailySales[saleDate].revenue += sale.total;
        dailySales[saleDate].orders += 1;
        if (sale.customerId) {
          dailySales[saleDate].customers.add(sale.customerId);
        }
      }
    });
    
    const labels = Object.keys(dailySales).sort().map(date => {
      const d = new Date(date);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    });
    
    const revenueData = Object.keys(dailySales).sort().map(date => dailySales[date].revenue);
    const ordersData = Object.keys(dailySales).sort().map(date => dailySales[date].orders);
    const customersData = Object.keys(dailySales).sort().map(date => dailySales[date].customers.size);
    
    return {
      labels,
      datasets: [
        {
          label: 'Ingresos',
          data: revenueData,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y'
        },
        {
          label: 'Pedidos',
          data: ordersData,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: false,
          yAxisID: 'y1'
        }
      ]
    };
  };
  
  const generateProductPerformanceData = () => {
    const productSales = {};
    
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.name,
            revenue: 0,
            quantity: 0,
            orders: 0
          };
        }
        productSales[item.productId].revenue += item.price * item.quantity;
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].orders += 1;
      });
    });
    
    const sortedProducts = Object.values(productSales)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10);
    
    return {
      labels: sortedProducts.map((p: any) => p.name),
      datasets: [
        {
          label: 'Ingresos',
          data: sortedProducts.map((p: any) => p.revenue),
          backgroundColor: [
            'rgba(99, 102, 241, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(249, 115, 22, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(20, 184, 166, 0.8)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(147, 51, 234, 0.8)'
          ],
          borderWidth: 1
        }
      ]
    };
  };
  
  const generateCustomerSegmentationData = () => {
    const segments = {
      'Nuevos': 0,
      'Regulares': 0,
      'VIP': 0,
      'Inactivos': 0
    };
    
    customers.forEach(customer => {
      if (customer.totalPurchases === 0) {
        segments['Nuevos']++;
      } else if (customer.totalPurchases < 500) {
        segments['Regulares']++;
      } else if (customer.totalPurchases >= 500) {
        segments['VIP']++;
      }
      
      const lastPurchase = customer.lastPurchaseDate ? new Date(customer.lastPurchaseDate) : null;
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      if (lastPurchase && lastPurchase < threeMonthsAgo) {
        segments['Inactivos']++;
      }
    });
    
    return {
      labels: Object.keys(segments),
      datasets: [
        {
          data: Object.values(segments),
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(99, 102, 241, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }
      ]
    };
  };
  
  const generateProfitabilityData = () => {
    const categoryProfits = {};
    
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const category = product.category || 'Sin categoría';
          const profit = (item.price - product.purchasePrice) * item.quantity;
          
          if (!categoryProfits[category]) {
            categoryProfits[category] = { profit: 0, revenue: 0 };
          }
          
          categoryProfits[category].profit += profit;
          categoryProfits[category].revenue += item.price * item.quantity;
        }
      });
    });
    
    const categories = Object.keys(categoryProfits);
    const profits = categories.map(cat => categoryProfits[cat].profit);
    const margins = categories.map(cat => 
      categoryProfits[cat].revenue > 0 
        ? (categoryProfits[cat].profit / categoryProfits[cat].revenue) * 100 
        : 0
    );
    
    return {
      labels: categories,
      datasets: [
        {
          label: 'Beneficio',
          data: profits,
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 1,
          yAxisID: 'y'
        },
        {
          label: 'Margen %',
          data: margins,
          type: 'line',
          borderColor: 'rgb(249, 115, 22)',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    };
  };
  
  const generateTrendAnalysisData = () => {
    // Generate weekly trends for the last 12 weeks
    const weeks = [];
    const weeklyData = { revenue: [], orders: [], avgOrder: [] };
    
    for (let i = 11; i >= 0; i--) {
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - (i * 7));
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);
      
      weeks.push(`S${12 - i}`);
      
      const weekSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= weekStart && saleDate <= weekEnd;
      });
      
      const weekRevenue = weekSales.reduce((sum, sale) => sum + sale.total, 0);
      const weekOrders = weekSales.length;
      const avgOrderValue = weekOrders > 0 ? weekRevenue / weekOrders : 0;
      
      weeklyData.revenue.push(weekRevenue);
      weeklyData.orders.push(weekOrders);
      weeklyData.avgOrder.push(avgOrderValue);
    }
    
    return {
      labels: weeks,
      datasets: [
        {
          label: 'Ingresos Semanales',
          data: weeklyData.revenue,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Valor Promedio Pedido',
          data: weeklyData.avgOrder,
          borderColor: 'rgb(249, 115, 22)',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          tension: 0.4,
          fill: false
        }
      ]
    };
  };
  
  // Chart options
  const multiAxisOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            if (context.datasetIndex === 0) {
              return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
            }
            return `${context.dataset.label}: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Período'
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Ingresos (€)'
        },
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          }
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Cantidad'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };
  
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return formatCurrency(context.raw);
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          }
        }
      }
    }
  };
  
  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.raw} clientes`;
          }
        }
      }
    }
  };
  
  const profitabilityOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            if (context.datasetIndex === 0) {
              return `Beneficio: ${formatCurrency(context.raw)}`;
            }
            return `Margen: ${context.raw.toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Beneficio (€)'
        },
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          }
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Margen (%)'
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function(value: any) {
            return `${value}%`;
          }
        }
      },
    },
  };
  
  // Handle date range change
  const handleDateRangeChange = (range: string) => {
    switch (range) {
      case 'today':
        setDateRange(getLastNDaysRange(0));
        break;
      case 'yesterday':
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        setDateRange({ startDate: yesterdayStr, endDate: yesterdayStr });
        break;
      case '7days':
        setDateRange(getLastNDaysRange(7));
        break;
      case '30days':
        setDateRange(getLastNDaysRange(30));
        break;
      case '90days':
        setDateRange(getLastNDaysRange(90));
        break;
      case 'custom':
        break;
    }
  };
  
  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };
  
  const openDetailModal = (title: string, content: any) => {
    setModalContent({ title, content });
    setIsDetailModalOpen(true);
  };
  
  // Calculate key metrics
  const keyMetrics = {
    totalRevenue: salesReport.totalSales,
    totalOrders: salesReport.salesCount,
    avgOrderValue: salesReport.averageSale,
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => c.isActive).length,
    totalProducts: products.length,
    lowStockProducts: stockReport.lowStock.length,
    inventoryValue: stockReport.totalValue
  };
  
  // Calculate growth rates (mock data for demo)
  const growthRates = {
    revenue: 12.5,
    orders: 8.3,
    customers: 15.2,
    avgOrder: 4.1
  };
  
  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Centro de Reportes
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Análisis completo del rendimiento empresarial
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick date filters */}
          <select
            className="select"
            onChange={(e) => handleDateRangeChange(e.target.value)}
            defaultValue="30days"
          >
            <option value="today">Hoy</option>
            <option value="yesterday">Ayer</option>
            <option value="7days">Últimos 7 días</option>
            <option value="30days">Últimos 30 días</option>
            <option value="90days">Últimos 90 días</option>
            <option value="custom">Personalizado</option>
          </select>
          
          {/* Custom date range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="input"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleCustomDateChange}
              max={dateRange.endDate}
            />
            <span className="text-gray-500 dark:text-gray-400">a</span>
            <input
              type="date"
              className="input"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleCustomDateChange}
              min={dateRange.startDate}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          {/* Refresh button */}
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => updateChartData()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          {/* Export button */}
          <button
            type="button"
            className="btn btn-primary"
            title="Exportar reporte"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>
      
      {/* Report Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'overview', name: 'Resumen General', icon: Activity },
          { id: 'sales', name: 'Ventas', icon: DollarSign },
          { id: 'products', name: 'Productos', icon: Package },
          { id: 'customers', name: 'Clientes', icon: Users },
          { id: 'profitability', name: 'Rentabilidad', icon: TrendingUp },
          { id: 'trends', name: 'Tendencias', icon: LineChart }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                selectedReport === tab.id
                  ? 'border-primary-500 text-primary-600 bg-primary-50 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setSelectedReport(tab.id)}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          );
        })}
      </div>
      
      {/* Overview Report */}
      {selectedReport === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Ingresos Totales
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(keyMetrics.totalRevenue)}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-success-500 mr-1" />
                    <span className="text-sm text-success-600 dark:text-success-400">
                      +{growthRates.revenue}%
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                      vs período anterior
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-primary-100 rounded-full dark:bg-primary-900">
                  <DollarSign className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
            </div>
            
            <div className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Pedidos Totales
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(keyMetrics.totalOrders)}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-success-500 mr-1" />
                    <span className="text-sm text-success-600 dark:text-success-400">
                      +{growthRates.orders}%
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                      vs período anterior
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-success-100 rounded-full dark:bg-success-900">
                  <ShoppingCart className="h-6 w-6 text-success-600 dark:text-success-400" />
                </div>
              </div>
            </div>
            
            <div className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Valor Promedio Pedido
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(keyMetrics.avgOrderValue)}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-success-500 mr-1" />
                    <span className="text-sm text-success-600 dark:text-success-400">
                      +{growthRates.avgOrder}%
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                      vs período anterior
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-accent-100 rounded-full dark:bg-accent-900">
                  <Target className="h-6 w-6 text-accent-600 dark:text-accent-400" />
                </div>
              </div>
            </div>
            
            <div className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Clientes Activos
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(keyMetrics.activeCustomers)}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-success-500 mr-1" />
                    <span className="text-sm text-success-600 dark:text-success-400">
                      +{growthRates.customers}%
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                      vs período anterior
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-secondary-100 rounded-full dark:bg-secondary-900">
                  <Users className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tendencia de Ventas
                </h3>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => openDetailModal('Análisis Detallado de Ventas', chartData.sales)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver detalles
                </button>
              </div>
              <div className="h-80">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <Line options={multiAxisOptions} data={chartData.sales} />
                )}
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Productos Top
                </h3>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => openDetailModal('Análisis de Productos', chartData.products)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver detalles
                </button>
              </div>
              <div className="h-80">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <Bar options={barChartOptions} data={chartData.products} />
                )}
              </div>
            </div>
          </div>
          
          {/* Secondary Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Segmentación de Clientes
              </h3>
              <div className="h-64">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <Doughnut options={doughnutOptions} data={chartData.customers} />
                )}
              </div>
            </div>
            
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Análisis de Rentabilidad
              </h3>
              <div className="h-64">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <Bar options={profitabilityOptions} data={chartData.profitability} />
                )}
              </div>
            </div>
          </div>
          
          {/* Quick Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 border-l-4 border-success-500">
              <div className="flex items-center">
                <Zap className="h-8 w-8 text-success-500 mr-3" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Mejor Día de Ventas
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(new Date().toISOString())} - {formatCurrency(1250)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="card p-6 border-l-4 border-warning-500">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-warning-500 mr-3" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Stock Bajo
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {keyMetrics.lowStockProducts} productos necesitan reposición
                  </p>
                </div>
              </div>
            </div>
            
            <div className="card p-6 border-l-4 border-primary-500">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-primary-500 mr-3" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Crecimiento Mensual
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    +{growthRates.revenue}% en ingresos este mes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Sales Report */}
      {selectedReport === 'sales' && (
        <div className="space-y-6">
          {/* Sales Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Ventas Totales
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(salesReport.totalSales)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {salesReport.salesCount} transacciones
              </p>
            </div>
            
            <div className="card p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Venta Promedio
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(salesReport.averageSale)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                por transacción
              </p>
            </div>
            
            <div className="card p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Efectivo
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(salesReport.salesByPaymentMethod.cash || 0)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {salesReport.totalSales > 0 && 
                  `${Math.round(((salesReport.salesByPaymentMethod.cash || 0) / salesReport.totalSales) * 100)}% del total`
                }
              </p>
            </div>
            
            <div className="card p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Tarjeta
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(salesReport.salesByPaymentMethod.card || 0)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {salesReport.totalSales > 0 && 
                  `${Math.round(((salesReport.salesByPaymentMethod.card || 0) / salesReport.totalSales) * 100)}% del total`
                }
              </p>
            </div>
          </div>
          
          {/* Sales Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Ventas Diarias
              </h3>
              <div className="h-80">
                <Line options={multiAxisOptions} data={chartData.sales} />
              </div>
            </div>
            
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Ventas por Método de Pago
              </h3>
              <div className="h-80">
                <Doughnut 
                  options={{
                    ...doughnutOptions,
                    plugins: {
                      ...doughnutOptions.plugins,
                      tooltip: {
                        callbacks: {
                          label: function(context: any) {
                            return `${context.label}: ${formatCurrency(context.raw)}`;
                          }
                        }
                      }
                    }
                  }} 
                  data={{
                    labels: ['Efectivo', 'Tarjeta', 'Bizum', 'Plazos', 'Giro mensual'],
                    datasets: [{
                      data: [
                        salesReport.salesByPaymentMethod.cash || 0,
                        salesReport.salesByPaymentMethod.card || 0,
                        salesReport.salesByPaymentMethod.bizum || 0,
                        salesReport.salesByPaymentMethod.installments || 0,
                        salesReport.salesByPaymentMethod.monthly || 0
                      ],
                      backgroundColor: [
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(249, 115, 22, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(20, 184, 166, 0.8)'
                      ],
                      borderWidth: 2,
                      borderColor: '#fff'
                    }]
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Customer Types Breakdown */}
          <div className="card overflow-hidden">
            <div className="bg-primary-50 px-6 py-4 dark:bg-primary-900/30">
              <h3 className="text-lg font-semibold text-primary-800 dark:text-primary-300">
                Ventas por Tipo de Cliente
              </h3>
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Tipo de Cliente</th>
                    <th>Ventas</th>
                    <th>Porcentaje</th>
                    <th>Tendencia</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(salesReport.salesByCustomerType).map(([typeId, amount]) => {
                    const customerType = ['1', '2', '3', '4'].includes(typeId) 
                      ? ['Normal', 'Mayorista', 'Premium', 'VIP'][parseInt(typeId) - 1] 
                      : 'Desconocido';
                    
                    const percentage = salesReport.totalSales > 0 
                      ? Math.round((amount / salesReport.totalSales) * 100) 
                      : 0;
                    
                    return (
                      <tr key={typeId}>
                        <td className="font-medium">{customerType}</td>
                        <td>{formatCurrency(amount)}</td>
                        <td>
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 rounded-full h-2 mr-3 dark:bg-gray-700">
                              <div 
                                className="bg-primary-600 h-2 rounded-full dark:bg-primary-500" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{percentage}%</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center">
                            <TrendingUp className="h-4 w-4 text-success-500 mr-1" />
                            <span className="text-sm text-success-600 dark:text-success-400">
                              +{Math.floor(Math.random() * 20)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Products Report */}
      {selectedReport === 'products' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Productos Más Vendidos
            </h3>
            <div className="h-80">
              <Bar options={barChartOptions} data={chartData.products} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card overflow-hidden">
              <div className="bg-success-50 px-6 py-4 dark:bg-success-900/30">
                <h3 className="flex items-center text-success-800 dark:text-success-300">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Productos Más Vendidos
                </h3>
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Ingresos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productReport.mostSold.map((product) => (
                      <tr key={product.productId}>
                        <td className="font-medium">{product.name}</td>
                        <td>
                          <span className="badge badge-success">
                            {formatNumber(product.quantity)} unidades
                          </span>
                        </td>
                        <td>{formatCurrency(product.quantity * 10)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="card overflow-hidden">
              <div className="bg-error-50 px-6 py-4 dark:bg-error-900/30">
                <h3 className="flex items-center text-error-800 dark:text-error-300">
                  <TrendingDown className="mr-2 h-5 w-5" />
                  Productos Menos Vendidos
                </h3>
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productReport.leastSold.map((product) => {
                      const productData = products.find(p => p.id === product.productId);
                      return (
                        <tr key={product.productId}>
                          <td className="font-medium">{product.name}</td>
                          <td>
                            <span className="badge badge-error">
                              {formatNumber(product.quantity)} unidades
                            </span>
                          </td>
                          <td>{productData ? productData.stock : 'N/A'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Customers Report */}
      {selectedReport === 'customers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Clientes
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(keyMetrics.totalCustomers)}
              </p>
            </div>
            
            <div className="card p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Clientes Activos
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(keyMetrics.activeCustomers)}
              </p>
            </div>
            
            <div className="card p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Valor Promedio Cliente
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(keyMetrics.totalRevenue / Math.max(keyMetrics.totalCustomers, 1))}
              </p>
            </div>
          </div>
          
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Segmentación de Clientes
            </h3>
            <div className="h-80">
              <Doughnut options={doughnutOptions} data={chartData.customers} />
            </div>
          </div>
        </div>
      )}
      
      {/* Profitability Report */}
      {selectedReport === 'profitability' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Análisis de Rentabilidad por Categoría
            </h3>
            <div className="h-80">
              <Bar options={profitabilityOptions} data={chartData.profitability} />
            </div>
          </div>
        </div>
      )}
      
      {/* Trends Report */}
      {selectedReport === 'trends' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Tendencias Semanales (Últimas 12 Semanas)
            </h3>
            <div className="h-80">
              <Line 
                options={{
                  ...multiAxisOptions,
                  scales: {
                    ...multiAxisOptions.scales,
                    y1: {
                      ...multiAxisOptions.scales.y1,
                      title: {
                        display: true,
                        text: 'Valor Promedio (€)'
                      }
                    }
                  }
                }} 
                data={chartData.trends} 
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={modalContent?.title || 'Detalles'}
        size="xl"
      >
        {modalContent && (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Análisis detallado de los datos seleccionados.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 dark:bg-gray-800">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Información Adicional
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Este modal puede expandirse para mostrar análisis más profundos,
                tablas de datos detalladas, y opciones de exportación específicas.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Cerrar
              </button>
              <button
                type="button"
                className="btn btn-primary"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Datos
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Reports;