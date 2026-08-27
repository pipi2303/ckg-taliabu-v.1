import React, { useState } from 'react';
import { CitizenProvider, useCitizen } from './context/CitizenContext';
import { CitizenAppShell, CitizenActiveTab } from './components/CitizenAppShell';
import { CitizenLoginPage } from './pages/CitizenLoginPage';
import { CitizenHomePage } from './pages/CitizenHomePage';
import { CitizenSchedulePage } from './pages/CitizenSchedulePage';
import { CitizenResultsPage } from './pages/CitizenResultsPage';
import { CitizenFacilityPage } from './pages/CitizenFacilityPage';
import { CitizenBarrierPage } from './pages/CitizenBarrierPage';
import { CitizenHelpPage } from './pages/CitizenHelpPage';
import { CitizenAccountPage } from './pages/CitizenAccountPage';
import { CitizenMessageResponseLanding } from './pages/CitizenMessageResponseLanding';

export const CitizenCompanionContent: React.FC = () => {
  const { citizen, isLoading } = useCitizen();
  const [activeTab, setActiveTab] = useState<CitizenActiveTab>('HOME');
  const [activeTokenId, setActiveTokenId] = useState<string | null>(null);

  // If viewing token response link
  if (activeTokenId) {
    return (
      <CitizenMessageResponseLanding
        tokenId={activeTokenId}
        onOpenFullApp={() => setActiveTokenId(null)}
      />
    );
  }

  // If not logged in
  if (!isLoading && !citizen) {
    return <CitizenLoginPage onSuccess={() => setActiveTab('HOME')} />;
  }

  return (
    <CitizenAppShell activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'HOME' && <CitizenHomePage onNavigate={(t) => setActiveTab(t)} />}
      {activeTab === 'SCHEDULE' && <CitizenSchedulePage />}
      {activeTab === 'RESULTS' && (
        <CitizenResultsPage
          onBack={() => setActiveTab('HOME')}
          onNavigate={(t) => setActiveTab(t)}
        />
      )}
      {activeTab === 'FACILITY' && (
        <CitizenFacilityPage onBack={() => setActiveTab('HOME')} />
      )}
      {activeTab === 'BARRIER' && (
        <CitizenBarrierPage onBack={() => setActiveTab('HOME')} />
      )}
      {activeTab === 'HELP' && (
        <CitizenHelpPage onBack={() => setActiveTab('HOME')} />
      )}
      {activeTab === 'ACCOUNT' && <CitizenAccountPage />}
    </CitizenAppShell>
  );
};

export const CitizenCompanionView: React.FC = () => {
  return (
    <CitizenProvider>
      <CitizenCompanionContent />
    </CitizenProvider>
  );
};
