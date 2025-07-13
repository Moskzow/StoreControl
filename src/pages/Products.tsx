import React, { useState, useEffect } from 'react';
import { Plus, Trash, Edit, Search, Filter, AlertCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import { formatCurrency } from '../utils/formatters';

function Products() {
  const { 
    products, 
    suppliers, 
    customerTypes,
    addProduct, 
    updateProduct, 
    deleteProduct,
    lowStockThreshold 
  } = useAppContext();
  
  // State for product list
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterCategory, setFilterCategory] = useState('');
  
  // State for product modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  
  // Filter and sort products when dependencies change
  useEffect(() => {
    let result = [...products];
    
    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        product => 
          product.name.toLowerCase().includes(lowerSearchTerm) || 
          product.code.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Apply category filter
    if (filterCategory) {
      result = result.filter(product => product.category === filterCategory);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortField === 'code') {
        return sortDirection === 'asc' 
          ? a.code.localeCompare(b.code) 
          : b.code.localeCompare(a.code);
      } else if (sortField === 'stock') {
        return sortDirection === 'asc' 
          ? a.stock - b.stock 
          : b.stock - a.stock;
      } else if (sortField === 'price') {
        return sortDirection === 'asc' 
          ? a.salePrice - b.salePrice 
          : b.salePrice - a.salePrice;
      }
      return 0;
    });
    
    setFilteredProducts(result);
    setCurrentPage(1);
  }, [products, searchTerm, sortField, sortDirection, filterCategory]);
  
  // Get unique categories for filter
  const categories = [...new Set(products.map(product => product.category))].filter(Boolean).sort();
  
  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  
  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Initialize new product form
  const initNewProduct = () => {
    setCurrentProduct({
      id: Date.now().toString(),
      code: '',
      name: '',
      description: '',
      purchasePrice: 0,
      salePrice: 0,
      hasDiscount: false,
      discountPrice: 0,
      hasVAT: true,
      stock: 0,
      supplierId: suppliers.length > 0 ? suppliers[0].id : '',
      category: '',
      lowStockThreshold: undefined, // Individual threshold (optional)
      profitMargins: {
        habitual: 0.25,   // 25% default margin for habitual customers
        vip: 0.20,        // 20% default margin for VIP customers
        premium: 0.30,    // 30% default margin for premium customers
        wholesale: 0.15   // 15% default margin for wholesale customers
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setIsModalOpen(true);
  };
  
  // Edit product
  const handleEdit = (product) => {
    // Ensure profit margins exist for all customer types
    const updatedProduct = {
      ...product,
      profitMargins: {
        habitual: product.profitMargins?.habitual || 0.25,
        vip: product.profitMargins?.vip || 0.20,
        premium: product.profitMargins?.premium || 0.30,
        wholesale: product.profitMargins?.wholesale || 0.15
      }
    };
    setCurrentProduct(updatedProduct);
    setIsModalOpen(true);
  };
  
  // Delete product
  const handleDelete = (product) => {
    setCurrentProduct(product);
    setIsDeleteModalOpen(true);
  };
  
  // Confirm delete
  const confirmDelete = () => {
    if (currentProduct) {
      deleteProduct(currentProduct.id);
      setIsDeleteModalOpen(false);
    }
  };
  
  // Save product
  const handleSave = (e) => {
    e.preventDefault();
    
    if (currentProduct) {
      const updatedProduct = {
        ...currentProduct,
        updatedAt: new Date().toISOString()
      };
      
      // Update or add new product
      if (products.some(p => p.id === currentProduct.id)) {
        updateProduct(updatedProduct);
      } else {
        addProduct(updatedProduct);
      }
      
      setIsModalOpen(false);
    }
  };
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setCurrentProduct(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
    }));
  };
  
  // Handle profit margin changes
  const handleMarginChange = (customerType, value) => {
    setCurrentProduct(prev => ({
      ...prev,
      profitMargins: {
        ...prev.profitMargins,
        [customerType]: parseFloat(value) || 0
      }
    }));
  };
  
  // Get effective low stock threshold for a product
  const getEffectiveLowStockThreshold = (product) => {
    return product.lowStockThreshold !== undefined ? product.lowStockThreshold : lowStockThreshold;
  };
  
  return (
    <div className="space-y-6">
      {/* Header and actions */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Productos</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gestiona el inventario de productos con precios diferenciados por tipo de cliente
          </p>
        </div>
        
        <button
          type="button"
          className="btn btn-primary"
          onClick={initNewProduct}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo producto
        </button>
      </div>
      
      {/* Filters and search */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="input pl-10"
            placeholder="Buscar por nombre o código..."
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
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product list */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          title="No hay productos"
          description={searchTerm || filterCategory ? "No hay productos que coincidan con los filtros aplicados." : "Comienza agregando tu primer producto."}
          action={
            <button
              type="button"
              className="btn btn-primary"
              onClick={initNewProduct}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo producto
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
                    onClick={() => handleSort('code')}
                  >
                    <div className="flex items-center">
                      <span>Código</span>
                      {sortField === 'code' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
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
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center">
                      <span>Precio Base</span>
                      {sortField === 'price' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th>Precios por Tipo</th>
                  <th 
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('stock')}
                  >
                    <div className="flex items-center">
                      <span>Stock</span>
                      {sortField === 'stock' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th>Categoría</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((product) => {
                  const effectiveThreshold = getEffectiveLowStockThreshold(product);
                  return (
                    <tr key={product.id} className="group">
                      <td>{product.code}</td>
                      <td className="max-w-xs truncate">{product.name}</td>
                      <td>
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Compra: {formatCurrency(product.purchasePrice)}
                          </div>
                          {product.hasDiscount ? (
                            <div>
                              <span className="text-error-600 line-through dark:text-error-400">
                                {formatCurrency(product.salePrice)}
                              </span>
                              <span className="ml-2 font-medium">
                                {formatCurrency(product.discountPrice)}
                              </span>
                            </div>
                          ) : (
                            <div className="font-medium">
                              {formatCurrency(product.salePrice)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="space-y-1 text-xs">
                          {customerTypes.map((type) => {
                            const marginKey = type.name.toLowerCase();
                            const margin = product.profitMargins?.[marginKey] || type.profitMargin;
                            const price = product.purchasePrice * (1 + margin);
                            return (
                              <div key={type.id} className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">{type.name}:</span>
                                <span className="font-medium">{formatCurrency(price)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td>
                        {product.stock <= effectiveThreshold ? (
                          <div className="flex items-center">
                            <AlertCircle className="mr-1 h-4 w-4 text-error-500" />
                            <span className="font-medium text-error-600 dark:text-error-400">
                              {product.stock}
                            </span>
                            {product.lowStockThreshold !== undefined && (
                              <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                                (umbral: {product.lowStockThreshold})
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span>{product.stock}</span>
                            {product.lowStockThreshold !== undefined && (
                              <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                                (umbral: {product.lowStockThreshold})
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td>
                        {product.category ? (
                          <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-900 dark:text-primary-300">
                            {product.category}
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">Sin categoría</span>
                        )}
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="rounded p-1 text-gray-500 hover:bg-error-100 hover:text-error-700 dark:text-gray-400 dark:hover:bg-error-900 dark:hover:text-error-300"
                            onClick={() => handleDelete(product)}
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
          
          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredProducts.length / itemsPerPage)}
            onPageChange={setCurrentPage}
            showingText={`Mostrando ${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, filteredProducts.length)} de ${filteredProducts.length} productos`}
          />
        </div>
      )}
      
      {/* Add/Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentProduct && products.some(p => p.id === currentProduct.id) ? "Editar producto" : "Nuevo producto"}
        size="xl"
      >
        {currentProduct && (
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Basic Information */}
              <div className="space-y-4 lg:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Información básica
                </h3>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Código *
                    </label>
                    <input
                      type="text"
                      name="code"
                      className="input mt-1"
                      value={currentProduct.code}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="name"
                      className="input mt-1"
                      value={currentProduct.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Descripción
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="input mt-1"
                    value={currentProduct.description}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Categoría
                    </label>
                    <input
                      type="text"
                      name="category"
                      className="input mt-1"
                      value={currentProduct.category}
                      onChange={handleChange}
                      list="categories"
                    />
                    <datalist id="categories">
                      {categories.map((category) => (
                        <option key={category} value={category} />
                      ))}
                    </datalist>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Proveedor
                    </label>
                    <select
                      name="supplierId"
                      className="select mt-1"
                      value={currentProduct.supplierId}
                      onChange={handleChange}
                    >
                      <option value="">Selecciona un proveedor</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Pricing */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">
                    Precios
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Precio de compra *
                      </label>
                      <div className="relative mt-1 rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-gray-500">€</span>
                        </div>
                        <input
                          type="number"
                          name="purchasePrice"
                          className="input pl-7"
                          min="0"
                          step="0.01"
                          value={currentProduct.purchasePrice}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Precio de venta base *
                      </label>
                      <div className="relative mt-1 rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-gray-500">€</span>
                        </div>
                        <input
                          type="number"
                          name="salePrice"
                          className="input pl-7"
                          min="0"
                          step="0.01"
                          value={currentProduct.salePrice}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="hasDiscount"
                      name="hasDiscount"
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:focus:ring-primary-600"
                      checked={currentProduct.hasDiscount}
                      onChange={handleChange}
                    />
                    <label
                      htmlFor="hasDiscount"
                      className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Tiene descuento
                    </label>
                  </div>
                  
                  {currentProduct.hasDiscount && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Precio con descuento
                      </label>
                      <div className="relative mt-1 rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-gray-500">€</span>
                        </div>
                        <input
                          type="number"
                          name="discountPrice"
                          className="input pl-7"
                          min="0"
                          step="0.01"
                          value={currentProduct.discountPrice}
                          onChange={handleChange}
                          required={currentProduct.hasDiscount}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="hasVAT"
                      name="hasVAT"
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:focus:ring-primary-600"
                      checked={currentProduct.hasVAT}
                      onChange={handleChange}
                    />
                    <label
                      htmlFor="hasVAT"
                      className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Aplicar IVA (21%)
                    </label>
                  </div>
                </div>
                
                {/* Inventory */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">
                    Inventario
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Stock actual *
                      </label>
                      <input
                        type="number"
                        name="stock"
                        className="input mt-1"
                        min="0"
                        step="1"
                        value={currentProduct.stock}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Umbral de stock bajo (opcional)
                      </label>
                      <input
                        type="number"
                        name="lowStockThreshold"
                        className="input mt-1"
                        min="0"
                        step="1"
                        value={currentProduct.lowStockThreshold || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          setCurrentProduct(prev => ({
                            ...prev,
                            lowStockThreshold: value === '' ? undefined : parseInt(value)
                          }));
                        }}
                        placeholder={`Por defecto: ${lowStockThreshold}`}
                      />
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Si no se especifica umbral individual, se usará el umbral global ({lowStockThreshold} unidades)
                  </p>
                  
                  {currentProduct.stock <= getEffectiveLowStockThreshold(currentProduct) && (
                    <div className="rounded-md bg-warning-50 p-4 dark:bg-warning-900/30">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertCircle className="h-5 w-5 text-warning-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-warning-800 dark:text-warning-300">
                            Stock bajo
                          </h3>
                          <div className="mt-2 text-sm text-warning-700 dark:text-warning-400">
                            <p>
                              El stock está por debajo del umbral mínimo ({getEffectiveLowStockThreshold(currentProduct)} unidades).
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Profit Margins by Customer Type */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Márgenes por Tipo de Cliente
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Configura márgenes específicos para cada tipo de cliente
                </p>
                
                <div className="space-y-4">
                  {customerTypes.map((type) => {
                    const marginKey = type.name.toLowerCase();
                    const currentMargin = currentProduct.profitMargins?.[marginKey] || type.profitMargin;
                    const calculatedPrice = currentProduct.purchasePrice * (1 + currentMargin);
                    
                    return (
                      <div key={type.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {type.name}
                          </h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatCurrency(calculatedPrice)}
                          </span>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Margen de beneficio
                          </label>
                          <div className="relative mt-1 rounded-md shadow-sm">
                            <input
                              type="number"
                              className="input pr-8"
                              min="0"
                              max="5"
                              step="0.01"
                              value={currentMargin}
                              onChange={(e) => handleMarginChange(marginKey, e.target.value)}
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                              <span className="text-gray-500">%</span>
                            </div>
                          </div>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Ejemplo: 0.25 = 25% de margen
                          </p>
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Precio final: {formatCurrency(calculatedPrice)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/30">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                    💡 Información sobre márgenes
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                    <li>• Los márgenes se aplican sobre el precio de compra</li>
                    <li>• Cada tipo de cliente puede tener márgenes diferentes</li>
                    <li>• Los precios se calculan automáticamente en las ventas</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsModalOpen(false)}
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
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar eliminación"
        size="sm"
      >
        {currentProduct && (
          <div>
            <p className="text-gray-700 dark:text-gray-300">
              ¿Estás seguro de que deseas eliminar el producto <strong>{currentProduct.name}</strong>?
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
                onClick={confirmDelete}
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

export default Products;