import React, { useState, useEffect, useRef, FC } from 'react';
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Rating } from 'primereact/rating';
import { Toolbar } from 'primereact/toolbar';
import { InputTextarea } from 'primereact/inputtextarea';
import { RadioButton, RadioButtonChangeEvent } from 'primereact/radiobutton';
import { InputNumber, InputNumberChangeEvent } from 'primereact/inputnumber';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import Image from 'next/image';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Controller, useForm } from 'react-hook-form';

interface CompanyPayCycleGrid {
  payCycleId?: number;
  gridId: string | null;
  cycle: string;
  payDate: number;
  cutOffStartDate: number;
  cutOffEndDate: number;
  preferredMonth: string | object;
  isApplyGovtBenefits: boolean | null;
}

interface PayCycleGridProps {
  action: string;
  setCycleData: (p: any[]) => void;
  setDeletedCycles: (p: any[]) => void;
  cycleData: any[];
}

export default function PayCycleGrid({
  action,
  setCycleData,
  setDeletedCycles,
  cycleData,
}: PayCycleGridProps) {
  let emptyItem: CompanyPayCycleGrid = {
    gridId: null,
    cycle: '',
    payDate: 0,
    cutOffStartDate: 0,
    cutOffEndDate: 0,
    preferredMonth: '',
    isApplyGovtBenefits: null,
  };

  const [buttonText, setButtonText] = useState('');
  const [items, setItems] = useState<CompanyPayCycleGrid[]>(cycleData || []);
  const [item, setItem] = useState<CompanyPayCycleGrid>(emptyItem);
  const [itemDialog, setItemDialog] = useState<boolean>(false);
  const [deleteItemDialog, setDeleteItemDialog] = useState<boolean>(false);
  const [deleteItemsDialog, setDeleteItemsDialog] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<CompanyPayCycleGrid[]>([]);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [globalFilter, setGlobalFilter] = useState<any>(null);
  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<any[]>>(null);

  useEffect(() => {
    setCycleData(items);
  }, [setCycleData, items]);

  const {
    control,
    formState: { errors, isDirty, isValid },
    handleSubmit,
    getValues,
    reset,
    register,
    setValue,
    trigger,
  } = useForm<CompanyPayCycleGrid>({ mode: 'onChange', defaultValues: item });

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  const openNew = (e: any) => {
    e.preventDefault();
    setButtonText('Create');
    setItem(emptyItem);
    setValue('gridId', null);
    setValue('cycle', '');
    setValue('payDate', 0);
    setValue('cutOffStartDate', 0);
    setValue('cutOffEndDate', 0);
    setValue('preferredMonth', '');
    setValue('isApplyGovtBenefits', null);
    setSubmitted(false);
    setItemDialog(true);
  };

  const hideDialog = () => {
    setSubmitted(false);
    setItemDialog(false);
    reset();
  };

  const hideDeleteItemDialog = () => {
    setDeleteItemDialog(false);
  };

  const hideDeleteItemsDialog = () => {
    setDeleteItemsDialog(false);
  };

  const onSubmit = async (data: CompanyPayCycleGrid) => {
    if (data.cycle.trim()) {
      let _items = [...items];
      let _item = { ...data };
      const { name }: any = _item.preferredMonth;
      _item.preferredMonth = name;

      if (data.gridId || data.payCycleId) {
        const index = findIndexByGridId(data.gridId || data.payCycleId);

        _items[index] = _item;
        toast.current?.replace({
          severity: 'success',
          summary: 'Successfully Updated',
          // detail: _item.cycle + ' has been updated',
          life: 3000,
        });
      } else {
        _item.gridId = createId();
        _items.push(_item);
        toast.current?.replace({
          severity: 'success',
          summary: 'Successfully Added',
          // detail: _item.cycle + ' has been added',
          life: 3000,
        });
      }

      setItems(_items);
      setItemDialog(false);
      setItem(emptyItem);
      setSubmitted(true);
      reset();
    }
  };

  const editItem = (e: any, item: CompanyPayCycleGrid) => {
    e.preventDefault();
    setButtonText('Update');
    setItem({ ...item });
    setValue('gridId', item.gridId);
    setValue('payCycleId', item.payCycleId);
    setValue('cycle', item.cycle);
    setValue('payDate', item.payDate);
    setValue('cutOffStartDate', item.cutOffStartDate);
    setValue('cutOffEndDate', item.cutOffEndDate);
    setValue('preferredMonth', { name: item.preferredMonth });
    setValue('isApplyGovtBenefits', item.isApplyGovtBenefits);
    setItemDialog(true);
  };

  const confirmDeleteItem = (e: any, item: CompanyPayCycleGrid) => {
    e.preventDefault();
    setItem(item);
    setDeleteItemDialog(true);
  };

  const deleteItem = (e: any) => {
    e.preventDefault();

    let _items = items.filter((val) => {
      if (val.gridId) return val.gridId !== item.gridId;
      else return val.payCycleId !== item.payCycleId;
    });

    let itemsToBeDeleted = items.filter((val) => {
      if (val.gridId) return val.gridId === item.gridId;
      else return val.payCycleId === item.payCycleId;
    });

    setItems(_items);
    setDeletedCycles(itemsToBeDeleted);
    setDeleteItemDialog(false);
    setItem(emptyItem);
    toast.current?.replace({
      severity: 'success',
      summary: 'Successfully Deleted',
      // detail: 'Item Deleted',
      life: 3000,
    });
  };

  const findIndexByGridId = (gridId: any) => {
    let index = -1;

    for (let i = 0; i < items.length; i++) {
      if (items[i].gridId || items[i].payCycleId === gridId) {
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

  const exportCSV = () => {
    dt.current?.exportCSV();
  };

  const confirmDeleteSelected = (e: any) => {
    e.preventDefault();
    setDeleteItemsDialog(true);
  };

  const deleteSelectedItems = () => {
    let _items = items.filter((val) => !selectedItems.includes(val));

    setItems(_items);
    setDeleteItemsDialog(false);
    setSelectedItems([]);
    toast.current?.replace({
      severity: 'success',
      summary: 'Successfully Deleted',
      // detail: 'Items Deleted',
      life: 3000,
    });
  };

  // const rightToolbarTemplate = () => {
  //   return (
  //     <Button
  //       label="Export"
  //       icon="pi pi-upload"
  //       className="p-button-help"
  //       onClick={exportCSV}
  //     />
  //   );
  // };

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
          onClick={(e) => editItem(e, rowData)}
        />
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          tooltip="Delete"
          tooltipOptions={{ position: 'top' }}
          onClick={(e) => confirmDeleteItem(e, rowData)}
        />
      </React.Fragment>
    );
  };

  const isApplyGovtBenefitsTemplate = (rowData: any) => {
    return (
      <Tag
        value={rowData.isApplyGovtBenefits ? 'YES' : 'NO'}
        severity={getSeverity(rowData)}
      ></Tag>
    );
  };

  const getSeverity = (rowData: any) => {
    switch (rowData.isApplyGovtBenefits) {
      case true:
        return 'success';
      case 1:
        return 'success';
      case false:
        return 'danger';
      case 0:
        return 'danger';
      default:
        return null;
    }
  };

  const header = (
    <div className="flex flex-wrap gap-2 items-center justify-between">
      {/* <h3 className="m-0 text-lg">Manage Pay Cycles</h3> */}
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          type="search"
          placeholder="Search..."
          onChange={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setGlobalFilter(e.target.value);
          }}
        />
      </span>
      {action != 'view' && (
        <div className="flex gap-2">
          <Button
            label="New"
            icon="pi pi-plus"
            severity="success"
            className="rounded-full px-10 p-button"
            onClick={openNew}
          />
          <Button
            label="Delete"
            icon="pi pi-trash"
            className="rounded-full px-10 p-button"
            onClick={confirmDeleteSelected}
            disabled={!selectedItems || !selectedItems.length}
          />
        </div>
      )}
    </div>
  );
  const itemDialogFooter = (
    <React.Fragment>
      <Button
        type="button"
        label="Cancel"
        icon="pi pi-times"
        outlined
        onClick={hideDialog}
      />
      <Button label="Save" icon="pi pi-check" />
    </React.Fragment>
  );
  const deleteItemDialogFooter = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        outlined
        className="rounded-full px-10 p-button"
        onClick={hideDeleteItemDialog}
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        className="rounded-full px-10 p-button"
        onClick={deleteItem}
      />
    </React.Fragment>
  );
  const deleteItemsDialogFooter = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        outlined
        className="rounded-full px-10 p-button"
        onClick={hideDeleteItemsDialog}
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        className="rounded-full px-10 p-button"
        onClick={deleteSelectedItems}
      />
    </React.Fragment>
  );

  return (
    <div>
      <Toast ref={toast} position="bottom-left" />
      <div className="card">
        <DataTable
          ref={dt}
          value={items}
          selection={action != 'view' && selectedItems}
          onSelectionChange={(e) => {
            if (Array.isArray(e.value)) {
              setSelectedItems(e.value);
            }
          }}
          onFilter={(e) => null}
          dataKey="payCycleId"
          // paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} items"
          globalFilter={globalFilter}
          globalFilterMatchMode="startsWith"
          header={header}
        >
          <Column
            hidden={action == 'view'}
            selectionMode="multiple"
            exportable={false}
          />
          <Column
            field="cycle"
            header="Cycle"
            sortable={false}
            style={{ minWidth: '12rem' }}
          />
          <Column
            field="payDate"
            header="Pay Date"
            sortable={false}
            style={{ minWidth: '12rem' }}
          />
          <Column
            field="cutOffStartDate"
            header="Cut-off Start Date"
            sortable={false}
            style={{ minWidth: '12rem' }}
          />
          <Column
            field="cutOffEndDate"
            header="Cut-off End Date"
            sortable={false}
            style={{ minWidth: '12rem' }}
          />
          <Column
            field="preferredMonth"
            header="Month of Cut-off Start Date"
            sortable={false}
            style={{ minWidth: '12rem' }}
          />
          <Column
            field="isApplyGovtBenefits"
            header="Apply Government Benefits?"
            sortable={false}
            style={{ minWidth: '12rem' }}
            body={isApplyGovtBenefitsTemplate}
          />
          <Column
            hidden={action == 'view'}
            header="Actions"
            body={actionBodyTemplate}
            exportable={false}
            style={{ minWidth: '12rem' }}
          />
        </DataTable>
      </div>

      <Dialog
        visible={itemDialog}
        style={{ width: '32rem' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        header="Pay Cycle Details"
        modal
        className="p-fluid"
        // footer={itemDialogFooter}
        onHide={hideDialog}
      >
        <form>
          <div className="field mb-2">
            <label htmlFor="cycle" className="font-bold">
              <span className="text-red-500">*</span>
              Cycle
            </label>
            <InputText
              className={classNames('w-full', {
                'p-invalid': errors.cycle,
              })}
              {...register('cycle', {
                required: true,
              })}
            />
            {errors.cycle && (
              <span className="text-red-600 text-sm">Cycle is required</span>
            )}
          </div>

          <div className="field mb-2">
            <label htmlFor="name" className="font-bold">
              <span className="text-red-500">*</span>
              Pay Date
            </label>

            <Controller
              name="payDate"
              control={control}
              rules={{
                required: true,
                min: 1,
              }}
              render={({ field, fieldState }) => (
                <InputNumber
                  min={0}
                  max={31}
                  id={field.name}
                  ref={field.ref}
                  value={field.value}
                  onBlur={field.onBlur}
                  placeholder="Pay Cycle To"
                  onChange={(e) => field.onChange(e.value)}
                  inputClassName={classNames({
                    'p-invalid': fieldState.error,
                  })}
                />
              )}
            />
            {errors.payDate && (
              <span className="text-red-600 text-sm">Pay Date is required</span>
            )}
          </div>

          <div className="field mb-2">
            <label htmlFor="name" className="font-bold">
              <span className="text-red-500">*</span>
              Cut-off Start Date
            </label>

            <Controller
              name="cutOffStartDate"
              control={control}
              rules={{
                required: true,
                min: 1,
              }}
              render={({ field, fieldState }) => (
                <InputNumber
                  min={0}
                  max={31}
                  id={field.name}
                  ref={field.ref}
                  value={field.value}
                  onBlur={field.onBlur}
                  placeholder="Pay Cycle To"
                  onChange={(e) => field.onChange(e.value)}
                  inputClassName={classNames({
                    'p-invalid': fieldState.error,
                  })}
                />
              )}
            />
            {errors.cutOffStartDate && (
              <span className="text-red-600 text-sm">
                Cut-off Start Date is required
              </span>
            )}
          </div>

          <div className="field mb-2">
            <label htmlFor="name" className="font-bold">
              <span className="text-red-500">*</span>
              Cut-off End Date
            </label>

            <Controller
              name="cutOffEndDate"
              control={control}
              rules={{
                required: true,
                min: 1,
              }}
              render={({ field, fieldState }) => (
                <InputNumber
                  min={0}
                  max={31}
                  id={field.name}
                  ref={field.ref}
                  value={field.value}
                  onBlur={field.onBlur}
                  placeholder="Pay Cycle To"
                  onChange={(e) => field.onChange(e.value)}
                  inputClassName={classNames({
                    'p-invalid': fieldState.error,
                  })}
                />
              )}
            />
            {errors.cutOffEndDate && (
              <span className="text-red-600 text-sm">
                Cut-off End Date is required
              </span>
            )}
          </div>

          <div className="field mb-2">
            <label htmlFor="name" className="font-bold">
              <span className="text-red-500">*</span>
              Month of Cut-off Start Date
            </label>
            <Controller
              name="preferredMonth"
              control={control}
              rules={{ required: true }}
              render={({ field, fieldState }) => (
                <Dropdown
                  id={'preferredMonth'}
                  value={field.value}
                  optionLabel="name"
                  placeholder="Choose Month of Cut-off Start Date"
                  options={[{ name: 'PREVIOUS' }, { name: 'CURRENT' }]}
                  onChange={(e) => {
                    field.onChange(e.value);
                  }}
                  required
                  className={classNames({
                    'p-invalid': submitted && !item.preferredMonth,
                  })}
                />
              )}
            />
            {errors.preferredMonth && (
              <span className="text-red-600 text-sm">
                Month of Cut-off Start Date is required
              </span>
            )}
          </div>

          <div className="field mb-2">
            <label className="mb-3 font-bold">
              <span className="text-red-500">*</span>Apply Government Benefits?
            </label>
            <Controller
              name="isApplyGovtBenefits"
              control={control}
              rules={{ required: 'Value is required.' }}
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
            {errors.isApplyGovtBenefits && (
              <span className="text-red-600 text-sm">
                Apply Government Benefits is required
              </span>
            )}
          </div>
          <div className="w-full flex justify-end my-5">
            <Button
              type="button"
              severity="secondary"
              text
              label="Cancel"
              className="rounded-full px-10"
              onClick={hideDialog}
            />
            <Button
              onClick={handleSubmit(onSubmit)}
              label={buttonText}
              className="rounded-full px-10 p-button"
              disabled={!isValid}
            />
          </div>
        </form>
      </Dialog>

      <Dialog
        visible={deleteItemDialog}
        style={{ width: '32rem' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        header="Delete Confirmation"
        modal
        footer={deleteItemDialogFooter}
        onHide={hideDeleteItemDialog}
      >
        <div className="flex confirmation-content items-center my-5">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: '2rem' }}
          />
          {item && (
            <span>
              Are you sure you want to delete <b>{item.cycle}</b>?
            </span>
          )}
        </div>
      </Dialog>

      <Dialog
        visible={deleteItemsDialog}
        style={{ width: '32rem' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        header="Confirm"
        modal
        footer={deleteItemsDialogFooter}
        onHide={hideDeleteItemsDialog}
      >
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: '2rem' }}
          />
          {item && (
            <span>Are you sure you want to delete the selected items?</span>
          )}
        </div>
      </Dialog>
    </div>
  );
}
