import CustomSidebar from 'lib/components/layout/customSidebar';
import SuperAdmin from 'lib/components/dashboards/superAdmin';
import React from 'react';
import EmployeeManagement from 'lib/components/dashboards/managements/employee/employeeManagement';

function Page() {
  return (
    <div className="h-screen flex">
        {/* SIDE BAR */}

        <CustomSidebar />

        {/* MAIN COMPONENT */}
        <EmployeeManagement />
    </div>
  );
}

export default Page;
