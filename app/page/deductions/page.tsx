'use client';
import { GlobalContainer } from 'lib/context/globalContext';
import { useContext, useEffect, useState } from 'react';
import CustomSidebar from '@layout/customSidebar';
import Deductions from 'lib/components/dashboards/managements/deductions/deductions';
import AutoLock from 'lib/components/timeout/autoLock';
import React from 'react';
import NotFound from 'app/not-found';
import axios from 'axios';
import LoadingScreen from 'lib/components/loading/loading';
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
  let isAllowed = moduleAccess.find((item: any) => item.moduleId === 5)
    ? true
    : false;
  if (isLoading) {
    return <LoadingScreen />;
  }
  if (!isAllowed) {
    return <NotFound />;
  }
  return (
    <div className="h-screen flex">
      {/* AUTO LOCK */}
      {/* SIDE BAR */}
      <CustomSidebar moduleAccess={moduleAccess} roleName={roleName} />

      {/* MAIN COMPONENT */}
      <Deductions />
      {/* </AutoLock> */}
    </div>
  );
}

export default Page;
