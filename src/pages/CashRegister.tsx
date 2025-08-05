import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, DollarSign, Receipt, ArrowUpRight, ArrowDownLeft, CheckCircle, CheckSquare } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import Modal from '../components/ui/Modal';

function CashRegister() {
  const navigate = useNavigate();
  const { 
    cashRegister, 
    isRegisterOpen, 
    openRegister, 
    closeRegister,
    sales
  } = useAppContext();
  
  const [isOpenModalVisible, setIsOpenModalVisible] = useState(false);
  const [isCloseModalVisible, setIsCloseModalVisible] = useState(false);
  const [initialAmount, setInitialAmount] = useState('');
  const [finalAmount, setFinalAmount] = useState('');
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [operationSuccess, setOperationSuccess] = useState(false);
  
  // Reset initial amount when register is closed
  useEffect(() => {
    if (!isRegisterOpen) {
      setInitialAmount('');
    }
  }, [isRegisterOpen]);
  
  // Calculate today's sales
  const calculateTodaySales = () => {
    if (!isRegisterOpen || !cashRegister) return 0;
    
    // Get today's date in ISO format
    const today = new Date().toISOString().split('T')[0];
    
    // Filter sales by current register and today's date
    const registerSales = sales.filter(sale => 
      sale.cashRegisterId === cashRegister.id && 
      sale.date.startsWith(today)
    );
    
    // Sum the total
    return registerSales.reduce((sum, sale) => sum + sale.total, 0);
  };
  
  // Calculate sales by payment method
  const calculateSalesByMethod = () => {
    if (!isRegisterOpen || !cashRegister) return {};
    
    // Get today's date in ISO format
    const today = new Date().toISOString().split('T')[0];
    
    // Filter sales by current register and today's date
    const registerSales = sales.filter(sale => 
      sale.cashRegisterId === cashRegister.id && 
      sale.date.startsWith(today)
    );
    
    // Group by payment method
    const salesByMethod = registerSales.reduce((acc, sale) => {
      const method = sale.paymentMethod;
      if (!acc[method]) {
        acc[method] = 0;
      }
      acc[method] += sale.total;
      return acc;
    }, {});
    
    return salesByMethod;
  };
  
  // Get expected cash amount
  const getExpectedCashAmount = () => {
    if (!isRegisterOpen || !cashRegister) return 0;
    
    const salesByMethod = calculateSalesByMethod();
    const cashSales = salesByMethod['cash'] || 0;
    
    return parseFloat(cashRegister.initialAmount.toString()) + cashSales;
  };
  
  // Handle opening register
  const handleOpenRegister = (e) => {
    e.preventDefault();
    
    if (!initialAmount.trim()) return;
    
    const amount = parseFloat(initialAmount);
    if (isNaN(amount) || amount < 0) return;
    
    openRegister(amount);
    setOperationSuccess(true);
    setIsOpenModalVisible(false);
    setIsConfirmModalVisible(true);
  };
  
  // Handle closing register
  const handleCloseRegister = (e) => {
    e.preventDefault();
    
    if (!finalAmount.trim()) return;
    
    const amount = parseFloat(finalAmount);
    if (isNaN(amount) || amount < 0) return;
    
    closeRegister(amount);
    setOperationSuccess(true);
    setIsCloseModalVisible(false);
    setIsConfirmModalVisible(true);
  };
  
  // Get card sales total
  const getCardSalesTotal = () => {
    const salesByMethod = calculateSalesByMethod();
    return salesByMethod['card'] || 0;
  };
  
  // Get bizum sales total
  const getBizumSalesTotal = () => {
    const salesByMethod = calculateSalesByMethod();
    return salesByMethod['bizum'] || 0;
  };
  
  // Get other sales total (installments and monthly)
  const getOtherSalesTotal = () => {
    const salesByMethod = calculateSalesByMethod();
    return (salesByMethod['installments'] || 0) + (salesByMethod['monthly'] || 0);
  };
  
  // Handle confirmation
  const handleConfirmation = () => {
    setIsConfirmModalVisible(false);
    setOperationSuccess(false);
    
    if (isRegisterOpen) {
      navigate('/ventas');
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Caja</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gestiona las operaciones de caja
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          {isRegisterOpen ? (
            <button
              type="button"
              className="btn btn-error"
              onClick={() => setIsCloseModalVisible(true)}
            >
              <ArrowDownLeft className="mr-2 h-4 w-4" />
              Cerrar caja
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-success"
              onClick={() => setIsOpenModalVisible(true)}
            >
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Abrir caja
            </button>
          )}
        </div>
      </div>
      
      {/* Register status */}
      <div className="card p-5">
        <div className="flex items-center">
          <div className={`h-3 w-3 rounded-full ${isRegisterOpen ? 'bg-success-500' : 'bg-error-500'} mr-2`}></div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Caja {isRegisterOpen ? 'abierta' : 'cerrada'}
          </h2>
        </div>
        
        {isRegisterOpen && cashRegister && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Apertura</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatDate(cashRegister.openedAt, true)}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Importe inicial</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(cashRegister.initialAmount)}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Today's sales */}
      {isRegisterOpen && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="card p-5">
            <div className="flex items-center">
              <div className="rounded-md bg-primary-100 p-3 dark:bg-primary-900">
                <Receipt className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ventas totales</h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(calculateTodaySales())}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card p-5">
            <div className="flex items-center">
              <div className="rounded-md bg-success-100 p-3 dark:bg-success-900">
                <DollarSign className="h-6 w-6 text-success-600 dark:text-success-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Efectivo</h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(getExpectedCashAmount())}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card p-5">
            <div className="flex items-center">
              <div className="rounded-md bg-secondary-100 p-3 dark:bg-secondary-900">
                <CreditCard className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tarjeta</h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(getCardSalesTotal())}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card p-5">
            <div className="flex items-center">
              <div className="rounded-md bg-accent-100 p-3 dark:bg-accent-900">
                <ArrowUpRight className="h-6 w-6 text-accent-600 dark:text-accent-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Otros</h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(getBizumSalesTotal() + getOtherSalesTotal())}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Register history */}
      <div className="card overflow-hidden">
        <div className="bg-primary-50 px-4 py-3 dark:bg-primary-900/30">
          <h2 className="text-lg font-medium text-primary-800 dark:text-primary-300">
            Historial de caja
          </h2>
        </div>
        
        {!cashRegister && !isRegisterOpen ? (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No hay historial de caja disponible.
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Haz clic en el botón "Abrir caja" para comenzar.
            </p>
          </div>
        ) : (
          <div className="p-6">
            <div className="relative">
              <div className="absolute top-0 bottom-0 left-[15px] w-0.5 bg-gray-200 dark:bg-gray-700"></div>
              <ul className="space-y-6">
                {isRegisterOpen && cashRegister && (
                  <li className="relative pl-8">
                    <span className="absolute left-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 ring-4 ring-white dark:bg-primary-900 dark:ring-gray-900">
                      <ArrowUpRight className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                    </span>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Caja abierta
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(cashRegister.openedAt, true)}
                        </p>
                      </div>
                      <div className="mt-2 sm:mt-0">
                        <span className="rounded-full bg-success-100 px-3 py-1 text-sm font-medium text-success-800 dark:bg-success-900 dark:text-success-300">
                          {formatCurrency(cashRegister.initialAmount)}
                        </span>
                      </div>
                    </div>
                  </li>
                )}
                
                {cashRegister && cashRegister.closedAt && (
                  <li className="relative pl-8">
                    <span className="absolute left-0 flex h-8 w-8 items-center justify-center rounded-full bg-error-100 ring-4 ring-white dark:bg-error-900 dark:ring-gray-900">
                      <ArrowDownLeft className="h-4 w-4 text-error-600 dark:text-error-400" />
                    </span>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Caja cerrada
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(cashRegister.closedAt, true)}
                        </p>
                      </div>
                      <div className="mt-2 sm:mt-0">
                        <span className="rounded-full bg-error-100 px-3 py-1 text-sm font-medium text-error-800 dark:bg-error-900 dark:text-error-300">
                          {formatCurrency(cashRegister.finalAmount)}
                        </span>
                      </div>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
      
      {/* Open Register Modal */}
      <Modal
        isOpen={isOpenModalVisible}
        onClose={() => setIsOpenModalVisible(false)}
        title="Abrir caja"
        size="sm"
      >
        <form onSubmit={handleOpenRegister}>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Introduce el importe inicial de la caja.
            </p>
            
            <div>
              <label htmlFor="initialAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Importe inicial *
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500">€</span>
                </div>
                <input
                  type="number"
                  id="initialAmount"
                  className="input pl-7"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsOpenModalVisible(false)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={!initialAmount.trim() || isNaN(parseFloat(initialAmount)) || parseFloat(initialAmount) < 0}
            >
              Abrir caja
            </button>
          </div>
        </form>
      </Modal>
      
      {/* Close Register Modal */}
      <Modal
        isOpen={isCloseModalVisible}
        onClose={() => setIsCloseModalVisible(false)}
        title="Cerrar caja"
        size="md"
      >
        <form onSubmit={handleCloseRegister}>
          <div className="space-y-6">
            <p className="text-gray-600 dark:text-gray-300">
              Introduce el importe final de la caja.
            </p>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">Importe inicial</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {cashRegister && formatCurrency(cashRegister.initialAmount)}
                </p>
              </div>
              
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">Ventas en efectivo</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency((calculateSalesByMethod()['cash'] || 0))}
                </p>
              </div>
            </div>
            
            <div className="rounded-lg bg-primary-50 p-4 dark:bg-primary-900/30">
              <p className="text-sm text-gray-600 dark:text-gray-300">Importe esperado en caja</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(getExpectedCashAmount())}
              </p>
            </div>
            
            <div>
              <label htmlFor="finalAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Importe final real *
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500">€</span>
                </div>
                <input
                  type="number"
                  id="finalAmount"
                  className="input pl-7"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={finalAmount}
                  onChange={(e) => setFinalAmount(e.target.value)}
                  required
                />
              </div>
            </div>
            
            {finalAmount && !isNaN(parseFloat(finalAmount)) && 
             parseFloat(finalAmount) !== getExpectedCashAmount() && (
              <div className={`rounded-lg p-4 ${
                parseFloat(finalAmount) > getExpectedCashAmount() 
                  ? 'bg-success-50 dark:bg-success-900/30' 
                  : 'bg-error-50 dark:bg-error-900/30'
              }`}>
                <p className={`text-sm ${
                  parseFloat(finalAmount) > getExpectedCashAmount()
                    ? 'text-success-700 dark:text-success-300'
                    : 'text-error-700 dark:text-error-300'
                }`}>
                  {parseFloat(finalAmount) > getExpectedCashAmount()
                    ? `Sobran ${formatCurrency(parseFloat(finalAmount) - getExpectedCashAmount())} en caja.`
                    : `Faltan ${formatCurrency(getExpectedCashAmount() - parseFloat(finalAmount))} en caja.`
                  }
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsCloseModalVisible(false)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-error"
              disabled={!finalAmount.trim() || isNaN(parseFloat(finalAmount)) || parseFloat(finalAmount) < 0}
            >
              Cerrar caja
            </button>
          </div>
        </form>
      </Modal>
      
      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalVisible}
        onClose={handleConfirmation}
        title={isRegisterOpen ? "Caja abierta" : "Caja cerrada"}
        size="sm"
      >
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-100 dark:bg-success-900">
            <CheckCircle className="h-8 w-8 text-success-600 dark:text-success-400" />
          </div>
          
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            {isRegisterOpen ? "La caja se ha abierto correctamente" : "La caja se ha cerrado correctamente"}
          </h3>
          
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {isRegisterOpen 
              ? "Ya puedes comenzar a registrar ventas." 
              : "Todas las operaciones de caja han sido registradas."}
          </p>
          
          <div className="mt-6">
            <button
              type="button"
              className="btn btn-primary w-full"
              onClick={handleConfirmation}
            >
              {isRegisterOpen ? "Ir a ventas" : "Aceptar"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default CashRegister;