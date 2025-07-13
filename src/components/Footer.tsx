import React from 'react';
import { Building2, MapPin, Phone, Mail, Globe, FileText } from 'lucide-react';
import { CompanyInfo } from '../types';

interface FooterProps {
  companyInfo: CompanyInfo;
}

function Footer({ companyInfo }: FooterProps) {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Building2 className="h-6 w-6 text-primary-400" />
              <h3 className="text-xl font-bold">{companyInfo.name}</h3>
            </div>
            
            {companyInfo.description && (
              <p className="text-gray-300 mb-4 leading-relaxed">
                {companyInfo.description}
              </p>
            )}
            
            <div className="space-y-2">
              {companyInfo.address && (
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{companyInfo.address}</span>
                </div>
              )}
              
              {companyInfo.taxId && (
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">NIF/CIF: {companyInfo.taxId}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-primary-300">Contacto</h4>
            <div className="space-y-3">
              {companyInfo.phone && (
                <a 
                  href={`tel:${companyInfo.phone}`}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors group"
                >
                  <Phone className="h-4 w-4 text-gray-400 group-hover:text-primary-400 transition-colors" />
                  <span className="text-sm">{companyInfo.phone}</span>
                </a>
              )}
              
              {companyInfo.email && (
                <a 
                  href={`mailto:${companyInfo.email}`}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors group"
                >
                  <Mail className="h-4 w-4 text-gray-400 group-hover:text-primary-400 transition-colors" />
                  <span className="text-sm">{companyInfo.email}</span>
                </a>
              )}
              
              {companyInfo.website && (
                <a 
                  href={companyInfo.website.startsWith('http') ? companyInfo.website : `https://${companyInfo.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors group"
                >
                  <Globe className="h-4 w-4 text-gray-400 group-hover:text-primary-400 transition-colors" />
                  <span className="text-sm">{companyInfo.website}</span>
                </a>
              )}
            </div>
          </div>
          
          {/* System Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-primary-300">Sistema</h4>
            <div className="space-y-2">
              <p className="text-gray-300 text-sm">
                Sistema de Gestión de Inventario y Ventas
              </p>
              <p className="text-gray-400 text-xs">
                Versión 1.0
              </p>
              <p className="text-gray-400 text-xs">
                © {currentYear} {companyInfo.name}
              </p>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} {companyInfo.name}. Todos los derechos reservados.
            </p>
            <p className="text-gray-500 text-xs text-center md:text-right">
              Desarrollado con ❤️ para la gestión empresarial
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;