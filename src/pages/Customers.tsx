import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash, 
  Edit, 
  Search, 
  Mail, 
  Phone, 
  User, 
  UserPlus, 
  Star, 
  Crown, 
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Calendar,
  MapPin,
  CreditCard,
  Settings,
  Eye,
  Award,
  Zap,
  Filter,
  ArrowUpRight,
  Building2,
  UserCheck
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Customer, CustomerType } from '../types';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import { formatCurrency, formatDate } from '../utils/formatters';

function Customers() {
  const { 
    customers, 
    customerTypes,
    sales,
    addCustomer, 
    updateCustomer, 
    deleteCustomer,
    addCustomerType,
    updateCustomerType,
    deleteCustomerType
  } = useAppContext();
  
  // State for customer list
  const [filteredCustomers, setFilteredCustomers] = useState(customers);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterSegment, setFilterSegment] = useState('');
  const [filterCustomerType, setFilterCustomerType] = useState('');
  
  // State for customer modal
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCustomerTypeModalOpen, setIsCustomerTypeModalOpen] = useState(false);
  const [isDeleteTypeModalOpen, setIsDeleteTypeModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [currentCustomerType, setCurrentCustomerType] = useState<CustomerType | null>(null);
  const [activeTab, setActiveTab] = useState<'customers' | 'types'>('customers');
  
  // Customer segmentation
  const getCustomerSegment = (customer: Customer) => {
    if (customer.totalPurchases === 0) return 'new';
    if (customer.totalPurchases < 300) return 'regular';
    if (customer.totalPurchases < 1000) return 'premium';
    return 'vip';
  };
  
  const getSegmentInfo = (segment: string) => {
    const segments = {
      new: { name: 'Nuevos', icon: UserPlus, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300', range: '€0' },
      regular: { name: 'Habituales', icon: User, color: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300', range: '€0-300' },
      premium: { name: 'Premium', icon: Star, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300', range: '€300-1000' },
      vip: { name: 'VIP', icon: Crown, color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300', range: '+€1000' }
    };
    return segments[segment] || segments.new;
  };
  
  // Calculate metrics
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.isActive).length;
  const newCustomersThisMonth = customers.filter(c => {
    const createdDate = new Date(c.createdAt);
    const thisMonth = new Date();
    return createdDate.getMonth() === thisMonth.getMonth() && 
           createdDate.getFullYear() === thisMonth.getFullYear();
  }).length;
  
  const vipCustomers = customers.filter(c => getCustomerSegment(c) === 'vip').length;
  const averageCustomerValue = totalCustomers > 0 
    ? customers.reduce((sum, c) => sum + c.totalPurchases, 0) / totalCustomers 
    : 0;
  
  const customerRetentionRate = totalCustomers > 0 
    ? (customers.filter(c => c.lastPurchaseDate && 
        new Date(c.lastPurchaseDate) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)).length / totalCustomers) * 100 
    : 0;
  
  // Segment distribution
  const segmentDistribution = {
    new: customers.filter(c => getCustomerSegment(c) === 'new').length,
    regular: customers.filter(c => getCustomerSegment(c) === 'regular').length,
    premium: customers.filter(c => getCustomerSegment(c) === 'premium').length,
    vip: customers.filter(c => getCustomerSegment(c) === 'vip').length
  };
  
  // Filter and sort customers
  useEffect(() => {
    let result = [...customers];
    
    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        customer => 
          customer.name.toLowerCase().includes(lowerSearchTerm) || 
          customer.email.toLowerCase().includes(lowerSearchTerm) ||
          customer.phone.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Apply segment filter
    if (filterSegment) {
      result = result.filter(customer => getCustomerSegment(customer) === filterSegment);
    }
    
    // Apply customer type filter
    if (filterCustomerType) {
      result = result.filter(customer => customer.customerTypeId === filterCustomerType);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortField === 'totalPurchases') {
        return sortDirection === 'asc' 
          ? a.totalPurchases - b.totalPurchases 
          : b.totalPurchases - a.totalPurchases;
      } else if (sortField === 'lastPurchaseDate') {
        const aDate = a.lastPurchaseDate ? new Date(a.lastPurchaseDate).getTime() : 0;
        const bDate = b.lastPurchaseDate ? new Date(b.lastPurchaseDate).getTime() : 0;
        return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
      }
      return 0;
    });
    
    setFilteredCustomers(result);
    setCurrentPage(1);
  }, [customers, searchTerm, sortField, sortDirection, filterSegment, filterCustomerType]);
  
  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
  
  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Initialize new customer
  const initNewCustomer = () => {
    setCurrentCustomer({
      id: Date.now().toString(),
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      customerType: 'individual',
      customerTypeId: customerTypes[0]?.id || '',
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalPurchases: 0,
      isActive: true
    });
    setIsCustomerModalOpen(true);
  };
  
  // Initialize new customer type
  const initNewCustomerType = () => {
    setCurrentCustomerType({
      id: Date.now().toString(),
      name: '',
      profitMargin: 0.20,
      description: '',
      minPurchaseAmount: 0,
      benefits: [],
      color: '#3B82F6'
    });
    setIsCustomerTypeModalOpen(true);
  };
  
  // Edit customer
  const handleEditCustomer = (customer: Customer) => {
    setCurrentCustomer({ ...customer });
    setIsCustomerModalOpen(true);
  };
  
  // Edit customer type
  const handleEditCustomerType = (customerType: CustomerType) => {
    setCurrentCustomerType({ ...customerType });
    setIsCustomerTypeModalOpen(true);
  };
  
  // View customer details
  const handleViewCustomer = (customer: Customer) => {
    setCurrentCustomer(customer);
    setIsDetailModalOpen(true);
  };
  
  // Delete customer
  const handleDeleteCustomer = (customer: Customer) => {
    setCurrentCustomer(customer);
    setIsDeleteModalOpen(true);
  };
  
  // Delete customer type
  const handleDeleteCustomerType = (customerType: CustomerType) => {
    setCurrentCustomerType(customerType);
    setIsDeleteTypeModalOpen(true);
  };
  
  // Confirm delete customer
  const confirmDeleteCustomer = () => {
    if (currentCustomer) {
      deleteCustomer(currentCustomer.id);
      setIsDeleteModalOpen(false);
    }
  };
  
  // Confirm delete customer type
  const confirmDeleteCustomerType = () => {
    if (currentCustomerType) {
      deleteCustomerType(currentCustomerType.id);
      setIsDeleteTypeModalOpen(false);
    }
  };
  
  // Save customer
  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentCustomer) {
      const updatedCustomer = {
        ...currentCustomer,
        updatedAt: new Date().toISOString()
      };
      
      if (customers.some(c => c.id === currentCustomer.id)) {
        updateCustomer(updatedCustomer);
      } else {
        addCustomer(updatedCustomer);
      }
      
      setIsCustomerModalOpen(false);
    }
  };
  
  // Save customer type
  const handleSaveCustomerType = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentCustomerType) {
      if (customerTypes.some(ct => ct.id === currentCustomerType.id)) {
        updateCustomerType(currentCustomerType);
      } else {
        addCustomerType(currentCustomerType);
      }
      
      setIsCustomerTypeModalOpen(false);
    }
  };
  
  // Handle customer form changes
  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setCurrentCustomer(prev => prev ? {
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    } : null);
  };
  
  // Handle customer type form changes
  const handleCustomerTypeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setCurrentCustomerType(prev => prev ? {
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    } : null);
  };
  
  // Get customer type name
  const getCustomerTypeName = (customerTypeId?: string) => {
    if (!customerTypeId) return 'Sin tipo';
    const customerType = customerTypes.find(ct => ct.id === customerTypeId);
    return customerType?.name || 'Tipo desconocido';
  };
  
  // Get customer sales
  const getCustomerSales = (customerId: string) => {
    return sales.filter(sale => sale.customerId === customerId);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestión de Clientes
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Administra clientes y tipos de cliente con precios diferenciados
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1 dark:bg-gray-800">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'customers'
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('customers')}
            >
              <Users className="h-4 w-4 mr-2 inline" />
              Clientes
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'types'
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('types')}
            >
              <Settings className="h-4 w-4 mr-2 inline" />
              Tipos de Cliente
            </button>
          </div>
          
          {activeTab === 'customers' ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={initNewCustomer}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Cliente
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={initNewCustomerType}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Tipo
            </button>
          )}
        </div>
      </div>
      
      {activeTab === 'customers' ? (
        <>
          {/* Analytics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <div className="card p-6 hover:shadow-lg transition-all duration-200 border-l-4 border-primary-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Clientes
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalCustomers}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-success-500 mr-1" />
                    <span className="text-sm text-success-600 dark:text-success-400">
                      +{newCustomersThisMonth} este mes
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-primary-100 rounded-full dark:bg-primary-900">
                  <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
            </div>
            
            <div className="card p-6 hover:shadow-lg transition-all duration-200 border-l-4 border-success-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Clientes Activos
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {activeCustomers}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {totalCustomers > 0 ? Math.round((activeCustomers / totalCustomers) * 100) : 0}% del total
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-success-100 rounded-full dark:bg-success-900">
                  <UserCheck className="h-6 w-6 text-success-600 dark:text-success-400" />
                </div>
              </div>
            </div>
            
            <div className="card p-6 hover:shadow-lg transition-all duration-200 border-l-4 border-warning-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Clientes VIP
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {vipCustomers}
                  </p>
                  <div className="flex items-center mt-2">
                    <Crown className="h-4 w-4 text-warning-500 mr-1" />
                    <span className="text-sm text-warning-600 dark:text-warning-400">
                      Elite
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-warning-100 rounded-full dark:bg-warning-900">
                  <Crown className="h-6 w-6 text-warning-600 dark:text-warning-400" />
                </div>
              </div>
            </div>
            
            <div className="card p-6 hover:shadow-lg transition-all duration-200 border-l-4 border-accent-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Valor Promedio
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(averageCustomerValue)}
                  </p>
                  <div className="flex items-center mt-2">
                    <DollarSign className="h-4 w-4 text-accent-500 mr-1" />
                    <span className="text-sm text-accent-600 dark:text-accent-400">
                      CLV
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-accent-100 rounded-full dark:bg-accent-900">
                  <Target className="h-6 w-6 text-accent-600 dark:text-accent-400" />
                </div>
              </div>
            </div>
            
            <div className="card p-6 hover:shadow-lg transition-all duration-200 border-l-4 border-secondary-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Retención
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {customerRetentionRate.toFixed(1)}%
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Últimos 90 días
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-secondary-100 rounded-full dark:bg-secondary-900">
                  <Zap className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
                </div>
              </div>
            </div>
            
            <div className="card p-6 hover:shadow-lg transition-all duration-200 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Tipos de Cliente
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {customerTypes.length}
                  </p>
                  <div className="flex items-center mt-2">
                    <Award className="h-4 w-4 text-purple-500 mr-1" />
                    <span className="text-sm text-purple-600 dark:text-purple-400">
                      Configurados
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-full dark:bg-purple-900">
                  <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Segment Distribution */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Distribución por Segmentos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(segmentDistribution).map(([segment, count]) => {
                const segmentInfo = getSegmentInfo(segment);
                const Icon = segmentInfo.icon;
                const percentage = totalCustomers > 0 ? (count / totalCustomers) * 100 : 0;
                
                return (
                  <div key={segment} className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-lg ${segmentInfo.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="font-medium text-gray-900 dark:text-white">{segmentInfo.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{segmentInfo.range}</p>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
                      <div 
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-600" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Filters and Search */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="input pl-10"
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3">
              <div className="w-48">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Filter className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    className="select pl-10"
                    value={filterSegment}
                    onChange={(e) => setFilterSegment(e.target.value)}
                  >
                    <option value="">Todos los segmentos</option>
                    <option value="new">Nuevos</option>
                    <option value="regular">Habituales</option>
                    <option value="premium">Premium</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>
              </div>
              
              <div className="w-48">
                <select
                  className="select"
                  value={filterCustomerType}
                  onChange={(e) => setFilterCustomerType(e.target.value)}
                >
                  <option value="">Todos los tipos</option>
                  {customerTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Customer List */}
          {filteredCustomers.length === 0 ? (
            <EmptyState
              title="No hay clientes"
              description={searchTerm || filterSegment || filterCustomerType ? "No hay clientes que coincidan con los filtros aplicados." : "Comienza agregando tu primer cliente."}
              action={
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={initNewCustomer}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Cliente
                </button>
              }
            />
          ) : (
            <div className="card overflow-hidden">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th 
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center">
                          <span>Cliente</span>
                          {sortField === 'name' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th>Contacto</th>
                      <th>Segmento</th>
                      <th>Tipo</th>
                      <th 
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => handleSort('totalPurchases')}
                      >
                        <div className="flex items-center">
                          <span>Total Compras</span>
                          {sortField === 'totalPurchases' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => handleSort('lastPurchaseDate')}
                      >
                        <div className="flex items-center">
                          <span>Última Compra</span>
                          {sortField === 'lastPurchaseDate' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((customer) => {
                      const segment = getCustomerSegment(customer);
                      const segmentInfo = getSegmentInfo(segment);
                      const Icon = segmentInfo.icon;
                      
                      return (
                        <tr key={customer.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td>
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-full ${segmentInfo.color}`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {customer.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {customer.customerType === 'business' ? (
                                    <div className="flex items-center">
                                      <Building2 className="h-3 w-3 mr-1" />
                                      Empresa
                                    </div>
                                  ) : (
                                    <div className="flex items-center">
                                      <User className="h-3 w-3 mr-1" />
                                      Particular
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <Mail className="h-3 w-3 mr-1 text-gray-400" />
                                <a href={`mailto:${customer.email}`} className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                                  {customer.email}
                                </a>
                              </div>
                              <div className="flex items-center text-sm">
                                <Phone className="h-3 w-3 mr-1 text-gray-400" />
                                <a href={`tel:${customer.phone}`} className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                                  {customer.phone}
                                </a>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${segmentInfo.color}`}>
                              <Icon className="h-3 w-3 mr-1" />
                              {segmentInfo.name}
                            </span>
                          </td>
                          <td>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {getCustomerTypeName(customer.customerTypeId)}
                            </span>
                          </td>
                          <td>
                            <div className="text-sm">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {formatCurrency(customer.totalPurchases)}
                              </div>
                              <div className="text-gray-500 dark:text-gray-400">
                                {getCustomerSales(customer.id).length} pedidos
                              </div>
                            </div>
                          </td>
                          <td>
                            {customer.lastPurchaseDate ? (
                              <div className="text-sm">
                                <div className="text-gray-900 dark:text-white">
                                  {formatDate(customer.lastPurchaseDate)}
                                </div>
                                <div className="text-gray-500 dark:text-gray-400">
                                  {Math.floor((Date.now() - new Date(customer.lastPurchaseDate).getTime()) / (1000 * 60 * 60 * 24))} días
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500">Sin compras</span>
                            )}
                          </td>
                          <td>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              customer.isActive 
                                ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                            }`}>
                              {customer.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                className="rounded p-1 text-gray-500 hover:bg-primary-100 hover:text-primary-700 dark:text-gray-400 dark:hover:bg-primary-900 dark:hover:text-primary-300"
                                onClick={() => handleViewCustomer(customer)}
                                title="Ver detalles"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                                onClick={() => handleEditCustomer(customer)}
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                className="rounded p-1 text-gray-500 hover:bg-error-100 hover:text-error-700 dark:text-gray-400 dark:hover:bg-error-900 dark:hover:text-error-300"
                                onClick={() => handleDeleteCustomer(customer)}
                                title="Eliminar"
                              >
                                <Trash className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredCustomers.length / itemsPerPage)}
                onPageChange={setCurrentPage}
                showingText={`Mostrando ${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, filteredCustomers.length)} de ${filteredCustomers.length} clientes`}
              />
            </div>
          )}
        </>
      ) : (
        <>
          {/* Customer Types Management */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tipos de Cliente Configurados
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Aministra tipos de clientes y márgenes de beneficio
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {customerTypes.map((customerType) => {
                const customersOfType = customers.filter(c => c.customerTypeId === customerType.id).length;
                
                return (
                  <div key={customerType.id} className="relative group">
                    <div className="card p-6 hover:shadow-lg transition-all duration-200 border-l-4" style={{ borderLeftColor: customerType.color || '#3B82F6' }}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {customerType.name}
                          </h4>
                          {customerType.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {customerType.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                            onClick={() => handleEditCustomerType(customerType)}
                            title="Editar tipo"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="rounded p-1 text-gray-500 hover:bg-error-100 hover:text-error-700 dark:text-gray-400 dark:hover:bg-error-900 dark:hover:text-error-300"
                            onClick={() => handleDeleteCustomerType(customerType)}
                            title="Eliminar tipo"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Margen de beneficio:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {(customerType.profitMargin * 100).toFixed(1)}%
                          </span>
                        </div>
                        
                        {customerType.minPurchaseAmount && customerType.minPurchaseAmount > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Compra mínima:</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatCurrency(customerType.minPurchaseAmount)}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Clientes:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {customersOfType}
                          </span>
                        </div>
                        
                        {customerType.benefits && customerType.benefits.length > 0 && (
                          <div className="mt-3">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Beneficios:</span>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {customerType.benefits.slice(0, 2).map((benefit, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                  {benefit}
                                </span>
                              ))}
                              {customerType.benefits.length > 2 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                  +{customerType.benefits.length - 2} más
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
      
      {/* Customer Modal */}
      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title={currentCustomer && customers.some(c => c.id === currentCustomer.id) ? "Editar Cliente" : "Nuevo Cliente"}
        size="lg"
      >
        {currentCustomer && (
          <form onSubmit={handleSaveCustomer}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Información Personal
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="input mt-1"
                    value={currentCustomer.name}
                    onChange={handleCustomerChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="input mt-1"
                    value={currentCustomer.email}
                    onChange={handleCustomerChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="input mt-1"
                    value={currentCustomer.phone}
                    onChange={handleCustomerChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tipo de cliente
                  </label>
                  <select
                    name="customerType"
                    className="select mt-1"
                    value={currentCustomer.customerType}
                    onChange={handleCustomerChange}
                  >
                    <option value="individual">Particular</option>
                    <option value="business">Empresa</option>
                  </select>
                </div>
                
                {currentCustomer.customerType === 'business' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      NIF/CIF
                    </label>
                    <input
                      type="text"
                      name="taxId"
                      className="input mt-1"
                      value={currentCustomer.taxId || ''}
                      onChange={handleCustomerChange}
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Información Comercial
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tipo de cliente *
                  </label>
                  <select
                    name="customerTypeId"
                    className="select mt-1"
                    value={currentCustomer.customerTypeId || ''}
                    onChange={handleCustomerChange}
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    {customerTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name} ({(type.profitMargin * 100).toFixed(1)}% margen)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Método de pago preferido
                  </label>
                  <select
                    name="preferredPaymentMethod"
                    className="select mt-1"
                    value={currentCustomer.preferredPaymentMethod || ''}
                    onChange={handleCustomerChange}
                  >
                    <option value="">Sin preferencia</option>
                    <option value="cash">Efectivo</option>
                    <option value="card">Tarjeta</option>
                    <option value="bizum">Bizum</option>
                    <option value="installments">Plazos</option>
                    <option value="monthly">Giro mensual</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Límite de crédito
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500">€</span>
                    </div>
                    <input
                      type="number"
                      name="creditLimit"
                      className="input pl-7"
                      min="0"
                      step="0.01"
                      value={currentCustomer.creditLimit || ''}
                      onChange={handleCustomerChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Dirección
                  </label>
                  <input
                    type="text"
                    name="address"
                    className="input mt-1"
                    value={currentCustomer.address}
                    onChange={handleCustomerChange}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      name="city"
                      className="input mt-1"
                      value={currentCustomer.city}
                      onChange={handleCustomerChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Código postal
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      className="input mt-1"
                      value={currentCustomer.postalCode}
                      onChange={handleCustomerChange}
                    />
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notas
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  className="input mt-1"
                  value={currentCustomer.notes}
                  onChange={handleCustomerChange}
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsCustomerModalOpen(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Guardar
              </button>
            </div>
          </form>
        )}
      </Modal>
      
      {/* Customer Type Modal */}
      <Modal
        isOpen={isCustomerTypeModalOpen}
        onClose={() => setIsCustomerTypeModalOpen(false)}
        title={currentCustomerType && customerTypes.some(ct => ct.id === currentCustomerType.id) ? "Editar Tipo de Cliente" : "Nuevo Tipo de Cliente"}
        size="md"
      >
        {currentCustomerType && (
          <form onSubmit={handleSaveCustomerType}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre del tipo *
                </label>
                <input
                  type="text"
                  name="name"
                  className="input mt-1"
                  value={currentCustomerType.name}
                  onChange={handleCustomerTypeChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Margen de beneficio *
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    type="number"
                    name="profitMargin"
                    className="input pr-8"
                    min="0"
                    max="1"
                    step="0.01"
                    value={currentCustomerType.profitMargin}
                    onChange={handleCustomerTypeChange}
                    required
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500">%</span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Ejemplo: 0.20 = 20% de margen
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Descripción
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="input mt-1"
                  value={currentCustomerType.description || ''}
                  onChange={handleCustomerTypeChange}
                  placeholder="Descripción del tipo de cliente..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Compra mínima para calificar
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500">€</span>
                  </div>
                  <input
                    type="number"
                    name="minPurchaseAmount"
                    className="input pl-7"
                    min="0"
                    step="0.01"
                    value={currentCustomerType.minPurchaseAmount || ''}
                    onChange={handleCustomerTypeChange}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Color de identificación
                </label>
                <input
                  type="color"
                  name="color"
                  className="mt-1 h-10 w-20 rounded border border-gray-300 dark:border-gray-600"
                  value={currentCustomerType.color || '#3B82F6'}
                  onChange={handleCustomerTypeChange}
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsCustomerTypeModalOpen(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Guardar
              </button>
            </div>
          </form>
        )}
      </Modal>
      
      {/* Customer Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detalles del Cliente"
        size="xl"
      >
        {currentCustomer && (
          <div className="space-y-6">
            {/* Customer Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${getSegmentInfo(getCustomerSegment(currentCustomer)).color}`}>
                  {React.createElement(getSegmentInfo(getCustomerSegment(currentCustomer)).icon, { className: "h-6 w-6" })}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {currentCustomer.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {getSegmentInfo(getCustomerSegment(currentCustomer)).name} • {getCustomerTypeName(currentCustomer.customerTypeId)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleEditCustomer(currentCustomer);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </button>
            </div>
            
            {/* Customer Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Compras</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(currentCustomer.totalPurchases)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-primary-500" />
                </div>
              </div>
              
              <div className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Número de Pedidos</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {getCustomerSales(currentCustomer.id).length}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-success-500" />
                </div>
              </div>
              
              <div className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Última Compra</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {currentCustomer.lastPurchaseDate 
                        ? `${Math.floor((Date.now() - new Date(currentCustomer.lastPurchaseDate).getTime()) / (1000 * 60 * 60 * 24))} días`
                        : 'Nunca'
                      }
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-accent-500" />
                </div>
              </div>
            </div>
            
            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  Información de Contacto
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <a href={`mailto:${currentCustomer.email}`} className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                      {currentCustomer.email}
                    </a>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a href={`tel:${currentCustomer.phone}`} className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                      {currentCustomer.phone}
                    </a>
                  </div>
                  
                  {currentCustomer.address && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-gray-900 dark:text-white">{currentCustomer.address}</p>
                        {(currentCustomer.city || currentCustomer.postalCode) && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {currentCustomer.city} {currentCustomer.postalCode}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {currentCustomer.preferredPaymentMethod && (
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {currentCustomer.preferredPaymentMethod === 'cash' && 'Efectivo'}
                        {currentCustomer.preferredPaymentMethod === 'card' && 'Tarjeta'}
                        {currentCustomer.preferredPaymentMethod === 'bizum' && 'Bizum'}
                        {currentCustomer.preferredPaymentMethod === 'installments' && 'Plazos'}
                        {currentCustomer.preferredPaymentMethod === 'monthly' && 'Giro mensual'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  Información Comercial
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Tipo de cliente:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {getCustomerTypeName(currentCustomer.customerTypeId)}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Segmento:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {getSegmentInfo(getCustomerSegment(currentCustomer)).name}
                    </p>
                  </div>
                  
                  {currentCustomer.creditLimit && (
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Límite de crédito:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(currentCustomer.creditLimit)}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Estado:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${
                      currentCustomer.isActive 
                        ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                    }`}>
                      {currentCustomer.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Orders */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Pedidos Recientes
              </h4>
              
              {getCustomerSales(currentCustomer.id).length > 0 ? (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Total</th>
                        <th>Método de Pago</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getCustomerSales(currentCustomer.id)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 5)
                        .map((sale) => (
                          <tr key={sale.id}>
                            <td>{formatDate(sale.date, true)}</td>
                            <td>{formatCurrency(sale.total)}</td>
                            <td>
                              {sale.paymentMethod === 'cash' && 'Efectivo'}
                              {sale.paymentMethod === 'card' && 'Tarjeta'}
                              {sale.paymentMethod === 'bizum' && 'Bizum'}
                              {sale.paymentMethod === 'installments' && 'Plazos'}
                              {sale.paymentMethod === 'monthly' && 'Giro mensual'}
                            </td>
                            <td>
                              <span className="badge badge-success">Completado</span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  Este cliente aún no ha realizado ningún pedido.
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>
      
      {/* Delete Customer Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar eliminación"
        size="sm"
      >
        {currentCustomer && (
          <div>
            <p className="text-gray-700 dark:text-gray-300">
              ¿Estás seguro de que deseas eliminar el cliente <strong>{currentCustomer.name}</strong>?
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Esta acción no se puede deshacer.
            </p>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-error"
                onClick={confirmDeleteCustomer}
              >
                Eliminar
              </button>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Delete Customer Type Modal */}
      <Modal
        isOpen={isDeleteTypeModalOpen}
        onClose={() => setIsDeleteTypeModalOpen(false)}
        title="Confirmar eliminación"
        size="sm"
      >
        {currentCustomerType && (
          <div>
            <p className="text-gray-700 dark:text-gray-300">
              ¿Estás seguro de que deseas eliminar el tipo de cliente <strong>{currentCustomerType.name}</strong>?
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Esta acción no se puede deshacer y no será posible si hay clientes usando este tipo.
            </p>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsDeleteTypeModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-error"
                onClick={confirmDeleteCustomerType}
              >
                Eliminar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Customers;