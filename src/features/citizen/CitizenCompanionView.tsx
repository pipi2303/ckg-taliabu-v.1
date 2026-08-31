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
import { useAuth } from '../../context/AuthContext';

interface CitizenCompanionViewProps {
  onExitToWebApp?: () => void;
}

export const CitizenCompanionContent: React.FC<CitizenCompanionViewProps> = ({ onExitToWebApp }) => {
  const { citizen, isLoading } = useCitizen();
  const { switchDemoUser, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<CitizenActiveTab>('HOME');
  const [activeTokenId, setActiveTokenId] = useState<string | null>(null);

  const handleExit = () => {
    if (onExitToWebApp) {
      onExitToWebApp();
    } else {
      if (currentUser?.roleId === 'CITIZEN') {
        switchDemoUser('usr-1');
      }
    }
  };

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
    return (
      <CitizenLoginPage
        onSuccess={() => setActiveTab('HOME')}
        onExitToWebApp={handleExit}
      />
    );
  }

  return (
    <CitizenAppShell
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onExitToWebApp={handleExit}
    >
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
      {activeTab === 'ACCOUNT' && <CitizenAccountPage onExitToWebApp={handleExit} />}
    </CitizenAppShell>
  );
};

export const CitizenCompanionView: React.FC<CitizenCompanionViewProps> = ({ onExitToWebApp }) => {
  return (
    <CitizenProvider>
      <CitizenCompanionContent onExitToWebApp={onExitToWebApp} />
    </CitizenProvider>
  );
};

