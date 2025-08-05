import { Product, Supplier } from '../types';

export interface ExportData {
  products: Product[];
  suppliers: Supplier[];
  exportDate: string;
  version: string;
}

// Export data as JSON
export function exportAsJSON(products: Product[], suppliers: Supplier[]): string {
  const exportData: ExportData = {
    products,
    suppliers,
    exportDate: new Date().toISOString(),
    version: '1.0'
  };
  
  return JSON.stringify(exportData, null, 2);
}

// Export complete data as JSON (new function for complete backup)
export function exportCompleteData(data: CompleteExportData, format: 'json' | 'xml'): string {
  if (format === 'json') {
    return JSON.stringify(data, null, 2);
  } else {
    return exportCompleteDataAsXML(data);
  }
}

// Export complete data as XML
function exportCompleteDataAsXML(data: CompleteExportData): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<StoreControlBackup>\n';
  xml += `  <metadata>\n`;
  xml += `    <exportDate>${data.exportDate}</exportDate>\n`;
  xml += `    <version>${data.version}</version>\n`;
  xml += `  </metadata>\n`;
  
  // Company info
  if (data.companyInfo) {
    xml += '  <companyInfo>\n';
    Object.entries(data.companyInfo).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        xml += `    <${key}>${escapeXml(String(value))}</${key}>\n`;
      }
    });
    xml += '  </companyInfo>\n';
  }
  
  // Settings
  if (data.settings) {
    xml += '  <settings>\n';
    Object.entries(data.settings).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        xml += `    <${key}>${escapeXml(String(value))}</${key}>\n`;
      }
    });
    xml += '  </settings>\n';
  }
  
  // Products
  if (data.products && data.products.length > 0) {
    xml += '  <products>\n';
    data.products.forEach(product => {
      xml += '    <product>\n';
      xml += `      <id>${escapeXml(product.id)}</id>\n`;
      xml += `      <code>${escapeXml(product.code)}</code>\n`;
      xml += `      <name>${escapeXml(product.name)}</name>\n`;
      xml += `      <description>${escapeXml(product.description)}</description>\n`;
      xml += `      <purchasePrice>${product.purchasePrice}</purchasePrice>\n`;
      xml += `      <salePrice>${product.salePrice}</salePrice>\n`;
      xml += `      <hasDiscount>${product.hasDiscount}</hasDiscount>\n`;
      xml += `      <discountPrice>${product.discountPrice}</discountPrice>\n`;
      xml += `      <hasVAT>${product.hasVAT}</hasVAT>\n`;
      xml += `      <stock>${product.stock}</stock>\n`;
      xml += `      <supplierId>${escapeXml(product.supplierId)}</supplierId>\n`;
      xml += `      <category>${escapeXml(product.category)}</category>\n`;
      xml += `      <createdAt>${product.createdAt}</createdAt>\n`;
      xml += `      <updatedAt>${product.updatedAt}</updatedAt>\n`;
      
      if (product.profitMargins) {
        xml += '      <profitMargins>\n';
        Object.entries(product.profitMargins).forEach(([key, value]) => {
          xml += `        <${key}>${value}</${key}>\n`;
        });
        xml += '      </profitMargins>\n';
      }
      
      if (product.lowStockThreshold !== undefined) {
        xml += `      <lowStockThreshold>${product.lowStockThreshold}</lowStockThreshold>\n`;
      }
      
      xml += '    </product>\n';
    });
    xml += '  </products>\n';
  }
  
  // Suppliers
  if (data.suppliers && data.suppliers.length > 0) {
    xml += '  <suppliers>\n';
    data.suppliers.forEach(supplier => {
      xml += '    <supplier>\n';
      xml += `      <id>${escapeXml(supplier.id)}</id>\n`;
      xml += `      <name>${escapeXml(supplier.name)}</name>\n`;
      xml += `      <contactName>${escapeXml(supplier.contactName)}</contactName>\n`;
      xml += `      <phone>${escapeXml(supplier.phone)}</phone>\n`;
      xml += `      <email>${escapeXml(supplier.email)}</email>\n`;
      xml += `      <address>${escapeXml(supplier.address)}</address>\n`;
      xml += `      <notes>${escapeXml(supplier.notes)}</notes>\n`;
      xml += `      <createdAt>${supplier.createdAt}</createdAt>\n`;
      xml += '    </supplier>\n';
    });
    xml += '  </suppliers>\n';
  }
  
  // Customers
  if (data.customers && data.customers.length > 0) {
    xml += '  <customers>\n';
    data.customers.forEach(customer => {
      xml += '    <customer>\n';
      Object.entries(customer).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          xml += `      <${key}>${escapeXml(String(value))}</${key}>\n`;
        }
      });
      xml += '    </customer>\n';
    });
    xml += '  </customers>\n';
  }
  
  // Customer Types
  if (data.customerTypes && data.customerTypes.length > 0) {
    xml += '  <customerTypes>\n';
    data.customerTypes.forEach(type => {
      xml += '    <customerType>\n';
      Object.entries(type).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            xml += `      <${key}>\n`;
            value.forEach(item => {
              xml += `        <item>${escapeXml(String(item))}</item>\n`;
            });
            xml += `      </${key}>\n`;
          } else {
            xml += `      <${key}>${escapeXml(String(value))}</${key}>\n`;
          }
        }
      });
      xml += '    </customerType>\n';
    });
    xml += '  </customerTypes>\n';
  }
  
  // Sales
  if (data.sales && data.sales.length > 0) {
    xml += '  <sales>\n';
    data.sales.forEach(sale => {
      xml += '    <sale>\n';
      xml += `      <id>${escapeXml(sale.id)}</id>\n`;
      xml += `      <date>${sale.date}</date>\n`;
      xml += `      <total>${sale.total}</total>\n`;
      xml += `      <paymentMethod>${escapeXml(sale.paymentMethod)}</paymentMethod>\n`;
      xml += `      <cashRegisterId>${escapeXml(sale.cashRegisterId)}</cashRegisterId>\n`;
      xml += `      <notes>${escapeXml(sale.notes)}</notes>\n`;
      
      if (sale.customerId) {
        xml += `      <customerId>${escapeXml(sale.customerId)}</customerId>\n`;
      }
      
      xml += '      <customerType>\n';
      Object.entries(sale.customerType).forEach(([key, value]) => {
        xml += `        <${key}>${escapeXml(String(value))}</${key}>\n`;
      });
      xml += '      </customerType>\n';
      
      xml += '      <items>\n';
      sale.items.forEach(item => {
        xml += '        <item>\n';
        Object.entries(item).forEach(([key, value]) => {
          xml += `          <${key}>${escapeXml(String(value))}</${key}>\n`;
        });
        xml += '        </item>\n';
      });
      xml += '      </items>\n';
      
      xml += '    </sale>\n';
    });
    xml += '  </sales>\n';
  }
  
  // Purchases
  if (data.purchases && data.purchases.length > 0) {
    xml += '  <purchases>\n';
    data.purchases.forEach(purchase => {
      xml += '    <purchase>\n';
      Object.entries(purchase).forEach(([key, value]) => {
        if (key === 'items' && Array.isArray(value)) {
          xml += '      <items>\n';
          value.forEach(item => {
            xml += '        <item>\n';
            Object.entries(item).forEach(([itemKey, itemValue]) => {
              xml += `          <${itemKey}>${escapeXml(String(itemValue))}</${itemKey}>\n`;
            });
            xml += '        </item>\n';
          });
          xml += '      </items>\n';
        } else if (value !== null && value !== undefined) {
          xml += `      <${key}>${escapeXml(String(value))}</${key}>\n`;
        }
      });
      xml += '    </purchase>\n';
    });
    xml += '  </purchases>\n';
  }
  
  xml += '</StoreControlBackup>';
  return xml;
}

