import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button } from 'primereact/button';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { watch } from 'fs';
interface PayrollAdjustment {
  payrollAdjustmentsId: number | null;
  addAdjustment: number;
  deductAdjustment: number;
  desc: string;
  isEdited: boolean;
}
const EditAdjustmentDialog = ({
  editDialog,
  setEditDialog,
  rowIndex,
  adjustmentData,
  setAdjustmentData,
  setForceRefresher,
  forceRefresher,
}: {
  editDialog: boolean;
  setEditDialog: (value: boolean) => any;
  rowIndex: number;
  adjustmentData: PayrollAdjustment[];
  setAdjustmentData: Dispatch<SetStateAction<PayrollAdjustment[]>>;
  setForceRefresher: Dispatch<React.SetStateAction<boolean>>;
  forceRefresher: boolean;
}) => {
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
    watch,
  } = useForm<PayrollAdjustment>({
    mode: 'onChange',
    defaultValues: {
      addAdjustment: 0.0,
      deductAdjustment: 0.0,
      desc: '',
    },
  });
  const handleEditAdjustment = (data: any) => {
    const item = adjustmentData[rowIndex];
    adjustmentData[rowIndex].addAdjustment = watch('addAdjustment');
    adjustmentData[rowIndex].deductAdjustment = watch('deductAdjustment');
    adjustmentData[rowIndex].desc = watch('desc');
    if (adjustmentData[rowIndex].payrollAdjustmentsId != null) {
      adjustmentData[rowIndex].isEdited = true;
    }

    setForceRefresher(!forceRefresher);
    setEditDialog(false);
    // toast.current?.replace({
    //   severity: 'success',
    //   summary: 'Successfully Updated',
    //   life: 3000,
    // });
  };
  useEffect(() => {
    if (adjustmentData.length > 0) {
      setValue('addAdjustment', adjustmentData[rowIndex].addAdjustment);
      setValue('deductAdjustment', adjustmentData[rowIndex].deductAdjustment);
      setValue('desc', adjustmentData[rowIndex].desc);
    }
  }, [rowIndex, editDialog]);
  return (
    <div>
      <Dialog
        visible={editDialog}
        style={{ width: '35rem' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        header="Edit Adjustment"
        modal
        className="p-fluid"
        onHide={() => setEditDialog(false)}
      >
        <form>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {/* <label className="font-bold">Add Adjustment</label>
              <InputNumber
                minFractionDigits={2}
                {...register('addAdjustment')}
              /> */}
            <Controller
              name="addAdjustment"
              control={control}
              render={({ field, fieldState }) => (
                <div className="field mb-2">
                  <label className="my-1 font-bold ">
                    <span>Add Adjustment</span>
                  </label>
                  <InputNumber
                    maxFractionDigits={2}
                    minFractionDigits={2}
                    min={0}
                    id={field.name}
                    ref={field.ref}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChange={(e) => field.onChange(e.value)}
                    disabled={watch('deductAdjustment') > 0}
                  />
                </div>
              )}
            />

            <Controller
              name="deductAdjustment"
              control={control}
              render={({ field, fieldState }) => (
                <div className="field mb-2">
                  <label className="my-1 font-bold">
                    <span>Deduct Adjustment</span>
                  </label>
                  <InputNumber
                    maxFractionDigits={2}
                    minFractionDigits={2}
                    min={0}
                    id={field.name}
                    ref={field.ref}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChange={(e) => field.onChange(e.value)}
                    disabled={watch('addAdjustment') > 0}
                  />
                </div>
              )}
            />

            <div className="field mb-2 col-span-2">
              <span className="text-red-500">*</span>
              <label className="font-bold">
                Short Description (Maximum of 20 Characters)
              </label>
              <InputText maxLength={20} {...register('desc')} />
            </div>
          </div>
          <div className="flex flex-row gap-10 p-3">
            <Button
              type="button"
              severity="secondary"
              text
              label="Cancel"
              className="rounded-full px-10"
              onClick={() => setEditDialog(false)}
            />
            <Button
              disabled={
                watch('desc') === '' ||
                (watch('addAdjustment') <= 0 && watch('deductAdjustment') <= 0)
              }
              onClick={handleSubmit(handleEditAdjustment)}
              label={'Save'}
              className="rounded-full px-10 p-button"
            />
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default EditAdjustmentDialog;
