'use client';
import { GlobalContainer } from 'lib/context/globalContext';
import { useContext, useEffect, useState } from 'react';
import CustomSidebar from 'lib/components/layout/customSidebar';
import Index from 'lib/components/dashboards/payroll';
import EmployeePayrollDashboard from 'lib/components/dashboards/payroll/employeeDashboard/employeePayrollDashboard';
import SuperAdmin from 'lib/components/dashboards/superAdmin';
import React from 'react';
import AutoLock from 'lib/components/timeout/autoLock';
import axios from 'axios';
import LoadingScreen from 'lib/components/loading/loading';
import { useRouter } from 'next/navigation';
import { set } from 'lodash';
function Page() {
  const context = useContext(GlobalContainer);
  const [moduleAccess, setModuleAccess] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleName, setRoleName] = useState<any>('');
  const [actions, setActions] = useState<any>([]);
  const router = useRouter();
  useEffect(() => {
    setIsLoading(true);
    axios
      .get(`/api/user/role`, {
        params: {
          module: 'Payrolls',
        },
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      })
      .then((res: any) => {
        setModuleAccess(JSON.parse(res.data.message.moduleAccess));
        setRoleName(res.data?.message?.roleName);
        setActions(
          res?.data?.userActions?.map((i: any) => i.module_action.action)
        );

        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        console.log(err);
      });
  }, []);
  let accessType = moduleAccess.find((item: any) => item.moduleId === 4)
    ? 'ADMIN'
    : moduleAccess.find((item: any) => item.moduleId === 19)
    ? 'EMPLOYEE'
    : null;
  if (isLoading) {
    return <LoadingScreen />;
  }
  if (!accessType) {
    return <div>Access Denied</div>;
  }
  return (
    <div className="h-screen flex">
      {/* SIDE BAR */}
      <CustomSidebar moduleAccess={moduleAccess} roleName={roleName} />

      {/* MAIN COMPONENT */}
      {accessType === 'ADMIN' && <Index actions={actions} />}
      {accessType === 'EMPLOYEE' && <EmployeePayrollDashboard />}
    </div>
  );
}

export default Page;
