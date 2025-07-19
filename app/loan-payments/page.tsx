import CustomSidebar from 'lib/components/layout/customSidebar';
import React from 'react';
import Index from 'lib/components/dashboards/managements/loanPayments';
import AutoLock from 'lib/components/timeout/autoLock';

function Page() {
  return (
    <div className="h-screen flex">
      {/* AUTO LOCK */}
      <AutoLock>
        {/* SIDE BAR */}
        <CustomSidebar />

        {/* MAIN COMPONENT */}
        <Index />
      </AutoLock>
    </div>
  );
}

export default Page;
