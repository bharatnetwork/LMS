import React, { createContext, useState, useContext, useEffect } from 'react';
import { Client } from '../types';
import { supabase } from '../utils/supabase';

interface ClientContextType {
  clients: Client[];
  loading: boolean;
  error: string | null;
  addClient: (client: Omit<Client, 'id'>) => Promise<void>;
  updateClient: (id: string, clientData: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  getClient: (id: string) => Client | undefined;
  searchClients: (query: string) => Client[];
  refreshClients: () => Promise<void>;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to map Supabase data to our Client type
  const mapSupabaseClientToClient = (supabaseClient: any): Client => {
    return {
      id: supabaseClient.id,
      name: supabaseClient.name,
      contactPerson: supabaseClient.contact_person || '',
      email: supabaseClient.email || '',
      phone: supabaseClient.mobile || '',
      address: supabaseClient.address || '',
      industry: supabaseClient.industry || '',
      serviceProvided: supabaseClient.service_provided || '',
      startDate: supabaseClient.start_date || '',
      endDate: supabaseClient.end_date,
      status: supabaseClient.status || 'Active',
      notes: supabaseClient.notes || '',
      
      // Additional fields
      companyName: supabaseClient.company_name,
      city: supabaseClient.city,
      country: supabaseClient.country,
      bdRepresentative: supabaseClient.bd_representative,
      engagementDetails: supabaseClient.engagement_details,
      remark: supabaseClient.remark
    };
  };

  // Function to map our Client type to Supabase format
  const mapClientToSupabaseClient = (client: Partial<Client>) => {
    return {
      name: client.name,
      contact_person: client.contactPerson,
      company_name: client.companyName || client.name,
      email: client.email,
      mobile: client.phone,
      address: client.address,
      industry: client.industry,
      service_provided: client.serviceProvided,
      start_date: client.startDate,
      end_date: client.endDate,
      status: client.status,
      notes: client.notes,
      
      // Additional fields
      city: client.city,
      country: client.country,
      bd_representative: client.bdRepresentative,
      engagement_details: client.engagementDetails,
      remark: client.remark
    };
  };

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const mappedClients = data.map(mapSupabaseClientToClient);
      setClients(mappedClients);
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();

    // Set up real-time subscription
    const subscription = supabase
      .channel('clients-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'clients' 
        }, 
        () => {
          fetchClients();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const addClient = async (client: Omit<Client, 'id'>) => {
    try {
      const supabaseClient = mapClientToSupabaseClient(client);
      
      const { data, error } = await supabase
        .from('clients')
        .insert([supabaseClient])
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const newClient = mapSupabaseClientToClient(data[0]);
        setClients((prevClients) => [newClient, ...prevClients]);
      }
    } catch (error: any) {
      setError(error.message);
      console.error('Error adding client:', error);
    }
  };

  const updateClient = async (id: string, clientData: Partial<Client>) => {
    try {
      const supabaseClient = mapClientToSupabaseClient(clientData);
      
      const { error } = await supabase
        .from('clients')
        .update(supabaseClient)
        .eq('id', id);

      if (error) {
        throw error;
      }

      setClients((prevClients) =>
        prevClients.map((client) =>
          client.id === id ? { ...client, ...clientData } : client
        )
      );
    } catch (error: any) {
      setError(error.message);
      console.error('Error updating client:', error);
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setClients((prevClients) => prevClients.filter((client) => client.id !== id));
    } catch (error: any) {
      setError(error.message);
      console.error('Error deleting client:', error);
    }
  };

  const getClient = (id: string) => {
    return clients.find((client) => client.id === id);
  };

  const searchClients = (query: string) => {
    const lowerCaseQuery = query.toLowerCase();
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(lowerCaseQuery) ||
        (client.contactPerson && client.contactPerson.toLowerCase().includes(lowerCaseQuery)) ||
        (client.email && client.email.toLowerCase().includes(lowerCaseQuery)) ||
        (client.companyName && client.companyName.toLowerCase().includes(lowerCaseQuery))
    );
  };

  const refreshClients = async () => {
    await fetchClients();
  };

  return (
    <ClientContext.Provider
      value={{
        clients,
        loading,
        error,
        addClient,
        updateClient,
        deleteClient,
        getClient,
        searchClients,
        refreshClients
      }}
    >
      {children}
    </ClientContext.Provider>
  );
};

export const useClients = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClients must be used within a ClientProvider');
  }
  return context;
};