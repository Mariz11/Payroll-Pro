'use client';

// REACT & NEXT
import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

// PRIME REACT
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';

import classnames from 'classnames';
import ML_logo from '@images/MLLogo.png';
import { GlobalContainer } from 'lib/context/globalContext';
import AdminSidebar from '../navigationSidebars/adminSidebar';
import EmployeeSidebar from '../navigationSidebars/employeeSidebar';
import SuperAdminSidebar from '../navigationSidebars/superAdminSidebar';

import { useParams, useRouter } from 'next/navigation';
import { deleteCookie } from 'app/actions';
// import { getCompanyDetails } from '@utils/companyDetailsGetter';
import { ML_FILE_UPLOAD_URL } from '@constant/partnerAPIDetails';
import { Skeleton } from 'primereact/skeleton';
import DynamicSidebar from '../navigationSidebars/dynamicSidebar';
import { FirestoreService } from "lib/classes/gcp/FirestoreService";

import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const firestoreService = new FirestoreService();

function CustomSidebar({
  moduleAccess,
  roleName,
}: {
  moduleAccess?: any;
  roleName?: any;
}) {
  const params = useParams();
  const context = React.useContext(GlobalContainer);
  const sessionData = context?.userData;
  const role = sessionData?.role;
  const router = useRouter();

  const [companyDetails, setCompanyDetails] = useState<any>(null);

  const { isLoading ,refetch } = useQuery({
    refetchOnWindowFocus: false,
    enabled: false,
    queryKey: ['userInfo'],
    queryFn: async () => {
      const getData = await axios.get(`/api/configurations/company`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      });
      const res = getData.data.message
      if(res.companyId)
      setCompanyDetails({
            logo: res.urlLogo
              ? `${ML_FILE_UPLOAD_URL}/${encodeURIComponent(res.urlLogo)}`
              : null,
            companyName: res.companyName,
          });
      return getData.data;
    },
  });


  useEffect(() => {
    if (companyDetails == null) {
      refetch();
    }
  }, [params.companyId, companyDetails, sessionData, role]);

  const isSuperAdmin = sessionData.role == 'SUPER_ADMIN' && !params.companyId;

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sidebar collapsed={isOpen}>
      {/* TITLE */}
      <div
        className={classnames(
          'my-5 mx-3 flex items-center',
          !isOpen ? 'justify-between' : 'justify-center'
        )}
      >
        {!isOpen ? (
          isLoading ? (
            <div className="w-full text-center">
              <Skeleton
                width="4rem"
                height="2.5rem"
                className="mb-2"
              ></Skeleton>
            </div>
          ) : isSuperAdmin ? (
            <Image src={ML_logo} height={50} width={50} alt="ML Logo" />
          ) : companyDetails && companyDetails.logo ? (
            <Image
              src={companyDetails && companyDetails.logo}
              height={50}
              width={50}
              alt="ML Logo"
            />
          ) : (
            <h2
              className="text-[20px] font-bold"
              style={{ wordWrap: 'break-word', maxWidth: '196px' }}
            >
              {companyDetails && companyDetails.companyName}
            </h2>
          )
        ) : (
          <button
            className="flex justify-center items-center p-2 border-2 rounded-full"
            title="Toogle Sidebar"
            onClick={() => setIsOpen(false)}
          >
            <span className="pi pi-chevron-right" />
          </button>
        )}

        {!isOpen ? (
          <button
            className="flex justify-center items-center p-2 border-2 rounded-full"
            title="Toogle Sidebar"
            onClick={() => setIsOpen(true)}
          >
            <span className="pi pi-chevron-left" />
          </button>
        ) : null}
      </div>
      <div
        className={
          isOpen
            ? 'pl-3 p-2 mb-5 mx-2 color-white flex flex-row items-center rounded-3xl border-2 border-[#A5A5A5] justify-center'
            : 'pl-2 p-2 mb-5 mx-2 color-white flex flex-row items-center rounded-3xl border-2 border-[#A5A5A5] '
        }
      >
        <i className="pi pi-lock mr-2" data-pr-tooltip="Role" />
        <div className="text-sm">
          {!isOpen ? (
            <>
              {`ROLE:`}
              <b>{roleName ? roleName : 'SUPER_ADMIN'}</b>{' '}
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
      {/* MENU */}
      <Menu className="p-3 h-[80vh] overflow-y-auto">
        {context?.authRole === 'ADMIN' ? (
          <AdminSidebar
            iconHandler={iconHandler}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
          />
        ) : context?.authRole === 'SUPER_ADMIN' ? (
          <SuperAdminSidebar
            iconHandler={iconHandler}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
          />
        ) : context?.authRole === 'EMPLOYEE' ? (
          <EmployeeSidebar
            iconHandler={iconHandler}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
          />
        ) : (
          <DynamicSidebar
            iconHandler={iconHandler}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            moduleAccess={moduleAccess}
          />
        )}
        {/* LOGOUT */}
        <MenuItem
          onClick={async () => {
            firestoreService.signOut();

            await deleteCookie('user-token');
            await deleteCookie('selected-company');
            router.replace('/');
          }}
        >
          {iconHandler({
            iconName: 'Logout',
            isOpen,
          })}
          {!isOpen && 'Logout'}
        </MenuItem>
      </Menu>
    </Sidebar>
  );

  // ICONS HANDLER
  function iconHandler({
    iconName,
    isOpen,
  }: {
    iconName: string;
    isOpen: boolean;
  }) {
    return (
      <React.Fragment>
        {/* add auto time out for all pages */}

        {iconName === 'Dashboard' ? (
          <i className={classnames('pi pi-home', !isOpen ? 'mr-3' : 'mr-0')} />
        ) : iconName === 'Attendance' ? (
          <i
            className={classnames('pi pi-calendar', !isOpen ? 'mr-3' : 'mr-0')}
          />
        ) : iconName === 'Companies' || iconName === 'Company' ? (
          <i
            className={classnames('pi pi-building', !isOpen ? 'mr-3' : 'mr-0')}
          />
        ) : iconName === 'Reports' ? (
          <i
            className={classnames('pi pi-chart-bar', !isOpen ? 'mr-3' : 'mr-0')}
          />
        ) : iconName === 'Payroll' ? (
          <i
            className={classnames(
              'pi pi-credit-card',
              !isOpen ? 'mr-3' : 'mr-0 text-sm'
            )}
          />
        ) : iconName === 'Transactions' ? (
          <i
            className={classnames(
              'pi pi-arrow-right-arrow-left',
              !isOpen ? 'mr-3' : 'mr-0 text-sm'
            )}
          />
        ) : iconName === 'Users' ? (
          <i
            className={classnames(
              'pi pi-user',
              !isOpen ? 'mr-3' : 'mr-0 text-sm'
            )}
          />
        ) : iconName === 'Logs' ? (
          <i
            className={classnames(
              'pi pi-clock',
              !isOpen ? 'mr-3' : 'mr-0 text-sm'
            )}
          />
        ) : iconName === 'Settings' ? (
          <i
            className={classnames(
              'pi pi-th-large',
              !isOpen ? 'mr-3' : 'mr-0 text-sm'
            )}
          />
        ) : iconName === 'Logout' ? (
          <i
            className={classnames(
              'pi pi-sign-out',
              !isOpen ? 'mr-3' : 'mr-0 text-sm'
            )}
          />
        ) : iconName === 'Account' ? (
          <i
            className={classnames(
              'pi pi-cog',
              !isOpen ? 'mr-3' : 'mr-0 text-sm'
            )}
          />
        ) : iconName === 'Announcements' ? (
          <i
            className={classnames(
              'pi pi-envelope',
              !isOpen ? 'mr-3' : 'mr-0 text-sm'
            )}
          />
        ) : null}
      </React.Fragment>
    );
  }
}

export default CustomSidebar;
