import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit, Trash2, Plus, FileText, Phone, Mail, Calendar } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import { useLeads } from '../context/LeadContext';
import { useInteractions } from '../context/InteractionContext';
import { useUsers } from '../context/UserContext';
import { useForm } from 'react-hook-form';
import { Lead, LeadInteraction } from '../types';
import { formatDate } from '../utils/dateUtils';

const LeadDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getLead, updateLead, deleteLead } = useLeads();
  const { interactions, loading: interactionsLoading, addInteraction, getInteractionsForLead } = useInteractions();
  const { users, loading: usersLoading } = useUsers();
  
  const lead = getLead(id || '');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddInteractionModalOpen, setIsAddInteractionModalOpen] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Lead>({
    defaultValues: lead,
  });
  
  const { register: registerInteraction, handleSubmit: handleSubmitInteraction, reset: resetInteraction, formState: { errors: interactionErrors } } = useForm<Omit<LeadInteraction, 'id' | 'leadId' | 'createdAt'>>();
  
  const leadInteractions = getInteractionsForLead(id || '');
  
  if (!lead) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Lead not found</h2>
        <p className="mt-2 text-gray-600">The lead you are looking for does not exist or has been deleted.</p>
        <button
          type="button"
          className="mt-4 btn btn-primary"
          onClick={() => navigate('/leads')}
        >
          Back to Leads
        </button>
      </div>
    );
  }
  
  const handleEditLead = (data: Lead) => {
    updateLead(id || '', data);
    setIsEditModalOpen(false);
  };
  
  const handleDeleteLead = () => {
    deleteLead(id || '');
    navigate('/leads');
  };
  
  const handleAddInteraction = async (data: Omit<LeadInteraction, 'id' | 'leadId' | 'createdAt'>) => {
    await addInteraction({
      leadId: id || '',
      type: data.type,
      date: data.date,
      description: data.description,
      outcome: data.outcome,
      nextSteps: data.nextSteps,
      userId: data.userId
    });
    
    setIsAddInteractionModalOpen(false);
    resetInteraction();
  };
  
  const assignedUser = users.find((user) => user.id === lead.assignedTo);
  
  return (
    <div>
      <div className="mb-6">
        <button
          type="button"
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          onClick={() => navigate('/leads')}
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Leads
        </button>
      </div>
      
      <PageHeader 
        title={lead.name}
        description={lead.company}
        actions={
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="btn btn-outline flex items-center transition-all hover:bg-gray-100"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="btn btn-outline text-red-600 hover:bg-red-50 hover:text-red-700 transition-all flex items-center"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </button>
          </div>
        }
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Lead Information */}
        <Card className="md:col-span-2">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium">Lead Information</h3>
            <StatusBadge status={lead.status} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
            <div>
              <p className="text-sm text-gray-500">Company</p>
              <p>{lead.company}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Contact Person</p>
              <p>{lead.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-1" />
                <a href={`mailto:${lead.email}`} className="text-blue-600 hover:text-blue-800 transition-colors">
                  {lead.email}
                </a>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-400 mr-1" />
                <a href={`tel:${lead.phone}`} className="text-blue-600 hover:text-blue-800 transition-colors">
                  {lead.phone}
                </a>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Source</p>
              <p>{lead.source}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Stage</p>
              <p>{lead.stage}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p>{formatDate(lead.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Updated</p>
              <p>{formatDate(lead.updatedAt)}</p>
            </div>
            
            {lead.productsInterested && (
              <div>
                <p className="text-sm text-gray-500">Products Interested</p>
                <p>{lead.productsInterested}</p>
              </div>
            )}
            
            {lead.website && (
              <div>
                <p className="text-sm text-gray-500">Website</p>
                <a 
                  href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {lead.website}
                </a>
              </div>
            )}
            
            {lead.location && (
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p>{lead.location}</p>
              </div>
            )}
            
            {lead.dateOfLastInteraction && (
              <div>
                <p className="text-sm text-gray-500">Last Interaction Date</p>
                <p>{formatDate(lead.dateOfLastInteraction)}</p>
              </div>
            )}
          </div>
          
          {lead.remark && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Remarks</p>
              <p className="text-gray-700">{lead.remark}</p>
            </div>
          )}
        </Card>
        
        {/* Next Action */}
        <Card>
          <h3 className="text-lg font-medium mb-4">Next Action</h3>
          
          <div className="mb-4">
            <p className="text-sm text-gray-500">Action</p>
            <p className="font-medium">{lead.nextAction || 'No action scheduled'}</p>
          </div>
          
          {lead.nextActionDate && (
            <div className="mb-4">
              <p className="text-sm text-gray-500">Due Date</p>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                <p>{formatDate(lead.nextActionDate)}</p>
              </div>
            </div>
          )}
          
          <div>
            <p className="text-sm text-gray-500">Assigned To</p>
            <p>{assignedUser?.name || 'Unassigned'}</p>
          </div>
          
          {lead.proposalShared !== undefined && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">Proposal Status</p>
              <div className="flex items-center mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  lead.proposalShared ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {lead.proposalShared ? 'Proposal Shared' : 'No Proposal Yet'}
                </span>
              </div>
            </div>
          )}
        </Card>
      </div>
      
      {/* Interactions History */}
      <Card className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Interaction History</h3>
          <button
            type="button"
            onClick={() => setIsAddInteractionModalOpen(true)}
            className="btn btn-primary btn-sm flex items-center transition-all"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Interaction
          </button>
        </div>
        
        {interactionsLoading ? (
          <div className="py-4 text-center text-gray-500">
            <div className="spinner mx-auto"></div>
            <p className="mt-2">Loading interactions...</p>
          </div>
        ) : leadInteractions.length > 0 ? (
          <div className="space-y-4">
            {leadInteractions.map((interaction) => {
              const interactionUser = users.find((user) => user.id === interaction.userId);
              
              return (
                <div key={interaction.id} className="border-l-4 border-blue-400 pl-4 py-1 animate-fadeIn">
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${interaction.type === 'Call' ? 'bg-green-100 text-green-800' :
                          interaction.type === 'Meeting' ? 'bg-blue-100 text-blue-800' :
                          interaction.type === 'Email' ? 'bg-purple-100 text-purple-800' :
                          interaction.type === 'Note' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'}
                      `}>
                        {interaction.type}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">{formatDate(interaction.date)}</span>
                    </div>
                    <span className="text-sm text-gray-500">{interactionUser?.name || 'Unknown user'}</span>
                  </div>
                  <p className="mt-1">{interaction.description}</p>
                  {interaction.outcome && (
                    <p className="text-sm mt-1"><span className="font-medium">Outcome:</span> {interaction.outcome}</p>
                  )}
                  {interaction.nextSteps && (
                    <p className="text-sm mt-1"><span className="font-medium">Next Steps:</span> {interaction.nextSteps}</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 py-4">No interactions recorded yet.</p>
        )}
      </Card>
      
      {/* Edit Lead Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Lead"
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
              onClick={handleSubmit(handleEditLead)}
            >
              Save Changes
            </button>
          </>
        }
      >
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="edit-name"
              type="text"
              className={`input ${errors.name ? 'border-red-500' : ''}`}
              {...register('name', { required: true })}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">Name is required</p>}
          </div>
          
          <div>
            <label htmlFor="edit-company" className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <input
              id="edit-company"
              type="text"
              className={`input ${errors.company ? 'border-red-500' : ''}`}
              {...register('company', { required: true })}
            />
            {errors.company && <p className="mt-1 text-sm text-red-600">Company is required</p>}
          </div>
          
          <div>
            <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="edit-email"
              type="email"
              className={`input ${errors.email ? 'border-red-500' : ''}`}
              {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
            />
            {errors.email?.type === 'required' && (
              <p className="mt-1 text-sm text-red-600">Email is required</p>
            )}
            {errors.email?.type === 'pattern' && (
              <p className="mt-1 text-sm text-red-600">Invalid email format</p>
            )}
          </div>
          
          <div>
            <label htmlFor="edit-phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              id="edit-phone"
              type="text"
              className="input"
              {...register('phone')}
            />
          </div>
          
          <div>
            <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="edit-status"
              className={`select ${errors.status ? 'border-red-500' : ''}`}
              {...register('status', { required: true })}
            >
              <option value="Live">Live</option>
              <option value="Closed">Closed</option>
              <option value="Lost">Lost</option>
            </select>
            {errors.status && <p className="mt-1 text-sm text-red-600">Status is required</p>}
          </div>
          
          <div>
            <label htmlFor="edit-source" className="block text-sm font-medium text-gray-700 mb-1">
              Source
            </label>
            <select
              id="edit-source"
              className={`select ${errors.source ? 'border-red-500' : ''}`}
              {...register('source', { required: true })}
            >
              <option value="Referral">Referral</option>
              <option value="Website">Website</option>
              <option value="Cold Call">Cold Call</option>
              <option value="Event">Event</option>
              <option value="Partner">Partner</option>
              <option value="Other">Other</option>
            </select>
            {errors.source && <p className="mt-1 text-sm text-red-600">Source is required</p>}
          </div>
          
          <div>
            <label htmlFor="edit-stage" className="block text-sm font-medium text-gray-700 mb-1">
              Stage
            </label>
            <input
              id="edit-stage"
              type="text"
              className="input"
              {...register('stage')}
            />
          </div>
          
          <div>
            <label htmlFor="edit-assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
              Assigned To
            </label>
            <select
              id="edit-assignedTo"
              className="select"
              {...register('assignedTo')}
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="edit-nextAction" className="block text-sm font-medium text-gray-700 mb-1">
              Next Action
            </label>
            <input
              id="edit-nextAction"
              type="text"
              className="input"
              {...register('nextAction')}
            />
          </div>
          
          <div>
            <label htmlFor="edit-nextActionDate" className="block text-sm font-medium text-gray-700 mb-1">
              Next Action Date
            </label>
            <input
              id="edit-nextActionDate"
              type="date"
              className="input"
              {...register('nextActionDate')}
            />
          </div>
          
          <div>
            <label htmlFor="edit-location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              id="edit-location"
              type="text"
              className="input"
              {...register('location')}
            />
          </div>
          
          <div>
            <label htmlFor="edit-website" className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              id="edit-website"
              type="text"
              className="input"
              {...register('website')}
            />
          </div>
          
          <div>
            <label htmlFor="edit-productsInterested" className="block text-sm font-medium text-gray-700 mb-1">
              Products Interested
            </label>
            <input
              id="edit-productsInterested"
              type="text"
              className="input"
              {...register('productsInterested')}
            />
          </div>
          
          <div>
            <label htmlFor="edit-proposalShared" className="block text-sm font-medium text-gray-700 mb-1">
              Proposal Shared
            </label>
            <select
              id="edit-proposalShared"
              className="select"
              {...register('proposalShared')}
            >
              <option value="">Select option</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="edit-remark" className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <textarea
              id="edit-remark"
              rows={3}
              className="input"
              {...register('remark')}
            ></textarea>
          </div>
        </form>
      </Modal>
      
      {/* Delete Lead Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Lead"
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
              className="btn btn-outline bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
              onClick={handleDeleteLead}
            >
              Delete Lead
            </button>
          </>
        }
      >
        <p>Are you sure you want to delete this lead? This action cannot be undone.</p>
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <p className="font-medium">{lead.name}</p>
          <p className="text-gray-600">{lead.company}</p>
          <div className="mt-2 flex items-center">
            <StatusBadge status={lead.status} />
          </div>
        </div>
      </Modal>
      
      {/* Add Interaction Modal */}
      <Modal
        isOpen={isAddInteractionModalOpen}
        onClose={() => {
          setIsAddInteractionModalOpen(false);
          resetInteraction();
        }}
        title="Add Interaction"
        actions={
          <>
            <button
              type="button"
              className="btn btn-outline mr-3"
              onClick={() => {
                setIsAddInteractionModalOpen(false);
                resetInteraction();
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmitInteraction(handleAddInteraction)}
            >
              Add Interaction
            </button>
          </>
        }
      >
        <form className="space-y-4">
          <div>
            <label htmlFor="interaction-type" className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              id="interaction-type"
              className={`select ${interactionErrors.type ? 'border-red-500' : ''}`}
              {...registerInteraction('type', { required: true })}
            >
              <option value="Call">Call</option>
              <option value="Meeting">Meeting</option>
              <option value="Email">Email</option>
              <option value="Note">Note</option>
              <option value="Document">Document</option>
            </select>
            {interactionErrors.type && <p className="mt-1 text-sm text-red-600">Type is required</p>}
          </div>
          
          <div>
            <label htmlFor="interaction-date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              id="interaction-date"
              type="date"
              className={`input ${interactionErrors.date ? 'border-red-500' : ''}`}
              defaultValue={new Date().toISOString().split('T')[0]}
              {...registerInteraction('date', { required: true })}
            />
            {interactionErrors.date && <p className="mt-1 text-sm text-red-600">Date is required</p>}
          </div>
          
          <div>
            <label htmlFor="interaction-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="interaction-description"
              rows={3}
              className={`input ${interactionErrors.description ? 'border-red-500' : ''}`}
              {...registerInteraction('description', { required: true })}
            ></textarea>
            {interactionErrors.description && <p className="mt-1 text-sm text-red-600">Description is required</p>}
          </div>
          
          <div>
            <label htmlFor="interaction-outcome" className="block text-sm font-medium text-gray-700 mb-1">
              Outcome
            </label>
            <textarea
              id="interaction-outcome"
              rows={2}
              className="input"
              {...registerInteraction('outcome')}
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="interaction-nextSteps" className="block text-sm font-medium text-gray-700 mb-1">
              Next Steps
            </label>
            <textarea
              id="interaction-nextSteps"
              rows={2}
              className="input"
              {...registerInteraction('nextSteps')}
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="interaction-userId" className="block text-sm font-medium text-gray-700 mb-1">
              User
            </label>
            <select
              id="interaction-userId"
              className={`select ${interactionErrors.userId ? 'border-red-500' : ''}`}
              {...registerInteraction('userId', { required: true })}
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            {interactionErrors.userId && <p className="mt-1 text-sm text-red-600">User is required</p>}
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LeadDetail;