'use client';

import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Sidebar } from 'primereact/sidebar';
import React, { useEffect, useState } from 'react';

const WithholdingTaxShieldSidebar = ({
  configuration: { action, isOpen, setIsOpen },
  selectedRowIndex,
  withholdingTax,
}: {
  configuration: any;
  selectedRowIndex: any;
  withholdingTax: any;
}) => {
  const [fromAmount, setFromAmount] = useState<number>(0);
  const [toAmount, setToAmount] = useState<number>(0);
  const [fixTaxAmount, setFixTaxAmount] = useState<number>(0);
  const [taxRateOnExcess, setTaxRateOnExcess] = useState<number>(0);

  useEffect(() => {
    setFromAmount(withholdingTax[selectedRowIndex].from);
    setToAmount(withholdingTax[selectedRowIndex].to);
    setFixTaxAmount(withholdingTax[selectedRowIndex].fixTaxAmount);
    setTaxRateOnExcess(withholdingTax[selectedRowIndex].taxRateExcess);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleUpdate = () => {
    if (withholdingTax[selectedRowIndex].bracket === 1) {
      if (toAmount > 0 && fixTaxAmount >= 0 && taxRateOnExcess >= 0 && toAmount < withholdingTax[selectedRowIndex + 1].to) {
        withholdingTax[selectedRowIndex].to = toAmount;
        withholdingTax[selectedRowIndex].fixTaxAmount = fixTaxAmount;
        withholdingTax[selectedRowIndex].taxRateExcess = taxRateOnExcess;
        withholdingTax[selectedRowIndex + 1].from = toAmount;
      }
    } else if (withholdingTax[selectedRowIndex].bracket === 2) {
      if (
        fromAmount > withholdingTax[selectedRowIndex - 1].from &&
        toAmount > fromAmount &&
        fixTaxAmount >= 0 &&
        taxRateOnExcess > 0
      ) {
        withholdingTax[selectedRowIndex - 1].to = fromAmount;
        withholdingTax[selectedRowIndex].from = fromAmount;
        withholdingTax[selectedRowIndex].to = toAmount;
        withholdingTax[selectedRowIndex].fixTaxAmount = fixTaxAmount;
        withholdingTax[selectedRowIndex].taxRateExcess = taxRateOnExcess;
        withholdingTax[selectedRowIndex + 1].from = toAmount + 1;
      }
    } else if (withholdingTax[selectedRowIndex].bracket === 6) {
      if (
        fromAmount > withholdingTax[selectedRowIndex - 1].from &&
        fixTaxAmount > 0 &&
        taxRateOnExcess > 0
      ) {
        withholdingTax[selectedRowIndex - 1].to = fromAmount - 1;
        withholdingTax[selectedRowIndex].from = fromAmount;
        withholdingTax[selectedRowIndex].fixTaxAmount = fixTaxAmount;
        withholdingTax[selectedRowIndex].taxRateExcess = taxRateOnExcess;
      }
    } else {
      if (
        fromAmount > withholdingTax[selectedRowIndex - 1].from &&
        toAmount > fromAmount &&
        toAmount < withholdingTax[selectedRowIndex + 1].to &&
        fixTaxAmount > 0 &&
        taxRateOnExcess > 0
      ) {
        withholdingTax[selectedRowIndex - 1].to = fromAmount - 1;
        withholdingTax[selectedRowIndex].from = fromAmount;
        withholdingTax[selectedRowIndex].to = toAmount;
        withholdingTax[selectedRowIndex + 1].from = toAmount + 1;
        withholdingTax[selectedRowIndex].fixTaxAmount = fixTaxAmount;
        withholdingTax[selectedRowIndex].taxRateExcess = taxRateOnExcess;
      }
    }
    setIsOpen(false);
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
              Bracket {selectedRowIndex + 1}
            </h1>
            <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
              <label className="my-1">
                <span className="text-red-500">*</span>
                <span>From</span>
              </label>
              <InputNumber
                className="w-full md:w-14rem"
                value={fromAmount}
                onChange={(e) => {
                  setFromAmount(e.value!);
                }}
                disabled={
                  action === 'view' ||
                  withholdingTax[selectedRowIndex].bracket === 1
                }
                minFractionDigits={2}
              />
              {fromAmount <= 0 &&
                withholdingTax[selectedRowIndex].bracket !== 1 && (
                  <span className="text-red-600">From Amount is required.</span>
                )}

              {fromAmount > 0 &&
                fromAmount >= toAmount &&
                withholdingTax[selectedRowIndex].bracket !== 1 &&
                withholdingTax[selectedRowIndex].bracket !== 6 && (
                  <span className="text-red-600">
                    From Amount should be less than the To Amount
                  </span>
                )}

              {fromAmount > 0 &&
                withholdingTax[selectedRowIndex].bracket !== 1 &&
                fromAmount <= withholdingTax[selectedRowIndex - 1].from && (
                  <span className="text-red-600">
                    From Amount should be greater than the previous From Amount
                  </span>
                )}
            </div>
            <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
              <label className="my-1">
                <span className="text-red-500">*</span>
                <span>To</span>
              </label>
              {withholdingTax[selectedRowIndex].bracket === 6 ? (
                <InputText
                  className="w-full md:w-14rem"
                  value={`Above ${fromAmount}`}
                  disabled={true}
                />
              ) : (
                <InputNumber
                  className="w-full md:w-14rem"
                  value={toAmount}
                  onChange={(e) => {
                    setToAmount(e.value!);
                  }}
                  disabled={
                    action === 'view' ||
                    withholdingTax[selectedRowIndex].bracket === 6
                  }
                  minFractionDigits={2}
                />
              )}

              {toAmount <= 0 &&
                withholdingTax[selectedRowIndex].bracket !== 6 && (
                  <span className="text-red-600">To Amount is required.</span>
                )}

              {toAmount > 0 &&
                toAmount <= fromAmount &&
                withholdingTax[selectedRowIndex].bracket !== 6 && (
                  <span className="text-red-600">
                    To Amount should be greater than the From Amount
                  </span>
                )}

              {toAmount > 0 &&
                withholdingTax[selectedRowIndex].bracket !== 6 &&
                withholdingTax[selectedRowIndex].bracket !== 1 &&
                toAmount <= withholdingTax[selectedRowIndex - 1].to && (
                  <span className="text-red-600">
                    To Amount should be greater than the previous To Amount
                  </span>
              )}

              {toAmount > 0 &&
                withholdingTax[selectedRowIndex].bracket !== 6 &&
                toAmount > withholdingTax[selectedRowIndex + 1].to && (
                  <span className="text-red-600">
                    To Amount should be less than the next To Amount
                  </span>
                )}
            </div>
            <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
              <span className="my-1">
                <span className="text-red-500">*</span>Fix Tax Amount
              </span>
              <InputNumber
                className="w-full md:w-14rem"
                value={fixTaxAmount}
                onChange={(e) => {
                  setFixTaxAmount(e.value!);
                }}
                disabled={action === 'view'}
                minFractionDigits={2}
              />
              {fixTaxAmount <= 0 &&
                withholdingTax[selectedRowIndex].bracket !== 1 &&
                withholdingTax[selectedRowIndex].bracket !== 2 && (
                  <span className="text-red-600">
                    Fix Tax Amount is required.
                  </span>
                )}
            </div>
            <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
              <span className="my-1">
                <span className="text-red-500">*</span>Tax Rate on Excess
              </span>
              <InputNumber
                className="w-full md:w-14rem"
                value={taxRateOnExcess}
                onChange={(e) => {
                  setTaxRateOnExcess(e.value!);
                }}
                disabled={action === 'view'}
                minFractionDigits={2}
              />
              {taxRateOnExcess <= 0 &&
                withholdingTax[selectedRowIndex].bracket !== 1 && (
                  <span className="text-red-600">
                    Tax Rate on Excess is required.
                  </span>
                )}
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
                    (fromAmount <= 0 &&
                      withholdingTax[selectedRowIndex].bracket !== 1) ||
                    (fromAmount > 0 &&
                      fromAmount >= toAmount &&
                      withholdingTax[selectedRowIndex].bracket !== 1 &&
                      withholdingTax[selectedRowIndex].bracket !== 6) ||
                    (fromAmount > 0 &&
                      withholdingTax[selectedRowIndex].bracket !== 1 &&
                      fromAmount <=
                        withholdingTax[selectedRowIndex - 1].from) ||
                    (toAmount <= 0 &&
                      withholdingTax[selectedRowIndex].bracket !== 6) ||
                    (toAmount > 0 &&
                      toAmount <= fromAmount &&
                      withholdingTax[selectedRowIndex].bracket !== 6) ||
                    (toAmount > 0 &&
                      withholdingTax[selectedRowIndex].bracket !== 1 &&
                      withholdingTax[selectedRowIndex].bracket !== 6 &&
                      toAmount <= withholdingTax[selectedRowIndex - 1].to) ||
                    (toAmount > 0 && withholdingTax[selectedRowIndex].bracket !== 6 &&
                      toAmount > withholdingTax[selectedRowIndex + 1].to) ||
                    (fixTaxAmount <= 0 &&
                      withholdingTax[selectedRowIndex].bracket !== 1 &&
                      withholdingTax[selectedRowIndex].bracket !== 2) ||
                    (taxRateOnExcess <= 0 &&
                      withholdingTax[selectedRowIndex].bracket !== 1)
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

export default WithholdingTaxShieldSidebar;
