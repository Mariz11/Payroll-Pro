'use client';

import { amountFormatter } from '@utils/helper';
import axios from 'axios';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { RadioButton } from 'primereact/radiobutton';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

interface Deduction {
  deductionType?: string;
  totalAmount?: number;
  amountPaid?: number;
  perCycleDeduction?: number;
  noOfCycles?: number;
  noOfIterations?: number;
}

interface PayrollDeduction {
  payrollDeductionId?: number;
  payroll_id?: number;
  deductionId?: number;
  amountToPay?: string;
  amountToPayNo?: number;
  isDeferred: boolean | null;
  isCollected?: boolean;
  deduction?: Deduction;
  deductionType?: string;
  totalAmount?: string;
  totalAmountNo?: number;
  totalAmountPaid?: string;
  totalAmountPaidNo?: number;
  amountPaid?: number;
  perCycleDeduction?: number;
}

const DeductionsGrid = ({
  rowData,
  setDeductionsData,
  refetchDataFromParent,
  isEditable,
}: {
  rowData: any;
  setDeductionsData: (d: any) => void;
  refetchDataFromParent: () => void;
  isEditable: boolean;
}) => {
  let emptyItem: PayrollDeduction = {
    isDeferred: null,
  };

  const [items, setItems] = useState<PayrollDeduction[]>(
    rowData.payroll_deductions
  );
  const [item, setItem] = useState<PayrollDeduction>(emptyItem);
  const [itemDialog, setItemDialog] = useState<boolean>(false);
  const [otherDeduction, setOtherDeduction] = useState<any>(null);
  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<any[]>>(null);

  const {
    control,
    formState: { errors, isDirty, isValid },
    handleSubmit,
    getValues,
    reset,
    register,
    setValue,
    trigger,
    setError,
  } = useForm<PayrollDeduction>({ mode: 'onChange', defaultValues: item });

  useEffect(() => {
    if (rowData) {
      // console.log(rowData);

      let temp: any[] = [];

      const fetchDeductions = async () => {
        for (let i = 0; i < rowData.payroll_deductions.length; i++) {
          const deduction = rowData.payroll_deductions[i];
          temp.push({ deductionId: deduction?.deductionId, desc: [] });

          try {
            const res = await axios.get(
              `/api/deductions/${deduction.deductionId}/ledger`,
              {
                headers: {
                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                },
              }
            );
            for (let j = 0; j < res.data.length; j++) {
              temp[i].desc.push(res.data[j].desc);
            }
          } catch (err) {
            console.error(err);
          }
        }
        setOtherDeduction(temp);
        // console.log(temp);
      };
      fetchDeductions();
    }
  }, [rowData]);

  const editItem = (item: PayrollDeduction) => {
    reset();
    setItem({ ...item });
    const totalAmount = item?.deduction?.totalAmount ?? 0;
    const perCycleDeduction = item?.deduction?.perCycleDeduction ?? 0;
    const deductionType = item?.deduction?.deductionType;
    const isDeferred = item.isDeferred;
    const amountPaid = item?.deduction?.amountPaid ?? 0;
    const amountToPay = item.amountPaid ?? 0;

    setValue('payrollDeductionId', item.payrollDeductionId);
    setValue('payroll_id', item.payroll_id);
    setValue('deductionId', item.deductionId);
    setValue('amountToPay', `PHP ${amountFormatter(amountToPay)}`);
    setValue('amountToPayNo', amountToPay);
    setValue('totalAmountPaid', `PHP ${amountFormatter(amountPaid)}`);
    setValue('totalAmountPaidNo', amountPaid);
    setValue('isDeferred', isDeferred);
    setValue('deductionType', deductionType);
    setValue('totalAmount', `PHP ${amountFormatter(totalAmount)}`);
    setValue('totalAmountNo', totalAmount);
    setValue('deduction', item?.deduction);

    setItemDialog(
      item.isCollected || deductionType == 'Salary Loan' ? false : true
    );
  };

  const handleEdit = (data: any) => {
    let _items = [...items];
    let _item = { ...data };

    const index = findIndexByGridId(data.payrollDeductionId);

    if (
      _item.isDeferred &&
      _item.deduction.noOfCycles == _item.deduction.noOfIterations + 1
    ) {
      setError('isDeferred', {
        message: `Maximum deferment period reached.`,
      });
      return;
    }

    // _items[index].amountPaid = _item.amountPayable;
    _items[index].isDeferred = _item.isDeferred;

    setItems(() => _items);

    setItemDialog(false);
    setItem(emptyItem);
    reset();

    // toast.current?.replace({
    //   severity: 'success',
    //   summary: 'Successfully Updated',
    //   life: 3000,
    // });
  };

  useEffect(() => {
    // console.log(item.deductionId);
  }, [itemDialog]);

  const findIndexByGridId = (gridId: any) => {
    let index = -1;

    for (let i = 0; i < items.length; i++) {
      if (items[i].payrollDeductionId === gridId) {
        index = i;
        break;
      }
    }

    return index;
  };

  useEffect(() => {
    setDeductionsData(items);
  }, [items, setDeductionsData]);

  return (
    <>
      <Toast ref={toast} position="bottom-left" />

      <DataTable
        value={items}
        frozenWidth="95rem"
        scrollable={true}
        tableStyle={{ minWidth: '90rem' }}
        size="small"
        scrollHeight="650px"
        selectionMode={rowData.isPosted ? undefined : 'single'}
        onSelectionChange={(e: any) => {
          if (!isEditable) {
            return;
          }
          editItem(e.value);
        }}
      >
        <Column
          header="Deduction Type"
          body={(row) => {
            return row?.deduction?.deductionType;
          }}
        />
        <Column
          header="Principal Amount"
          body={(row) => {
            return 'PHP ' + amountFormatter(row?.deduction?.totalAmount);
          }}
        />
        <Column
          header="No. of Cycles"
          body={(row) => {
            return row?.deduction?.noOfCycles;
          }}
        />
        <Column
          header="Total Amount Paid"
          body={(row) => {
            return 'PHP ' + amountFormatter(row?.deduction?.amountPaid);
          }}
        />
        <Column
          header="Amount to Pay"
          body={(row) => {
            return 'PHP ' + amountFormatter(row?.amountPaid);
          }}
        />
        <Column
          header="Is Deferred?"
          body={(row) => {
            return (
              <Tag
                value={row.isDeferred ? 'YES' : 'NO'}
                severity={row.isDeferred ? 'success' : 'danger'}
              ></Tag>
            );
          }}
        />
        {isEditable && (
          <Column
            field="actions"
            header="Actions"
            hidden={rowData.isPosted}
            body={actionTemplate}
          />
        )}
      </DataTable>

      <Dialog
        visible={itemDialog}
        style={{ width: '35rem' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        header="Details"
        modal
        className="p-fluid"
        onHide={() => setItemDialog(false)}
      >
        <form>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="field mb-2">
              <label htmlFor="date" className="font-bold">
                Deduction Type
              </label>
              <InputText {...register('deductionType')} disabled />
            </div>

            <div className="field mb-2">
              <label className="font-bold">Principal Amount</label>
              <InputText {...register('totalAmount')} disabled />
            </div>

            <div className="field mb-2">
              <label className="font-bold">Total Amount Paid</label>
              <InputText {...register('totalAmountPaid')} disabled />
            </div>
            <div className="field mb-2">
              <label className="font-bold">
                {/* <span className="text-red-500">*</span> */}
                Amount to Pay
              </label>
              <InputText {...register('amountToPay')} disabled />
              {/* <Controller
                name="amountPayable"
                control={control}
                rules={{
                  required: 'Amount Payable is required.',
                  validate: {
                    setMaxVal: (v) =>
                      v <= getValues('totalAmountNo') ||
                      'Amount Payable exceeded.',
                    setMinVal: (v) => v > 0 || 'Amount Payable is required.',
                  },
                }}
                render={({ field, fieldState }) => (
                  <div>
                    <InputNumber
                      min={0}
                      id={field.name}
                      ref={field.ref}
                      value={field.value}
                      onBlur={field.onBlur}
                      onChange={(e) => field.onChange(e.value)}
                      className={classNames({
                        'p-invalid': fieldState.error,
                      })}
                    />
                    {errors.amountPayable && (
                      <span className="text-red-600 text-sm">
                        {errors.amountPayable.message}
                      </span>
                    )}
                  </div>
                )}
              /> */}
            </div>

            {(() => {
              const deduction = otherDeduction?.find(
                (d: any) => d.deductionId === item.deductionId
              );

              return (
                deduction &&
                deduction.desc.length > 0 && (
                  <div className="field mb-2 col-span-2">
                    <label className="font-bold">Items:</label>
                    <div className="flex items-center gap-2">
                      {deduction.desc.join(', ')}
                    </div>
                  </div>
                )
              );
            })()}

            <div className="field mb-2">
              <label className="mb-3 font-bold">
                <span className="text-red-500">*</span>Is Deferred?
              </label>
              <Controller
                name="isDeferred"
                control={control}
                render={({ field }) => (
                  <>
                    <div className="flex justify-content-center">
                      <div className="flex items-center">
                        <RadioButton
                          inputId="pref"
                          {...field}
                          inputRef={field.ref}
                          value={1}
                          checked={field.value == true}
                        />
                        <label htmlFor="pref" className="ml-1 mr-3">
                          Yes
                        </label>

                        <RadioButton
                          inputId="notPref"
                          {...field}
                          value={0}
                          checked={field.value == false}
                        />
                        <label htmlFor="notPref" className="ml-1 mr-3">
                          No
                        </label>
                      </div>
                    </div>
                  </>
                )}
              />
            </div>
          </div>

          {errors.isDeferred && (
            <span className="text-red-600 text-sm">
              {errors.isDeferred.message}
            </span>
          )}
          <div className="w-full flex justify-end my-5">
            <Button
              type="button"
              severity="secondary"
              text
              label="Cancel"
              className="rounded-full px-10"
              onClick={() => setItemDialog(false)}
            />
            <Button
              onClick={handleSubmit(handleEdit)}
              label={'Save'}
              className="rounded-full px-10 p-button"
            />
          </div>
        </form>
      </Dialog>
    </>
  );

  function actionTemplate(rowData: any) {
    return rowData &&
      (rowData.isCollected ||
        rowData?.deduction?.deductionType == 'Salary Loan' ||
        !isEditable) ? (
      ''
    ) : (
      <div className="flex flex-nowrap gap-2">
        <Button
          type="button"
          text
          severity="secondary"
          icon="pi pi-file-edit"
          tooltip="Edit"
          tooltipOptions={{ position: 'top' }}
          onClick={() => editItem(rowData)}
        />
      </div>
    );
  }
};

export default DeductionsGrid;
