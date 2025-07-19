import axios from 'axios';
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react';

const RoleDeleteSidebar = ({
  configuration: { isOpen, setIsOpen },
  label: { buttonText, title },
  selectedRole,
  refetch,
}: {
  configuration: Configuration;
  label: Label;
  selectedRole: number;
  refetch: () => void;
}) => {

  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useRef<Toast>(null);
  const toastInfo = useRef<Toast>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    const del = await axios.delete(`/api/user_roles/${selectedRole}`, {
      headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}` },
    });

    if (del) {
      refetch();
      toastInfo.current?.clear();
      toast.current?.show({
        severity: 'success',
        summary: 'Successfully Deleted',
        life: 5000,
      });
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isDeleting) {
      toastInfo.current?.show({
        severity: 'info',
        summary: 'Deleting role',
        detail: 'Please wait...',
        sticky: true,
        closable: false,
      });
    }
  }, [isDeleting]);

  return (
    <>
      <Toast ref={toast} position="bottom-left" />
      <Toast ref={toastInfo} position="bottom-left" />
      <Sidebar
        position="right"
        className="p-sidebar-md"
        visible={isOpen}
        onHide={() => {
          setIsOpen(false);
        }}
      >
        <div className="h-full mx-10 flex flex-col justify-center items-start">
          <div className="mb-5">
            <h1 className="text-black font-medium text-3xl mb-2">{title}</h1>
            <h3 className="font-medium">{buttonText}</h3>
          </div>

          <div className="mt-2 w-full flex flex-nowrap justify-center items-center gap-2">
            <Button
              rounded
              severity="secondary"
              className="w-full"
              text
              label="Cancel"
              onClick={() => setIsOpen(false)}
            />
            <Button
              rounded
              className="w-full bg-primaryDefault"
              label="Yes"
              onClick={handleDelete}
            />
          </div>
        </div>
      </Sidebar>
    </>
  );
};

export default RoleDeleteSidebar;
