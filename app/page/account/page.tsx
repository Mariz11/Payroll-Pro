'use client';
import { GlobalContainer } from 'lib/context/globalContext';
import { useContext, useEffect, useState } from 'react';
import CustomSidebar from 'lib/components/layout/customSidebar';
import React from 'react';
import Users from 'lib/components/dashboards/managements/users/users';
import AccountDetail from 'lib/components/dashboards/accountDetails/accountDetail';
import AutoLock from 'lib/components/timeout/autoLock';
import NotFound from 'app/not-found';
import axios from 'axios';
import { useRouter } from 'next/navigation';
// import { set } from 'lodash';
import LoadingScreen from 'lib/components/loading/loading';
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
        setModuleAccess(JSON.parse(res.data.message.moduleAccess));
        setRoleName(res.data.message.roleName);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  let isAllowed = moduleAccess.find((item: any) => item.moduleId === 15)
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
      {/* SIDE BAR */}
      <CustomSidebar moduleAccess={moduleAccess} roleName={roleName} />

      {/* MAIN COMPONENT */}
      <AccountDetail />
    </div>
  );
}

export default Page;
