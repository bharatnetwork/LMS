import React, { createContext, useState, useContext, useEffect } from 'react';
import { Partner } from '../types';
import { supabase } from '../utils/supabase';

interface PartnerContextType {
  partners: Partner[];
  loading: boolean;
  error: string | null;
  addPartner: (partner: Omit<Partner, 'id' | 'createdAt'>) => Promise<void>;
  updatePartner: (id: string, partnerData: Partial<Partner>) => Promise<void>;
  deletePartner: (id: string) => Promise<void>;
  getPartner: (id: string) => Partner | undefined;
  searchPartners: (query: string) => Partner[];
  refreshPartners: () => Promise<void>;
}

const PartnerContext = createContext<PartnerContextType | undefined>(undefined);

export const PartnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to map Supabase data to our Partner type
  const mapSupabasePartnerToPartner = (supabasePartner: any): Partner => {
    return {
      id: supabasePartner.id,
      name: supabasePartner.company_name,
      contactPerson: supabasePartner.contact_person || '',
      email: supabasePartner.email || '',
      phone: supabasePartner.contact_number || '',
      address: supabasePartner.address || '',
      category: supabasePartner.category || 'Business',
      status: supabasePartner.status || 'Active',
      agreementDate: supabasePartner.agreement_date || '',
      notes: supabasePartner.notes || '',
      createdAt: supabasePartner.created_at,
      
      // Additional fields
      natureOfContract: supabasePartner.nature_of_contract,
      engagementLetterSent: supabasePartner.engagement_letter_sent,
      acceptanceStatus: supabasePartner.acceptance_status,
      engagementLetterReference: supabasePartner.engagement_letter_reference,
      businessRemark: supabasePartner.business_remark,
      internalRemark: supabasePartner.internal_remark
    };
  };

  // Function to map our Partner type to Supabase format
  const mapPartnerToSupabasePartner = (partner: Partial<Partner>) => {
    return {
      company_name: partner.name,
      contact_person: partner.contactPerson,
      email: partner.email,
      contact_number: partner.phone,
      address: partner.address,
      category: partner.category,
      status: partner.status,
      agreement_date: partner.agreementDate,
      notes: partner.notes,
      
      // Additional fields
      nature_of_contract: partner.natureOfContract,
      engagement_letter_sent: partner.engagementLetterSent,
      acceptance_status: partner.acceptanceStatus,
      engagement_letter_reference: partner.engagementLetterReference,
      business_remark: partner.businessRemark,
      internal_remark: partner.internalRemark
    };
  };

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const mappedPartners = data.map(mapSupabasePartnerToPartner);
      setPartners(mappedPartners);
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();

    // Set up real-time subscription
    const subscription = supabase
      .channel('partners-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'partners' 
        }, 
        () => {
          fetchPartners();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const addPartner = async (partner: Omit<Partner, 'id' | 'createdAt'>) => {
    try {
      const supabasePartner = mapPartnerToSupabasePartner(partner);
      
      const { data, error } = await supabase
        .from('partners')
        .insert([supabasePartner])
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const newPartner = mapSupabasePartnerToPartner(data[0]);
        setPartners((prevPartners) => [newPartner, ...prevPartners]);
      }
    } catch (error: any) {
      setError(error.message);
      console.error('Error adding partner:', error);
    }
  };

  const updatePartner = async (id: string, partnerData: Partial<Partner>) => {
    try {
      const supabasePartner = mapPartnerToSupabasePartner(partnerData);
      
      const { error } = await supabase
        .from('partners')
        .update(supabasePartner)
        .eq('id', id);

      if (error) {
        throw error;
      }

      setPartners((prevPartners) =>
        prevPartners.map((partner) =>
          partner.id === id ? { ...partner, ...partnerData } : partner
        )
      );
    } catch (error: any) {
      setError(error.message);
      console.error('Error updating partner:', error);
    }
  };

  const deletePartner = async (id: string) => {
    try {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setPartners((prevPartners) => prevPartners.filter((partner) => partner.id !== id));
    } catch (error: any) {
      setError(error.message);
      console.error('Error deleting partner:', error);
    }
  };

  const getPartner = (id: string) => {
    return partners.find((partner) => partner.id === id);
  };

  const searchPartners = (query: string) => {
    const lowerCaseQuery = query.toLowerCase();
    return partners.filter(
      (partner) =>
        partner.name.toLowerCase().includes(lowerCaseQuery) ||
        partner.contactPerson.toLowerCase().includes(lowerCaseQuery) ||
        partner.email.toLowerCase().includes(lowerCaseQuery)
    );
  };

  const refreshPartners = async () => {
    await fetchPartners();
  };

  return (
    <PartnerContext.Provider
      value={{
        partners,
        loading,
        error,
        addPartner,
        updatePartner,
        deletePartner,
        getPartner,
        searchPartners,
        refreshPartners
      }}
    >
      {children}
    </PartnerContext.Provider>
  );
};

export const usePartners = () => {
  const context = useContext(PartnerContext);
  if (context === undefined) {
    throw new Error('usePartners must be used within a PartnerProvider');
  }
  return context;
};