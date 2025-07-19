import { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Fragment } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import {
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormReset,
  UseFormSetError,
  UseFormSetValue,
  UseFormWatch,
  Controller,
} from 'react-hook-form';

const EditBreakdownDialog = ({
  visible,
  setVisible,
  selectedBreakdown,
  setDeductionBreakdownArr,
  deductionBreakdownArr,
}: {
  visible: boolean;
  setVisible: any;
  selectedBreakdown: {
    data: any;
    rowIndex: number;
  };
  setDeductionBreakdownArr: any;
  deductionBreakdownArr: any[];
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    setValue,
    setError,
    watch,
    reset,
    control,
  } = useForm({
    mode: 'onSubmit',
    defaultValues: {
      amount: 0,
      desc: '',
    },
  });
  function handleEdit(data: any) {
    setDeductionBreakdownArr(
      deductionBreakdownArr.map((item, index) => {
        if (index === selectedBreakdown.rowIndex) {
          return { ...item, amount: data.amount, desc: data.desc };
        }
        return item;
      })
    );
    setVisible(false);
  }
  useEffect(() => {
    if (visible) {
      setValue('amount', selectedBreakdown.data.amount);
      setValue('desc', selectedBreakdown.data.desc);
    }
  }, [visible]);
  return (
    <>
      <Dialog
        visible={visible}
        onHide={() => {
          setVisible(false);
        }}
        closable={true}
        className="w-[50vw]"
        header="Edit Breakdown"
      >
        <form onSubmit={handleSubmit(handleEdit)} className="w-full gap-5">
          <div className="flex flex-row w-full gap-5 ">
            <div className=" flex flex-row gap-5 w-full">
              <div className="flex flex-col">
                <label className="my-1">
                  <span className="text-red-500">*</span>
                  <span>Amount</span>
                </label>
                <Controller
                  name="amount"
                  control={control}
                  rules={{
                    required: 'Amount is required.',
                    min: {
                      value: 0.01,
                      message: 'Amount should not be 0 or less',
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <>
                      {/* <InputNumber
                        id={field.name}
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onValueChange={(e) => field.onChange(e)}
                        mode="currency"
                        currency="USD"
                        locale="en-US"
                        inputClassName={classNames({
                          'p-invalid': fieldState.error,
                        })}
                      /> */}

                      <InputNumber
                        id={field.name}
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onValueChange={(e) => field.onChange(e)}
                        // value={watch('totalAmmount')}
                        // className={classNames()}
                        placeholder="0.00"
                        maxFractionDigits={2}
                        minFractionDigits={2}
                      />
                      {errors.amount && (
                        <span className="text-red-500 text-sm">
                          {errors.amount.message}
                        </span>
                      )}
                    </>
                  )}
                />
              </div>
              <div className="w-full flex flex-col">
                <label className="my-1">
                  <label className="">
                    <span className="text-red-500">*</span>
                  </label>
                  <span>Description </span>
                  <span>{` (20 Characters Max)`}</span>
                </label>
                <InputText
                  // autoResize={false}
                  // rows={1}
                  // cols={30}
                  // {...register('remarks', {
                  // required: 'remarks is required',
                  // })}
                  {...register('desc', {
                    required: 'Description is required',
                    maxLength: {
                      value: 20,
                      message: 'Description is too long',
                    },
                    minLength: {
                      value: 1,
                      message: 'Description should not be empty',
                    },
                  })}
                  maxLength={20}
                  placeholder="Description of the deduction"
                />
                {errors.desc && (
                  <span className="text-red-500 text-sm">
                    {errors.desc.message}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="justify-end items-end  flex p-5 ">
            <Button className="rounded-full">Save</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default EditBreakdownDialog;
