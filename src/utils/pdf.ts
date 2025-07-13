import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Sale, CompanyInfo } from '../types';
import { formatCurrency, formatDate, calculateVAT } from './formatters';

// Default company info
const defaultCompanyInfo: CompanyInfo = {
  name: 'Mi Empresa',
  address: 'Calle Principal, 123',
  phone: '123456789',
  email: 'info@miempresa.com',
  taxId: 'B12345678'
};

export function generateSaleTicket(sale: Sale, companyInfo: CompanyInfo = defaultCompanyInfo) {
  // Create new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Set initial position after header space
  let yPos = 40; // Leave space for letterhead

  // Add sale information
  doc.setFontSize(10);
  doc.text(`Fecha: ${formatDate(sale.date, true)}`, 20, yPos);
  doc.text(`Ticket #: ${sale.id}`, 120, yPos);
  yPos += 10;

  // Add company info
  doc.setFontSize(8);
  doc.text(companyInfo.name, 20, yPos);
  yPos += 4;
  doc.text(companyInfo.address, 20, yPos);
  yPos += 4;
  doc.text(`Tel: ${companyInfo.phone}`, 20, yPos);
  yPos += 4;
  doc.text(`Email: ${companyInfo.email}`, 20, yPos);
  yPos += 4;
  doc.text(`NIF/CIF: ${companyInfo.taxId}`, 20, yPos);
  yPos += 10;

  // Add items table
  autoTable(doc, {
    startY: yPos,
    head: [['Código', 'Producto', 'Cant.', 'Precio', 'Total']],
    body: sale.items.map(item => [
      item.code,
      item.name,
      item.quantity.toString(),
      formatCurrency(item.price),
      formatCurrency(item.price * item.quantity)
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [100, 100, 100] },
    margin: { top: 20, right: 20, bottom: 40, left: 20 }
  });

  // Calculate final Y position after table
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Add totals
  const vatAmount = sale.items.reduce((total, item) => {
    if (item.hasVAT) {
      return total + calculateVAT(item.price * item.quantity);
    }
    return total;
  }, 0);

  doc.setFontSize(8);
  doc.text(`Base imponible: ${formatCurrency(sale.total - vatAmount)}`, 120, finalY);
  doc.text(`IVA (21%): ${formatCurrency(vatAmount)}`, 120, finalY + 5);
  doc.setFontSize(10);
  doc.text(`Total: ${formatCurrency(sale.total)}`, 120, finalY + 12);

  // Add payment method
  doc.setFontSize(8);
  doc.text(`Método de pago: ${getPaymentMethodText(sale.paymentMethod)}`, 20, finalY);
  doc.text(`Tipo de cliente: ${sale.customerType.name}`, 20, finalY + 5);

  // Add notes if any
  if (sale.notes) {
    doc.text('Notas:', 20, finalY + 12);
    doc.text(sale.notes, 20, finalY + 16);
  }

  // Add footer text
  const footerY = doc.internal.pageSize.height - 20;
  doc.setFontSize(8);
  doc.text('Gracias por su compra', doc.internal.pageSize.width / 2, footerY, { align: 'center' });

  return doc;
}

function getPaymentMethodText(method: string): string {
  const methods = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    bizum: 'Bizum',
    installments: 'Plazos',
    monthly: 'Giro mensual'
  };
  return methods[method] || method;
}