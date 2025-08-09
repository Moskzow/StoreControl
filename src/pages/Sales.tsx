import React, { useState, useRef } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash, 
  CreditCard, 
  DollarSign, 
  Smartphone, 
  CalendarClock, 
  Receipt,
  CheckCircle,
  User,
  UserPlus
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency, calculateVAT } from '../utils/formatters';
import Modal from '../components/ui/Modal';
import { PaymentMethod, Sale } from '../types';

function Sales() {
  const { 
    products, 
    customers,
    customerTypes, 
    cart, 
    selectedCustomerType, 
    selectedCustomer,
    setSelectedCustomerType, 
    setSelectedCustomer,
    addToCart, 
    updateCartItem, 
    removeFromCart, 
    clearCart, 
    cartTotal, 
    completeSale
  } = useAppContext();
  
  // State for product code input
  const [productCode, setProductCode] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  
  // References
  const productCodeInputRef = useRef<HTMLInputElement>(null);
  const customerSearchRef = useRef<HTMLInputElement>(null);
  
  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer =>
    customer.isActive && (
      customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      customer.phone.toLowerCase().includes(customerSearchTerm.toLowerCase())
    )
  ).slice(0, 5); // Limit to 5 results
  
  // Calculate VAT
  const vatAmount = cart.reduce((total, item) => {
    if (item.hasVAT) {
      return total + calculateVAT(item.price * item.quantity);
    }
    return total;
  }, 0);
  
  // Handle adding product to cart
  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productCode.trim()) return;
    
    addToCart(productCode, quantity);
    setProductCode('');
    setQuantity(1);
    
    // Focus back on the input
    if (productCodeInputRef.current) {
      productCodeInputRef.current.focus();
    }
  };
  
  // Handle updating cart item quantity
  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateCartItem(index, newQuantity);
  };
  
  // Handle customer selection
  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
    setCustomerSearchTerm(customer.name);
    setShowCustomerDropdown(false);
    
    // Set preferred payment method if available
    if (customer.preferredPaymentMethod) {
      setPaymentMethod(customer.preferredPaymentMethod);
    }
  };
  
  // Handle customer search input
  const handleCustomerSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomerSearchTerm(value);
    setShowCustomerDropdown(value.length > 0);
    
    if (value === '') {
      setSelectedCustomer(null);
    }
  };
  
  // Clear customer selection
  const clearCustomerSelection = () => {
    setSelectedCustomer(null);
    setCustomerSearchTerm('');
    setShowCustomerDropdown(false);
  };
  
  // Handle payment
  const handlePayment = () => {
    if (cart.length === 0 || !selectedCustomerType) return;
    
    const sale = completeSale(paymentMethod, notes);
    if (sale) {
      setCompletedSale(sale);
      setIsCompletedModalOpen(true);
      setNotes('');
      clearCustomerSelection();
    }
  };
  
  // Close completed sale modal
  const handleCloseCompletedModal = () => {
    setIsCompletedModalOpen(false);
    setCompletedSale(null);
  };
  
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Product selection and cart */}
      <div className="lg:col-span-2 space-y-6">
        {/* Customer type selection */}
        <div className="card p-4">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Tipo de cliente
          </h2>
          
          <div className="flex flex-wrap gap-3">
            {customerTypes.map(type => (
              <button
                key={type.id}
                className={`btn ${
                  selectedCustomerType?.id === type.id 
                    ? 'btn-primary' 
                    : 'btn-outline'
                }`}
                onClick={() => setSelectedCustomerType(type)}
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Customer selection */}
        <div className="card p-4">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Cliente (opcional)
          </h2>
          
          <div className="relative">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  ref={customerSearchRef}
                  type="text"
                  className="input pl-10"
                  placeholder="Buscar cliente por nombre, email o teléfono..."
                  value={customerSearchTerm}
                  onChange={handleCustomerSearchChange}
                  onFocus={() => setShowCustomerDropdown(customerSearchTerm.length > 0)}
                />
              </div>
              
              {selectedCustomer && (
                <button
                  type="button"
                  className="btn btn-outline text-error-600 border-error-300 hover:bg-error-50 dark:text-error-400 dark:border-error-800 dark:hover:bg-error-900/30"
                  onClick={clearCustomerSelection}
                >
                  <Trash className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Customer dropdown */}
            {showCustomerDropdown && filteredCustomers.length > 0 && (
              <div className="absolute z-80 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg dark:bg-gray-800 dark:border-gray-600">
                {filteredCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    onClick={() => handleCustomerSelect(customer)}
                  >
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {customer.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {customer.email} • {customer.phone}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {/* Selected customer info */}
            {selectedCustomer && (
              <div className="mt-3 p-3 bg-primary-50 rounded-lg dark:bg-primary-900/30">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-primary-800 dark:text-primary-300">
                      {selectedCustomer.name}
                    </div>
                    <div className="text-sm text-primary-600 dark:text-primary-400">
                      {selectedCustomer.email} • {selectedCustomer.phone}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-primary-600 dark:text-primary-400">
                      Total compras
                    </div>
                    <div className="font-medium text-primary-800 dark:text-primary-300">
                      {formatCurrency(selectedCustomer.totalPurchases)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Product code input */}
        <div className="card p-4">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Agregar producto
          </h2>
          
          <form onSubmit={handleAddToCart} className="flex items-end gap-3">
            <div className="flex-1">
              <label htmlFor="productCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Código de producto
              </label>
              <input
                type="text"
                id="productCode"
                ref={productCodeInputRef}
                className="input"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                list="productCodes"
                disabled={!selectedCustomerType}
                required
              />
              <datalist id="productCodes">
                {products.map(product => (
                  <option key={product.id} value={product.code}>
                    {product.name}
                  </option>
                ))}
              </datalist>
            </div>
            
            <div className="w-24">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cantidad
              </label>
              <input
                type="number"
                id="quantity"
                min="1"
                className="input"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                disabled={!selectedCustomerType}
              />
            </div>
            
            <button
              type="submit"
              className="btn btn-primary h-10"
              disabled={!selectedCustomerType || !productCode.trim()}
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar
            </button>
          </form>
        </div>
        
        {/* Cart */}
        <div className="card overflow-hidden">
          <div className="bg-primary-50 px-4 py-3 dark:bg-primary-900/30">
            <h2 className="text-lg font-medium text-primary-800 dark:text-primary-300 flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Carrito
            </h2>
          </div>
          
          {cart.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No hay productos en el carrito.
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Producto</th>
                    <th>Precio</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, index) => (
                    <tr key={index}>
                      <td>{item.code}</td>
                      <td>{item.name}</td>
                      <td>{formatCurrency(item.price)}</td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            className="rounded-full bg-gray-100 p-1 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            onClick={() => handleQuantityChange(index, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            className="rounded-full bg-gray-100 p-1 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            onClick={() => handleQuantityChange(index, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td className="font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="rounded p-1 text-gray-500 hover:bg-error-100 hover:text-error-700 dark:text-gray-400 dark:hover:bg-error-900 dark:hover:text-error-300"
                          onClick={() => removeFromCart(index)}
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {cart.length > 0 && (
            <div className="border-t border-gray-200 p-4 dark:border-gray-700">
              <div className="flex justify-between">
                <button
                  type="button"
                  className="btn btn-outline text-error-600 border-error-300 hover:bg-error-50 dark:text-error-400 dark:border-error-800 dark:hover:bg-error-900/30"
                  onClick={clearCart}
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Vaciar carrito
                </button>
                <div className="text-right space-y-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    IVA (21%): {formatCurrency(vatAmount)}
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    Total: {formatCurrency(cartTotal)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Payment section */}
      <div className="lg:col-span-1 space-y-6">
        <div className="card p-4">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Método de pago
          </h2>
          
          <div className="space-y-3">
            <label className="flex items-center p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={paymentMethod === 'cash'}
                onChange={() => setPaymentMethod('cash')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600"
              />
              <div className="ml-3 flex items-center">
                <DollarSign className="h-5 w-5 text-success-500 mr-2" />
                <span>Efectivo</span>
              </div>
            </label>
            
            <label className="flex items-center p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={() => setPaymentMethod('card')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600"
              />
              <div className="ml-3 flex items-center">
                <CreditCard className="h-5 w-5 text-primary-500 mr-2" />
                <span>Tarjeta</span>
              </div>
            </label>
            
            <label className="flex items-center p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
              <input
                type="radio"
                name="paymentMethod"
                value="bizum"
                checked={paymentMethod === 'bizum'}
                onChange={() => setPaymentMethod('bizum')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600"
              />
              <div className="ml-3 flex items-center">
                <Smartphone className="h-5 w-5 text-accent-500 mr-2" />
                <span>Bizum</span>
              </div>
            </label>
            
            <label className="flex items-center p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
              <input
                type="radio"
                name="paymentMethod"
                value="installments"
                checked={paymentMethod === 'installments'}
                onChange={() => setPaymentMethod('installments')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600"
              />
              <div className="ml-3 flex items-center">
                <CalendarClock className="h-5 w-5 text-warning-500 mr-2" />
                <span>Plazos</span>
              </div>
            </label>
            
            <label className="flex items-center p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
              <input
                type="radio"
                name="paymentMethod"
                value="monthly"
                checked={paymentMethod === 'monthly'}
                onChange={() => setPaymentMethod('monthly')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600"
              />
              <div className="ml-3 flex items-center">
                <Receipt className="h-5 w-5 text-secondary-500 mr-2" />
                <span>Giro mensual</span>
              </div>
            </label>
          </div>
        </div>
        
        <div className="card p-4">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Notas
          </h2>
          
          <textarea
            className="input w-full"
            rows={3}
            placeholder="Agregar notas a la venta (opcional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>
        
        <div className="card p-4">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Resumen
          </h2>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Cliente:</span>
              <span className="font-medium">
                {selectedCustomerType?.name || 'No seleccionado'}
              </span>
            </div>
            {selectedCustomer && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Nombre:</span>
                <span className="font-medium text-sm">
                  {selectedCustomer.name}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Items:</span>
              <span className="font-medium">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Método de pago:</span>
              <span className="font-medium">
                {paymentMethod === 'cash' && 'Efectivo'}
                {paymentMethod === 'card' && 'Tarjeta'}
                {paymentMethod === 'bizum' && 'Bizum'}
                {paymentMethod === 'installments' && 'Plazos'}
                {paymentMethod === 'monthly' && 'Giro mensual'}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold mt-4">
              <span>Total:</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              type="button"
              className="btn btn-primary w-full py-3"
              disabled={cart.length === 0 || !selectedCustomerType}
              onClick={handlePayment}
            >
              Completar venta
            </button>
          </div>
        </div>
      </div>
      
      {/* Completed Sale Modal */}
      <Modal
        isOpen={isCompletedModalOpen}
        onClose={handleCloseCompletedModal}
        title="Venta completada"
        size="md"
      >
        {completedSale && (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-100 dark:bg-success-900">
              <CheckCircle className="h-8 w-8 text-success-600 dark:text-success-400" />
            </div>
            
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              ¡Venta completada con éxito!
            </h3>
            
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Se ha registrado correctamente la venta.
            </p>
            
            <div className="mt-6 bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Referencia</p>
                  <p className="font-medium">{completedSale.id.slice(0, 8)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Fecha</p>
                  <p className="font-medium">
                    {new Date(completedSale.date).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Cliente</p>
                  <p className="font-medium">{completedSale.customerType.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Método de pago</p>
                  <p className="font-medium">
                    {completedSale.paymentMethod === 'cash' && 'Efectivo'}
                    {completedSale.paymentMethod === 'card' && 'Tarjeta'}
                    {completedSale.paymentMethod === 'bizum' && 'Bizum'}
                    {completedSale.paymentMethod === 'installments' && 'Plazos'}
                    {completedSale.paymentMethod === 'monthly' && 'Giro mensual'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                  <p className="text-lg font-bold">{formatCurrency(completedSale.total)}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="button"
                className="btn btn-primary w-full"
                onClick={handleCloseCompletedModal}
              >
                Aceptar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Sales;