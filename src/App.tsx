import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Suppliers from './pages/Suppliers';
import Customers from './pages/Customers';
import Sales from './pages/Sales';
import Purchases from './pages/Purchases';
import CashRegister from './pages/CashRegister';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { useAppContext } from './context/AppContext';

function App() {
  const { isRegisterOpen } = useAppContext();

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="productos" element={<Products />} />
        <Route path="proveedores" element={<Suppliers />} />
        <Route path="clientes" element={<Customers />} />
        <Route path="compras" element={<Purchases />} />
        <Route 
          path="ventas" 
          element={
            isRegisterOpen ? <Sales /> : <Navigate to="/caja" replace />
          } 
        />
        <Route path="caja" element={<CashRegister />} />
        <Route path="reportes" element={<Reports />} />
        <Route path="configuracion" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;