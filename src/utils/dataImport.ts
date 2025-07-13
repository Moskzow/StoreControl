import { Product, Supplier } from '../types';

export interface ImportResult {
  success: boolean;
  message: string;
  data?: {
    products: Product[];
    suppliers: Supplier[];
  };
}

// Import data from JSON
export function importFromJSON(jsonContent: string): ImportResult {
  try {
    const data = JSON.parse(jsonContent);
    
    // Validate structure
    if (!data.products || !data.suppliers) {
      return {
        success: false,
        message: 'Formato JSON inválido. El archivo debe contener "products" y "suppliers".'
      };
    }
    
    // Validate products
    if (!Array.isArray(data.products)) {
      return {
        success: false,
        message: 'El campo "products" debe ser un array.'
      };
    }
    
    // Validate suppliers
    if (!Array.isArray(data.suppliers)) {
      return {
        success: false,
        message: 'El campo "suppliers" debe ser un array.'
      };
    }
    
    // Validate product structure
    for (const product of data.products) {
      if (!validateProductStructure(product)) {
        return {
          success: false,
          message: `Producto inválido: ${product.name || 'sin nombre'}. Verifica que todos los campos requeridos estén presentes.`
        };
      }
    }
    
    // Validate supplier structure
    for (const supplier of data.suppliers) {
      if (!validateSupplierStructure(supplier)) {
        return {
          success: false,
          message: `Proveedor inválido: ${supplier.name || 'sin nombre'}. Verifica que todos los campos requeridos estén presentes.`
        };
      }
    }
    
    return {
      success: true,
      message: 'Datos importados correctamente desde JSON.',
      data: {
        products: data.products,
        suppliers: data.suppliers
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error al procesar el archivo JSON. Verifica que el formato sea válido.'
    };
  }
}

// Import data from XML (supports both custom format and spreadsheet format)
export function importFromXML(xmlContent: string): ImportResult {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      return {
        success: false,
        message: 'Error al procesar el archivo XML. Verifica que el formato sea válido.'
      };
    }
    
    const root = xmlDoc.documentElement;
    
    // Check if it's a spreadsheet format (Excel XML)
    if (root.tagName === 'Workbook') {
      return importFromSpreadsheetXML(xmlDoc);
    }
    
    // Check if it's our custom format
    if (root.tagName === 'inventoryData') {
      return importFromCustomXML(xmlDoc);
    }
    
    return {
      success: false,
      message: 'Formato XML no reconocido. El archivo debe ser un formato de hoja de cálculo o el formato personalizado del sistema.'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error al procesar el archivo XML. Verifica que el formato sea válido.'
    };
  }
}

// Import from spreadsheet XML format
function importFromSpreadsheetXML(xmlDoc: Document): ImportResult {
  try {
    const suppliers: Supplier[] = [];
    const products: Product[] = [];
    
    // Find worksheets
    const worksheets = xmlDoc.querySelectorAll('Worksheet');
    
    for (const worksheet of worksheets) {
      const worksheetName = worksheet.getAttribute('ss:Name') || '';
      
      if (worksheetName === 'Proveedores') {
        // Parse suppliers
        const rows = worksheet.querySelectorAll('Row');
        const headerRow = rows[0];
        const headers = Array.from(headerRow.querySelectorAll('Cell Data')).map(cell => cell.textContent || '');
        
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          const cells = Array.from(row.querySelectorAll('Cell Data')).map(cell => cell.textContent || '');
          
          if (cells.length >= headers.length) {
            const supplier: Supplier = {
              id: cells[0] || Date.now().toString(),
              name: cells[1] || '',
              contactName: cells[2] || '',
              phone: cells[3] || '',
              email: cells[4] || '',
              address: cells[5] || '',
              notes: cells[6] || '',
              createdAt: cells[7] || new Date().toISOString()
            };
            
            if (validateSupplierStructure(supplier)) {
              suppliers.push(supplier);
            }
          }
        }
      } else if (worksheetName === 'Productos') {
        // Parse products
        const rows = worksheet.querySelectorAll('Row');
        const headerRow = rows[0];
        const headers = Array.from(headerRow.querySelectorAll('Cell Data')).map(cell => cell.textContent || '');
        
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          const cells = Array.from(row.querySelectorAll('Cell Data')).map(cell => cell.textContent || '');
          
          if (cells.length >= 12) { // Minimum required fields
            const product: Product = {
              id: cells[0] || Date.now().toString(),
              code: cells[1] || '',
              name: cells[2] || '',
              description: cells[3] || '',
              purchasePrice: parseFloat(cells[4]) || 0,
              salePrice: parseFloat(cells[5]) || 0,
              hasDiscount: cells[6] === 'Sí' || cells[6] === 'true',
              discountPrice: parseFloat(cells[7]) || 0,
              hasVAT: cells[8] === 'Sí' || cells[8] === 'true',
              stock: parseInt(cells[9]) || 0,
              supplierId: cells[10] || '',
              category: cells[11] || '',
              profitMargins: {
                normal: parseFloat(cells[12]) || 0.2,
                wholesale: parseFloat(cells[13]) || 0.1,
                premium: parseFloat(cells[14]) || 0.3
              },
              createdAt: cells[16] || new Date().toISOString(),
              updatedAt: cells[17] || new Date().toISOString()
            };
            
            // Add low stock threshold if present
            if (cells[15] && cells[15] !== '') {
              product.lowStockThreshold = parseInt(cells[15]);
            }
            
            if (validateProductStructure(product)) {
              products.push(product);
            }
          }
        }
      }
    }
    
    return {
      success: true,
      message: 'Datos importados correctamente desde hoja de cálculo XML.',
      data: {
        products,
        suppliers
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error al procesar el archivo XML de hoja de cálculo.'
    };
  }
}

