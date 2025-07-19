import React, { useEffect, useRef, useState } from 'react';
import { DataTable, DataTableRowEditCompleteEvent } from 'primereact/datatable';
import { Column, ColumnEditorOptions } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import {
  InputNumber,
  InputNumberValueChangeEvent,
} from 'primereact/inputnumber';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Skeleton, TimePicker } from 'antd';
import classNames from 'classnames';
import { Calendar } from 'primereact/calendar';
import dayjs from 'dayjs';
import { Controller, useForm } from 'react-hook-form';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import moment from '@constant/momentTZ';
import { Toast } from 'primereact/toast';

export default function ChangeScheduleForm({
  action,
  newScheduleData,
  currentScheduleData,
  setNewScheduleData,
}: {
  action: string;
  newScheduleData: ChangeSchedule[];
  currentScheduleData: any;
  setNewScheduleData: (data: ChangeSchedule[]) => void;
}) {
  const emptyItem: ChangeSchedule = {
    gridId: null,
    changeScheduleId: null,
    date: null,
    timeIn: null,
    timeOut: null,
    lunchStart: null,
    lunchEnd: null,
    typeOfChange: null,
    workingHours: 0,
  };

  const [items, setItems] = useState<ChangeSchedule[]>(newScheduleData || []);
  const [item, setItem] = useState<ChangeSchedule>(emptyItem);
  const [itemDialog, setItemDialog] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    setValue,
    setError,
    clearErrors,
    reset,
    watch,
  } = useForm<ChangeSchedule>({
    mode: 'onSubmit',
    defaultValues: item,
  });

  const toast = useRef<Toast>(null);
  const toast2 = useRef<Toast>(null);

  const editItem = (item: ChangeSchedule) => {
    setItem({ ...item });

    setValue('gridId', item.gridId);
    setValue('changeScheduleId', item.changeScheduleId);
    setValue('typeOfChange', item.typeOfChange);
    setValue('date', item.date ? new Date(item.date) : null);

    if (item.typeOfChange == 'CHANGE SHIFT SCHEDULE') {
      const dateFormatted = moment(item.date).format('MM/DD/YY');

      setValue(
        'timeIn',
        moment(item.timeIn).isValid()
          ? item.timeIn
          : (new Date(`${dateFormatted} ${item.timeIn}`) as any)
      );
      setValue(
        'timeOut',
        moment(item.timeOut).isValid()
          ? item.timeOut
          : (new Date(`${dateFormatted} ${item.timeOut}`) as any)
      );
      setValue(
        'lunchEnd',
        moment(item.lunchEnd).isValid()
          ? item.lunchEnd
          : (new Date(`${dateFormatted} ${item.lunchEnd}`) as any)
      );
      setValue(
        'lunchStart',
        moment(item.lunchStart).isValid()
          ? item.lunchStart
          : (new Date(`${dateFormatted} ${item.lunchStart}`) as any)
      );
    }
    clearErrors(['timeIn', 'timeOut', 'lunchEnd', 'lunchStart']);
    setItemDialog(true);
  };

  const onSubmit = (data: ChangeSchedule) => {
    if (
      data.typeOfChange == 'CHANGE SHIFT SCHEDULE' &&
      data.lunchStart &&
      data.timeIn &&
      data.timeOut &&
      data.lunchEnd
    ) {
      let errorCount = 0;
      let timeIn: any = data.timeIn;
      let timeOut: any = data.timeOut;
      let lunchStartTime: any = data.lunchStart;
      let lunchEndTime: any = data.lunchEnd;

      if (timeOut < timeIn) {
        timeOut = moment(timeOut).add(1, 'days').toDate();
      }

      if (lunchStartTime < timeIn) {
        lunchStartTime = moment(lunchStartTime).add(1, 'days').toDate();
      }

      if (lunchEndTime < lunchStartTime) {
        lunchEndTime = moment(lunchEndTime).add(1, 'days').toDate();
      }

      if (lunchStartTime < timeIn || lunchStartTime > timeOut) {
        setError('lunchStart', {
          type: 'required',
          message: 'Lunch should be between Time In/Out',
        });
        errorCount++;
      }

      if (lunchEndTime > timeOut || lunchEndTime < timeIn) {
        setError('lunchEnd', {
          type: 'required',
          message: 'Lunch should be between Time In/Out',
        });
        errorCount++;
      }

      if (
        lunchEndTime < lunchStartTime &&
        timeIn < lunchStartTime &&
        timeOut > lunchEndTime
      ) {
        setError('lunchStart', {
          type: 'required',
          message: 'Invalid Time range',
        });
        setError('lunchEnd', {
          type: 'required',
          message: 'Invalid Time range',
        });
        errorCount++;
      }

      const lunchBreakHours =
        moment
          .duration(moment(lunchEndTime).diff(moment(lunchStartTime)))
          .asMinutes() / 60;
      const numberOfHours =
        moment.duration(moment(timeOut).diff(moment(timeIn))).asMinutes() / 60 -
        lunchBreakHours;

      if (numberOfHours != currentScheduleData.workingHours) {
        toast2.current?.replace({
          severity: 'error',
          summary:
            'Total Working Hours you are changing the schedule to must be same as the number of Working Hours of the Shift',
          life: 10000,
        });
        errorCount++;
      }

      if (errorCount > 0) {
        return;
      }

      data.timeIn = moment(timeIn).format('HH:mm:ss');
      data.timeOut = moment(timeOut).format('HH:mm:ss');
      data.lunchStart = moment(lunchStartTime).format('HH:mm:ss');
      data.lunchEnd = moment(lunchEndTime).format('HH:mm:ss');
      data.workingHours = numberOfHours;
    }

    let _items = [...items];
    let _item = { ...data };

    const duplicateDatesFound =
      _items.filter(
        (i: any) =>
          moment(i.date).format('YYYY-MM-DD') ==
            moment(data.date).format('YYYY-MM-DD') &&
          (i.changeScheduleId != data.changeScheduleId ||
            i.gridId != data.gridId)
      ).length > 0;
    if (duplicateDatesFound) {
      toast2.current?.replace({
        severity: 'error',
        summary: 'You cannot add a schedule for the same date',
        life: 3000,
      });
      return;
    }

    if (data.gridId || data.changeScheduleId) {
      const index = findIndexByGridId(data.gridId || data.changeScheduleId);
      _items[index] = _item;

      toast.current?.replace({
        severity: 'success',
        summary: 'Successfully Updated',
        life: 3000,
      });
    } else {
      _item.gridId = createId();
      _items.push(_item);
      toast.current?.replace({
        severity: 'success',
        summary: 'Successfully Added',
        life: 3000,
      });
    }

    setItems(_items);
    setNewScheduleData(_items);
    setItemDialog(false);
    setItem(emptyItem);
    reset();
  };

  const confirmDeleteItem = (item: ChangeSchedule) => {
    let _items = items.filter((val) => {
      if (val.gridId) return val.gridId !== item.gridId;
      else return val.changeScheduleId !== item.changeScheduleId;
    });

    let itemsToBeDeleted = items.filter((val) => {
      if (val.gridId) return val.gridId === item.gridId;
      else return val.changeScheduleId === item.changeScheduleId;
    });

    setItems(_items);
    setNewScheduleData(_items);
    setItem(emptyItem);
  };

  const findIndexByGridId = (gridId: any) => {
    let index = -1;

    for (let i = 0; i < items.length; i++) {
      if (items[i].gridId == gridId || items[i].changeScheduleId == gridId) {
        index = i;
        break;
      }
    }

    return index;
  };

  const createId = (): string => {
    let id = '';
    let chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < 5; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return id;
  };

  const actionBodyTemplate = (rowData: any) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-pencil"
          rounded
          outlined
          className="mr-2"
          tooltip="Edit"
          tooltipOptions={{ position: 'top' }}
          onClick={(e) => {
            e.preventDefault();
            editItem(rowData);
          }}
        />
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          tooltip="Delete"
          tooltipOptions={{ position: 'top' }}
          onClick={(e) => {
            e.preventDefault();
            confirmDeleteItem(rowData);
          }}
        />
      </React.Fragment>
    );
  };

  return (
    <div className="card p-fluid">
      <Toast ref={toast} position="bottom-left" />
      <DataTable
        value={items}
        frozenWidth="95rem"
        scrollable={true}
        tableStyle={{ minWidth: '90rem' }}
        size="small"
        scrollHeight="650px"
        selectionMode={action == 'edit' ? 'single' : undefined}
        onSelectionChange={(e: any) => {
          items.length > 0 && action == 'edit' ? editItem(e.value) : null;
        }}
        header={
          <div className="flex flex-wrap gap-2 items-center justify-end">
            {action != 'view' && (
              <div className="flex gap-2">
                <Button
                  label="New"
                  icon="pi pi-plus"
                  severity="success"
                  className="rounded-full px-10 p-button"
                  disabled={!currentScheduleData}
                  onClick={(e: any) => {
                    e.preventDefault();
                    if (currentScheduleData) {
                      setItemDialog(true);
                      reset();
                    }
                  }}
                />
              </div>
            )}
          </div>
        }
      >
        <Column field="typeOfChange" header="Type of Change" />
        <Column
          field="date"
          header="Date"
          body={(data) => {
            return items.length == 0 ? (
              <Skeleton />
            ) : (
              <>
                {moment(data.date).isValid()
                  ? moment(data.date).format('MM/DD/YY (ddd)')
                  : ''}
              </>
            );
          }}
        />
        <Column
          field="timeIn"
          header="Time-in"
          body={(data) => {
            return items.length == 0 ? (
              <Skeleton />
            ) : moment(data.timeIn, 'HH:mm:ss').isValid() ? (
              moment(data.timeIn, 'HH:mm:ss').format('LT')
            ) : (
              ''
            );
          }}
        />

        <Column
          field="lunchStart"
          header="Lunch Break Start"
          body={(data) => {
            return items.length == 0 ? (
              <Skeleton />
            ) : moment(data.lunchStart, 'HH:mm:ss').isValid() ? (
              moment(data.lunchStart, 'HH:mm:ss').format('LT')
            ) : (
              ''
            );
          }}
        />
        <Column
          field="lunchEnd"
          header="Lunch Break End"
          body={(data) => {
            return items.length == 0 ? (
              <Skeleton />
            ) : moment(data.lunchEnd, 'HH:mm:ss').isValid() ? (
              moment(data.lunchEnd, 'HH:mm:ss').format('LT')
            ) : (
              ''
            );
          }}
        />
        <Column
          field="timeOut"
          header="Time-out"
          body={(data) => {
            return items.length == 0 ? (
              <Skeleton />
            ) : moment(data.timeOut, 'HH:mm:ss').isValid() ? (
              moment(data.timeOut, 'HH:mm:ss').format('LT')
            ) : (
              ''
            );
          }}
        />
        <Column
          hidden={action == 'view'}
          header="Actions"
          body={actionBodyTemplate}
          exportable={false}
          style={{ minWidth: '12rem' }}
        />
      </DataTable>

      <Dialog
        visible={itemDialog}
        style={{ width: '35rem' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        modal
        className="p-fluid"
        onHide={() => setItemDialog(false)}
      >
        <form>
          <Toast ref={toast2} position="bottom-left" />
          <div className="w-full card flex justify-content-center flex-col flex-auto my-5">
            <label className="font-bold">
              <span className="text-red-500">*</span>
              <span>Type of Change</span>
            </label>
            <Controller
              name="typeOfChange"
              control={control}
              rules={{
                required: 'Type of Change is required.',
              }}
              render={({ field, fieldState }) => (
                <Dropdown
                  value={field.value}
                  options={['CHANGE SHIFT SCHEDULE', 'CHANGE DAY-OFF']}
                  onChange={(e) => {
                    field.onChange(e.value);
                    setValue('timeIn', null);
                    setValue('timeOut', null);
                    setValue('lunchEnd', null);
                    setValue('lunchStart', null);
                  }}
                  required
                  className="w-full md:w-14rem"
                />
              )}
            />
            {errors.typeOfChange && (
              <span className="text-red-600">
                {errors.typeOfChange.message}
              </span>
            )}
          </div>
          {watch('typeOfChange') && (
            <div className="w-full card flex justify-content-center flex-col flex-auto mb-5">
              <label htmlFor="date" className="font-bold">
                <span className="text-red-500">*</span>
                Date
              </label>
              <Controller
                name="date"
                control={control}
                rules={{ required: 'Date is required.' }}
                render={({ field, fieldState }) => (
                  <Calendar
                    disabled={action == 'view'}
                    ref={field.ref}
                    value={field.value}
                    onBlur={field.onBlur}
                    // minDate={new Date()}
                    onChange={(e) => {
                      field.onChange(e.value);

                      const dateFormatted = moment(e.value as Date).format(
                        'MM/DD/YY'
                      );
                      if (item.typeOfChange == 'CHANGE SHIFT SCHEDULE') {
                        setValue(
                          'timeIn',
                          item.timeIn
                            ? (new Date(
                                `${dateFormatted} ${item.timeIn}`
                              ) as any)
                            : null
                        );
                        setValue(
                          'timeOut',
                          item.timeOut
                            ? (new Date(
                                `${dateFormatted} ${item.timeOut}`
                              ) as any)
                            : null
                        );
                        setValue(
                          'lunchEnd',
                          item.lunchEnd
                            ? (new Date(
                                `${dateFormatted} ${item.lunchEnd}`
                              ) as any)
                            : null
                        );
                        setValue(
                          'lunchStart',
                          item.lunchStart
                            ? (new Date(
                                `${dateFormatted} ${item.lunchStart}`
                              ) as any)
                            : null
                        );
                      }
                    }}
                    className={classNames('custom-calendar-input')}
                    dateFormat="mm/dd/yy"
                    showIcon
                  />
                )}
              />
              {errors.date && (
                <span className="text-red-500 text-sm">
                  {errors.date.message}
                </span>
              )}
            </div>
          )}
          {watch('typeOfChange') == 'CHANGE SHIFT SCHEDULE' && (
            <div className="mt-5 grid grid-cols-2 gap-2">
              <div className="field mb-2">
                <label htmlFor="name" className="font-bold">
                  <span className="text-red-500">*</span>
                  Time-in
                </label>

                <Controller
                  name="timeIn"
                  control={control}
                  rules={{
                    required: 'Time-in is required.',
                  }}
                  render={({ field, fieldState }) => (
                    <TimePicker
                      className="p-inputtext p-component"
                      use12Hours
                      id={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      format="hh:mm A"
                      onChange={(e: any) => {
                        const value =
                          watch().date && e
                            ? new Date(
                                `${moment(watch().date).format(
                                  'MM/DD/YY'
                                )} ${moment(new Date(e)).format('HH:mm:ss')}`
                              )
                            : null;
                        field.onChange(value);
                      }}
                      value={field.value ? dayjs(field.value) : null}
                    ></TimePicker>
                  )}
                />
                {errors.timeIn && (
                  <span className="text-red-600 text-sm">
                    {errors.timeIn.message}
                  </span>
                )}
              </div>

              <div className="field mb-2">
                <label htmlFor="name" className="font-bold">
                  <span className="text-red-500">*</span>
                  Time-out
                </label>

                <Controller
                  name="timeOut"
                  control={control}
                  rules={{
                    required: 'Time-out is required.',
                  }}
                  render={({ field, fieldState }) => (
                    <TimePicker
                      className="p-inputtext p-component"
                      use12Hours
                      id={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      format="hh:mm A"
                      onChange={(e: any) => {
                        const value =
                          watch().date && e
                            ? new Date(
                                `${moment(watch().date).format(
                                  'MM/DD/YY'
                                )} ${moment(new Date(e)).format('HH:mm:ss')}`
                              )
                            : null;
                        field.onChange(value);
                      }}
                      value={field.value ? dayjs(field.value) : null}
                    ></TimePicker>
                  )}
                />
                {errors.timeOut && (
                  <span className="text-red-600 text-sm">
                    {errors.timeOut.message}
                  </span>
                )}
              </div>

              <div className="field mb-2">
                <label htmlFor="name" className="font-bold">
                  <span className="text-red-500">*</span>
                  Lunch Break Start
                </label>
                <Controller
                  name="lunchStart"
                  control={control}
                  rules={{
                    required: 'Lunch Break Start is required.',
                  }}
                  render={({ field, fieldState }) => (
                    <TimePicker
                      className="p-inputtext p-component"
                      use12Hours
                      id={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      format="hh:mm A"
                      onChange={(e: any) => {
                        const value =
                          watch().date && e
                            ? new Date(
                                `${moment(watch().date).format(
                                  'MM/DD/YY'
                                )} ${moment(new Date(e)).format('HH:mm:ss')}`
                              )
                            : null;
                        field.onChange(value);
                      }}
                      value={field.value ? dayjs(field.value) : null}
                    ></TimePicker>
                  )}
                />
                {errors.lunchStart && (
                  <span className="text-red-600 text-sm">
                    {errors.lunchStart.message}
                  </span>
                )}
              </div>
              <div className="field mb-2">
                <label htmlFor="name" className="font-bold">
                  <span className="text-red-500">*</span>
                  Lunch Break End
                </label>
                <Controller
                  name="lunchEnd"
                  control={control}
                  rules={{
                    required: 'Lunch Break End is required.',
                  }}
                  render={({ field, fieldState }) => (
                    <TimePicker
                      className="p-inputtext p-component"
                      use12Hours
                      id={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      format="hh:mm A"
                      onChange={(e: any) => {
                        const value =
                          watch().date && e
                            ? new Date(
                                `${moment(watch().date).format(
                                  'MM/DD/YY'
                                )} ${moment(new Date(e)).format('HH:mm:ss')}`
                              )
                            : null;
                        field.onChange(value);
                      }}
                      value={field.value ? dayjs(field.value) : null}
                    ></TimePicker>
                  )}
                />
                {errors.lunchEnd && (
                  <span className="text-red-600 text-sm">
                    {errors.lunchEnd.message}
                  </span>
                )}
              </div>
            </div>
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
              onClick={handleSubmit(onSubmit)}
              label={'Save'}
              className="rounded-full px-10 p-button"
            />
          </div>
        </form>
      </Dialog>
    </div>
  );
}
