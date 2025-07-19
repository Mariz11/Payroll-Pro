'use client';

import { sideBarMenuItems } from '@constant/sideBarMenuItems';
import getCompanyUponSelection from '@utils/getCompanyUponSelection';
import { deleteCookie } from 'app/actions';
import classNames from 'classnames';
import useSidebarCompaniesHook from 'lib/hooks/sidebarCompaniesHook';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Skeleton } from 'primereact/skeleton';
import React, { useEffect, useState } from 'react';
import { MenuItem, SubMenu } from 'react-pro-sidebar';

const SuperAdminSidebar = ({
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
  const params = useParams();

  const { isLoading, error, data, refetch } = useSidebarCompaniesHook();

  useEffect(() => {
    if (params.companyId) {
      getCompanyUponSelection(Number(params.companyId));
    }
  }, [params.companyId]);

  return (
    <div>
      {/* SELECT COMPANY */}
      <div className="card flex justify-content-center flex-col text-[12px] flex-auto">
        <React.Fragment>
          {isLoading ? (
            <div className="w-full">
              <p className="my-1">Select Company</p>
              <div className="w-full flex gap-2">
                <Skeleton height="2.5rem" className="mb-2"></Skeleton>
                <Skeleton
                  width="3.5rem"
                  height="2.5rem"
                  className="mb-2"
                ></Skeleton>
              </div>
            </div>
          ) : (
            <React.Fragment>
              {!isOpen && <span className="my-1">Select Company</span>}
              <div
                className={classNames(
                  'flex justify-between gap-1',
                  isOpen
                    ? 'flex-col items-center border-b-2 border-gray-400 pb-3 mb-3'
                    : 'flex-row items-start '
                )}
              >
                <Dropdown
                  value={params && Number(params.companyId)}
                  filter
                  options={
                    Array.isArray(data)
                      ? data.map((companyData: any) => {
                          return {
                            name: companyData.companyName,
                            value: companyData.companyId,
                          };
                        })
                      : []
                  }
                  optionLabel={'name'}
                  placeholder={'- Select -'}
                  className={classNames('mb-2', !isOpen ? 'w-[85%]' : 'w-full')}
                  onChange={(e) => {
                    router.push(`/superAdmin/${e.value}/dashboard`);
                  }}
                />
                <Button
                  icon="pi pi-times"
                  onClick={async () => {
                    await deleteCookie('selected-company');
                    router.replace('/superAdmin/dashboard');
                  }}
                />
              </div>
            </React.Fragment>
          )}
        </React.Fragment>
      </div>

      {/* NOT SELECTED A COMPANY | SELECTED A COMPANY */}
      <div>
        {params.companyId !== undefined ? (
          <React.Fragment>
            {sideBarMenuItems.superAdmin.selected.map((sidebarItem, index) => {
              const url = sidebarItem.url as string;

              switch (sidebarItem.type) {
                case 'Button':
                  return (
                    <MenuItem
                      style={{
                        borderRadius: '50px',
                        marginBottom: '0.5rem',
                        backgroundColor: pathName.includes(url)
                          ? '#D61117'
                          : '#fbfbfb',
                        color: pathName.includes(url) ? '#fff' : '#000',
                      }}
                      key={index}
                      disabled={sidebarItem.isDisabled}
                      onClick={() => {
                        router.replace(
                          `/superAdmin/${params.companyId}${sidebarItem.url}`
                        );
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
                      key={index}
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
                            disabled={subMenuItem.isDisabled}
                            style={{
                              backgroundColor: '#fbfbfb',
                              color: pathName.includes(
                                subMenuItem.url as string
                              )
                                ? '#D61117'
                                : '#000',
                            }}
                            onClick={() => {
                              router.replace(
                                `/superAdmin/${params.companyId}${subMenuItem.url}`
                              );
                            }}
                          >
                            {subMenuItem.name}
                          </MenuItem>
                        );
                      })}
                    </SubMenu>
                  );

                default:
                  return null;
              }
            })}
          </React.Fragment>
        ) : (
          <React.Fragment>
            {sideBarMenuItems.superAdmin.noneSelected.map(
              (sidebarItem, index) => {
                const url = sidebarItem.url as string;

                switch (sidebarItem.type) {
                  case 'Button':
                    return (
                      <MenuItem
                        key={index}
                        style={{
                          borderRadius: '50px',
                          marginBottom: '0.5rem',
                          backgroundColor: pathName.includes(url)
                            ? '#D61117'
                            : '#fbfbfb',
                          color: pathName.includes(url) ? '#fff' : '#000',
                        }}
                        disabled={sidebarItem.isDisabled}
                        onClick={() =>
                          router.push(`/superAdmin${sidebarItem.url as string}`)
                        }
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
                              disabled={subMenuItem.isDisabled}
                              style={{
                                backgroundColor: '#fbfbfb',
                                color: pathName.includes(
                                  subMenuItem.url as string
                                )
                                  ? '#D61117'
                                  : '#000',
                              }}
                              onClick={() =>
                                router.push(
                                  `/superAdmin${subMenuItem.url as string}`
                                )
                              }
                            >
                              {subMenuItem.name}
                            </MenuItem>
                          );
                        })}
                      </SubMenu>
                    );

                  default:
                    return null;
                }
              }
            )}
          </React.Fragment>
        )}
      </div>
    </div>
  );
};

export default SuperAdminSidebar;
