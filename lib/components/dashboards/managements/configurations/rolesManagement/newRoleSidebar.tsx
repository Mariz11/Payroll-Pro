/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Sidebar } from 'primereact/sidebar';
import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Toast } from 'primereact/toast';
import {checkDuplicateRoleName,} from '@utils/checkDuplicates';


const IntialFormState = {
  roleName: '',
};

const NewRoleSidebar = ({
  configuration: { isOpen, setIsOpen },
  companyId,
  refetch
}: {
  configuration: { isOpen: boolean, setIsOpen: any };
  companyId: string;
  refetch: any
}) => {
  const {
    formState: { errors, isDirty, isValid, isSubmitting },
    handleSubmit,
    setError,
    register,
  } = useForm({
    mode: 'onChange',
    defaultValues: { ...IntialFormState },
  });

  const toast = useRef<Toast>(null);
  const toastInfo = useRef<Toast>(null);

  const onSubmit = async (data: { roleName: string }) => {
    if (Object.keys(errors).length > 0) return false;
    let apiUrl = '/api/user_roles';

    const valid = await checkDuplicates({
      companyId: companyId,
      roleName: data.roleName,
    });
    if (!valid) return false;


    const requestBody = {
      roleName: data.roleName,
    };

    try {
      let response = null;
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response) {
        toastInfo.current?.clear();

        toast.current?.show({
          severity: 'success',
          summary: 'Successfully added new role',
          life: 5000,
        });
        refetch()
        setIsOpen(false)
      }
    } catch (error: any) {
      const response = error?.response?.data;
      toastInfo.current?.clear();
      toast.current?.show({
        severity: 'error',
        detail: response.message,
        life: 5000,
      });
    }
  };

  useEffect(() => {
    if (isValid && isSubmitting) {
      toastInfo.current?.show({
        severity: 'info',
        summary: 'Submitting request',
        detail: 'Please wait...',
        sticky: true,
        closable: false,
      });
    }
  }, [isValid, isSubmitting]);

  return (
    <>
      <Toast ref={toast} position="bottom-left" />
      <Toast ref={toastInfo} position="bottom-left" />
      <Sidebar
        position="right"
        className="p-sidebar-md"
        visible={isOpen}
        onHide={() => setIsOpen(false)}
      >
        <React.Fragment>
          <form
            className="flex flex-col items-start gap-3 mt-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <h1 className="text-black font-medium text-3xl mb-3">Add New Role</h1>

            <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
              <label className="my-1">
                <span className="text-red-500">*</span>
                <span>Role Name</span>
              </label>
              <InputText
                className="w-full md:w-14rem"
                disabled={isSubmitting }
                {...register('roleName', {
                  required: 'Role name is required.',
                })}
              />
              {errors.roleName && (
                <span className="text-red-600">{errors.roleName.message}</span>
              )}
            </div>
            <div className="w-full flex justify-end mt-[70px]">
              <Button
                type="button"
                severity="secondary"
                text
                label="Cancel"
                className="rounded-full px-10"
                onClick={() =>
                  setIsOpen(false)
                }
              />
              
                <Button
                  label="Add"
                  className="rounded-full px-10 p-button"
                  disabled={
                    (!isDirty || !isValid || isSubmitting)
                  }
                />
              
            </div>
          </form>
        </React.Fragment>
      </Sidebar>
    </>
  );

  async function checkDuplicates({
    companyId,
    roleName,
  }: {
    companyId: any;
    roleName: string;
  }) {
    let errorCount = 0;
    
    const duplicateName = await checkDuplicateRoleName({
      companyId: companyId,
      roleName: roleName,
    });

    if (duplicateName) {
      toastInfo.current?.clear();
      toast.current?.show({
        severity: 'error',
        detail: 'Role Name already exists.',
        life: 5000,
      });
      errorCount++;
      setError('roleName', {
        type: 'Duplicate',
        message: 'Role Name already exists.',
      });
    }

    return errorCount > 0 ? false : true;
  }
};

export default NewRoleSidebar;
