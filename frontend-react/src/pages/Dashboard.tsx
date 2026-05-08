import { useState, useEffect } from 'react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import SessionsTab from '../components/dashboard/SessionsTab';
import StudyTab from '../components/dashboard/StudyTab';
import AvailabilityTab from '../components/dashboard/AvailabilityTab';
import ProfileTab from '../components/dashboard/ProfileTab';

type TabId = 'sessions' | 'study' | 'availability' | 'profile' | 'payments';

const Dashboard = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [activeTab, setActiveTab] = useState<TabId>('sessions');

  return (
    <div className="min-h-screen bg-[#f9fafb] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <DashboardSidebar activeTab={activeTab} setActiveTab={(tab) => setActiveTab(tab as TabId)} />

          <div className="lg:col-span-3">
            {activeTab === 'sessions'     && <SessionsTab />}
            {activeTab === 'study'        && <StudyTab />}
            {activeTab === 'availability' && <AvailabilityTab />}
            {activeTab === 'profile'      && <ProfileTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
