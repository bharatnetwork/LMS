import React, { createContext, useState, useContext, useEffect } from 'react';
import { LeadInteraction } from '../types';
import { supabase } from '../utils/supabase';

interface InteractionContextType {
  interactions: LeadInteraction[];
  loading: boolean;
  error: string | null;
  addInteraction: (interaction: Omit<LeadInteraction, 'id' | 'createdAt'>) => Promise<void>;
  getInteractionsForLead: (leadId: string) => LeadInteraction[];
}

const InteractionContext = createContext<InteractionContextType | undefined>(undefined);

export const InteractionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [interactions, setInteractions] = useState<LeadInteraction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInteractions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('interactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setInteractions(data || []);
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching interactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInteractions();

    // Set up real-time subscription
    const subscription = supabase
      .channel('interactions-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'interactions' 
        }, 
        () => {
          fetchInteractions();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const addInteraction = async (interaction: Omit<LeadInteraction, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('interactions')
        .insert([{
          lead_id: interaction.leadId,
          type: interaction.type,
          date: interaction.date,
          description: interaction.description,
          outcome: interaction.outcome,
          next_steps: interaction.nextSteps,
          user_id: interaction.userId
        }])
        .select();

      if (error) {
        throw error;
      }

      if (data) {
        setInteractions(prev => [data[0], ...prev]);
      }
    } catch (error: any) {
      setError(error.message);
      console.error('Error adding interaction:', error);
    }
  };

  const getInteractionsForLead = (leadId: string) => {
    return interactions.filter(interaction => interaction.leadId === leadId);
  };

  return (
    <InteractionContext.Provider
      value={{
        interactions,
        loading,
        error,
        addInteraction,
        getInteractionsForLead
      }}
    >
      {children}
    </InteractionContext.Provider>
  );
};

export const useInteractions = () => {
  const context = useContext(InteractionContext);
  if (context === undefined) {
    throw new Error('useInteractions must be used within an InteractionProvider');
  }
  return context;
};