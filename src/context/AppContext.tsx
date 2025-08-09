import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Product, 
  Supplier, 
  Customer,
  CustomerType, 
  Sale, 
  CashRegister, 
  CartItem,
  PaymentMethod,
  Purchase,
  CompanyInfo
} from '../types';
import { loadData, saveData } from '../utils/storage';

interface AppContextType {
  // Products
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  
  // Suppliers
  suppliers: Supplier[];
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;
  
  // Customers
  customers: Customer[];
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  
  // Customer types
  customerTypes: CustomerType[];
  addCustomerType: (customerType: CustomerType) => void;
  updateCustomerType: (customerType: CustomerType) => void;
  deleteCustomerType: (id: string) => void;
  
  // Cart
  cart: CartItem[];
  selectedCustomerType: CustomerType | null;
  selectedCustomer: Customer | null;
  setSelectedCustomerType: (customerType: CustomerType | null) => void;
  setSelectedCustomer: (customer: Customer | null) => void;
  addToCart: (productCode: string, quantity?: number) => void;
  updateCartItem: (index: number, quantity: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  cartTotal: number;
  
  // Sales
  sales: Sale[];
  completeSale: (paymentMethod: PaymentMethod, notes?: string) => void;
  
  // Cash register
  cashRegister: CashRegister | null;
  isRegisterOpen: boolean;
  openRegister: (initialAmount: number) => void;
  closeRegister: (finalAmount: number) => void;
  
  // Low stock alerts
  lowStockThreshold: number;
  setLowStockThreshold: (threshold: number) => void;
  getLowStockProducts: () => Product[];

  // Purchases
  purchases: Purchase[];
  addPurchase: (purchase: Purchase) => void;
  updatePurchase: (purchase: Purchase) => void;
  deletePurchase: (id: string) => void;
  
  // Product price management
  updateProductPrices: (productId: string, supplierId: string, price: number) => void;
  updateProductProfitMargins: (productId: string, margins: { habitual: number; vip: number; premium: number; wholesale: number; }) => void;
  
  // Company info
  companyInfo: CompanyInfo;
  updateCompanyInfo: (info: CompanyInfo) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Products state
  const [products, setProducts] = useState<Product[]>(() => 
    loadData('products', [])
  );
  
  // Suppliers state
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => 
    loadData('suppliers', [])
  );
  
  // Customers state
  const [customers, setCustomers] = useState<Customer[]>(() => 
    loadData('customers', [])
  );
  
