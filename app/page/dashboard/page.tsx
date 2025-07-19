'use client';
import CustomSidebar from 'lib/components/layout/customSidebar';
import Admin from 'lib/components/dashboards/admin';
import React, { useContext, useEffect, useState } from 'react';
import AutoLock from 'lib/components/timeout/autoLock';
import { GlobalContainer } from 'lib/context/globalContext';
import Employee from 'lib/components/dashboards/employee';
import axios from 'axios';
import LoadingScreen from 'lib/components/loading/loading';
import NotFound from 'app/not-found';
import { set } from 'lodash';
import { useRouter } from 'next/navigation';
const Page = () => {
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
  let accessType = moduleAccess.find((item: any) => item.moduleId === 1)
    ? 'ADMIN'
    : moduleAccess.find((item: any) => item.moduleId === 16)
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

      {accessType === 'ADMIN' && <Admin />}
      {accessType === 'EMPLOYEE' && <Employee />}
    </div>
  );
};

export default Page;
