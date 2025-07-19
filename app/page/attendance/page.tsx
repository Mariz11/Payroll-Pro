'use client';
import { GlobalContainer } from 'lib/context/globalContext';
import { useContext, useEffect, useState } from 'react';
import CustomSidebar from 'lib/components/layout/customSidebar';
import SuperAdmin from 'lib/components/dashboards/superAdmin';
import React from 'react';
// below is equivalent toimport Index from 'lib/components/dashboards/attendance/index';
import { default as AdminIndex } from 'lib/components/dashboards/attendance/index';
// below is equivalent to import Index from 'lib/components/dashboards/employeeAttendance/index';
import { default as EmployeeIndex } from 'lib/components/dashboards/employeeAttendance/index';
import AutoLock from 'lib/components/timeout/autoLock';
import axios from 'axios';
import LoadingScreen from 'lib/components/loading/loading';
import NotFound from 'app/not-found';
import { useRouter } from 'next/navigation';
function Page() {
  const context = useContext(GlobalContainer);
  const [moduleAccess, setModuleAccess] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleName, setRoleName] = useState<any>('');
  const router = useRouter();
  const [actions, setActions] = useState<any>([]);
  useEffect(() => {
    setIsLoading(true);
    axios
      .get(
        `/api/user/role`,

        {
          params: {
            module: 'Attendances',
          },
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        }
      )
      .then(async (res: any) => {
        await setActions(
          res.data?.userActions?.map((i: any) => i.module_action.action)
        );
        await setModuleAccess(JSON.parse(res.data.message.moduleAccess));
        await setRoleName(res.data.message.roleName);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  let accessType = moduleAccess.find((item: any) => item.moduleId === 2)
    ? 'ADMIN'
    : moduleAccess.find((item: any) => item.moduleId === 17)
    ? 'EMPLOYEE'
    : null;
  if (isLoading) {
    return <LoadingScreen />;
  }
  if (!accessType) {
    return <NotFound />;
  }
  return (
    <div className="h-screen flex">
      {/* SIDE BAR */}
      <CustomSidebar moduleAccess={moduleAccess} roleName={roleName} />

      {/* MAIN COMPONENT */}
      {accessType === 'ADMIN' && <AdminIndex actions={actions} />}
      {accessType === 'EMPLOYEE' && <EmployeeIndex />}
    </div>
  );
}

export default Page;