// Import from custom XML format
function importFromCustomXML(xmlDoc: Document): ImportResult {
  try {
    const root = xmlDoc.documentElement;
    
    // Parse suppliers
    const suppliers: Supplier[] = [];
    const suppliersNode = root.querySelector('suppliers');
    if (suppliersNode) {
      const supplierNodes = suppliersNode.querySelectorAll('supplier');
      for (const supplierNode of supplierNodes) {
        const supplier = parseSupplierFromXML(supplierNode);
        if (supplier) {
          suppliers.push(supplier);
        }
      }
    }
    
    // Parse products
    const products: Product[] = [];
    const productsNode = root.querySelector('products');
    if (productsNode) {
      const productNodes = productsNode.querySelectorAll('product');
      for (const productNode of productNodes) {
        const product = parseProductFromXML(productNode);
        if (product) {
          products.push(product);
        }
      }
    }
    
    return {
      success: true,
      message: 'Datos importados correctamente desde XML personalizado.',
      data: {
        products,
        suppliers
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error al procesar el archivo XML personalizado.'
    };
  }
}

// Parse supplier from XML node
function parseSupplierFromXML(node: Element): Supplier | null {
  try {
    const supplier: Supplier = {
      id: getTextContent(node, 'id') || Date.now().toString(),
      name: getTextContent(node, 'name') || '',
      contactName: getTextContent(node, 'contactName') || '',
      phone: getTextContent(node, 'phone') || '',
      email: getTextContent(node, 'email') || '',
      address: getTextContent(node, 'address') || '',
      notes: getTextContent(node, 'notes') || '',
      createdAt: getTextContent(node, 'createdAt') || new Date().toISOString()
    };
    
    if (!validateSupplierStructure(supplier)) {
      return null;
    }
    
    return supplier;
  } catch (error) {
    return null;
  }
}

// Parse product from XML node
function parseProductFromXML(node: Element): Product | null {
  try {
    const product: Product = {
      id: getTextContent(node, 'id') || Date.now().toString(),
      code: getTextContent(node, 'code') || '',
      name: getTextContent(node, 'name') || '',
      description: getTextContent(node, 'description') || '',
      purchasePrice: parseFloat(getTextContent(node, 'purchasePrice') || '0'),
      salePrice: parseFloat(getTextContent(node, 'salePrice') || '0'),
      hasDiscount: getTextContent(node, 'hasDiscount') === 'true',
      discountPrice: parseFloat(getTextContent(node, 'discountPrice') || '0'),
      hasVAT: getTextContent(node, 'hasVAT') === 'true',
      stock: parseInt(getTextContent(node, 'stock') || '0'),
      supplierId: getTextContent(node, 'supplierId') || '',
      category: getTextContent(node, 'category') || '',
      createdAt: getTextContent(node, 'createdAt') || new Date().toISOString(),
      updatedAt: getTextContent(node, 'updatedAt') || new Date().toISOString(),
      profitMargins: {
        normal: 0.2,
        wholesale: 0.1,
        premium: 0.3
      }
    };
    
    // Parse profit margins
    const profitMarginsNode = node.querySelector('profitMargins');
    if (profitMarginsNode) {
      product.profitMargins = {
        normal: parseFloat(getTextContent(profitMarginsNode, 'normal') || '0.2'),
        wholesale: parseFloat(getTextContent(profitMarginsNode, 'wholesale') || '0.1'),
        premium: parseFloat(getTextContent(profitMarginsNode, 'premium') || '0.3')
      };
    }
    
    // Parse low stock threshold (optional)
    const lowStockThreshold = getTextContent(node, 'lowStockThreshold');
    if (lowStockThreshold) {
      product.lowStockThreshold = parseInt(lowStockThreshold);
    }
    
    // Parse suppliers array (optional)
    const suppliersNode = node.querySelector('suppliers');
    if (suppliersNode) {
      const supplierIds = Array.from(suppliersNode.querySelectorAll('supplierId'))
        .map(node => node.textContent || '')
        .filter(id => id);
      if (supplierIds.length > 0) {
        product.suppliers = supplierIds;
      }
    }
    
    // Parse prices object (optional)
    const pricesNode = node.querySelector('prices');
    if (pricesNode) {
      const priceNodes = pricesNode.querySelectorAll('price');
      if (priceNodes.length > 0) {
        product.prices = {};
        priceNodes.forEach(priceNode => {
          const supplierId = priceNode.getAttribute('supplierId');
          const price = parseFloat(priceNode.textContent || '0');
          if (supplierId) {
            product.prices![supplierId] = price;
          }
        });
      }
    }
    
    if (!validateProductStructure(product)) {
      return null;
    }
    
    return product;
  } catch (error) {
    return null;
  }
}

// Helper function to get text content from XML node
function getTextContent(parent: Element, tagName: string): string | null {
  const element = parent.querySelector(tagName);
  return element ? element.textContent : null;
}

// Validate product structure
function validateProductStructure(product: any): boolean {
  return (
    typeof product.id === 'string' &&
    typeof product.code === 'string' &&
    typeof product.name === 'string' &&
    typeof product.purchasePrice === 'number' &&
    typeof product.salePrice === 'number' &&
    typeof product.stock === 'number' &&
    product.profitMargins &&
    typeof product.profitMargins.normal === 'number' &&
    typeof product.profitMargins.wholesale === 'number' &&
    typeof product.profitMargins.premium === 'number'
  );
}

// Validate supplier structure
function validateSupplierStructure(supplier: any): boolean {
  return (
    typeof supplier.id === 'string' &&
    typeof supplier.name === 'string' &&
    supplier.name.trim() !== ''
  );
}