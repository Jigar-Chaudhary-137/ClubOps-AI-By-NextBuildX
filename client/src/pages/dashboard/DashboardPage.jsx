import React from 'react';
import {
  DashboardHeader,
  ActiveEventSection,
  OperationalOverview,
  AIOperationsSection,
  ActivityInsightsGrid,
  QuickActionsSection
} from '../../components/dashboard';

export default function DashboardPage() {
  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* 1. Greeting & Primary Header */}
      <DashboardHeader />

      {/* 2. Active Event Section */}
      <ActiveEventSection />

      {/* 3. Operational Overview Cards */}
      <OperationalOverview />

      {/* 4. AI Operations Section */}
      <AIOperationsSection />

      {/* 5. AI Insights & 6. Upcoming Timeline */}
      <ActivityInsightsGrid />

      {/* 7. Quick Operational Actions */}
      <QuickActionsSection />
    </div>
  );
}
