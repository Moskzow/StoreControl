import React, { useState, useEffect } from 'react';
import { Plus, Trash, Edit, Search, Package, DollarSign, AlertCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Purchase, PurchaseItem } from '../types';

function Purchases() {
  const { 
    products, 
    suppliers, 
    purchases,
    addPurchase,
    updatePurchase,
    deletePurchase,
    updateProductPrices,
    updateProductProfitMargins
  } = useAppContext();
  
  // State for purchase list
  const [filteredPurchases, setFilteredPurchases] = useState(purchases);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // State for purchase modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPurchase, setCurrentPurchase] = useState<Purchase | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<PurchaseItem[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  
  // Filter and sort purchases when dependencies change
  useEffect(() => {
    let result = [...purchases];
    
    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(purchase => {
        const supplier = suppliers.find(s => s.id === purchase.supplierId);
        return (
          supplier?.name.toLowerCase().includes(lowerSearchTerm) ||
          purchase.invoiceNumber?.toLowerCase().includes(lowerSearchTerm)
        );
      });
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortField === 'date') {
        return sortDirection === 'asc'
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return 0;
    });
    
    setFilteredPurchases(result);
    setCurrentPage(1);
  }, [purchases, searchTerm, sortField, sortDirection, suppliers]);
  
  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPurchases.slice(indexOfFirstItem, indexOfLastItem);
  
  // Initialize new purchase
  const initNewPurchase = () => {
    setCurrentPurchase({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      supplierId: suppliers[0]?.id || '',
      items: [],
      total: 0,
      notes: '',
      status: 'pending',
      paymentStatus: 'pending'
    });
    setSelectedProducts([]);
    setSelectedSupplierId(suppliers[0]?.id || '');
    setIsModalOpen(true);
  };
  
  // Add product to purchase
  const handleAddProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = selectedProducts.find(item => item.productId === productId);
    if (existingItem) {
      setSelectedProducts(selectedProducts.map(item =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newItem: PurchaseItem = {
        productId,
        code: product.code,
        name: product.name,
        quantity: 1,
        price: product.prices?.[selectedSupplierId] || product.purchasePrice,
        total: product.prices?.[selectedSupplierId] || product.purchasePrice
      };
      setSelectedProducts([...selectedProducts, newItem]);
    }
  };
  
  // Update product quantity
  const handleUpdateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;
    
    setSelectedProducts(selectedProducts.map((item, i) =>
      i === index
        ? { ...item, quantity, total: item.price * quantity }
        : item
    ));
  };
  
  // Update product price
  const handleUpdatePrice = (index: number, price: number) => {
    if (price < 0) return;
    
    setSelectedProducts(selectedProducts.map((item, i) =>
      i === index
        ? { ...item, price, total: price * item.quantity }
        : item
    ));
  };
  
  // Remove product from purchase
  const handleRemoveProduct = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };
  
  // Calculate total
  const calculateTotal = () => {
    return selectedProducts.reduce((sum, item) => sum + item.total, 0);
  };
  
  // Save purchase
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPurchase || selectedProducts.length === 0) return;
    
    const purchase: Purchase = {
      ...currentPurchase,
      items: selectedProducts,
      total: calculateTotal(),
      supplierId: selectedSupplierId
    };
    
    // Update product prices and stock
    selectedProducts.forEach(item => {
      updateProductPrices(item.productId, selectedSupplierId, item.price);
    });
    
    if (purchases.some(p => p.id === purchase.id)) {
      updatePurchase(purchase);
    } else {
      addPurchase(purchase);
    }
    
    setIsModalOpen(false);
  };
  
  return (
    <div className="space-y-6">
      {/* Header and actions */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Compras</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gestiona las compras a proveedores
          </p>
        </div>
        
        <button
          type="button"
          className="btn btn-primary"
          onClick={initNewPurchase}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva compra
        </button>
      </div>
      
      {/* Search */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          className="input pl-10"
          placeholder="Buscar por proveedor o número de factura..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Purchase list */}
      {filteredPurchases.length === 0 ? (
        <EmptyState
          title="No hay compras"
          description={searchTerm ? "No hay compras que coincidan con la búsqueda." : "Comienza registrando tu primera compra."}
          action={
            <button
              type="button"
              className="btn btn-primary"
              onClick={initNewPurchase}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva compra
            </button>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Proveedor</th>
                  <th>Productos</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((purchase) => {
                  const supplier = suppliers.find(s => s.id === purchase.supplierId);
                  return (
                    <tr key={purchase.id}>
                      <td>{formatDate(purchase.date)}</td>
                      <td>{supplier?.name || 'Proveedor eliminado'}</td>
                      <td>{purchase.items.length} productos</td>
                      <td>{formatCurrency(purchase.total)}</td>
                      <td>
                        <span className={`badge ${
                          purchase.status === 'received' 
                            ? 'badge-success' 
                            : purchase.status === 'cancelled'
                            ? 'badge-error'
                            : 'badge-warning'
                        }`}>
                          {purchase.status === 'received' ? 'Recibido' :
                           purchase.status === 'cancelled' ? 'Cancelado' : 'Pendiente'}
                        </span>
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                            onClick={() => {
                              setCurrentPurchase(purchase);
                              setSelectedProducts(purchase.items);
                              setSelectedSupplierId(purchase.supplierId);
                              setIsModalOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="rounded p-1 text-gray-500 hover:bg-error-100 hover:text-error-700 dark:text-gray-400 dark:hover:bg-error-900 dark:hover:text-error-300"
                            onClick={() => {
                              setCurrentPurchase(purchase);
                              setIsDeleteModalOpen(true);
                            }}
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
            totalPages={Math.ceil(filteredPurchases.length / itemsPerPage)}
            onPageChange={setCurrentPage}
            showingText={`Mostrando ${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, filteredPurchases.length)} de ${filteredPurchases.length} compras`}
          />
        </div>
      )}
      
      {/* Add/Edit Purchase Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentPurchase && purchases.some(p => p.id === currentPurchase.id) ? "Editar compra" : "Nueva compra"}
        size="xl"
      >
        {currentPurchase && (
          <form onSubmit={handleSave}>
            <div className="space-y-6">
              {/* Supplier selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Proveedor *
                </label>
                <select
                  className="select mt-1"
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  required
                >
                  <option value="">Selecciona un proveedor</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Product selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Agregar productos
                </label>
                <select
                  className="select mt-1"
                  onChange={(e) => handleAddProduct(e.target.value)}
                  value=""
                >
                  <option value="">Selecciona un producto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.code} - {product.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Selected products */}
              {selectedProducts.length > 0 ? (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio</th>
                        <th>Total</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProducts.map((item, index) => (
                        <tr key={index}>
                          <td>{item.code}</td>
                          <td>{item.name}</td>
                          <td>
                            <input
                              type="number"
                              className="input w-20"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleUpdateQuantity(index, parseInt(e.target.value))}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="input w-24"
                              min="0"
                              step="0.01"
                              value={item.price}
                              onChange={(e) => handleUpdatePrice(index, parseFloat(e.target.value))}
                            />
                          </td>
                          <td>{formatCurrency(item.total)}</td>
                          <td>
                            <button
                              type="button"
                              className="rounded p-1 text-gray-500 hover:bg-error-100 hover:text-error-700 dark:text-gray-400 dark:hover:bg-error-900 dark:hover:text-error-300"
                              onClick={() => handleRemoveProduct(index)}
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={4} className="text-right font-medium">
                          Total:
                        </td>
                        <td colSpan={2} className="font-bold">
                          {formatCurrency(calculateTotal())}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No hay productos seleccionados
                </div>
              )}
              
              {/* Additional fields */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Número de factura
                  </label>
                  <input
                    type="text"
                    className="input mt-1"
                    value={currentPurchase.invoiceNumber || ''}
                    onChange={(e) => setCurrentPurchase({
                      ...currentPurchase,
                      invoiceNumber: e.target.value
                    })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Estado
                  </label>
                  <select
                    className="select mt-1"
                    value={currentPurchase.status}
                    onChange={(e) => setCurrentPurchase({
                      ...currentPurchase,
                      status: e.target.value as 'pending' | 'received' | 'cancelled'
                    })}
                  >
                    <option value="pending">Pendiente</option>
                    <option value="received">Recibido</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notas
                </label>
                <textarea
                  className="input mt-1"
                  rows={3}
                  value={currentPurchase.notes}
                  onChange={(e) => setCurrentPurchase({
                    ...currentPurchase,
                    notes: e.target.value
                  })}
                />
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
              <button
                type="submit"
                className="btn btn-primary"
                disabled={selectedProducts.length === 0}
              >
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
        {currentPurchase && (
          <div>
            <p className="text-gray-700 dark:text-gray-300">
              ¿Estás seguro de que deseas eliminar esta compra?
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
                onClick={() => {
                  if (currentPurchase) {
                    deletePurchase(currentPurchase.id);
                    setIsDeleteModalOpen(false);
                  }
                }}
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

export default Purchases;