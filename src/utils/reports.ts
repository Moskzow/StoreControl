import { format, subDays, isWithinInterval, parseISO } from 'date-fns';
import { 
  Sale, 
  Product, 
  Customer,
  DateRange, 
  SalesReport, 
  ProductReport, 
  StockReport,
  PaymentMethod 
} from '../types';

// Get sales for a date range
export function getSalesForRange(sales: Sale[], dateRange: DateRange): Sale[] {
  const startDate = parseISO(dateRange.startDate);
  const endDate = parseISO(dateRange.endDate);
  
  return sales.filter(sale => {
    const saleDate = parseISO(sale.date);
    return isWithinInterval(saleDate, { start: startDate, end: endDate });
  });
}

// Generate sales report
export function generateSalesReport(sales: Sale[], dateRange: DateRange): SalesReport {
  const filteredSales = getSalesForRange(sales, dateRange);
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const salesCount = filteredSales.length;
  
  // Count sales by payment method
  const salesByPaymentMethod: Record<PaymentMethod, number> = {
    cash: 0,
    card: 0,
    bizum: 0,
    installments: 0,
    monthly: 0
  };
  
  // Count sales by customer type
  const salesByCustomerType: Record<string, number> = {};
  
  filteredSales.forEach(sale => {
    // Count by payment method
    salesByPaymentMethod[sale.paymentMethod] += sale.total;
    
    // Count by customer type
    const typeId = sale.customerType.id;
    if (!salesByCustomerType[typeId]) {
      salesByCustomerType[typeId] = 0;
    }
    salesByCustomerType[typeId] += sale.total;
  });
  
  return {
    totalSales,
    salesCount,
    averageSale: salesCount > 0 ? totalSales / salesCount : 0,
    salesByPaymentMethod,
    salesByCustomerType
  };
}

// Generate advanced sales report with more metrics
export function generateAdvancedSalesReport(sales: Sale[], dateRange: DateRange) {
  const filteredSales = getSalesForRange(sales, dateRange);
  const basicReport = generateSalesReport(sales, dateRange);
  
  // Calculate additional metrics
  const salesByHour = Array(24).fill(0);
  const salesByDayOfWeek = Array(7).fill(0);
  const salesByMonth = {};
  
  filteredSales.forEach(sale => {
    const saleDate = new Date(sale.date);
    
    // Sales by hour
    salesByHour[saleDate.getHours()] += sale.total;
    
    // Sales by day of week (0 = Sunday)
    salesByDayOfWeek[saleDate.getDay()] += sale.total;
    
    // Sales by month
    const monthKey = format(saleDate, 'yyyy-MM');
    if (!salesByMonth[monthKey]) {
      salesByMonth[monthKey] = 0;
    }
    salesByMonth[monthKey] += sale.total;
  });
  
  return {
    ...basicReport,
    salesByHour,
    salesByDayOfWeek,
    salesByMonth,
    peakHour: salesByHour.indexOf(Math.max(...salesByHour)),
    peakDay: salesByDayOfWeek.indexOf(Math.max(...salesByDayOfWeek))
  };
}

// Generate product sales report
export function generateProductReport(sales: Sale[], dateRange: DateRange): ProductReport {
  const filteredSales = getSalesForRange(sales, dateRange);
  
  // Count total quantity sold for each product
  const productSales: Record<string, { productId: string, name: string, quantity: number }> = {};
  
  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = {
          productId: item.productId,
          name: item.name,
          quantity: 0
        };
      }
      productSales[item.productId].quantity += item.quantity;
    });
  });
  
  // Convert to array and sort
  const productSalesArray = Object.values(productSales);
  const sortedBySales = [...productSalesArray].sort((a, b) => b.quantity - a.quantity);
  
  return {
    mostSold: sortedBySales.slice(0, 5), // Top 5 most sold
    leastSold: [...sortedBySales].reverse().slice(0, 5) // Top 5 least sold
  };
}

