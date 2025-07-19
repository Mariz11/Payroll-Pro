import CustomSidebar from '@layout/customSidebar';
import Shifts from 'lib/components/dashboards/managements/shifts/shifts';
import React from 'react';
const Page = () => {
  return (
    <div className="h-screen flex">
        {/* SIDE BAR */}
        <CustomSidebar />
        {/* MAIN COMPONENT */}
        <Shifts />
    </div>
  );
};

export default Page;