  // Customer types with new default values
  const [customerTypes, setCustomerTypes] = useState<CustomerType[]>(() => 
    loadData('customerTypes', [
      { id: '1', name: 'Habitual', profitMargin: 0.30 },
      { id: '2', name: 'VIP', profitMargin: 0.25 },
      { id: '3', name: 'Premium', profitMargin: 0.20 },
      { id: '4', name: 'Mayorista', profitMargin: 0.15 }
    ])
  );
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerType, setSelectedCustomerType] = useState<CustomerType | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Sales state
  const [sales, setSales] = useState<Sale[]>(() => 
    loadData('sales', [])
  );
  
  // Cash register state
  const [cashRegister, setCashRegister] = useState<CashRegister | null>(() => 
    loadData('currentRegister', null)
  );
  
  // Settings
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(() => 
    loadData('lowStockThreshold', 5)
  );

  // Purchases state
  const [purchases, setPurchases] = useState<Purchase[]>(() => 
    loadData('purchases', [])
  );
  
  // Company info state
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(() => 
    loadData('companyInfo', {
      name: 'Mi Empresa',
      address: 'Calle Principal, 123, 28001 Madrid',
      phone: '+34 123 456 789',
      email: 'info@miempresa.com',
      taxId: 'B12345678',
      website: 'www.miempresa.com',
      description: 'Empresa dedicada a la venta de productos de calidad con el mejor servicio al cliente.'
    })
  );
  
  // Calculate if register is open
  const isRegisterOpen = cashRegister !== null && !cashRegister.closedAt;
  
  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  // Save data when state changes
  useEffect(() => {
    saveData('products', products);
  }, [products]);
  
  useEffect(() => {
    saveData('suppliers', suppliers);
  }, [suppliers]);
  
  useEffect(() => {
    saveData('customers', customers);
  }, [customers]);
  
  useEffect(() => {
    saveData('customerTypes', customerTypes);
  }, [customerTypes]);
  
  useEffect(() => {
    saveData('sales', sales);
  }, [sales]);
  
  useEffect(() => {
    saveData('currentRegister', cashRegister);
  }, [cashRegister]);
  
  useEffect(() => {
    saveData('lowStockThreshold', lowStockThreshold);
  }, [lowStockThreshold]);

  useEffect(() => {
    saveData('purchases', purchases);
  }, [purchases]);
  
  useEffect(() => {
    saveData('companyInfo', companyInfo);
  }, [companyInfo]);
  
  // Product functions
  const addProduct = (product: Product) => {
    // Check if product code already exists
    if (products.some(p => p.code === product.code)) {
      toast.error('Ya existe un producto con ese código');
      return;
    }
    
    // Initialize profit margins if not set
    if (!product.profitMargins) {
      product.profitMargins = {
        habitual: 0.25,   // 25% default margin for habitual customers
        vip: 0.20,        // 20% default margin for VIP customers
        premium: 0.30,    // 30% default margin for premium customers
        wholesale: 0.15   // 15% default margin for wholesale customers
      };
    }
    
    setProducts([...products, product]);
    toast.success('Producto agregado correctamente');
  };
  
  const updateProduct = (product: Product) => {
    // Check if updated code conflicts with another product
    if (products.some(p => p.id !== product.id && p.code === product.code)) {
      toast.error('Ya existe otro producto con ese código');
      return;
    }
    
    setProducts(products.map(p => p.id === product.id ? product : p));
    toast.success('Producto actualizado correctamente');
  };
  
  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    toast.success('Producto eliminado correctamente');
  };
  
  // Supplier functions
  const addSupplier = (supplier: Supplier) => {
    setSuppliers([...suppliers, supplier]);
    toast.success('Proveedor agregado correctamente');
  };
  
  const updateSupplier = (supplier: Supplier) => {
    setSuppliers(suppliers.map(s => s.id === supplier.id ? supplier : s));
    toast.success('Proveedor actualizado correctamente');
  };
  
  const deleteSupplier = (id: string) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
    toast.success('Proveedor eliminado correctamente');
  };
  
  // Customer functions
  const addCustomer = (customer: Customer) => {
    setCustomers([...customers, customer]);
    toast.success('Cliente agregado correctamente');
  };
  
  const updateCustomer = (customer: Customer) => {
    setCustomers(customers.map(c => c.id === customer.id ? customer : c));
    
    // Update customer statistics
    const customerSales = sales.filter(sale => sale.customerId === customer.id);
    const totalPurchases = customerSales.reduce((sum, sale) => sum + sale.total, 0);
    const lastPurchaseDate = customerSales.length > 0 
      ? customerSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
      : undefined;
    
    const updatedCustomer = {
      ...customer,
      totalPurchases,
      lastPurchaseDate
    };
    
    setCustomers(customers.map(c => c.id === customer.id ? updatedCustomer : c));
    toast.success('Cliente actualizado correctamente');
  };
  
  const deleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
    toast.success('Cliente eliminado correctamente');
  };
  
  // Customer type functions
  const addCustomerType = (customerType: CustomerType) => {
    setCustomerTypes([...customerTypes, customerType]);
    toast.success('Tipo de cliente agregado correctamente');
  };
  
  const updateCustomerType = (customerType: CustomerType) => {
    setCustomerTypes(customerTypes.map(ct => ct.id === customerType.id ? customerType : ct));
    toast.success('Tipo de cliente actualizado correctamente');
  };
  
  const deleteCustomerType = (id: string) => {
    // Check if customer type is being used
    const isUsed = customers.some(customer => customer.customerTypeId === id) ||
                   sales.some(sale => sale.customerType.id === id);
    
    if (isUsed) {
      toast.error('No se puede eliminar un tipo de cliente que está siendo utilizado');
      return;
    }
    
    setCustomerTypes(customerTypes.filter(ct => ct.id !== id));
    toast.success('Tipo de cliente eliminado correctamente');
  };
  
  // Cart functions
  const addToCart = (productCode: string, quantity: number = 1) => {
    const product = products.find(p => p.code === productCode);
    
    if (!product) {
      toast.error('Producto no encontrado');
      return;
    }
    
    if (product.stock < quantity) {
      toast.error('Stock insuficiente');
      return;
    }
    
    if (!selectedCustomerType) {
      toast.error('Seleccione un tipo de cliente');
      return;
    }
    
    // Calculate price based on customer type and product's specific margins
    const basePrice = product.purchasePrice;
    const marginKey = selectedCustomerType.name.toLowerCase() as keyof typeof product.profitMargins;
    const margin = product.profitMargins[marginKey] || selectedCustomerType.profitMargin;
    const price = product.hasDiscount 
      ? product.discountPrice 
      : basePrice * (1 + margin);
    
    // Check if product is already in cart
    const existingItemIndex = cart.findIndex(item => item.productId === product.id);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedCart = [...cart];
      const newQuantity = updatedCart[existingItemIndex].quantity + quantity;
      
      if (product.stock < newQuantity) {
        toast.error('Stock insuficiente');
        return;
      }
      
      updatedCart[existingItemIndex].quantity = newQuantity;
      setCart(updatedCart);
    } else {
      // Add new item
      setCart([...cart, {
        productId: product.id,
        code: product.code,
        name: product.name,
        price,
        quantity,
        hasVAT: product.hasVAT
      }]);
    }
    
    toast.success('Producto agregado al carrito');
  };
  
  const updateCartItem = (index: number, quantity: number) => {
    if (index < 0 || index >= cart.length) return;
    
    const item = cart[index];
    const product = products.find(p => p.id === item.productId);
    
    if (!product) return;
    
    if (product.stock < quantity) {
      toast.error('Stock insuficiente');
      return;
    }
    
    const updatedCart = [...cart];
    updatedCart[index].quantity = quantity;
    setCart(updatedCart);
  };
  
  const removeFromCart = (index: number) => {
    if (index < 0 || index >= cart.length) return;
    
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
    toast.success('Producto eliminado del carrito');
  };
  
  const clearCart = () => {
    setCart([]);
    setSelectedCustomerType(null);
    setSelectedCustomer(null);
  };
  
  // Sales functions
  const completeSale = (paymentMethod: PaymentMethod, notes?: string) => {
    if (!isRegisterOpen) {
      toast.error('La caja está cerrada');
      return;
    }
    
    if (cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }
    
    if (!selectedCustomerType) {
      toast.error('Seleccione un tipo de cliente');
      return;
    }
    
    // Create sale object
    const sale: Sale = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      items: [...cart],
      total: cartTotal,
      customerType: selectedCustomerType,
      customerId: selectedCustomer?.id,
      paymentMethod,
      cashRegisterId: cashRegister?.id || '',
      notes: notes || ''
    };
    
    // Update product stock
    const updatedProducts = [...products];
    for (const item of cart) {
      const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
      if (productIndex >= 0) {
        updatedProducts[productIndex].stock -= item.quantity;
      }
    }
    
    // Update customer statistics if customer is selected
    if (selectedCustomer) {
      const updatedCustomers = [...customers];
      const customerIndex = updatedCustomers.findIndex(c => c.id === selectedCustomer.id);
      if (customerIndex >= 0) {
        updatedCustomers[customerIndex].totalPurchases += cartTotal;
        updatedCustomers[customerIndex].lastPurchaseDate = sale.date;
        setCustomers(updatedCustomers);
      }
    }
    
    // Save changes
    setSales([...sales, sale]);
    setProducts(updatedProducts);
    clearCart();
    
    toast.success('Venta completada correctamente');
    return sale;
  };
  
  // Cash register functions
  const openRegister = (initialAmount: number) => {
    if (isRegisterOpen) {
      toast.error('La caja ya está abierta');
      return;
    }
    
    const register: CashRegister = {
      id: Date.now().toString(),
      openedAt: new Date().toISOString(),
      initialAmount,
      closedAt: null,
      finalAmount: null
    };
    
    setCashRegister(register);
    toast.success('Caja abierta correctamente');
  };
  
  const closeRegister = (finalAmount: number) => {
    if (!cashRegister || !isRegisterOpen) {
      toast.error('La caja no está abierta');
      return;
    }
    
    const updatedRegister: CashRegister = {
      ...cashRegister,
      closedAt: new Date().toISOString(),
      finalAmount
    };
    
    setCashRegister(updatedRegister);
    
    // Add to register history
    const registers = loadData('registerHistory', []);
    saveData('registerHistory', [...registers, updatedRegister]);
    
    toast.success('Caja cerrada correctamente');
  };
  
  // Low stock functions
  const getLowStockProducts = () => {
    return products.filter(product => {
      // Use individual threshold if set, otherwise use global threshold
      const threshold = product.lowStockThreshold !== undefined 
        ? product.lowStockThreshold 
        : lowStockThreshold;
      return product.stock <= threshold;
    });
  };

  // Purchase functions
  const addPurchase = (purchase: Purchase) => {
    setPurchases([...purchases, purchase]);
    
    // Update product stock and prices
    const updatedProducts = [...products];
    for (const item of purchase.items) {
      const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
      if (productIndex >= 0) {
        updatedProducts[productIndex].stock += item.quantity;
        
        // Update supplier price if different
        if (!updatedProducts[productIndex].prices) {
          updatedProducts[productIndex].prices = {};
        }
        updatedProducts[productIndex].prices[purchase.supplierId] = item.price;
        
        // Add supplier to product's suppliers list if not present
        if (!updatedProducts[productIndex].suppliers) {
          updatedProducts[productIndex].suppliers = [];
        }
        if (!updatedProducts[productIndex].suppliers.includes(purchase.supplierId)) {
          updatedProducts[productIndex].suppliers.push(purchase.supplierId);
        }
        
        // Update purchase price and recalculate sale price
        updatedProducts[productIndex].purchasePrice = item.price;
      }
    }
    
    setProducts(updatedProducts);
    toast.success('Compra registrada correctamente');
  };
  
  const updatePurchase = (purchase: Purchase) => {
    setPurchases(purchases.map(p => p.id === purchase.id ? purchase : p));
    toast.success('Compra actualizada correctamente');
  };
  
  const deletePurchase = (id: string) => {
    setPurchases(purchases.filter(p => p.id !== id));
    toast.success('Compra eliminada correctamente');
  };
  
  // Product price management
  const updateProductPrices = (productId: string, supplierId: string, price: number) => {
    setProducts(products.map(product => {
      if (product.id === productId) {
        return {
          ...product,
          prices: {
            ...(product.prices || {}),
            [supplierId]: price
          }
        };
      }
      return product;
    }));
  };
  
  const updateProductProfitMargins = (productId: string, margins: { habitual: number; vip: number; premium: number; wholesale: number; }) => {
    setProducts(products.map(product => {
      if (product.id === productId) {
        return {
          ...product,
          profitMargins: margins
        };
      }
      return product;
    }));
  };
  
  // Company info functions
  const updateCompanyInfo = (info: CompanyInfo) => {
    setCompanyInfo(info);
    toast.success('Información de la empresa actualizada correctamente');
  };
  
  const value: AppContextType = {
    // Products
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    
    // Suppliers
    suppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    
    // Customers
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    
    // Customer types
    customerTypes,
    addCustomerType,
    updateCustomerType,
    deleteCustomerType,
    
    // Cart
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
    
    // Sales
    sales,
    completeSale,
    
    // Cash register
    cashRegister,
    isRegisterOpen,
    openRegister,
    closeRegister,
    
    // Low stock alerts
    lowStockThreshold,
    setLowStockThreshold,
    getLowStockProducts,

    // Purchases
    purchases,
    addPurchase,
    updatePurchase,
    deletePurchase,
    
    // Product price management
    updateProductPrices,
    updateProductProfitMargins,
    
    // Company info
    companyInfo,
    updateCompanyInfo
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  
  return context;
}