// Generate customer report
export function generateCustomerReport(sales: Sale[], customers: Customer[], dateRange: DateRange) {
  const filteredSales = getSalesForRange(sales, dateRange);
  
  // Customer metrics
  const customerMetrics = {
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => c.isActive).length,
    newCustomers: 0,
    returningCustomers: 0,
    averageOrderValue: 0,
    customerLifetimeValue: 0
  };
  
  // Customer segmentation
  const segments = {
    new: customers.filter(c => c.totalPurchases === 0).length,
    regular: customers.filter(c => c.totalPurchases > 0 && c.totalPurchases < 500).length,
    vip: customers.filter(c => c.totalPurchases >= 500).length,
    inactive: customers.filter(c => {
      if (!c.lastPurchaseDate) return true;
      const lastPurchase = new Date(c.lastPurchaseDate);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return lastPurchase < threeMonthsAgo;
    }).length
  };
  
  // Calculate customer acquisition and retention
  const uniqueCustomers = new Set(filteredSales.map(sale => sale.customerId).filter(Boolean));
  customerMetrics.returningCustomers = uniqueCustomers.size;
  
  // Calculate average order value
  if (filteredSales.length > 0) {
    customerMetrics.averageOrderValue = filteredSales.reduce((sum, sale) => sum + sale.total, 0) / filteredSales.length;
  }
  
  // Calculate customer lifetime value
  if (customers.length > 0) {
    customerMetrics.customerLifetimeValue = customers.reduce((sum, customer) => sum + customer.totalPurchases, 0) / customers.length;
  }
  
  return {
    ...customerMetrics,
    segments,
    topCustomers: customers
      .sort((a, b) => b.totalPurchases - a.totalPurchases)
      .slice(0, 10)
  };
}

// Generate profitability report
export function generateProfitabilityReport(sales: Sale[], products: Product[], dateRange: DateRange) {
  const filteredSales = getSalesForRange(sales, dateRange);
  
  const profitability = {
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    profitMargin: 0,
    profitByCategory: {},
    profitByProduct: {}
  };
  
  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const revenue = item.price * item.quantity;
        const cost = product.purchasePrice * item.quantity;
        const profit = revenue - cost;
        
        profitability.totalRevenue += revenue;
        profitability.totalCost += cost;
        profitability.totalProfit += profit;
        
        // Profit by category
        const category = product.category || 'Sin categoría';
        if (!profitability.profitByCategory[category]) {
          profitability.profitByCategory[category] = { revenue: 0, cost: 0, profit: 0 };
        }
        profitability.profitByCategory[category].revenue += revenue;
        profitability.profitByCategory[category].cost += cost;
        profitability.profitByCategory[category].profit += profit;
        
        // Profit by product
        if (!profitability.profitByProduct[item.productId]) {
          profitability.profitByProduct[item.productId] = {
            name: item.name,
            revenue: 0,
            cost: 0,
            profit: 0,
            quantity: 0
          };
        }
        profitability.profitByProduct[item.productId].revenue += revenue;
        profitability.profitByProduct[item.productId].cost += cost;
        profitability.profitByProduct[item.productId].profit += profit;
        profitability.profitByProduct[item.productId].quantity += item.quantity;
      }
    });
  });
  
  // Calculate profit margin
  if (profitability.totalRevenue > 0) {
    profitability.profitMargin = (profitability.totalProfit / profitability.totalRevenue) * 100;
  }
  
  return profitability;
}

// Generate stock report
export function generateStockReport(products: Product[], lowStockThreshold: number): StockReport {
  const lowStockProducts = products.filter(product => {
    const threshold = product.lowStockThreshold !== undefined 
      ? product.lowStockThreshold 
      : lowStockThreshold;
    return product.stock <= threshold;
  });
  
  // Calculate total inventory value
  const totalValue = products.reduce((sum, product) => {
    return sum + (product.purchasePrice * product.stock);
  }, 0);
  
  // Calculate stock turnover and other metrics
  const stockMetrics = {
    totalProducts: products.length,
    totalValue,
    lowStockCount: lowStockProducts.length,
    outOfStockCount: products.filter(p => p.stock === 0).length,
    averageStockValue: products.length > 0 ? totalValue / products.length : 0,
    stockByCategory: {}
  };
  
  // Group stock by category
  products.forEach(product => {
    const category = product.category || 'Sin categoría';
    if (!stockMetrics.stockByCategory[category]) {
      stockMetrics.stockByCategory[category] = {
        count: 0,
        totalStock: 0,
        totalValue: 0
      };
    }
    stockMetrics.stockByCategory[category].count++;
    stockMetrics.stockByCategory[category].totalStock += product.stock;
    stockMetrics.stockByCategory[category].totalValue += product.purchasePrice * product.stock;
  });
  
  return {
    lowStock: lowStockProducts,
    totalProducts: products.length,
    totalValue,
    ...stockMetrics
  };
}

