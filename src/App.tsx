import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import LeadDatabase from './pages/LeadDatabase';
import PartnerManagement from './pages/PartnerManagement';
import ClientManagement from './pages/ClientManagement';
import DailyTracker from './pages/DailyTracker';
import LeadDetail from './pages/LeadDetail';
import { LeadProvider } from './context/LeadContext';
import { PartnerProvider } from './context/PartnerContext';
import { ClientProvider } from './context/ClientContext';
import { UserProvider } from './context/UserContext';
import { InteractionProvider } from './context/InteractionContext';
import ConnectSupabase from './components/ConnectSupabase';

function App() {
  return (
    <Router>
      <LeadProvider>
        <PartnerProvider>
          <ClientProvider>
            <UserProvider>
              <InteractionProvider>
                <ConnectSupabase>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/leads" element={<LeadDatabase />} />
                      <Route path="/leads/:id" element={<LeadDetail />} />
                      <Route path="/partners" element={<PartnerManagement />} />
                      <Route path="/clients" element={<ClientManagement />} />
                      <Route path="/daily-tracker" element={<DailyTracker />} />
                    </Routes>
                  </Layout>
                </ConnectSupabase>
              </InteractionProvider>
            </UserProvider>
          </ClientProvider>
        </PartnerProvider>
      </LeadProvider>
    </Router>
  );
}

export default App;