'use client';

import { sideBarMenuItems } from '@constant/sideBarMenuItems';
import { usePathname, useRouter } from 'next/navigation';
import { Dropdown } from 'primereact/dropdown';
import React, { useState } from 'react';
import { MenuItem, SubMenu } from 'react-pro-sidebar';

const EmployeeSidebar = ({
  iconHandler,
  isOpen,
  setIsOpen,
}: {
  iconHandler: ({
    iconName,
    isOpen,
  }: {
    iconName: string;
    isOpen: boolean;
  }) => JSX.Element;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const pathName = usePathname();

  return (
    <div>
      {sideBarMenuItems.employee.map((sidebarItem, index) => {
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
                  backgroundColor: sidebarItem.items?.some((item) =>
                    pathName.includes(item.url as string)
                  )
                    ? '#D61117'
                    : '#fbfbfb',
                  color: sidebarItem.items?.some((item) =>
                    pathName.includes(item.url as string)
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
                  return (
                    <MenuItem
                      key={index2}
                      disabled={sidebarItem.isDisabled}
                      style={{
                        backgroundColor: '#fbfbfb',
                        color: pathName.includes(subMenuItem.url as string)
                          ? '#D61117'
                          : '#000',
                      }}
                      onClick={() => {
                        router.replace(`/page${subMenuItem.url}`);
                      }}
                    >
                      {subMenuItem.name}
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

export default EmployeeSidebar;
