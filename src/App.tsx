/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DemandMeshProvider, useDemandMesh } from './context/DemandMeshContext.tsx';
import { LivingMeshBackground } from './components/common/LivingMeshBackground.tsx';
import { Sidebar } from './components/navigation/Sidebar.tsx';
import { TopBar } from './components/navigation/TopBar.tsx';
import { OverviewView } from './components/dashboard/OverviewView.tsx';
import { CaptureDemandView } from './components/capture/CaptureDemandView.tsx';
import { DemandLedgerView } from './components/ledger/DemandLedgerView.tsx';
import { ForecastLabView } from './components/forecast/ForecastLabView.tsx';
import { LocalDemandNetworkView } from './components/network/LocalDemandNetworkView.tsx';
import { SettingsView } from './components/settings/SettingsView.tsx';
import { PooledOrderModal } from './components/modals/PooledOrderModal.tsx';
import { ExportReportModal } from './components/modals/ExportReportModal.tsx';

const AppContent: React.FC = () => {
  const { activeTab } = useDemandMesh();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewView />;
      case 'capture':
        return <CaptureDemandView />;
      case 'ledger':
        return <DemandLedgerView />;
      case 'forecast':
        return <ForecastLabView />;
      case 'network':
        return <LocalDemandNetworkView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F2] text-[#0B1730] flex flex-col relative selection:bg-[#0BA69C]/20 selection:text-[#0B1730]">
      {/* Subtle Living Background Mesh */}
      <LivingMeshBackground />

      {/* Persistent Sidebar Navigation */}
      <Sidebar 
        isMobileOpen={isMobileNavOpen} 
        setIsMobileOpen={setIsMobileNavOpen} 
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col lg:pl-72 z-10 transition-all duration-300">
        {/* Top Header Bar */}
        <TopBar onToggleMobileMenu={() => setIsMobileNavOpen(true)} />

        {/* Dynamic View Viewport */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals */}
      <PooledOrderModal />
      <ExportReportModal />
    </div>
  );
};

export default function App() {
  return (
    <DemandMeshProvider>
      <AppContent />
    </DemandMeshProvider>
  );
}
