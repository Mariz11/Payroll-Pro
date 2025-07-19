import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import React from 'react';

const ConfirmationSidebar = ({
  configuration: { title, subTitle, submitBtnText, action, rowData, isOpen },
  setSideBarConfig,
  actionButton,
}: {
  configuration: SideBarConfig;
  setSideBarConfig: any;
  actionButton: () => void;
}) => {
  return (
    <Sidebar
      position="right"
      className="p-sidebar-md"
      visible={isOpen}
      onHide={() =>
        setSideBarConfig((prev: any) => ({ ...prev, isOpen: false }))
      }
    >
      <div className="h-full mx-10 flex flex-col justify-center items-start">
        <div className="mb-5">
          <h1 className="text-black font-medium text-3xl mb-2">{title}</h1>
          <h3 className="font-medium">{subTitle}</h3>
        </div>

        <div className="mt-2 w-full flex flex-nowrap justify-center items-center gap-2">
          <Button
            rounded
            severity="secondary"
            className="w-full"
            text
            label="Cancel"
            onClick={() =>
              setSideBarConfig((prev: any) => ({ ...prev, isOpen: false }))
            }
          />
          <Button
            rounded
            className="w-full bg-primaryDefault"
            label={submitBtnText}
            onClick={actionButton}
          />
        </div>
      </div>
    </Sidebar>
  );
};

export default ConfirmationSidebar;