// Export data as XML compatible with spreadsheet programs
export function exportAsXML(products: Product[], suppliers: Supplier[]): string {
  const exportData: ExportData = {
    products,
    suppliers,
    exportDate: new Date().toISOString(),
    version: '1.0'
  };

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n';
  xml += '          xmlns:o="urn:schemas-microsoft-com:office:office"\n';
  xml += '          xmlns:x="urn:schemas-microsoft-com:office:excel"\n';
  xml += '          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"\n';
  xml += '          xmlns:html="http://www.w3.org/TR/REC-html40">\n';
  
  // Document properties
  xml += '  <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">\n';
  xml += `    <Title>Datos de Inventario</Title>\n`;
  xml += `    <Subject>Exportación de productos y proveedores</Subject>\n`;
  xml += `    <Author>Sistema de Gestión de Inventario</Author>\n`;
  xml += `    <Created>${exportData.exportDate}</Created>\n`;
  xml += '  </DocumentProperties>\n';
  
  // Styles
  xml += '  <Styles>\n';
  xml += '    <Style ss:ID="Header">\n';
  xml += '      <Font ss:Bold="1"/>\n';
  xml += '      <Interior ss:Color="#E0E0E0" ss:Pattern="Solid"/>\n';
  xml += '    </Style>\n';
  xml += '    <Style ss:ID="Currency">\n';
  xml += '      <NumberFormat ss:Format="Currency"/>\n';
  xml += '    </Style>\n';
  xml += '    <Style ss:ID="Number">\n';
  xml += '      <NumberFormat ss:Format="0"/>\n';
  xml += '    </Style>\n';
  xml += '    <Style ss:ID="Percentage">\n';
  xml += '      <NumberFormat ss:Format="Percent"/>\n';
  xml += '    </Style>\n';
  xml += '  </Styles>\n';
  
  // Suppliers worksheet
  xml += '  <Worksheet ss:Name="Proveedores">\n';
  xml += '    <Table>\n';
  
  // Suppliers header
  xml += '      <Row>\n';
  xml += '        <Cell ss:StyleID="Header"><Data ss:Type="String">ID</Data></Cell>\n';
  xml += '        <Cell ss:StyleID="Header"><Data ss:Type="String">Nombre</Data></Cell>\n';
  xml += '        <Cell ss:StyleID="Header"><Data ss:Type="String">Contacto</Data></Cell>\n';
  xml += '        <Cell ss:StyleID="Header"><Data ss:Type="String">Teléfono</Data></Cell>\n';
  xml += '        <Cell ss:StyleID="Header"><Data ss:Type="String">Email</Data></Cell>\n';
  xml += '        <Cell ss:StyleID="Header"><Data ss:Type="String">Dirección</Data></Cell>\n';
  xml += '        <Cell ss:StyleID="Header"><Data ss:Type="String">Notas</Data></Cell>\n';
  xml += '        <Cell ss:StyleID="Header"><Data ss:Type="String">Fecha Creación</Data></Cell>\n';
  xml += '      </Row>\n';
  
  // Suppliers data
  exportData.suppliers.forEach(supplier => {
    xml += '      <Row>\n';
    xml += `        <Cell><Data ss:Type="String">${escapeXml(supplier.id)}</Data></Cell>\n`;
    xml += `        <Cell><Data ss:Type="String">${escapeXml(supplier.name)}</Data></Cell>\n`;
    xml += `        <Cell><Data ss:Type="String">${escapeXml(supplier.contactName)}</Data></Cell>\n`;
    xml += `        <Cell><Data ss:Type="String">${escapeXml(supplier.phone)}</Data></Cell>\n`;
    xml += `        <Cell><Data ss:Type="String">${escapeXml(supplier.email)}</Data></Cell>\n`;
    xml += `        <Cell><Data ss:Type="String">${escapeXml(supplier.address)}</Data></Cell>\n`;
    xml += `        <Cell><Data ss:Type="String">${escapeXml(supplier.notes)}</Data></Cell>\n`;
    xml += `        <Cell><Data ss:Type="DateTime">${formatDateForXML(supplier.createdAt)}</Data></Cell>\n`;
    xml += '      </Row>\n';
  });
  
  xml += '    </Table>\n';
  xml += '  </Worksheet>\n';
  
  // Products worksheet
  xml += '  <Worksheet ss:Name="Productos">\n';
  xml += '    <Table>\n';
  
  // Products header
  xml += '      <Row>\n';
  xml += '        <Cell ss:StyleID="Header"><Data ss:Type="String">ID</Data></Cell>\n';
  xml += '        <Cell ss:StyleID="Header"><Data ss:Type="String">Código</Data></Cell>\n';
  xml += '        <Cell ss:StyleID="Header"><Data ss:Type="String">Nombre</Data></Cell>\n';
  xml += '        <Cell ss:StyleID="Header"><Data ss:Type="String">Descripción</Data></Cell>\n';
  xml += '        <Cell ss:StyleID="Header"><Data ss:Type="String">Precio Compra</Data></Cell>\n';
  xml += '        <Cell ss:StyleID="Header"><Data ss:Type="String">Precio Venta</Data></Cell>\n';
  xml += '        <Cell ss:StyleID="Header"><Data ss:Type="String">Tiene Descuento</Data></Cell>\n';
  xml += '        <Cell ss:StyleID="Header"><Data ss:Type="String">Precio Descuento</Data></Cell>\n';
  xml += '        <Cell ss:StyleID="Header"><Data ss:Type="String">Tiene IVA</Data></Cell>\n';
  xml += '        <Cell ss:StyleID="Header"><Data ss:Type="String">Stock</Data></Cell>\n';
  xml += '        <Cell ss:StyleID="Header"><Data ss:Type="String">ID Proveedor</Data></Cell>\n';
  xml += '        <Cell ss:StyleID="Header"><Data ss:Type="String">Categoría</Data></Cell>\n';
  xml += '        <Cell ss:StyleID="Header"><Data ss:Type="String">Margen Normal</Data></Cell>\n';
  xml += '        <Cell ss:StyleID="Header"><Data ss:Type="String">Margen Mayorista</Data></Cell>\n';
  xml += '        <Cell ss:StyleID="Header"><Data ss:Type="String">Margen Premium</Data></Cell>\n';
  xml += '        <Cell ss:StyleID="Header"><Data ss:Type="String">Umbral Stock Bajo</Data></Cell>\n';
  xml += '        <Cell ss:StyleID="Header"><Data ss:Type="String">Fecha Creación</Data></Cell>\n';
  xml += '        <Cell ss:StyleID="Header"><Data ss:Type="String">Fecha Actualización</Data></Cell>\n';
  xml += '      </Row>\n';
  
  // Products data
  exportData.products.forEach(product => {
    xml += '      <Row>\n';
    xml += `        <Cell><Data ss:Type="String">${escapeXml(product.id)}</Data></Cell>\n`;
    xml += `        <Cell><Data ss:Type="String">${escapeXml(product.code)}</Data></Cell>\n`;
    xml += `        <Cell><Data ss:Type="String">${escapeXml(product.name)}</Data></Cell>\n`;
    xml += `        <Cell><Data ss:Type="String">${escapeXml(product.description)}</Data></Cell>\n`;
    xml += `        <Cell ss:StyleID="Currency"><Data ss:Type="Number">${product.purchasePrice}</Data></Cell>\n`;
    xml += `        <Cell ss:StyleID="Currency"><Data ss:Type="Number">${product.salePrice}</Data></Cell>\n`;
    xml += `        <Cell><Data ss:Type="String">${product.hasDiscount ? 'Sí' : 'No'}</Data></Cell>\n`;
    xml += `        <Cell ss:StyleID="Currency"><Data ss:Type="Number">${product.discountPrice}</Data></Cell>\n`;
    xml += `        <Cell><Data ss:Type="String">${product.hasVAT ? 'Sí' : 'No'}</Data></Cell>\n`;
    xml += `        <Cell ss:StyleID="Number"><Data ss:Type="Number">${product.stock}</Data></Cell>\n`;
    xml += `        <Cell><Data ss:Type="String">${escapeXml(product.supplierId)}</Data></Cell>\n`;
    xml += `        <Cell><Data ss:Type="String">${escapeXml(product.category)}</Data></Cell>\n`;
    xml += `        <Cell ss:StyleID="Percentage"><Data ss:Type="Number">${product.profitMargins.normal}</Data></Cell>\n`;
    xml += `        <Cell ss:StyleID="Percentage"><Data ss:Type="Number">${product.profitMargins.wholesale}</Data></Cell>\n`;
    xml += `        <Cell ss:StyleID="Percentage"><Data ss:Type="Number">${product.profitMargins.premium}</Data></Cell>\n`;
    xml += `        <Cell ss:StyleID="Number"><Data ss:Type="Number">${product.lowStockThreshold || ''}</Data></Cell>\n`;
    xml += `        <Cell><Data ss:Type="DateTime">${formatDateForXML(product.createdAt)}</Data></Cell>\n`;
    xml += `        <Cell><Data ss:Type="DateTime">${formatDateForXML(product.updatedAt)}</Data></Cell>\n`;
    xml += '      </Row>\n';
  });
  
  xml += '    </Table>\n';
  xml += '  </Worksheet>\n';
  
  // Product prices worksheet (if any products have multiple supplier prices)
  const productsWithPrices = exportData.products.filter(p => p.prices && Object.keys(p.prices).length > 0);
  if (productsWithPrices.length > 0) {
    xml += '  <Worksheet ss:Name="Precios por Proveedor">\n';
    xml += '    <Table>\n';
    
    // Prices header
    xml += '      <Row>\n';
    xml += '        <Cell ss:StyleID="Header"><Data ss:Type="String">ID Producto</Data></Cell>\n';
    xml += '        <Cell ss:StyleID="Header"><Data ss:Type="String">Código Producto</Data></Cell>\n';
    xml += '        <Cell ss:StyleID="Header"><Data ss:Type="String">Nombre Producto</Data></Cell>\n';
    xml += '        <Cell ss:StyleID="Header"><Data ss:Type="String">ID Proveedor</Data></Cell>\n';
    xml += '        <Cell ss:StyleID="Header"><Data ss:Type="String">Precio</Data></Cell>\n';
    xml += '      </Row>\n';
    
    // Prices data
    productsWithPrices.forEach(product => {
      if (product.prices) {
        Object.entries(product.prices).forEach(([supplierId, price]) => {
          xml += '      <Row>\n';
          xml += `        <Cell><Data ss:Type="String">${escapeXml(product.id)}</Data></Cell>\n`;
          xml += `        <Cell><Data ss:Type="String">${escapeXml(product.code)}</Data></Cell>\n`;
          xml += `        <Cell><Data ss:Type="String">${escapeXml(product.name)}</Data></Cell>\n`;
          xml += `        <Cell><Data ss:Type="String">${escapeXml(supplierId)}</Data></Cell>\n`;
          xml += `        <Cell ss:StyleID="Currency"><Data ss:Type="Number">${price}</Data></Cell>\n`;
          xml += '      </Row>\n';
        });
      }
    });
    
    xml += '    </Table>\n';
    xml += '  </Worksheet>\n';
  }
  
  xml += '</Workbook>';
  
  return xml;
}

// Helper function to escape XML special characters
function escapeXml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Helper function to format dates for XML
function formatDateForXML(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString();
}

// Download file helper
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}