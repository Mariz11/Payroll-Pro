import axios from 'axios';
import moment from '@constant/momentTZ';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Sidebar } from 'primereact/sidebar';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

interface Employee {
  mismatchedInfos: string;
  employeeCode: string;
}
interface ColumnGrid {
  employeeId: number | null;
  firstName: string;
  middleName: string | null;
  lastName: string;
  suffix: string | null;
  birthDate: string;
  emailAddress: string;
  contactNumber: string;
  countryId: number | null;
  provinceId: number | null;
  cityId: number | null;
  streetAddress: string;
  zipCode: number | null;
  placeOfBirth: string;
  nationality: string;
  gender: string;
  civilStatus: string;
  employee?: Employee;
  employeeCode: any;
}

interface GridProps {
  action: string;
  setData?: (p: any[]) => void;
  refetchEmployees: () => void;
  refetchFailedRegistrations: () => void;
  setDeletedItems?: (p: any[]) => void;
  isOpenGrid: boolean;
  setIsOpenGrid: (p: boolean) => void;
  gridData: any[];
}

export default function FailedRegistrationGrid({
  action,
  setData,
  isOpenGrid,
  setIsOpenGrid,
  setDeletedItems,
  refetchEmployees,
  refetchFailedRegistrations,
  gridData,
}: GridProps) {
  const emptyItem = {
    employeeId: null,
    employeeCode: '',
    firstName: '',
    middleName: null,
    lastName: '',
    suffix: null,
    birthDate: '',
    emailAddress: '',
    contactNumber: '',
    countryId: null,
    provinceId: null,
    cityId: null,
    streetAddress: '',
    zipCode: null,
    placeOfBirth: '',
    nationality: '',
    gender: '',
    civilStatus: '',
  };
  const [buttonText, setButtonText] = useState('');
  const [disabledSubmitBtn, setDisabledSubmitBtn] = useState(true);
  const [items, setItems] = useState<ColumnGrid[]>(gridData || []);
  const [item, setItem] = useState<ColumnGrid>(emptyItem);
  const [itemDialog, setItemDialog] = useState<boolean>(false);
  const [deleteItemDialog, setDeleteItemDialog] = useState<boolean>(false);
  const [deleteItemsDialog, setDeleteItemsDialog] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<ColumnGrid[]>([]);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<any[]>>(null);

  useEffect(() => {
    setItems(gridData);
    refetchFailedRegistrations();
  }, [isOpenGrid, refetchFailedRegistrations, gridData]);

  const {
    control,
    formState: { errors, isSubmitting, isValid },
    handleSubmit,
    getValues,
    reset,
    register,
    setValue,
    trigger,
  } = useForm<ColumnGrid>({ mode: 'onChange', defaultValues: item });

  const hideDialog = () => {
    setSubmitted(false);
    setItemDialog(false);
    reset();
  };

  const hideDeleteItemDialog = () => {
    setDeleteItemDialog(false);
  };

  const [backendErrors, setBackendErrors] = useState<any>([]);

  const reRegisterHandler = () => {
    if (items.length == 0) return;

    setDisabledSubmitBtn(true);
    toast.current?.replace({
      severity: 'info',
      summary: 'Submitting request',
      detail: 'Please wait...',
      sticky: true,
      closable: false,
    });

    axios
      .patch('/api/employees/failed/registration', items, {
        headers: {
          'Content-Type': 'application/json',
           Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}` },
      })
      .then((result) => {
        if (result.data.success) {
          toast.current?.replace({
            severity: 'success',
            summary: result.data.message,
            life: 5000,
            closable: true,
          });
          // tasksProgress?.setStartTime(new Date().getTime());
          refetchEmployees();
          refetchFailedRegistrations();
        } else {
          if (Array.isArray(result.data.message)) {
            toast.current?.clear();
            setBackendErrors(result.data.message);
          } else {
            toast.current?.replace({
              severity: result.data.severity,
              summary: result.data.message,
              sticky: true,
              closable: true,
            });
          }
        }

        setIsOpenGrid(false);
        refetchEmployees();
      });
  };

  const onSubmit = async (data: ColumnGrid) => {
    if (data.firstName.trim()) {
      data.birthDate = moment(data.birthDate).format('YYYY-MM-DD');
      let _items = [...items];
      let _item = { ...data };

      const index = findIndexByGridId(data.employeeId);

      _items[index] = _item;

      toast.current?.replace({
        severity: 'success',
        summary: 'Successfully Updated',
        // detail: 'Successfully updated',
        life: 3000,
      });

      setDisabledSubmitBtn(false);
      setItems(_items);
      setItemDialog(false);
      setItem(emptyItem);
      setSubmitted(true);
      reset();
    }
  };

  const editItem = (e: any, item: ColumnGrid) => {
    e.preventDefault();
    setButtonText('Update');
    setItem({ ...item });
    setValue('employeeId', item.employeeId);
    setValue('employeeCode', item.employee?.employeeCode);
    setValue('firstName', item.firstName);
    setValue('middleName', item.middleName);
    setValue('lastName', item.lastName);
    setValue('suffix', item.suffix);
    setValue('birthDate', new Date(item.birthDate) as any);
    setValue('emailAddress', item.emailAddress);
    setValue('contactNumber', item.contactNumber);
    setValue('countryId', item.countryId);
    setValue('provinceId', item.provinceId);
    setValue('cityId', item.cityId);
    setValue('streetAddress', item.streetAddress);
    setValue('zipCode', item.zipCode);
    setValue('placeOfBirth', item.placeOfBirth);
    setValue('nationality', item.nationality);
    setValue('gender', item.gender);
    setValue('civilStatus', item.civilStatus);
    setValue('employee', item.employee);

    setItemDialog(true);
  };

  const confirmDeleteItem = (e: any, item: ColumnGrid) => {
    e.preventDefault();
    setItem(item);
    setDeleteItemDialog(true);
  };
  const deleteItem = (e: any) => {
    e.preventDefault();

    let _items = items.filter((val) => val.employeeId !== item.employeeId);

    let employeeToBeDeleted = items.filter(
      (val) => val.employeeId === item.employeeId
    );

    axios
      .delete('/api/employees/failed/registration', {
        data: {
          employeeId: employeeToBeDeleted[0].employeeId,
        },
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}` },
      })
      .then((result) => {
        setItems(_items);
        setDeleteItemDialog(false);
        setItem(emptyItem);
        toast.current?.replace({
          severity: 'success',
          summary: 'Successfully Deleted',
          // detail: 'Item Deleted',
          life: 3000,
        });
      });
  };

  const findIndexByGridId = (gridId: any) => {
    let index = -1;

    for (let i = 0; i < items.length; i++) {
      if (items[i].employeeId === gridId) {
        index = i;
        break;
      }
    }

    return index;
  };

  const exportCSV = () => {
    dt.current?.exportCSV();
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

  const actionBodyTemplate = (rowData: any) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-pencil"
          rounded
          outlined
          className="mr-2"
          onClick={(e) => editItem(e, rowData)}
        />
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          onClick={(e) => confirmDeleteItem(e, rowData)}
        />
      </React.Fragment>
    );
  };

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

  return (
    <div>
      <Toast ref={toast} position="bottom-left" />
      <div className="card">
        <Sidebar
          closeOnEscape={action == 'view'}
          dismissable={action == 'view'}
          position="right"
          style={{
            width: '87%',
          }}
          visible={isOpenGrid}
          onHide={() => setIsOpenGrid(false)}
        >
          <div className="flex flex-wrap gap-2 mb-2 items-center justify-between">
            <h2 className="m-0 text-[25px] font-bold">Failed Registrations</h2>
            {/* <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText
                type="search"
                placeholder="Search..."
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  setGlobalFilter(target.value);
                }}
              />
            </span> */}
          </div>
          <DataTable
            ref={dt}
            value={items}
            selection={action != 'view' && selectedItems}
            onSelectionChange={(e) => {
              if (Array.isArray(e.value)) {
                setSelectedItems(e.value);
              }
            }}
            dataKey="employeeId"
            paginator
            rows={5}
            rowsPerPageOptions={[5, 20, 50, 100]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} items"
            globalFilter={globalFilter}
          >
            <Column hidden={true} field="employeeId" sortable={false} />
            <Column
              field="firstName"
              header="First Name"
              sortable={false}
              style={{ minWidth: '12rem' }}
              body={(row) => row.firstName}
            />
            <Column
              field="middleName"
              header="Middle Name"
              sortable={false}
              style={{ minWidth: '12rem' }}
              body={(row) => row.middleName}
            />
            <Column
              field="lastName"
              header="Last Name"
              sortable={false}
              style={{ minWidth: '12rem' }}
              body={(row) => row.lastName}
            />
            <Column
              field="suffix"
              header="Suffix"
              sortable={false}
              style={{ minWidth: '12rem' }}
              body={(row) => row.suffix}
            />
            <Column
              field="birthDate"
              header="Birthdate"
              sortable={false}
              style={{ minWidth: '12rem' }}
              body={(row) => moment(row.birthDate).format('MM/DD/YYYY')}
            />
            <Column
              field="contactNumber"
              header="Contact Number"
              sortable={false}
              style={{ minWidth: '12rem' }}
              body={(row) => row.contactNumber}
            />
            <Column
              field="emailAddress"
              header="Email Address"
              sortable={false}
              style={{ minWidth: '12rem' }}
              body={(row) => row.emailAddress}
            />
            <Column
              field="mismatchedInfos"
              header="Mismatched Infos"
              sortable={false}
              style={{ minWidth: '12rem' }}
              body={(row) => row?.employee?.mismatchedInfos}
            />
            <Column
              field="failedRegistrationRemarks"
              header="Reason"
              sortable={false}
              style={{ minWidth: '12rem' }}
              body={(row) => row?.employee?.failedRegistrationRemarks}
            />
            <Column
              hidden={action == 'view'}
              header="Actions"
              body={actionBodyTemplate}
              exportable={false}
              style={{ minWidth: '12rem' }}
            />
          </DataTable>

          <div className="w-full flex justify-end mt-10">
            <Button
              type="button"
              severity="secondary"
              text
              label="Cancel"
              className="rounded-full px-10"
              onClick={() => setIsOpenGrid(false)}
            />
            <Button
              label={'Reprocess Registration'}
              className="rounded-full px-10 p-button"
              disabled={items.length == 0 || disabledSubmitBtn}
              onClick={reRegisterHandler}
            />
          </div>
        </Sidebar>
      </div>

      <Dialog
        visible={itemDialog}
        style={{ width: '32rem' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        header="Edit Employee Details"
        modal
        className="p-fluid"
        // footer={itemDialogFooter}
        onHide={hideDialog}
      >
        <form className="my-5">
          <div className="field mb-2">
            <label htmlFor="firstName" className="font-bold">
              <span className="text-red-500">*</span>
              First Name
            </label>
            <InputText
              className={classNames('w-full', {
                'p-invalid': errors.firstName,
              })}
              {...register('firstName', {
                required: 'First Name is required.',
              })}
            />
            {errors.firstName && (
              <span className="text-red-600 text-sm">
                {errors.firstName.message}
              </span>
            )}
          </div>

          <div className="field mb-2">
            <label htmlFor="middleName" className="font-bold">
              Middle Name
            </label>
            <InputText
              className={classNames('w-full', {
                'p-invalid': errors.middleName,
              })}
              {...register('middleName')}
            />
            {errors.middleName && (
              <span className="text-red-600 text-sm">
                {errors.middleName.message}
              </span>
            )}
          </div>

          <div className="field mb-2">
            <label htmlFor="lastName" className="font-bold">
              <span className="text-red-500">*</span>
              Last Name
            </label>
            <InputText
              className={classNames('w-full', {
                'p-invalid': errors.lastName,
              })}
              {...register('lastName', {
                required: 'Last Name is required.',
              })}
            />
            {errors.lastName && (
              <span className="text-red-600 text-sm">
                {errors.lastName.message}
              </span>
            )}
          </div>

          <div className="field mb-2">
            <label htmlFor="suffix" className="font-bold">
              Suffix
            </label>
            <InputText
              className={classNames('w-full', {
                'p-invalid': errors.suffix,
              })}
              {...register('suffix')}
            />
            {errors.suffix && (
              <span className="text-red-600 text-sm">
                {errors.suffix.message}
              </span>
            )}
          </div>

          <div className="field mb-2">
            <label className="my-1 font-bold">
              <span className="text-red-500">*</span>
              <span>Birthdate</span>
            </label>
            <Controller
              name="birthDate"
              control={control}
              rules={{ required: 'Birthdate is required.' }}
              render={({ field, fieldState }) => (
                <Calendar
                  inputId={field.name}
                  id={field.name}
                  ref={field.ref}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  className={classNames({ 'p-invalid': fieldState.invalid })}
                  dateFormat="mm/dd/yy"
                  showIcon
                />
              )}
            />
            {errors.birthDate && (
              <span className="text-red-600 text-sm">
                {errors.birthDate.message}
              </span>
            )}
          </div>

          <div className="field mb-2">
            <label className="my-1 font-bold">
              <span className="text-red-500">*</span>
              <span>MCash Mobile Number</span>
            </label>
            <InputText
              className="w-full md:w-14rem"
              autoComplete="off"
              maxLength={11}
              {...register('contactNumber', {
                required: 'MCash Mobile Number is required.',
                maxLength: 11,
                pattern: {
                  value: /^[0-9\b]+$/,
                  message: 'Invalid Mobile number format.',
                },
                validate: {
                  getLength: (v) =>
                    v.length == 11 || 'Invalid Mobile number format.',
                  checkFormat: (v) =>
                    v.startsWith('09') || 'Invalid Mobile number format.',
                },
                onChange: (e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setValue('contactNumber', value);
                },
              })}
            />
            {errors.contactNumber && (
              <span className="text-red-600">
                {errors.contactNumber.message}
              </span>
            )}
          </div>
          <div className="field mb-2">
            <label className="my-1 font-bold">
              <span className="text-red-500">*</span>
              <span>Email Address</span>
            </label>
            <InputText
              className="w-full md:w-14rem"
              {...register('emailAddress', {
                required: 'Email Address is required.',
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: 'Invalid Email Address format.',
                },
              })}
            />
            {errors.emailAddress && (
              <span className="text-red-600">
                {errors.emailAddress.message}
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
            />
          </div>
        </form>
      </Dialog>

      <Dialog
        maximizable
        header="Errors on the following:"
        visible={backendErrors.length > 0}
        style={{ width: '50vw' }}
        onHide={() => setBackendErrors([])}
      >
        <div className="my-5">
          {backendErrors.length > 0 &&
            backendErrors.map((item: any, index: number) => (
              <div className="my-4" key={index}>
                <h4 className="font-bold">{item.employeeFullName}:</h4>
                <>
                  {Array.isArray(item.errorMessage) ? (
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                      {item.errorMessage.map(
                        (message: any, msgIndex: number) => (
                          <li key={msgIndex}>{message}</li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p>{item.errorMessage}</p>
                  )}
                </>
                <br />
              </div>
            ))}
        </div>
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
            className="pi pi-exclamation-triangle mr-3 text-red-600"
            style={{ fontSize: '2rem' }}
          />
          {item && (
            <p>
              Removing this employee cannot be undone. Are you sure you want to
              continue?
            </p>
          )}
        </div>
      </Dialog>
    </div>
  );
}
