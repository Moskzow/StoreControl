import React, { useState, useEffect } from 'react';
import { Plus, Trash, Edit, Search, Filter, Mail, Phone, MapPin, Calendar, DollarSign, User, Users } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import { formatCurrency, formatDate } from '../utils/formatters';

function Customers() {
  const { 
    customers, 
    customerTypes,
    addCustomer, 
    updateCustomer, 
    deleteCustomer,
    addCustomerType,
    updateCustomerType,
    deleteCustomerType
  } = useAppContext();
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('customers');
  
  // State for customer list
  const [filteredCustomers, setFilteredCustomers] = useState(customers);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // State for customer modal
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isDeleteCustomerModalOpen, setIsDeleteCustomerModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  
  // State for customer type modal
  const [isCustomerTypeModalOpen, setIsCustomerTypeModalOpen] = useState(false);
  const [isDeleteCustomerTypeModalOpen, setIsDeleteCustomerTypeModalOpen] = useState(false);
  const [currentCustomerType, setCurrentCustomerType] = useState(null);
  
  // Filter and sort customers when dependencies change
  useEffect(() => {
    let result = [...customers];
    
    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        customer => 
          customer.name.toLowerCase().includes(lowerSearchTerm) || 
          customer.email.toLowerCase().includes(lowerSearchTerm) ||
          customer.phone.toLowerCase().includes(lowerSearchTerm) ||
          customer.city.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Apply type filter
    if (filterType) {
      result = result.filter(customer => customer.customerTypeId === filterType);
    }
    
    // Apply status filter
    if (filterStatus) {
      if (filterStatus === 'active') {
        result = result.filter(customer => customer.isActive);
      } else if (filterStatus === 'inactive') {
        result = result.filter(customer => !customer.isActive);
      }
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortField === 'email') {
        return sortDirection === 'asc' 
          ? a.email.localeCompare(b.email) 
          : b.email.localeCompare(a.email);
      } else if (sortField === 'totalPurchases') {
        return sortDirection === 'asc' 
          ? a.totalPurchases - b.totalPurchases 
          : b.totalPurchases - a.totalPurchases;
      } else if (sortField === 'createdAt') {
        return sortDirection === 'asc' 
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });
    
    setFilteredCustomers(result);
    setCurrentPage(1);
  }, [customers, searchTerm, sortField, sortDirection, filterType, filterStatus]);
  
  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
  
  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Initialize new customer form
  const initNewCustomer = () => {
    setCurrentCustomer({
      id: Date.now().toString(),
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      taxId: '',
      customerType: 'individual',
      customerTypeId: customerTypes[0]?.id || '',
      preferredPaymentMethod: 'cash',
      creditLimit: 0,
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalPurchases: 0,
      isActive: true
    });
    setIsCustomerModalOpen(true);
  };
  
  // Initialize new customer type form
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
  const handleEditCustomer = (customer) => {
    setCurrentCustomer({ ...customer });
    setIsCustomerModalOpen(true);
  };
  
  // Edit customer type
  const handleEditCustomerType = (customerType) => {
    setCurrentCustomerType({ ...customerType });
    setIsCustomerTypeModalOpen(true);
  };
  
  // Delete customer
  const handleDeleteCustomer = (customer) => {
    setCurrentCustomer(customer);
    setIsDeleteCustomerModalOpen(true);
  };
  
  // Delete customer type
  const handleDeleteCustomerType = (customerType) => {
    setCurrentCustomerType(customerType);
    setIsDeleteCustomerTypeModalOpen(true);
  };
  
  // Confirm delete customer
  const confirmDeleteCustomer = () => {
    if (currentCustomer) {
      deleteCustomer(currentCustomer.id);
      setIsDeleteCustomerModalOpen(false);
    }
  };
  
  // Confirm delete customer type
  const confirmDeleteCustomerType = () => {
    if (currentCustomerType) {
      deleteCustomerType(currentCustomerType.id);
      setIsDeleteCustomerTypeModalOpen(false);
    }
  };
  
  // Save customer
  const handleSaveCustomer = (e) => {
    e.preventDefault();
    
    if (currentCustomer) {
      const updatedCustomer = {
        ...currentCustomer,
        updatedAt: new Date().toISOString()
      };
      
      // Update or add new customer
      if (customers.some(c => c.id === currentCustomer.id)) {
        updateCustomer(updatedCustomer);
      } else {
        addCustomer(updatedCustomer);
      }
      
      setIsCustomerModalOpen(false);
    }
  };
  
  // Save customer type
  const handleSaveCustomerType = (e) => {
    e.preventDefault();
    
    if (currentCustomerType) {
      // Update or add new customer type
      if (customerTypes.some(ct => ct.id === currentCustomerType.id)) {
        updateCustomerType(currentCustomerType);
      } else {
        addCustomerType(currentCustomerType);
      }
      
      setIsCustomerTypeModalOpen(false);
    }
  };
  
  // Handle form field changes
  const handleCustomerChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setCurrentCustomer(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
    }));
  };
  
  // Handle customer type form field changes
  const handleCustomerTypeChange = (e) => {
    const { name, value, type } = e.target;
    
    setCurrentCustomerType(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };
  
  // Handle benefits change
  const handleBenefitsChange = (benefits) => {
    setCurrentCustomerType(prev => ({
      ...prev,
      benefits
    }));
  };
  
  // Get customer type name
  const getCustomerTypeName = (customerTypeId) => {
    const type = customerTypes.find(ct => ct.id === customerTypeId);
    return type ? type.name : 'Sin tipo';
  };
  
  // Get customers count by type
  const getCustomersCountByType = (typeId) => {
    return customers.filter(customer => customer.customerTypeId === typeId).length;
  };
  
  return (
    <div className="space-y-6">
      {/* Header and tabs */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Clientes</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Administra los clientes y tipos de cliente
          </p>
        </div>
        
        <div className="flex space-x-2">
          {activeTab === 'customers' ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={initNewCustomer}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo cliente
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={initNewCustomerType}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo tipo
            </button>
          )}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            type="button"
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'customers'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('customers')}
          >
            <User className="h-4 w-4 mr-2 inline" />
            Clientes ({customers.length})
          </button>
          <button
            type="button"
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'customerTypes'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('customerTypes')}
          >
            <Users className="h-4 w-4 mr-2 inline" />
            Tipos de Cliente ({customerTypes.length})
          </button>
        </nav>
      </div>
      
      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <>
          {/* Filters and search */}
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="input pl-10"
                placeholder="Buscar por nombre, email, teléfono o ciudad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-4">
              <div className="w-48">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Filter className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    className="select pl-10"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
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
              
              <div className="w-32">
                <select
                  className="select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Customer list */}
          {filteredCustomers.length === 0 ? (
            <EmptyState
              title="No hay clientes"
              description={searchTerm || filterType || filterStatus ? "No hay clientes que coincidan con los filtros aplicados." : "Comienza agregando tu primer cliente."}
              action={
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={initNewCustomer}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo cliente
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
                          <span>Nombre</span>
                          {sortField === 'name' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => handleSort('email')}
                      >
                        <div className="flex items-center">
                          <span>Contacto</span>
                          {sortField === 'email' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
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
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((customer) => (
                      <tr key={customer.id} className="group">
                        <td>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {customer.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {customer.city && (
                                <span className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {customer.city}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="space-y-1">
                            {customer.email && (
                              <a 
                                href={`mailto:${customer.email}`} 
                                className="flex items-center text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                              >
                                <Mail className="h-3 w-3 mr-1" />
                                {customer.email}
                              </a>
                            )}
                            {customer.phone && (
                              <a 
                                href={`tel:${customer.phone}`} 
                                className="flex items-center text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                              >
                                <Phone className="h-3 w-3 mr-1" />
                                {customer.phone}
                              </a>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-900 dark:text-primary-300">
                            {getCustomerTypeName(customer.customerTypeId)}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-success-500 mr-1" />
                            <span className="font-medium">
                              {formatCurrency(customer.totalPurchases)}
                            </span>
                          </div>
                          {customer.lastPurchaseDate && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(customer.lastPurchaseDate)}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${
                            customer.isActive ? 'badge-success' : 'badge-error'
                          }`}>
                            {customer.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                              onClick={() => handleEditCustomer(customer)}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className="rounded p-1 text-gray-500 hover:bg-error-100 hover:text-error-700 dark:text-gray-400 dark:hover:bg-error-900 dark:hover:text-error-300"
                              onClick={() => handleDeleteCustomer(customer)}
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredCustomers.length / itemsPerPage)}
                onPageChange={setCurrentPage}
                showingText={`Mostrando ${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, filteredCustomers.length)} de ${filteredCustomers.length} clientes`}
              />
            </div>
          )}
        </>
      )}
      
      {/* Customer Types Tab */}
      {activeTab === 'customerTypes' && (
        <>
          {/* Customer types grid */}
          {customerTypes.length === 0 ? (
            <EmptyState
              title="No hay tipos de cliente"
              description="Comienza agregando tu primer tipo de cliente."
              action={
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={initNewCustomerType}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo tipo
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {customerTypes.map((customerType) => (
                <div
                  key={customerType.id}
                  className="card p-6 hover:shadow-lg transition-shadow group"
                  style={{ borderLeft: `4px solid ${customerType.color || '#3B82F6'}` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {customerType.name}
                    </h3>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                      <button
                        type="button"
                        className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                        onClick={() => handleEditCustomerType(customerType)}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="rounded p-1 text-gray-500 hover:bg-error-100 hover:text-error-700 dark:text-gray-400 dark:hover:bg-error-900 dark:hover:text-error-300"
                        onClick={() => handleDeleteCustomerType(customerType)}
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Margen de beneficio:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {(customerType.profitMargin * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Clientes:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {getCustomersCountByType(customerType.id)}
                      </span>
                    </div>
                    
                    {customerType.minPurchaseAmount && customerType.minPurchaseAmount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Compra mínima:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(customerType.minPurchaseAmount)}
                        </span>
                      </div>
                    )}
                    
                    {customerType.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {customerType.description}
                      </p>
                    )}
                    
                    {customerType.benefits && customerType.benefits.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Beneficios:</p>
                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          {customerType.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center">
                              <span className="w-1 h-1 bg-primary-500 rounded-full mr-2"></span>
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Add/Edit Customer Modal */}
      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title={currentCustomer && customers.some(c => c.id === currentCustomer.id) ? "Editar cliente" : "Nuevo cliente"}
        size="xl"
      >
        {currentCustomer && (
          <form onSubmit={handleSaveCustomer}>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Información básica
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
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="input mt-1"
                      value={currentCustomer.email}
                      onChange={handleCustomerChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      className="input mt-1"
                      value={currentCustomer.phone}
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
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              
              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Información comercial
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tipo de cliente *
                  </label>
                  <select
                    name="customerTypeId"
                    className="select mt-1"
                    value={currentCustomer.customerTypeId}
                    onChange={handleCustomerChange}
                    required
                  >
                    <option value="">Selecciona un tipo</option>
                    {customerTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name} ({(type.profitMargin * 100).toFixed(1)}% margen)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tipo de persona
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
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      NIF/CIF
                    </label>
                    <input
                      type="text"
                      name="taxId"
                      className="input mt-1"
                      value={currentCustomer.taxId}
                      onChange={handleCustomerChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Método de pago preferido
                  </label>
                  <select
                    name="preferredPaymentMethod"
                    className="select mt-1"
                    value={currentCustomer.preferredPaymentMethod}
                    onChange={handleCustomerChange}
                  >
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
                      value={currentCustomer.creditLimit}
                      onChange={handleCustomerChange}
                    />
                  </div>
                </div>
                
                <div>
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
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:focus:ring-primary-600"
                    checked={currentCustomer.isActive}
                    onChange={handleCustomerChange}
                  />
                  <label
                    htmlFor="isActive"
                    className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Cliente activo
                  </label>
                </div>
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
      
      {/* Add/Edit Customer Type Modal */}
      <Modal
        isOpen={isCustomerTypeModalOpen}
        onClose={() => setIsCustomerTypeModalOpen(false)}
        title={currentCustomerType && customerTypes.some(ct => ct.id === currentCustomerType.id) ? "Editar tipo de cliente" : "Nuevo tipo de cliente"}
        size="md"
      >
        {currentCustomerType && (
          <form onSubmit={handleSaveCustomerType}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre *
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
                    max="5"
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
                  Ejemplo: 0.25 = 25% de margen
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
                  value={currentCustomerType.description}
                  onChange={handleCustomerTypeChange}
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
                    value={currentCustomerType.minPurchaseAmount}
                    onChange={handleCustomerTypeChange}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Color identificativo
                </label>
                <input
                  type="color"
                  name="color"
                  className="mt-1 h-10 w-20 rounded border border-gray-300 dark:border-gray-600"
                  value={currentCustomerType.color}
                  onChange={handleCustomerTypeChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Beneficios
                </label>
                <div className="space-y-2">
                  {(currentCustomerType.benefits || []).map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        className="input flex-1"
                        value={benefit}
                        onChange={(e) => {
                          const newBenefits = [...(currentCustomerType.benefits || [])];
                          newBenefits[index] = e.target.value;
                          handleBenefitsChange(newBenefits);
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-outline text-error-600 border-error-300 hover:bg-error-50 dark:text-error-400 dark:border-error-800 dark:hover:bg-error-900/30 px-2"
                        onClick={() => {
                          const newBenefits = [...(currentCustomerType.benefits || [])];
                          newBenefits.splice(index, 1);
                          handleBenefitsChange(newBenefits);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-outline w-full"
                    onClick={() => {
                      const newBenefits = [...(currentCustomerType.benefits || []), ''];
                      handleBenefitsChange(newBenefits);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar beneficio
                  </button>
                </div>
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
      
      {/* Delete Customer Confirmation Modal */}
      <Modal
        isOpen={isDeleteCustomerModalOpen}
        onClose={() => setIsDeleteCustomerModalOpen(false)}
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
                onClick={() => setIsDeleteCustomerModalOpen(false)}
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
      
      {/* Delete Customer Type Confirmation Modal */}
      <Modal
        isOpen={isDeleteCustomerTypeModalOpen}
        onClose={() => setIsDeleteCustomerTypeModalOpen(false)}
        title="Confirmar eliminación"
        size="sm"
      >
        {currentCustomerType && (
          <div>
            <p className="text-gray-700 dark:text-gray-300">
              ¿Estás seguro de que deseas eliminar el tipo de cliente <strong>{currentCustomerType.name}</strong>?
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Esta acción no se puede deshacer y no es posible si hay clientes asignados a este tipo.
            </p>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsDeleteCustomerTypeModalOpen(false)}
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