// Get predefined date ranges
export function getLastNDaysRange(days: number): DateRange {
  const endDate = new Date();
  const startDate = subDays(endDate, days);
  
  return {
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd')
  };
}

// Generate daily sales for chart
export function getDailySalesData(sales: Sale[], days: number = 7) {
  const dateRange = getLastNDaysRange(days);
  const filteredSales = getSalesForRange(sales, dateRange);
  
  // Create a map of days
  const salesByDay: Record<string, number> = {};
  
  // Initialize all days in the range with 0
  for (let i = 0; i <= days; i++) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    salesByDay[date] = 0;
  }
  
  // Fill in actual sales data
  filteredSales.forEach(sale => {
    const saleDate = format(parseISO(sale.date), 'yyyy-MM-dd');
    if (salesByDay[saleDate] !== undefined) {
      salesByDay[saleDate] += sale.total;
    }
  });
  
  // Convert to array for charts
  const labels = Object.keys(salesByDay).sort();
  const data = labels.map(date => salesByDay[date]);
  
  return { labels, data };
}

// Generate comparative analysis
export function generateComparativeAnalysis(sales: Sale[], dateRange: DateRange, comparisonRange: DateRange) {
  const currentPeriodSales = getSalesForRange(sales, dateRange);
  const comparisonPeriodSales = getSalesForRange(sales, comparisonRange);
  
  const currentMetrics = generateSalesReport(sales, dateRange);
  const comparisonMetrics = generateSalesReport(sales, comparisonRange);
  
  const growth = {
    revenue: calculateGrowthRate(currentMetrics.totalSales, comparisonMetrics.totalSales),
    orders: calculateGrowthRate(currentMetrics.salesCount, comparisonMetrics.salesCount),
    avgOrder: calculateGrowthRate(currentMetrics.averageSale, comparisonMetrics.averageSale)
  };
  
  return {
    current: currentMetrics,
    comparison: comparisonMetrics,
    growth
  };
}

// Helper function to calculate growth rate
function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// Generate forecast based on historical data
export function generateForecast(sales: Sale[], days: number = 30) {
  // Simple linear regression forecast
  const dailySales = getDailySalesData(sales, 90); // Use last 90 days for forecast
  
  // Calculate trend
  const trend = calculateTrend(dailySales.data);
  
  // Generate forecast for next 'days' days
  const forecast = [];
  const lastValue = dailySales.data[dailySales.data.length - 1] || 0;
  
  for (let i = 1; i <= days; i++) {
    const forecastValue = Math.max(0, lastValue + (trend * i));
    forecast.push(forecastValue);
  }
  
  return {
    forecast,
    trend,
    confidence: calculateForecastConfidence(dailySales.data)
  };
}

// Helper function to calculate trend
function calculateTrend(data: number[]): number {
  if (data.length < 2) return 0;
  
  const n = data.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = data.reduce((sum, value) => sum + value, 0);
  const sumXY = data.reduce((sum, value, index) => sum + (value * index), 0);
  const sumX2 = data.reduce((sum, _, index) => sum + (index * index), 0);
  
  return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
}

// Helper function to calculate forecast confidence
function calculateForecastConfidence(data: number[]): number {
  // Simple confidence calculation based on data variance
  if (data.length < 2) return 0;
  
  const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
  const variance = data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / data.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Return confidence as percentage (lower variance = higher confidence)
  const coefficientOfVariation = mean > 0 ? standardDeviation / mean : 1;
  return Math.max(0, Math.min(100, (1 - coefficientOfVariation) * 100));
}