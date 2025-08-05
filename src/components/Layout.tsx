import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutGrid, Package, Users, ShoppingCart, DollarSign, PieChart, Settings, Menu, X, AlertCircle, ShoppingBag, UserCheck, ChevronLeft, ChevronRight, Palette } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import Footer from './Footer';
import ThemeSelector from './ThemeSelector';

function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isRegisterOpen, getLowStockProducts, companyInfo } = useAppContext();
  const { logo, colorScheme, isDark } = useTheme();
  const location = useLocation();
  
  const lowStockProducts = getLowStockProducts();
  const hasLowStockAlert = lowStockProducts.length > 0;
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Navigation items organized in logical business flow
  const navItems = [
    { 
      to: '/', 
      label: 'Dashboard', 
      icon: <LayoutGrid size={20} />,
      description: 'Vista general del negocio'
    },
    { 
      to: '/ventas', 
      label: 'Ventas', 
      icon: <ShoppingCart size={20} />, 
      disabled: !isRegisterOpen,
      description: 'Registrar nuevas ventas'
    },
    { 
      to: '/productos', 
      label: 'Productos', 
      icon: <Package size={20} />,
      description: 'Gestión de inventario'
    },
    { 
      to: '/clientes', 
      label: 'Clientes', 
      icon: <UserCheck size={20} />,
      description: 'Base de clientes'
    },
    { 
      to: '/compras', 
      label: 'Compras', 
      icon: <ShoppingBag size={20} />,
      description: 'Adquisiciones y reposición'
    },
    { 
      to: '/proveedores', 
      label: 'Proveedores', 
      icon: <Users size={20} />,
      description: 'Cadena de suministro'
    },
    { 
      to: '/caja', 
      label: 'Caja', 
      icon: <DollarSign size={20} />,
      description: 'Control de caja registradora'
    },
    { 
      to: '/reportes', 
      label: 'Reportes', 
      icon: <PieChart size={20} />,
      description: 'Análisis y estadísticas'
    },
    { 
      to: '/configuracion', 
      label: 'Configuración', 
      icon: <Settings size={20} />,
      description: 'Ajustes del sistema'
    },
  ];
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className={`header-primary text-white shadow-lg fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled ? 'py-2' : 'py-4'
      }`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {logo ? (
              <div className={`relative transition-all duration-300 ease-in-out ${
                isScrolled ? 'w-10 h-10' : 'w-12 h-12'
              }`}>
                <img 
                  src={logo} 
                  alt="Logo" 
                  className="w-full h-full object-contain bg-white rounded-lg p-1.5 border-2 border-white/20 shadow-lg"
                  style={{
                    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))'
                  }}
                />
              </div>
            ) : (
              <div className={`transition-all duration-300 ease-in-out ${
                isScrolled ? 'scale-90' : 'scale-100'
              }`}>
                <ShoppingCart size={isScrolled ? 24 : 28} />
              </div>
            )}
            <div className={`transition-all duration-300 ease-in-out ${
              isScrolled ? 'scale-95' : 'scale-100'
            }`}>
              <h1 className={`font-bold transition-all duration-300 ease-in-out ${
                isScrolled ? 'text-lg' : 'text-xl'
              }`}>
                {companyInfo.name}
              </h1>
              <p className={`text-primary-200 transition-all duration-300 ease-in-out ${
                isScrolled ? 'text-xs' : 'text-xs'
              }`}>
                Sistema de Gestión
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {hasLowStockAlert && (
              <NavLink 
                to="/productos" 
                className="relative flex items-center text-warning-300 hover:text-warning-200 transition-colors"
                title="Productos con bajo stock"
              >
                <AlertCircle size={20} />
                <span className="absolute -top-1 -right-1 bg-error-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {lowStockProducts.length}
                </span>
              </NavLink>
            )}
            
            <button
              type="button"
              className="flex items-center text-primary-200 hover:text-white transition-colors"
              onClick={() => setIsThemeSelectorOpen(true)}
              title="Configurar apariencia"
            >
              <Palette size={20} />
            </button>
            
            <button 
              className="md:hidden text-white"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>
      
      {/* Spacer for fixed header */}
      <div className={`transition-all duration-300 ease-in-out ${
        isScrolled ? 'h-16' : 'h-20'
      }`}></div>
      
      <div className="flex flex-1">
        {/* Sidebar for desktop */}
        <aside className={`hidden md:flex flex-col bg-white shadow-md dark:bg-gray-800 transition-all duration-300 ease-in-out relative ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        }`}>
          {/* Sidebar toggle button */}
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1.5 shadow-md hover:shadow-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 z-10"
            aria-label={isSidebarCollapsed ? 'Expandir menú' : 'Contraer menú'}
          >
            {isSidebarCollapsed ? (
              <ChevronRight size={16} className="text-gray-600 dark:text-gray-300" />
            ) : (
              <ChevronLeft size={16} className="text-gray-600 dark:text-gray-300" />
            )}
          </button>
          
          <nav className="flex-1 py-6 px-2">
            {/* Menu sections */}
            <div className="space-y-6">
              {/* Main Operations Section */}
              <div>
                {!isSidebarCollapsed && (
                  <div className="px-3 mb-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Operaciones Principales
                    </h3>
                  </div>
                )}
                <ul className="space-y-1">
                  {navItems.slice(0, 4).map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        className={({ isActive }) => 
                          `flex items-center px-3 py-3 rounded-md transition-all duration-200 group relative ${
                            isActive 
                              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                          } ${item.disabled ? 'opacity-50 pointer-events-none' : ''}`
                        }
                        title={isSidebarCollapsed ? item.label : undefined}
                      >
                        <div className="flex-shrink-0">
                          {item.icon}
                        </div>
                        
                        <span className={`ml-3 transition-all duration-300 ${
                          isSidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'
                        }`}>
                          {item.label}
                        </span>
                        
                        {item.to === '/productos' && hasLowStockAlert && (
                          <span className={`ml-auto bg-error-500 text-white text-xs rounded-full px-1.5 py-0.5 transition-all duration-300 ${
                            isSidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'
                          }`}>
                            {lowStockProducts.length}
                          </span>
                        )}
                        
                        {/* Tooltip for collapsed state */}
                        {isSidebarCollapsed && (
                          <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 min-w-max">
                            <div className="font-medium">{item.label}</div>
                            <div className="text-xs text-gray-300 mt-1">{item.description}</div>
                            {item.to === '/productos' && hasLowStockAlert && (
                              <span className="ml-2 bg-error-500 text-white text-xs rounded-full px-1.5 py-0.5">
                                {lowStockProducts.length}
                              </span>
                            )}
                            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                          </div>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Supply Chain Section */}
              <div>
                {!isSidebarCollapsed && (
                  <div className="px-3 mb-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Cadena de Suministro
                    </h3>
                  </div>
                )}
                <ul className="space-y-1">
                  {navItems.slice(4, 6).map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        className={({ isActive }) => 
                          `flex items-center px-3 py-3 rounded-md transition-all duration-200 group relative ${
                            isActive 
                              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                          } ${item.disabled ? 'opacity-50 pointer-events-none' : ''}`
                        }
                        title={isSidebarCollapsed ? item.label : undefined}
                      >
                        <div className="flex-shrink-0">
                          {item.icon}
                        </div>
                        
                        <span className={`ml-3 transition-all duration-300 ${
                          isSidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'
                        }`}>
                          {item.label}
                        </span>
                        
                        {/* Tooltip for collapsed state */}
                        {isSidebarCollapsed && (
                          <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 min-w-max">
                            <div className="font-medium">{item.label}</div>
                            <div className="text-xs text-gray-300 mt-1">{item.description}</div>
                            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                          </div>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Management Section */}
              <div>
                {!isSidebarCollapsed && (
                  <div className="px-3 mb-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Gestión y Control
                    </h3>
                  </div>
                )}
                <ul className="space-y-1">
                  {navItems.slice(6).map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        className={({ isActive }) => 
                          `flex items-center px-3 py-3 rounded-md transition-all duration-200 group relative ${
                            isActive 
                              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                          } ${item.disabled ? 'opacity-50 pointer-events-none' : ''}`
                        }
                        title={isSidebarCollapsed ? item.label : undefined}
                      >
                        <div className="flex-shrink-0">
                          {item.icon}
                        </div>
                        
                        <span className={`ml-3 transition-all duration-300 ${
                          isSidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'
                        }`}>
                          {item.label}
                        </span>
                        
                        {/* Tooltip for collapsed state */}
                        {isSidebarCollapsed && (
                          <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 min-w-max">
                            <div className="font-medium">{item.label}</div>
                            <div className="text-xs text-gray-300 mt-1">{item.description}</div>
                            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                          </div>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </nav>
          
          <div className={`p-4 border-t border-gray-200 dark:border-gray-700 transition-all duration-300 ${
            isSidebarCollapsed ? 'px-2' : 'px-4'
          }`}>
            <div className={`text-sm text-gray-500 dark:text-gray-400 ${
              isSidebarCollapsed ? 'text-center' : ''
            }`}>
              {isRegisterOpen ? (
                <div className={`flex items-center text-success-600 dark:text-success-400 ${
                  isSidebarCollapsed ? 'justify-center' : ''
                }`}>
                  <span className="w-2 h-2 rounded-full bg-success-500 mr-2"></span>
                  <span className={`transition-all duration-300 ${
                    isSidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'
                  }`}>
                    Caja abierta
                  </span>
                </div>
              ) : (
                <div className={`flex items-center text-error-600 dark:text-error-400 ${
                  isSidebarCollapsed ? 'justify-center' : ''
                }`}>
                  <span className="w-2 h-2 rounded-full bg-error-500 mr-2"></span>
                  <span className={`transition-all duration-300 ${
                    isSidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'
                  }`}>
                    Caja cerrada
                  </span>
                </div>
              )}
            </div>
          </div>
        </aside>
        
        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeMobileMenu}
          ></div>
        )}
        
        {/* Mobile sidebar */}
        <aside 
          className={`md:hidden fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform z-50 dark:bg-gray-800 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ top: isScrolled ? '64px' : '80px' }}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {logo ? (
                <img 
                  src={logo} 
                  alt="Logo" 
                  className="h-6 w-6 object-contain"
                />
              ) : (
                <ShoppingCart size={20} />
              )}
              <h2 className="text-lg font-bold">Menú</h2>
            </div>
            <button 
              className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
              onClick={closeMobileMenu}
            >
              <X size={20} />
            </button>
          </div>
          
          <nav className="flex-1 py-4 px-2 overflow-y-auto">
            <div className="space-y-6">
              {/* Main Operations Section */}
              <div>
                <div className="px-3 mb-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Operaciones Principales
                  </h3>
                </div>
                <ul className="space-y-1">
                  {navItems.slice(0, 4).map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        className={({ isActive }) => 
                          `flex items-center px-4 py-3 rounded-md transition-colors ${
                            isActive 
                              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                          } ${item.disabled ? 'opacity-50 pointer-events-none' : ''}`
                        }
                        onClick={closeMobileMenu}
                      >
                        {item.icon}
                        <span className="ml-3">{item.label}</span>
                        
                        {item.to === '/productos' && hasLowStockAlert && (
                          <span className="ml-auto bg-error-500 text-white text-xs rounded-full px-1.5 py-0.5">
                            {lowStockProducts.length}
                          </span>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Supply Chain Section */}
              <div>
                <div className="px-3 mb-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Cadena de Suministro
                  </h3>
                </div>
                <ul className="space-y-1">
                  {navItems.slice(4, 6).map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        className={({ isActive }) => 
                          `flex items-center px-4 py-3 rounded-md transition-colors ${
                            isActive 
                              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                          } ${item.disabled ? 'opacity-50 pointer-events-none' : ''}`
                        }
                        onClick={closeMobileMenu}
                      >
                        {item.icon}
                        <span className="ml-3">{item.label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Management Section */}
              <div>
                <div className="px-3 mb-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Gestión y Control
                  </h3>
                </div>
                <ul className="space-y-1">
                  {navItems.slice(6).map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        className={({ isActive }) => 
                          `flex items-center px-4 py-3 rounded-md transition-colors ${
                            isActive 
                              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                          } ${item.disabled ? 'opacity-50 pointer-events-none' : ''}`
                        }
                        onClick={closeMobileMenu}
                      >
                        {item.icon}
                        <span className="ml-3">{item.label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </nav>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {isRegisterOpen ? (
                <span className="flex items-center text-success-600 dark:text-success-400">
                  <span className="w-2 h-2 rounded-full bg-success-500 mr-2"></span>
                  Caja abierta
                </span>
              ) : (
                <span className="flex items-center text-error-600 dark:text-error-400">
                  <span className="w-2 h-2 rounded-full bg-error-500 mr-2"></span>
                  Caja cerrada
                </span>
              )}
            </div>
          </div>
        </aside>
        
        {/* Main content */}
        <main className={`flex-1 p-4 md:p-6 overflow-auto transition-all duration-300 ${
          isSidebarCollapsed ? 'md:ml-0' : 'md:ml-0'
        }`}>
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {navItems.find(item => item.to === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>
          
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Footer */}
      <Footer companyInfo={companyInfo} />
      
      {/* Theme Selector Modal */}
      <ThemeSelector 
        isOpen={isThemeSelectorOpen}
        onClose={() => setIsThemeSelectorOpen(false)}
      />
    </div>
  );
}

export default Layout;