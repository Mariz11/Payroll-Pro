'use client';
import { GlobalContainer } from 'lib/context/globalContext';
import { useContext, useEffect, useState } from 'react';
import CustomSidebar from 'lib/components/layout/customSidebar';
import SuperAdmin from 'lib/components/dashboards/superAdmin';
import React from 'react';
import Index from 'lib/components/dashboards/attendanceApplications/index';
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
  useEffect(() => {
    setIsLoading(true);
    axios
      .get(`/api/user/role`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      })
      .then((res: any) => {
        setIsLoading(false);
        setModuleAccess(JSON.parse(res.data.message.moduleAccess));
        setRoleName(res.data.message.roleName);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  let accessType = moduleAccess.find((item: any) => item.moduleId === 3)
    ? 'ADMIN'
    : moduleAccess.find((item: any) => item.moduleId === 18)
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
      <Index moduleRole={accessType} />
    </div>
  );
}

export default Page;
