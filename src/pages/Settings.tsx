import React, { useState, useRef } from 'react';
import { Settings as SettingsIcon, AlertTriangle, Save, Download, Upload, FileText, Code, Building2, Palette } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { clearAllData } from '../utils/storage';
import { exportAsJSON, exportAsXML, downloadFile } from '../utils/dataExport';
import { importFromJSON, importFromXML } from '../utils/dataImport';
import { CompanyInfo } from '../types';
import Modal from '../components/ui/Modal';
import ThemeSelector from '../components/ThemeSelector';

type ExportFormat = 'json' | 'xml';

function Settings() {
  const { 
    lowStockThreshold, 
    setLowStockThreshold,
    products,
    suppliers,
    customers,
    sales,
    addProduct,
    addSupplier,
    companyInfo,
    updateCompanyInfo
  } = useAppContext();
  
  const [newThreshold, setNewThreshold] = useState(lowStockThreshold);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [importError, setImportError] = useState('');
  const [selectedExportFormat, setSelectedExportFormat] = useState<ExportFormat>('json');
  const [currentCompanyInfo, setCurrentCompanyInfo] = useState<CompanyInfo>(companyInfo);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle threshold change
  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setNewThreshold(value);
    }
  };
  
  // Save settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setLowStockThreshold(newThreshold);
    setSuccessMessage('Configuración guardada correctamente');
    setIsSuccessModalOpen(true);
  };
  
  // Save company info
  const handleSaveCompanyInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyInfo(currentCompanyInfo);
    setSuccessMessage('Información de la empresa actualizada correctamente');
    setIsSuccessModalOpen(true);
  };
  
  // Handle company info change
  const handleCompanyInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentCompanyInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Reset all data
  const handleResetData = () => {
    clearAllData();
    setIsResetModalOpen(false);
    window.location.reload();
  };
  
  // Export data
  const handleExportData = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    
    if (selectedExportFormat === 'json') {
      const jsonContent = exportAsJSON(products, suppliers);
      downloadFile(jsonContent, `inventory_data_${timestamp}.json`, 'application/json');
    } else {
      const xmlContent = exportAsXML(products, suppliers);
      downloadFile(xmlContent, `inventory_data_${timestamp}.xml`, 'application/xml');
    }
  };
  
  // Import data
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        let result;
        
        // Determine file type and import accordingly
        if (file.name.toLowerCase().endsWith('.json')) {
          result = importFromJSON(content);
        } else if (file.name.toLowerCase().endsWith('.xml')) {
          result = importFromXML(content);
        } else {
          // Try to detect format by content
          if (content.trim().startsWith('<?xml') || content.trim().startsWith('<Workbook') || content.trim().startsWith('<inventoryData')) {
            result = importFromXML(content);
          } else {
            result = importFromJSON(content);
          }
        }
        
        if (result.success && result.data) {
          // Import products
          result.data.products.forEach((product) => {
            addProduct(product);
          });
          
          // Import suppliers
          result.data.suppliers.forEach((supplier) => {
            addSupplier(supplier);
          });
          
          setImportError('');
          setSuccessMessage(result.message);
          setIsSuccessModalOpen(true);
        } else {
          setImportError(result.message);
        }
      } catch (error) {
        setImportError('Error al procesar el archivo. Verifica que el formato sea correcto.');
      }
    };
    
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Company Information */}
      <div className="card p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Building2 className="h-6 w-6 text-primary-500" />
          <h2 className="text-xl font-medium text-gray-900 dark:text-white">
            Información de la empresa
          </h2>
        </div>
        
        <form onSubmit={handleSaveCompanyInfo}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre de la empresa *
              </label>
              <input
                type="text"
                id="companyName"
                name="name"
                className="input mt-1"
                value={currentCompanyInfo.name}
                onChange={handleCompanyInfoChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="companyTaxId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                NIF/CIF *
              </label>
              <input
                type="text"
                id="companyTaxId"
                name="taxId"
                className="input mt-1"
                value={currentCompanyInfo.taxId}
                onChange={handleCompanyInfoChange}
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Dirección *
              </label>
              <input
                type="text"
                id="companyAddress"
                name="address"
                className="input mt-1"
                value={currentCompanyInfo.address}
                onChange={handleCompanyInfoChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="companyPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Teléfono *
              </label>
              <input
                type="tel"
                id="companyPhone"
                name="phone"
                className="input mt-1"
                value={currentCompanyInfo.phone}
                onChange={handleCompanyInfoChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="companyEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email *
              </label>
              <input
                type="email"
                id="companyEmail"
                name="email"
                className="input mt-1"
                value={currentCompanyInfo.email}
                onChange={handleCompanyInfoChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="companyWebsite" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Sitio web
              </label>
              <input
                type="url"
                id="companyWebsite"
                name="website"
                className="input mt-1"
                value={currentCompanyInfo.website || ''}
                onChange={handleCompanyInfoChange}
                placeholder="www.miempresa.com"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="companyDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Descripción de la empresa
              </label>
              <textarea
                id="companyDescription"
                name="description"
                rows={3}
                className="input mt-1"
                value={currentCompanyInfo.description || ''}
                onChange={handleCompanyInfoChange}
                placeholder="Breve descripción de la empresa y sus servicios..."
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="btn btn-primary"
            >
              <Save className="mr-2 h-4 w-4" />
              Guardar información
            </button>
          </div>
        </form>
      </div>
      
      {/* General Settings */}
      <div className="card p-6">
        <div className="flex items-center space-x-2">
          <SettingsIcon className="h-6 w-6 text-primary-500" />
          <h2 className="text-xl font-medium text-gray-900 dark:text-white">
            Configuración general
          </h2>
        </div>
        
        <div className="mt-6">
          <form onSubmit={handleSaveSettings}>
            <div className="space-y-4">
              <div>
                <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Umbral de stock bajo
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    id="lowStockThreshold"
                    className="input"
                    min="0"
                    value={newThreshold}
                    onChange={handleThresholdChange}
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Los productos con stock menor o igual a este valor se marcarán como "stock bajo".
                </p>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={newThreshold === lowStockThreshold}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Guardar cambios
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {/* Import/Export Data */}
      <div className="card p-6">
        <div className="flex items-center space-x-2">
          <Download className="h-6 w-6 text-primary-500" />
          <h2 className="text-xl font-medium text-gray-900 dark:text-white">
            Importar/Exportar datos
          </h2>
        </div>
        
        <div className="mt-6 space-y-6">
          {/* Export Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Exportar datos
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Descarga todos los productos y proveedores en el formato que prefieras.
            </p>
            
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Formato de exportación (Backup completo)
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="exportFormat"
                      value="json"
                      checked={selectedExportFormat === 'json'}
                      onChange={(e) => setSelectedExportFormat(e.target.value as ExportFormat)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600"
                    />
                    <div className="ml-2 flex items-center">
                      <Code className="h-4 w-4 text-primary-500 mr-1" />
                      <span className="text-sm">JSON (Recomendado)</span>
                    </div>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="exportFormat"
                      value="xml"
                      checked={selectedExportFormat === 'xml'}
                      onChange={(e) => setSelectedExportFormat(e.target.value as ExportFormat)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600"
                    />
                    <div className="ml-2 flex items-center">
                      <FileText className="h-4 w-4 text-secondary-500 mr-1" />
                      <span className="text-sm">XML (Compatible con Excel)</span>
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleExportData}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar backup completo
                </button>
                
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {products.length} productos, {suppliers.length} proveedores, {customers.length} clientes, {sales.length} ventas + configuración
                </div>
              </div>
            </div>
          </div>
          
          {/* Import Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Importar datos (Restaurar backup)
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Restaura un backup completo del sistema incluyendo todos los datos y configuración.
            </p>
            
            <div className="mt-4 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/30 dark:border-blue-800">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                  Backup completo incluye:
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                  <li className="flex items-center">
                    <FileText className="h-3 w-3 mr-2" />
                    <strong>Datos:</strong> Productos, proveedores, clientes, ventas, compras
                  </li>
                  <li className="flex items-center">
                    <Palette className="h-3 w-3 mr-2" />
                    <strong>Configuración:</strong> Tema, colores, logo, umbrales
                  </li>
                  <li className="flex items-center">
                    <Building2 className="h-3 w-3 mr-2" />
                    <strong>Empresa:</strong> Información completa de la empresa
                  </li>
                </ul>
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".json,.xml"
                onChange={handleFileImport}
              />
              
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleImportClick}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Restaurar backup
                </button>
                
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Archivos de backup .json o .xml
                </div>
              </div>
              
              {importError && (
                <div className="bg-error-50 border border-error-200 rounded-lg p-4 dark:bg-error-900/30 dark:border-error-800">
                  <p className="text-sm text-error-700 dark:text-error-400">
                    <strong>Error:</strong> {importError}
                  </p>
                </div>
              )}
              
              <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 dark:bg-warning-900/30 dark:border-warning-800">
                <p className="text-sm text-warning-700 dark:text-warning-400">
                  <strong>Importante:</strong> La importación agregará los datos al sistema actual. 
                  Si deseas reemplazar completamente los datos, primero reinicia el sistema desde la zona de peligro.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Danger Zone */}
      <div className="card p-6">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-6 w-6 text-error-500" />
          <h2 className="text-xl font-medium text-gray-900 dark:text-white">
            Zona de peligro
          </h2>
        </div>
        
        <div className="mt-6">
          <div className="rounded-md bg-error-50 p-4 dark:bg-error-900/30">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-error-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-error-800 dark:text-error-300">
                  Reiniciar todos los datos
                </h3>
                <div className="mt-2 text-sm text-error-700 dark:text-error-400">
                  <p>
                    Esta acción eliminará todos los datos del sistema, incluyendo productos, proveedores, ventas y configuraciones.
                    Esta acción no se puede deshacer.
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    className="btn btn-error"
                    onClick={() => setIsResetModalOpen(true)}
                  >
                    Reiniciar datos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Confirmar reinicio de datos"
        size="sm"
      >
        <div>
          <p className="text-gray-700 dark:text-gray-300">
            ¿Estás seguro de que deseas reiniciar todos los datos? Esta acción eliminará:
          </p>
          <ul className="mt-2 list-disc pl-5 text-gray-700 dark:text-gray-300">
            <li>Todos los productos</li>
            <li>Todos los proveedores</li>
            <li>Todas las ventas y registros de caja</li>
            <li>Todas las configuraciones</li>
          </ul>
          <p className="mt-4 font-bold text-error-600 dark:text-error-400">
            Esta acción no se puede deshacer.
          </p>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsResetModalOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-error"
              onClick={handleResetData}
            >
              Sí, reiniciar datos
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Success Modal */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Operación completada"
        size="sm"
      >
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-100 dark:bg-success-900">
            <Save className="h-6 w-6 text-success-600 dark:text-success-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            {successMessage}
          </h3>
          <div className="mt-6">
            <button
              type="button"
              className="btn btn-primary w-full"
              onClick={() => setIsSuccessModalOpen(false)}
            >
              Aceptar
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Theme Selector Modal */}
      <ThemeSelector 
        isOpen={isThemeSelectorOpen}
        onClose={() => setIsThemeSelectorOpen(false)}
      />
    </div>
  );
}

export default Settings;