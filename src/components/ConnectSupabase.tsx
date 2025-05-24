import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import Card from './ui/Card';

interface ConnectSupabaseProps {
  children: React.ReactNode;
}

const ConnectSupabase: React.FC<ConnectSupabaseProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
          setError('Supabase credentials not found');
          setChecking(false);
          return;
        }

        // Try to fetch tables to verify connection
        const { data, error } = await supabase
          .from('leads')
          .select('id')
          .limit(1);

        if (error) {
          if (error.code === 'PGRST116') {
            // This is a permissions error, which means we are connected but
            // the table might not exist or user doesn't have access
            setIsConnected(true);
          } else {
            throw error;
          }
        } else {
          setIsConnected(true);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to connect to Supabase');
      } finally {
        setChecking(false);
      }
    };

    checkConnection();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="spinner mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking Supabase connection...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 mb-4">Connect to Supabase</h1>
            <p className="text-gray-600 mb-6">
              Your application needs to be connected to Supabase to manage your leads, partners, and clients.
            </p>
            
            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <p className="text-sm text-gray-500 mb-6">
              Please click the "Connect to Supabase" button in the top right corner of the editor to set up your Supabase connection.
            </p>
            
            <button
              className="btn btn-primary w-full"
              onClick={() => window.location.reload()}
            >
              Retry Connection
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default ConnectSupabase;