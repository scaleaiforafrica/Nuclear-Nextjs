import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Analytics } from './components/Analytics';
import { ChainOfCustody } from './components/ChainOfCustody';
import { QualityCompliance } from './components/QualityCompliance';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { LoginModal } from './components/LoginModal';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { DashboardHome } from './components/dashboard/DashboardHome';
import { ProcurementModule } from './components/dashboard/ProcurementModule';
import { ShipmentsModule } from './components/dashboard/ShipmentsModule';
import { ComplianceModule } from './components/dashboard/ComplianceModule';
import { TraceabilityModule } from './components/dashboard/TraceabilityModule';
import { ReportsModule } from './components/dashboard/ReportsModule';
import { SettingsModule } from './components/dashboard/SettingsModule';
import { useState } from 'react';

export default function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleLogin = () => {
    setIsLoggedIn(true);
    setIsLoginOpen(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white">
        <Hero onOpenLogin={() => setIsLoginOpen(true)} />
        <Analytics />
        <Features />
        <ChainOfCustody />
        <QualityCompliance />
        <FinalCTA onOpenLogin={() => setIsLoginOpen(true)} />
        <Footer />
        <LoginModal 
          isOpen={isLoginOpen} 
          onClose={() => setIsLoginOpen(false)}
          onLogin={handleLogin}
        />
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardHome />;
      case 'procurement':
        return <ProcurementModule />;
      case 'shipments':
        return <ShipmentsModule />;
      case 'compliance':
        return <ComplianceModule />;
      case 'traceability':
        return <TraceabilityModule />;
      case 'reports':
        return <ReportsModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <DashboardLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </DashboardLayout>
  );
}