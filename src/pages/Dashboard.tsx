import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  PackageCheck, 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  UserCheck,
  ShoppingBag
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import { getDailySalesData } from '../utils/reports';
import { Chart, registerables } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register Chart.js components
Chart.register(...registerables);

function Dashboard() {
  const navigate = useNavigate();
  const { 
    products, 
    suppliers, 
    customers,
    purchases,
    sales, 
    isRegisterOpen, 
    getLowStockProducts,
    lowStockThreshold
  } = useAppContext();
  
  // State for chart data
  const [dailySalesData, setDailySalesData] = useState({ labels: [], data: [] });
  const [topProductsData, setTopProductsData] = useState({ labels: [], data: [] });
  
  // Calculate statistics
  const lowStockProducts = getLowStockProducts();
  
  // Total sales amount
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  
  // Total inventory value
  const inventoryValue = products.reduce((sum, product) => {
    return sum + (product.purchasePrice * product.stock);
  }, 0);
  
  // Calculate today's sales
  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(sale => 
    sale.date.startsWith(today)
  ).reduce((sum, sale) => sum + sale.total, 0);
  
  // Calculate yesterday's sales for comparison
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const yesterdaySales = sales.filter(sale => 
    sale.date.startsWith(yesterdayStr)
  ).reduce((sum, sale) => sum + sale.total, 0);
  
  // Calculate sales trend (percentage change)
  const salesTrend = yesterdaySales === 0 
    ? 100 // If yesterday was 0, then it's a 100% increase
    : ((todaySales - yesterdaySales) / yesterdaySales) * 100;
  
  // Calculate total purchases amount
  const totalPurchases = purchases.reduce((sum, purchase) => sum + purchase.total, 0);
  
  // Calculate this month's purchases
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  const monthlyPurchases = purchases.filter(purchase => 
    purchase.date.startsWith(currentMonth)
  ).reduce((sum, purchase) => sum + purchase.total, 0);
  
  // Calculate last month's purchases for comparison
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStr = lastMonth.toISOString().slice(0, 7);
  const lastMonthPurchases = purchases.filter(purchase => 
    purchase.date.startsWith(lastMonthStr)
  ).reduce((sum, purchase) => sum + purchase.total, 0);
  
  // Calculate purchases trend
  const purchasesTrend = lastMonthPurchases === 0 
    ? 100 
    : ((monthlyPurchases - lastMonthPurchases) / lastMonthPurchases) * 100;
  
  // Calculate active customers (customers with purchases in last 3 months)
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const threeMonthsAgoStr = threeMonthsAgo.toISOString();
  
  const activeCustomers = customers.filter(customer => 
    customer.isActive && customer.lastPurchaseDate && 
    customer.lastPurchaseDate >= threeMonthsAgoStr
  ).length;
  
  // Generate chart data
  useEffect(() => {
    // Daily sales chart
    const dailyData = getDailySalesData(sales, 7);
    setDailySalesData({
      labels: dailyData.labels.map(date => {
        const [year, month, day] = date.split('-');
        return `${day}/${month}`;
      }).reverse(),
      data: dailyData.data.reverse()
    });
    
    // Top products chart
    const productSales = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productSales[item.name]) {
          productSales[item.name] = 0;
        }
        productSales[item.name] += item.quantity;
      });
    });
    
    // Get top 5 products
    const topProducts = Object.entries(productSales)
      .sort(([, a], [, b]) => Number(b) - Number(a))
      .slice(0, 5);
    
    setTopProductsData({
      labels: topProducts.map(([name]) => name),
      data: topProducts.map(([, quantity]) => quantity)
    });
  }, [sales]);
  
  // Chart configurations
  const salesChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return formatCurrency(context.raw);
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      }
    }
  };
  
  const productsChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };
  
  const salesChartData = {
    labels: dailySalesData.labels,
    datasets: [
      {
        label: 'Ventas',
        data: dailySalesData.data,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.2,
        fill: true,
      }
    ]
  };
  
  const productsChartData = {
    labels: topProductsData.labels,
    datasets: [
      {
        label: 'Unidades vendidas',
        data: topProductsData.data,
        backgroundColor: 'rgba(20, 184, 166, 0.7)',
        borderColor: 'rgb(13, 148, 136)',
        borderWidth: 1
      }
    ]
  };
  
  return (
    <div className="space-y-6">
      {/* Cash register alert */}
      {!isRegisterOpen && (
        <div className="bg-warning-50 border-l-4 border-warning-500 p-4 dark:bg-warning-900/30 dark:border-warning-600">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-warning-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-warning-700 dark:text-warning-300">
                La caja está cerrada. Debes abrir la caja para registrar ventas.
              </p>
            </div>
            <div className="ml-auto">
              <button
                type="button"
                className="btn btn-warning text-xs px-3 py-1"
                onClick={() => navigate('/caja')}
              >
                Abrir caja
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Stat cards - Reorganized in logical business flow */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Today's sales - Most important metric */}
        <div className="card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-primary-100 p-3 dark:bg-primary-900">
              <DollarSign className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ventas hoy</h3>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(todaySales)}
              </p>
              <div className="mt-1 flex items-center">
                {salesTrend > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-success-500" />
                    <span className="ml-1 text-xs text-success-500">
                      +{salesTrend.toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-error-500" />
                    <span className="ml-1 text-xs text-error-500">
                      {salesTrend.toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                  vs ayer
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Products - Core inventory */}
        <div className="card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-secondary-100 p-3 dark:bg-secondary-900">
              <Package className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Productos</h3>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {products.length}
              </p>
              <div className="mt-1 flex items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Valor: {formatCurrency(inventoryValue)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Customers - Sales relationship */}
        <div className="card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-accent-100 p-3 dark:bg-accent-900">
              <UserCheck className="h-6 w-6 text-accent-600 dark:text-accent-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Clientes</h3>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {customers.length}
              </p>
              <div className="mt-1 flex items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {activeCustomers} activos
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Purchases - Supply chain */}
        <div className="card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-success-100 p-3 dark:bg-success-900">
              <ShoppingBag className="h-6 w-6 text-success-600 dark:text-success-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Compras</h3>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(monthlyPurchases)}
              </p>
              <div className="mt-1 flex items-center">
                {purchasesTrend > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-success-500" />
                    <span className="ml-1 text-xs text-success-500">
                      +{purchasesTrend.toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-error-500" />
                    <span className="ml-1 text-xs text-error-500">
                      {purchasesTrend.toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                  este mes
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Suppliers - Supply chain support */}
        <div className="card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-purple-100 p-3 dark:bg-purple-900">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Proveedores</h3>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {suppliers.length}
              </p>
              <div className="mt-1 flex items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Activos
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Low stock - Alert/warning */}
        <div className="card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-warning-100 p-3 dark:bg-warning-900">
              <PackageCheck className="h-6 w-6 text-warning-600 dark:text-warning-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Stock bajo</h3>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {lowStockProducts.length}
              </p>
              <div className="mt-1 flex items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Umbral: {lowStockThreshold} unidades
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sales trend chart */}
        <div className="card p-5">
          <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white">
            Ventas últimos 7 días
          </h3>
          <div className="h-72">
            <Line options={salesChartOptions} data={salesChartData} />
          </div>
        </div>
        
        {/* Top products chart */}
        <div className="card p-5">
          <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white">
            Productos más vendidos
          </h3>
          <div className="h-72">
            <Bar options={productsChartOptions} data={productsChartData} />
          </div>
        </div>
      </div>
      
      {/* Quick access buttons - Updated order */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <button 
          className="btn btn-outline flex flex-col items-center justify-center py-4"
          onClick={() => navigate('/ventas')}
          disabled={!isRegisterOpen}
        >
          <ShoppingCart className="mb-2 h-6 w-6" />
          <span>Nueva venta</span>
        </button>
        
        <button 
          className="btn btn-outline flex flex-col items-center justify-center py-4"
          onClick={() => navigate('/productos')}
        >
          <Package className="mb-2 h-6 w-6" />
          <span>Productos</span>
        </button>
        
        <button 
          className="btn btn-outline flex flex-col items-center justify-center py-4"
          onClick={() => navigate('/clientes')}
        >
          <UserCheck className="mb-2 h-6 w-6" />
          <span>Clientes</span>
        </button>
        
        <button 
          className="btn btn-outline flex flex-col items-center justify-center py-4"
          onClick={() => navigate('/compras')}
        >
          <ShoppingBag className="mb-2 h-6 w-6" />
          <span>Compras</span>
        </button>
        
        <button 
          className="btn btn-outline flex flex-col items-center justify-center py-4"
          onClick={() => navigate('/proveedores')}
        >
          <Users className="mb-2 h-6 w-6" />
          <span>Proveedores</span>
        </button>
        
        <button 
          className="btn btn-outline flex flex-col items-center justify-center py-4"
          onClick={() => navigate('/caja')}
        >
          <DollarSign className="mb-2 h-6 w-6" />
          <span>Caja</span>
        </button>
      </div>
      
      {/* Low stock alert section */}
      {lowStockProducts.length > 0 && (
        <div className="card overflow-hidden">
          <div className="bg-warning-50 px-5 py-3 dark:bg-warning-900/30">
            <h3 className="flex items-center text-warning-800 dark:text-warning-300">
              <AlertCircle className="mr-2 h-5 w-5" />
              Productos con stock bajo
            </h3>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Producto</th>
                  <th>Stock actual</th>
                  <th>Proveedor</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.slice(0, 5).map((product) => {
                  const supplier = suppliers.find(s => s.id === product.supplierId);
                  return (
                    <tr key={product.id}>
                      <td>{product.code}</td>
                      <td>{product.name}</td>
                      <td>
                        <span className="badge badge-warning">
                          {product.stock} unidades
                        </span>
                      </td>
                      <td>{supplier?.name || 'Sin proveedor'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {lowStockProducts.length > 5 && (
            <div className="border-t border-gray-200 px-5 py-3 text-right dark:border-gray-700">
              <button 
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                onClick={() => navigate('/productos')}
              >
                Ver todos ({lowStockProducts.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;