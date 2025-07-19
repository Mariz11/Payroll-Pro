'use client';

import { hasHtmlTags, hasSQLKeywords } from '@utils/helper';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Sidebar } from 'primereact/sidebar';
import React, { useEffect, useState } from 'react';

const AllowanceBreakdownSidebar = ({
  configuration: { action, isOpen, setIsOpen },
  selectedRowIndex,
  setAllowanceBreakdownItems,
  allowanceBreakdownItems,
  workingDays,
  checkDuplicateAllowanceType,
  checkDuplicateAllowanceTypeForEdit,
}: {
  configuration: any;
  selectedRowIndex: any;
  setAllowanceBreakdownItems: any;
  allowanceBreakdownItems: any;
  workingDays: any;
  checkDuplicateAllowanceType: any;
  checkDuplicateAllowanceTypeForEdit: any;
}) => {
  const [allowanceType, setAllowanceType] = useState<string>('');
  const [monthlyRate, setMonthlyRate] = useState<number>(0);
  const [dailyRate, setDailyRate] = useState<number>(0);
  const [isValidated, setIsValidated] = useState<boolean>(false);

  useEffect(() => {
    setAllowanceType(allowanceBreakdownItems[selectedRowIndex]?.type);
    setMonthlyRate(allowanceBreakdownItems[selectedRowIndex]?.monthlyRate);
    setDailyRate(
      parseFloat(
        (
          (allowanceBreakdownItems[selectedRowIndex]?.monthlyRate * 12) /
          workingDays
        ).toFixed(2)
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRowIndex]);

  const handleUpdate = () => {
    // console.log(
    //   checkDuplicateAllowanceTypeForEdit(allowanceType, selectedRowIndex)
    // );
    if (
      allowanceType.length >= 0 &&
      monthlyRate >= 0 &&
      dailyRate >= 0 &&
      !checkDuplicateAllowanceTypeForEdit(allowanceType, selectedRowIndex) &&
      !hasHtmlTags(allowanceType) &&
      !hasSQLKeywords(allowanceType)
    ) {
      const updatedAllowanceBreakdownItems = [...allowanceBreakdownItems];
      updatedAllowanceBreakdownItems[selectedRowIndex].type = allowanceType;
      updatedAllowanceBreakdownItems[selectedRowIndex].monthlyRate =
        monthlyRate;
      updatedAllowanceBreakdownItems[selectedRowIndex].dailyRate = dailyRate;
      setAllowanceBreakdownItems(updatedAllowanceBreakdownItems);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Sidebar
        position="right"
        className="p-sidebar-md"
        visible={isOpen}
        onHide={() => setIsOpen(false)}
      >
        <React.Fragment>
          <div className="flex flex-col items-start gap-3 mt-4">
            <h1 className="text-black font-medium text-3xl mb-3">
              {allowanceType} Allowance
            </h1>
            <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
              <label className="my-1">
                <span className="text-red-500">*</span>
                <span>Allowance Type</span>
              </label>
              <InputText
                className="w-full md:w-14rem"
                value={allowanceType}
                onChange={(e) => setAllowanceType(e.target.value)}
                disabled={action === 'view'}
              />
              {allowanceType.length <= 0 && (
                <span className="text-red-600">
                  Allowance Type is required.
                </span>
              )}

              {allowanceType !=
                allowanceBreakdownItems[selectedRowIndex]?.type &&
                checkDuplicateAllowanceType(allowanceType) && (
                  <span className="text-red-600">
                    Allowance Type already exists.
                  </span>
                )}
              {hasHtmlTags(allowanceType) && (
                <span className="text-red-600">
                  Allowance Type should not contain script tag.
                </span>
              )}
              {hasSQLKeywords(allowanceType) && (
                <span className="text-red-600">
                  Allowance Type should not contain SQL keywords.
                </span>
              )}
            </div>
            <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
              <label className="my-1">
                <span className="text-red-500">*</span>
                <span>Monthly Allowance Rate</span>
              </label>
              <InputNumber
                className="w-full md:w-14rem"
                value={monthlyRate}
                onChange={(e) => {
                  setMonthlyRate(e.value!);
                  setDailyRate(
                    parseFloat(((e.value! * 12) / workingDays).toFixed(2))
                  );
                }}
                disabled={action === 'view'}
                minFractionDigits={2}
              />
              {monthlyRate <= 0 && (
                <span className="text-red-600">
                  Monthly Allowance Rate is required.
                </span>
              )}
              {/* {hasHtmlTags(monthlyRate ? monthlyRate.toString() : '') && (
                <span className="text-red-600">
                  Monthly Allowance Rate should not contain script tag.
                </span>
              )}
              {hasSQLKeywords(monthlyRate ? monthlyRate.toString() : '') && (
                <span className="text-red-600">
                  Monthly Allowance Rate should not contain SQL keywords.
                </span>
              )} */}
            </div>

            <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
              <span className="my-1">
                <span className="text-red-500">*</span>Daily Allowance Rate
              </span>
              <InputNumber
                id="daily-rate-allowance-input"
                className="w-full md:w-14rem"
                value={dailyRate}
                onChange={(e) => {
                  setDailyRate(e.value!);
                  setMonthlyRate(
                    parseFloat(((e.value! * workingDays) / 12).toFixed(2))
                  );
                }}
                disabled={action === 'view'}
                minFractionDigits={2}
              />
              {dailyRate <= 0 && (
                <span className="text-red-600">
                  Daily Allowance Rate is required.
                </span>
              )}
              {/* {hasHtmlTags(dailyRate ? dailyRate.toString() : '') && (
                <span className="text-red-600">
                  Daily Allowance Rate should not contain script tag.
                </span>
              )}
              {hasSQLKeywords(dailyRate ? dailyRate.toString() : '') && (
                <span className="text-red-600">
                  Daily Allowance Rate should not contain SQL keywords.
                </span>
              )} */}
            </div>
            <div className="w-full flex justify-end mt-[70px]">
              <Button
                type="button"
                severity="secondary"
                text
                label="Cancel"
                className="rounded-full px-10"
                onClick={() => setIsOpen(false)}
              />
              {action == 'edit' && (
                <Button
                  label={'Update'}
                  disabled={
                    allowanceType.length <= 0 ||
                    monthlyRate <= 0 ||
                    dailyRate <= 0 ||
                    (allowanceType !=
                      allowanceBreakdownItems[selectedRowIndex]?.type &&
                      checkDuplicateAllowanceType(allowanceType)) ||
                    hasHtmlTags(allowanceType) ||
                    hasSQLKeywords(allowanceType)
                  }
                  className="rounded-full px-10 p-button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleUpdate();
                  }}
                />
              )}
            </div>
          </div>
        </React.Fragment>
      </Sidebar>
    </>
  );
};

export default AllowanceBreakdownSidebar;
