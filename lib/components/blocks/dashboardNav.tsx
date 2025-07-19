'use client';

import React, { useRef } from 'react';

import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Tooltip } from 'primereact/tooltip';
import DebouncedInput from './DebouncedInput';

function DashboardNav({
  navTitle,
  buttons,
  isShowSearch,
  searchPlaceholder,
  customText,
  valueSearchText,
  setValueSearchText,
}: {
  navTitle: string;
  buttons: Buttons[];
  isShowSearch?: boolean;
  searchPlaceholder?: string;
  customText?: React.ReactNode;
  valueSearchText?: string;
  setValueSearchText?: React.Dispatch<React.SetStateAction<string>>;
}) {
  const itemsRef = useRef<any>([]);

  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-5 gap-5 sm:gap-0">
      <h1 className="font-extrabold">{navTitle}</h1>

      <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-5 sm:gap-3 ">
        {buttons.map((button, index) => {
          switch (button.type) {
            case 'Transparent':
              return (
                <Button
                  key={index}
                  rounded
                  className="min-w-[200px] flex justify-center items-center gap-3"
                  severity="secondary"
                  outlined
                  onClick={button?.handler}
                >
                  {button.label}
                  {button?.isIcon && <i className={button?.icon} />}
                </Button>
              );
            case 'Black':
              return (
                <React.Fragment key={index}>
                  {button.isDropdown ? (
                    <div className="card flex justify-content-center">
                      <Button
                        key={index}
                        rounded
                        className="min-w-[200px] flex justify-center items-center gap-3"
                        severity="secondary"
                        onClick={(e) => itemsRef.current[index].toggle(e)}
                      >
                        {button.label}
                        {button?.isIcon && <i className={button?.icon} />}
                      </Button>
                      <OverlayPanel
                        ref={(el) => (itemsRef.current[index] = el)}
                        className="min-w-[250px]"
                      >
                        {button.dropDownButtons?.map(
                          (dropdownButton, index2) => (
                            <Button
                              key={index2}
                              className="w-full flex justify-start font-light"
                              text
                              severity="secondary"
                              onClick={dropdownButton.dropDownHandler}
                            >
                              {dropdownButton.label}
                              {dropdownButton.tooltip && (
                                <span className="mx-1">
                                  <Tooltip
                                    target=".dropdown"
                                    position="left"
                                  />
                                  <i
                                    className="dropdown pi pi-info-circle p-text-secondary p-overlay-badge text-[17px]"
                                    data-pr-tooltip={dropdownButton.tooltip}
                                    data-pr-position="right"
                                    data-pr-at="right+5 top"
                                    data-pr-my="left center-2"
                                    style={{ cursor: 'pointer' }}
                                  ></i>
                                </span>
                              )}
                            </Button>
                          )
                        )}
                      </OverlayPanel>
                    </div>
                  ) : (
                    <Button
                      rounded
                      className="min-w-[200px] flex justify-center items-center gap-3"
                      severity="secondary"
                      onClick={button?.handler}
                    >
                      {button.label}
                      {button?.isIcon && <i className={button?.icon} />}
                    </Button>
                  )}
                </React.Fragment>
              );
            case 'Red':
              return (
                <Button
                  key={index}
                  rounded
                  className="min-w-[200px] flex justify-center items-center gap-3"
                  onClick={button?.handler}
                >
                  {button.label}
                  {button?.isIcon && <i className={button?.icon} />}
                </Button>
              );
            default:
              null;
          }
        })}

        {isShowSearch && (
          <div className="p-input-icon-left">
            <i className="pi pi-search" />
            <DebouncedInput
              placeholder={`Search ${searchPlaceholder}`}
              value={valueSearchText || ''}
              onChange={setValueSearchText}
              debounceTime={1000}
            />
          </div>
        )}
      </div>

      {customText && customText}
    </div>
  );
}

export default DashboardNav;
