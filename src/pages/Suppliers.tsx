import React, { useState, useEffect } from 'react';
import { Plus, Trash, Edit, Search, Mail, Phone } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';

function Suppliers() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useAppContext();
  
  // State for supplier list
  const [filteredSuppliers, setFilteredSuppliers] = useState(suppliers);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // State for supplier modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState(null);
  
  // Filter and sort suppliers when dependencies change
  useEffect(() => {
    let result = [...suppliers];
    
    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        supplier => 
          supplier.name.toLowerCase().includes(lowerSearchTerm) || 
          supplier.contactName.toLowerCase().includes(lowerSearchTerm) ||
          supplier.email.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortField === 'contactName') {
        return sortDirection === 'asc' 
          ? a.contactName.localeCompare(b.contactName) 
          : b.contactName.localeCompare(a.contactName);
      } else if (sortField === 'createdAt') {
        return sortDirection === 'asc' 
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });
    
    setFilteredSuppliers(result);
    setCurrentPage(1);
  }, [suppliers, searchTerm, sortField, sortDirection]);
  
  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSuppliers.slice(indexOfFirstItem, indexOfLastItem);
  
  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Initialize new supplier form
  const initNewSupplier = () => {
    setCurrentSupplier({
      id: Date.now().toString(),
      name: '',
      contactName: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
      createdAt: new Date().toISOString()
    });
    setIsModalOpen(true);
  };
  
  // Edit supplier
  const handleEdit = (supplier) => {
    setCurrentSupplier({ ...supplier });
    setIsModalOpen(true);
  };
  
  // Delete supplier
  const handleDelete = (supplier) => {
    setCurrentSupplier(supplier);
    setIsDeleteModalOpen(true);
  };
  
  // Confirm delete
  const confirmDelete = () => {
    if (currentSupplier) {
      deleteSupplier(currentSupplier.id);
      setIsDeleteModalOpen(false);
    }
  };
  
  // Save supplier
  const handleSave = (e) => {
    e.preventDefault();
    
    if (currentSupplier) {
      // Update or add new supplier
      if (suppliers.some(s => s.id === currentSupplier.id)) {
        updateSupplier(currentSupplier);
      } else {
        addSupplier(currentSupplier);
      }
      
      setIsModalOpen(false);
    }
  };
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setCurrentSupplier(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  return (
    <div className="space-y-6">
      {/* Header and actions */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Proveedores</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gestiona los proveedores de productos
          </p>
        </div>
        
        <button
          type="button"
          className="btn btn-primary"
          onClick={initNewSupplier}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo proveedor
        </button>
      </div>
      
      {/* Search */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          className="input pl-10"
          placeholder="Buscar por nombre, contacto o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Supplier list */}
      {filteredSuppliers.length === 0 ? (
        <EmptyState
          title="No hay proveedores"
          description={searchTerm ? "No hay proveedores que coincidan con la búsqueda." : "Comienza agregando tu primer proveedor."}
          action={
            <button
              type="button"
              className="btn btn-primary"
              onClick={initNewSupplier}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo proveedor
            </button>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th 
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      <span>Nombre</span>
                      {sortField === 'name' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('contactName')}
                  >
                    <div className="flex items-center">
                      <span>Contacto</span>
                      {sortField === 'contactName' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((supplier) => (
                  <tr key={supplier.id} className="group">
                    <td className="font-medium">{supplier.name}</td>
                    <td>{supplier.contactName || <span className="text-gray-400 dark:text-gray-500">No especificado</span>}</td>
                    <td>
                      {supplier.phone ? (
                        <a 
                          href={`tel:${supplier.phone}`} 
                          className="flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          <Phone className="mr-1 h-4 w-4" />
                          {supplier.phone}
                        </a>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">No especificado</span>
                      )}
                    </td>
                    <td>
                      {supplier.email ? (
                        <a 
                          href={`mailto:${supplier.email}`} 
                          className="flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          <Mail className="mr-1 h-4 w-4" />
                          {supplier.email}
                        </a>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">No especificado</span>
                      )}
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                          onClick={() => handleEdit(supplier)}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="rounded p-1 text-gray-500 hover:bg-error-100 hover:text-error-700 dark:text-gray-400 dark:hover:bg-error-900 dark:hover:text-error-300"
                          onClick={() => handleDelete(supplier)}
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredSuppliers.length / itemsPerPage)}
            onPageChange={setCurrentPage}
            showingText={`Mostrando ${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, filteredSuppliers.length)} de ${filteredSuppliers.length} proveedores`}
          />
        </div>
      )}
      
      {/* Add/Edit Supplier Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentSupplier && suppliers.some(s => s.id === currentSupplier.id) ? "Editar proveedor" : "Nuevo proveedor"}
        size="md"
      >
        {currentSupplier && (
          <form onSubmit={handleSave}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="name"
                  className="input mt-1"
                  value={currentSupplier.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre de contacto
                </label>
                <input
                  type="text"
                  name="contactName"
                  className="input mt-1"
                  value={currentSupplier.contactName}
                  onChange={handleChange}
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="input mt-1"
                    value={currentSupplier.phone}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="input mt-1"
                    value={currentSupplier.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dirección
                </label>
                <input
                  type="text"
                  name="address"
                  className="input mt-1"
                  value={currentSupplier.address}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notas
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  className="input mt-1"
                  value={currentSupplier.notes}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Guardar
              </button>
            </div>
          </form>
        )}
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar eliminación"
        size="sm"
      >
        {currentSupplier && (
          <div>
            <p className="text-gray-700 dark:text-gray-300">
              ¿Estás seguro de que deseas eliminar el proveedor <strong>{currentSupplier.name}</strong>?
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Esta acción no se puede deshacer.
            </p>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-error"
                onClick={confirmDelete}
              >
                Eliminar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Suppliers;