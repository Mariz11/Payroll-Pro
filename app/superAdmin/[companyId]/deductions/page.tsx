import CustomSidebar from '@layout/customSidebar';
import Deductions from 'lib/components/dashboards/managements/deductions/deductions';
import React from 'react';

function Page() {
  return (
    <div className="h-screen flex">
      {/* AUTO LOCK */}

        {/* SIDE BAR */}
        <CustomSidebar />

        {/* MAIN COMPONENT */}
        <Deductions />

    </div>
  );
}

export default Page;
