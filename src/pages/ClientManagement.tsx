import React, { useState } from 'react';
import { Plus, Filter, Download, Upload, Search, Phone, Mail } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import Card from '../components/ui/Card';
import { useClients } from '../context/ClientContext';
import { Client } from '../types';
import { useForm } from 'react-hook-form';

const ClientManagement: React.FC = () => {
  const { clients, loading, error, addClient, updateClient, deleteClient, searchClients } = useClients();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredClients, setFilteredClients] = useState<Client[]>(clients);
  
  const { register: registerAdd, handleSubmit: handleSubmitAdd, reset: resetAdd, formState: { errors: errorsAdd } } = useForm<Omit<Client, 'id'>>();
  
  const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, formState: { errors: errorsEdit } } = useForm<Client>();
  
  const clientColumns = [
    {
      id: 'name',
      header: 'Client Name',
      accessor: (row: Client) => (
        <div>
          <div className="font-medium text-gray-900">{row.name}</div>
          <div className="text-sm text-gray-500">{row.companyName || row.industry}</div>
        </div>
      ),
      sortable: true,
    },
    {
      id: 'contact',
      header: 'Contact Information',
      accessor: (row: Client) => (
        <div>
          <div className="flex items-center text-sm">
            <Mail className="h-3.5 w-3.5 mr-1 text-gray-400" />
            <a href={`mailto:${row.email}`} className="hover:text-blue-600">{row.email}</a>
          </div>
          <div className="flex items-center text-sm">
            <Phone className="h-3.5 w-3.5 mr-1 text-gray-400" />
            <a href={`tel:${row.phone}`} className="hover:text-blue-600">{row.phone}</a>
          </div>
        </div>
      ),
      sortable: false,
    },
    {
      id: 'location',
      header: 'Location',
      accessor: (row: Client) => (
        <div>
          {row.city && row.country ? (
            <span>{row.city}, {row.country}</span>
          ) : (
            <span>{row.address}</span>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      id: 'representative',
      header: 'BD Representative',
      accessor: (row: Client) => <span>{row.bdRepresentative || 'Unassigned'}</span>,
      sortable: true,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (row: Client) => <StatusBadge status={row.status} type="client" />,
      sortable: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: (row: Client) => (
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(row);
            }}
            className="text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row);
            }}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      ),
      sortable: false,
    },
  ];
  
  const handleAddClient = async (data: Omit<Client, 'id'>) => {
    await addClient(data);
    setIsAddModalOpen(false);
    resetAdd();
  };
  
  const handleEditClick = (client: Client) => {
    setSelectedClient(client);
    resetEdit(client);
    setIsEditModalOpen(true);
  };
  
  const handleDeleteClick = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteModalOpen(true);
  };
  
  const handleEditClient = async (data: Client) => {
    if (selectedClient) {
      await updateClient(selectedClient.id, data);
      setIsEditModalOpen(false);
    }
  };
  
  const handleDeleteClient = async () => {
    if (selectedClient) {
      await deleteClient(selectedClient.id);
      setIsDeleteModalOpen(false);
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setFilteredClients(clients);
    } else {
      setFilteredClients(searchClients(query));
    }
  };
  
  const handleClientClick = (client: Client) => {
    handleEditClick(client);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-500">Error loading clients: {error}</p>
        <button
          className="mt-4 btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </Card>
    );
  }
  
  return (
    <div>
      <PageHeader 
        title="Client Management" 
        description="Manage your clients and engagements"
        actions={
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </button>
        }
      />
      
      {/* Search and filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="input pl-10"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-outline flex items-center"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </button>
          <button
            type="button"
            className="btn btn-outline flex items-center"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </button>
          <button
            type="button"
            className="btn btn-outline flex items-center"
          >
            <Upload className="mr-2 h-4 w-4" />
            Import
          </button>
        </div>
      </div>
      
      {/* Client stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Total Clients</h3>
          <p className="text-2xl font-bold text-blue-900">{clients.length}</p>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <h3 className="text-sm font-medium text-green-800 mb-2">Active Clients</h3>
          <p className="text-2xl font-bold text-green-900">
            {clients.filter(c => c.status === 'Active').length}
          </p>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <h3 className="text-sm font-medium text-amber-800 mb-2">New This Month</h3>
          <p className="text-2xl font-bold text-amber-900">
            {clients.filter(c => {
              const startDate = new Date(c.startDate);
              const now = new Date();
              return startDate.getMonth() === now.getMonth() && 
                     startDate.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </Card>
      </div>
      
      {/* Clients table */}
      <DataTable 
        columns={clientColumns} 
        data={searchQuery ? filteredClients : clients}
        itemsPerPage={10}
        onRowClick={handleClientClick}
      />
      
      {/* Add Client Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetAdd();
        }}
        title="Add New Client"
        size="lg"
        actions={
          <>
            <button
              type="button"
              className="btn btn-outline mr-3"
              onClick={() => {
                setIsAddModalOpen(false);
                resetAdd();
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmitAdd(handleAddClient)}
            >
              Add Client
            </button>
          </>
        }
      >
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Client Name
            </label>
            <input
              id="name"
              type="text"
              className={`input ${errorsAdd.name ? 'border-red-500' : ''}`}
              {...registerAdd('name', { required: true })}
            />
            {errorsAdd.name && <p className="mt-1 text-sm text-red-600">Client name is required</p>}
          </div>
          
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              id="companyName"
              type="text"
              className={`input ${errorsAdd.companyName ? 'border-red-500' : ''}`}
              {...registerAdd('companyName', { required: true })}
            />
            {errorsAdd.companyName && <p className="mt-1 text-sm text-red-600">Company name is required</p>}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="input"
              {...registerAdd('email')}
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              id="phone"
              type="text"
              className="input"
              {...registerAdd('phone')}
            />
          </div>
          
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              id="address"
              type="text"
              className="input"
              {...registerAdd('address')}
            />
          </div>
          
          <div>
            <label htmlFor="bdRepresentative" className="block text-sm font-medium text-gray-700 mb-1">
              BD Representative
            </label>
            <input
              id="bdRepresentative"
              type="text"
              className="input"
              {...registerAdd('bdRepresentative')}
            />
          </div>
          
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              id="city"
              type="text"
              className="input"
              {...registerAdd('city')}
            />
          </div>
          
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              id="country"
              type="text"
              className="input"
              {...registerAdd('country')}
            />
          </div>
          
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
              Industry
            </label>
            <input
              id="industry"
              type="text"
              className="input"
              {...registerAdd('industry')}
            />
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              className="select"
              defaultValue="Active"
              {...registerAdd('status')}
            >
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              className="input"
              {...registerAdd('startDate')}
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date (optional)
            </label>
            <input
              id="endDate"
              type="date"
              className="input"
              {...registerAdd('endDate')}
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="engagementDetails" className="block text-sm font-medium text-gray-700 mb-1">
              Engagement Details
            </label>
            <textarea
              id="engagementDetails"
              rows={3}
              className="input"
              {...registerAdd('engagementDetails')}
            ></textarea>
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              className="input"
              {...registerAdd('notes')}
            ></textarea>
          </div>
        </form>
      </Modal>
      
      {/* Edit Client Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Client"
        size="lg"
        actions={
          <>
            <button
              type="button"
              className="btn btn-outline mr-3"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmitEdit(handleEditClient)}
            >
              Save Changes
            </button>
          </>
        }
      >
        {selectedClient && (
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                Client Name
              </label>
              <input
                id="edit-name"
                type="text"
                className={`input ${errorsEdit.name ? 'border-red-500' : ''}`}
                {...registerEdit('name', { required: true })}
              />
              {errorsEdit.name && <p className="mt-1 text-sm text-red-600">Client name is required</p>}
            </div>
            
            <div>
              <label htmlFor="edit-companyName" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                id="edit-companyName"
                type="text"
                className={`input ${errorsEdit.companyName ? 'border-red-500' : ''}`}
                {...registerEdit('companyName', { required: true })}
              />
              {errorsEdit.companyName && <p className="mt-1 text-sm text-red-600">Company name is required</p>}
            </div>
            
            <div>
              <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="edit-email"
                type="email"
                className="input"
                {...registerEdit('email')}
              />
            </div>
            
            <div>
              <label htmlFor="edit-phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                id="edit-phone"
                type="text"
                className="input"
                {...registerEdit('phone')}
              />
            </div>
            
            <div>
              <label htmlFor="edit-address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                id="edit-address"
                type="text"
                className="input"
                {...registerEdit('address')}
              />
            </div>
            
            <div>
              <label htmlFor="edit-bdRepresentative" className="block text-sm font-medium text-gray-700 mb-1">
                BD Representative
              </label>
              <input
                id="edit-bdRepresentative"
                type="text"
                className="input"
                {...registerEdit('bdRepresentative')}
              />
            </div>
            
            <div>
              <label htmlFor="edit-city" className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                id="edit-city"
                type="text"
                className="input"
                {...registerEdit('city')}
              />
            </div>
            
            <div>
              <label htmlFor="edit-country" className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                id="edit-country"
                type="text"
                className="input"
                {...registerEdit('country')}
              />
            </div>
            
            <div>
              <label htmlFor="edit-industry" className="block text-sm font-medium text-gray-700 mb-1">
                Industry
              </label>
              <input
                id="edit-industry"
                type="text"
                className="input"
                {...registerEdit('industry')}
              />
            </div>
            
            <div>
              <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="edit-status"
                className="select"
                {...registerEdit('status')}
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="edit-startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                id="edit-startDate"
                type="date"
                className="input"
                {...registerEdit('startDate')}
              />
            </div>
            
            <div>
              <label htmlFor="edit-endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date (optional)
              </label>
              <input
                id="edit-endDate"
                type="date"
                className="input"
                {...registerEdit('endDate')}
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="edit-engagementDetails" className="block text-sm font-medium text-gray-700 mb-1">
                Engagement Details
              </label>
              <textarea
                id="edit-engagementDetails"
                rows={3}
                className="input"
                {...registerEdit('engagementDetails')}
              ></textarea>
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="edit-notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="edit-notes"
                rows={3}
                className="input"
                {...registerEdit('notes')}
              ></textarea>
            </div>
            
            <input type="hidden" {...registerEdit('id')} />
          </form>
        )}
      </Modal>
      
      {/* Delete Client Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Client"
        actions={
          <>
            <button
              type="button"
              className="btn btn-outline mr-3"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-outline bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
              onClick={handleDeleteClient}
            >
              Delete Client
            </button>
          </>
        }
      >
        <p>Are you sure you want to delete this client? This action cannot be undone.</p>
        {selectedClient && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <p className="font-medium">{selectedClient.name}</p>
            <p className="text-sm text-gray-600">{selectedClient.companyName}</p>
            <div className="mt-2">
              <StatusBadge status={selectedClient.status} type="client" />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ClientManagement;