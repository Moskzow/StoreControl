import React, { useRef } from 'react';
import { Monitor, Moon, Sun, Palette, Upload, X, Image } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Modal from './ui/Modal';

interface ThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

function ThemeSelector({ isOpen, onClose }: ThemeSelectorProps) {
  const { theme, setTheme, colorScheme, setColorScheme, logo, setLogo } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const themes = [
    { id: 'light' as const, name: 'Claro', icon: Sun },
    { id: 'dark' as const, name: 'Oscuro', icon: Moon },
    { id: 'auto' as const, name: 'Automático', icon: Monitor },
  ];
  
  const colorSchemes = [
    { 
      id: 'blue' as const, 
      name: 'Azul', 
      colors: {
        primary: 'bg-blue-500',
        secondary: 'bg-blue-100',
        accent: 'bg-blue-600'
      }
    },
    { 
      id: 'green' as const, 
      name: 'Verde', 
      colors: {
        primary: 'bg-emerald-500',
        secondary: 'bg-emerald-100',
        accent: 'bg-emerald-600'
      }
    },
    { 
      id: 'purple' as const, 
      name: 'Morado', 
      colors: {
        primary: 'bg-purple-500',
        secondary: 'bg-purple-100',
        accent: 'bg-purple-600'
      }
    },
  ];
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 2MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setLogo(result);
    };
    reader.readAsDataURL(file);
  };
  
  const handleRemoveLogo = () => {
    setLogo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configuración de Apariencia"
      size="md"
    >
      <div className="space-y-8">
        {/* Logo Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Logo de la Empresa
          </h3>
          
          <div className="space-y-4">
            {logo ? (
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <img
                    src={logo}
                    alt="Logo de la empresa"
                    className="h-16 w-16 object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Logo actual de la empresa
                  </p>
                  <div className="mt-2 flex space-x-2">
                    <button
                      type="button"
                      className="btn btn-outline text-xs"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Cambiar
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline text-error-600 border-error-300 hover:bg-error-50 dark:text-error-400 dark:border-error-800 dark:hover:bg-error-900/30 text-xs"
                      onClick={handleRemoveLogo}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <Image className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No hay logo configurado
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary mt-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Subir Logo
                  </button>
                </div>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Formatos soportados: JPG, PNG, SVG. Tamaño máximo: 2MB
            </p>
          </div>
        </div>
        
        {/* Theme Selection */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Modo de Apariencia
          </h3>
          
          <div className="grid grid-cols-3 gap-3">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon;
              return (
                <button
                  key={themeOption.id}
                  type="button"
                  className={`relative flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-200 ${
                    theme === themeOption.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setTheme(themeOption.id)}
                >
                  <Icon className={`h-6 w-6 mb-2 ${
                    theme === themeOption.id
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    theme === themeOption.id
                      ? 'text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {themeOption.name}
                  </span>
                  {theme === themeOption.id && (
                    <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary-500"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Color Scheme Selection */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Esquema de Colores
          </h3>
          
          <div className="grid grid-cols-3 gap-3">
            {colorSchemes.map((scheme) => (
              <button
                key={scheme.id}
                type="button"
                className={`relative flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-200 ${
                  colorScheme === scheme.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => setColorScheme(scheme.id)}
              >
                <div className="flex space-x-1 mb-2">
                  <div className={`w-3 h-3 rounded-full ${scheme.colors.primary}`}></div>
                  <div className={`w-3 h-3 rounded-full ${scheme.colors.secondary}`}></div>
                  <div className={`w-3 h-3 rounded-full ${scheme.colors.accent}`}></div>
                </div>
                <span className={`text-sm font-medium ${
                  colorScheme === scheme.id
                    ? 'text-primary-700 dark:text-primary-300'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {scheme.name}
                </span>
                {colorScheme === scheme.id && (
                  <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary-500"></div>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Preview Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Vista Previa
          </h3>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center space-x-3 mb-3">
              {logo ? (
                <img src={logo} alt="Logo" className="h-8 w-8 object-contain" />
              ) : (
                <div className="h-8 w-8 bg-primary-500 rounded flex items-center justify-center">
                  <Palette className="h-4 w-4 text-white" />
                </div>
              )}
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Sistema de Gestión
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Inventario y Ventas
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex space-x-2">
                <div className="btn btn-primary text-xs">Botón Principal</div>
                <div className="btn btn-outline text-xs">Botón Secundario</div>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Esta es una vista previa de cómo se verá la interfaz con la configuración actual.
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          className="btn btn-primary"
          onClick={onClose}
        >
          Aplicar Cambios
        </button>
      </div>
    </Modal>
  );
}

export default ThemeSelector;