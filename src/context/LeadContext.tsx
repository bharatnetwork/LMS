import React, { createContext, useState, useContext, useEffect } from 'react';
import { Lead, LeadStatus, LeadSource } from '../types';
import { supabase } from '../utils/supabase';

interface LeadContextType {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateLead: (id: string, leadData: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  getLead: (id: string) => Lead | undefined;
  filterLeadsByStatus: (status: LeadStatus) => Lead[];
  filterLeadsBySource: (source: LeadSource) => Lead[];
  searchLeads: (query: string) => Lead[];
  refreshLeads: () => Promise<void>;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export const LeadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to map Supabase data to our Lead type
  const mapSupabaseLeadToLead = (supabaseLead: any): Lead => {
    return {
      id: supabaseLead.id,
      name: supabaseLead.name,
      company: supabaseLead.company_name,
      email: supabaseLead.email || '',
      phone: supabaseLead.mobile || '',
      status: supabaseLead.status as LeadStatus,
      source: (supabaseLead.source || 'Other') as LeadSource,
      stage: supabaseLead.stage || '',
      nextAction: supabaseLead.next_action || '',
      nextActionDate: supabaseLead.next_interaction_date || '',
      assignedTo: supabaseLead.bd_representative || '',
      createdAt: supabaseLead.created_at,
      updatedAt: supabaseLead.updated_at,
      productsInterested: supabaseLead.products_interested,
      location: supabaseLead.location,
      website: supabaseLead.website,
      proposalShared: supabaseLead.proposal_shared,
      remark: supabaseLead.remark,
      dateOfLastInteraction: supabaseLead.date_of_last_interaction
    };
  };

  // Function to map our Lead type to Supabase format
  const mapLeadToSupabaseLead = (lead: Partial<Lead>) => {
    return {
      name: lead.name,
      company_name: lead.company,
      email: lead.email,
      mobile: lead.phone,
      status: lead.status,
      source: lead.source,
      stage: lead.stage,
      next_action: lead.nextAction,
      next_interaction_date: lead.nextActionDate,
      bd_representative: lead.assignedTo,
      products_interested: lead.productsInterested,
      location: lead.location,
      website: lead.website,
      proposal_shared: lead.proposalShared,
      remark: lead.remark,
      date_of_last_interaction: lead.dateOfLastInteraction
    };
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const mappedLeads = data.map(mapSupabaseLeadToLead);
      setLeads(mappedLeads);
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();

    // Set up real-time subscription
    const subscription = supabase
      .channel('leads-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'leads' 
        }, 
        () => {
          fetchLeads();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const addLead = async (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const supabaseLead = mapLeadToSupabaseLead(lead);
      
      const { data, error } = await supabase
        .from('leads')
        .insert([supabaseLead])
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const newLead = mapSupabaseLeadToLead(data[0]);
        setLeads((prevLeads) => [newLead, ...prevLeads]);
      }
    } catch (error: any) {
      setError(error.message);
      console.error('Error adding lead:', error);
    }
  };

  const updateLead = async (id: string, leadData: Partial<Lead>) => {
    try {
      const supabaseLead = mapLeadToSupabaseLead(leadData);
      
      const { error } = await supabase
        .from('leads')
        .update(supabaseLead)
        .eq('id', id);

      if (error) {
        throw error;
      }

      setLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead.id === id ? { ...lead, ...leadData } : lead
        )
      );
    } catch (error: any) {
      setError(error.message);
      console.error('Error updating lead:', error);
    }
  };

  const deleteLead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setLeads((prevLeads) => prevLeads.filter((lead) => lead.id !== id));
    } catch (error: any) {
      setError(error.message);
      console.error('Error deleting lead:', error);
    }
  };

  const getLead = (id: string) => {
    return leads.find((lead) => lead.id === id);
  };

  const filterLeadsByStatus = (status: LeadStatus) => {
    return leads.filter((lead) => lead.status === status);
  };

  const filterLeadsBySource = (source: LeadSource) => {
    return leads.filter((lead) => lead.source === source);
  };

  const searchLeads = (query: string) => {
    const lowerCaseQuery = query.toLowerCase();
    return leads.filter(
      (lead) =>
        lead.name.toLowerCase().includes(lowerCaseQuery) ||
        lead.company.toLowerCase().includes(lowerCaseQuery) ||
        lead.email.toLowerCase().includes(lowerCaseQuery)
    );
  };

  const refreshLeads = async () => {
    await fetchLeads();
  };

  return (
    <LeadContext.Provider
      value={{
        leads,
        loading,
        error,
        addLead,
        updateLead,
        deleteLead,
        getLead,
        filterLeadsByStatus,
        filterLeadsBySource,
        searchLeads,
        refreshLeads
      }}
    >
      {children}
    </LeadContext.Provider>
  );
};

export const useLeads = () => {
  const context = useContext(LeadContext);
  if (context === undefined) {
    throw new Error('useLeads must be used within a LeadProvider');
  }
  return context;
};