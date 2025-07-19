import CustomSidebar from 'lib/components/layout/customSidebar';
import Index from 'lib/components/dashboards/payroll';
import SuperAdmin from 'lib/components/dashboards/superAdmin';
import React from 'react';
import EmployeePayrollDashboard from 'lib/components/dashboards/payroll/employeeDashboard/employeePayrollDashboard';
function Page() {
  return (
    <div className="h-screen flex">
        {/* SIDE BAR */}
        <CustomSidebar />

        {/* MAIN COMPONENT */}
        <EmployeePayrollDashboard />
    </div>
  );
}

export default Page;
