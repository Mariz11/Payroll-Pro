'use client';

import CustomSidebar from '@layout/customSidebar';
// import ApplyLeaves from 'lib/components/dashboards/attendanceApplications/applyLeaves';
import React from 'react';
function Page() {
  return (
    <div className="h-screen flex">
      {/* AUTO LOCK */}
      {/* SIDE BAR */}
      <CustomSidebar />

      {/* MAIN COMPONENT */}
      {/* <ApplyLeaves /> */}
    </div>
  );
}

export default Page;
