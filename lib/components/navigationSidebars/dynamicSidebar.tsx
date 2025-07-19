'use client';

import { sideBarMenuItems } from '@constant/sideBarMenuItems';
import Item from 'antd/es/list/Item';
import { usePathname, useRouter } from 'next/navigation';
import { Dropdown } from 'primereact/dropdown';
import React, { useMemo, useState } from 'react';
import { MenuItem, SubMenu } from 'react-pro-sidebar';

const DynamicSidebar = ({
  iconHandler,
  isOpen,
  setIsOpen,
  moduleAccess,
}: {
  iconHandler: ({
    iconName,
    isOpen,
  }: {
    iconName: string;
    isOpen: boolean;
  }) => JSX.Element;
  isOpen: boolean;
  moduleAccess?: { moduleId: number }[];
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const pathName = usePathname();
  const moduleMap = moduleAccess
    ? moduleAccess.reduce((acc: any, { moduleId }) => {
        acc[moduleId] = true;
        return acc;
      }, {})
    : {};
  const customSideBarMenuItems = useMemo(() => {
    return [
      moduleMap[1] || moduleMap[16]
        ? {
            name: 'Dashboard',
            type: 'Button',
            isDisabled: false,
            url: '/dashboard',
          }
        : null,
      moduleMap[2] || moduleMap[3] || moduleMap[17] || moduleMap[18]
        ? {
            name: 'Attendance',
            type: 'DropDown',
            items: [
              moduleMap[2] || moduleMap[17]
                ? {
                    name: 'Attendances',
                    type: 'Button',
                    isDisabled: false,
                    url: '/attendance',
                  }
                : null,
              moduleMap[3] || moduleMap[18]
                ? {
                    name: 'Applications',
                    type: 'Button',
                    isDisabled: false,
                    url: '/application',
                  }
                : null,
              // {
              //   name: 'Submit Application',
              //   type: 'Button',
              //   isDisabled: false,
              //   url: '/applyLeaves',
              // },
            ],
          }
        : null,
      moduleMap[4] || moduleMap[19] || moduleMap[5]
        ? {
            name: 'Payroll',
            type: 'DropDown',
            items: [
              moduleMap[4] || moduleMap[19]
                ? {
                    name: 'Payrolls',
                    type: 'Button',
                    isDisabled: false,
                    url: '/payroll',
                  }
                : null,
              moduleMap[5]
                ? {
                    name: 'Deductions',
                    type: 'Button',
                    isDisabled: false,
                    url: '/deductions',
                  }
                : null,
            ],
          }
        : null,
      moduleMap[6] ||
      moduleMap[7] ||
      moduleMap[8] ||
      moduleMap[9] ||
      moduleMap[10] ||
      moduleMap[11] ||
      moduleMap[12]
        ? {
            name: 'Company',
            type: 'DropDown',
            items: [
              moduleMap[6]
                ? {
                    name: 'Configurations',
                    type: 'Button',
                    isDisabled: false,
                    url: '/configurations',
                  }
                : null,
              moduleMap[7]
                ? {
                    name: 'Announcements',
                    type: 'Button',
                    isDisabled: false,
                    url: '/announcements',
                  }
                : null,
              moduleMap[8]
                ? {
                    name: 'Employees',
                    type: 'Button',
                    isDisabled: false,
                    url: '/employeeManagement',
                  }
                : null,
              moduleMap[9]
                ? {
                    name: 'Shifts',
                    type: 'Button',
                    isDisabled: false,
                    url: '/shifts',
                  }
                : null,
              moduleMap[10]
                ? {
                    name: 'Departments',
                    type: 'Button',
                    isDisabled: false,
                    url: '/department',
                  }
                : null,
              moduleMap[11]
                ? {
                    name: 'Holidays',
                    type: 'Button',
                    isDisabled: false,
                    url: '/holidays',
                  }
                : null,
              moduleMap[12]
                ? {
                    name: 'Reports',
                    type: 'Button',
                    isDisabled: false,
                    url: '/reports',
                  }
                : null,
            ],
          }
        : null,
      moduleMap[13]
        ? {
            name: 'Transactions',
            type: 'DropDown',
            items: [
              moduleMap[13]
                ? {
                    name: 'Cash In',
                    type: 'Button',
                    isDisabled: false,
                    url: '/cash-in',
                  }
                : null,
              // {
              //   name: 'Loan Payments',
              //   type: 'Button',
              //   isDisabled: false,
              //   url: '/loan-payments',
              // },
            ],
          }
        : null,
      moduleMap[14]
        ? {
            name: 'Users',
            type: 'Button',
            isDisabled: false,
            url: '/user',
          }
        : null,
      moduleMap[15]
        ? {
            name: 'Account',
            type: 'Button',
            isDisabled: false,
            url: '/account',
          }
        : null,
    ];
  }, []);

  return (
    <div>
      {customSideBarMenuItems.map((sidebarItem, index) => {
        if (!sidebarItem) return null;
        const url = sidebarItem.url as string;

        switch (sidebarItem.type) {
          case 'Button':
            return (
              <MenuItem
                key={index}
                disabled={sidebarItem.isDisabled}
                style={{
                  borderRadius: '50px',
                  marginBottom: '0.5rem',
                  backgroundColor: pathName.includes(url)
                    ? '#D61117'
                    : '#fbfbfb',
                  color: pathName.includes(url) ? '#fff' : '#000',
                }}
                onClick={() => {
                  router.replace(`/page${url}`);
                }}
              >
                {iconHandler({
                  iconName: sidebarItem.name,
                  isOpen,
                })}
                {!isOpen && sidebarItem.name}
              </MenuItem>
            );

          case 'DropDown':
            return (
              <SubMenu
                key={index}
                style={{
                  borderRadius: '50px',
                  marginBottom: '0.5rem',
                  backgroundColor: sidebarItem.items?.some(
                    (item) => item && pathName.includes(item.url as string)
                  )
                    ? '#D61117'
                    : '#fbfbfb',
                  color: sidebarItem.items?.some(
                    (item) => item && pathName.includes(item.url as string)
                  )
                    ? '#fff'
                    : '#000',
                }}
                label={
                  <>
                    {iconHandler({
                      iconName: sidebarItem.name,
                      isOpen,
                    })}
                    {!isOpen && sidebarItem.name}
                  </>
                }
              >
                {sidebarItem.items?.map((subMenuItem, index2) => {
                  return !subMenuItem ? null : (
                    <MenuItem
                      key={index2}
                      disabled={sidebarItem.isDisabled}
                      style={{
                        backgroundColor: '#fbfbfb',
                        color:
                          subMenuItem &&
                          pathName.includes(subMenuItem.url as string)
                            ? '#D61117'
                            : '#000',
                      }}
                      onClick={() => {
                        if (!subMenuItem) return;
                        router.replace(`/page${subMenuItem.url}`);
                      }}
                    >
                      {subMenuItem ? subMenuItem.name : ''}
                    </MenuItem>
                  );
                })}
              </SubMenu>
            );

          case 'Select':
            return (
              <div key={index}>
                {!isOpen && <span className="my-1">Select Company</span>}
                <Dropdown
                  filter
                  disabled={sidebarItem.isDisabled}
                  value={''}
                  options={[]}
                  optionLabel="name"
                  placeholder={!isOpen ? 'Select Company' : ''}
                  className="w-full md:w-14rem"
                />
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};

export default DynamicSidebar;
