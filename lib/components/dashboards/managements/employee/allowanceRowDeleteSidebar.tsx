import axios from 'axios';
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react';

const AllowanceRowDeleteSidebar = ({
  configuration: { isOpen, setIsOpen },
  label: { buttonText, title },
  handleDelete,
}: {
  configuration: Configuration;
  label: Label;
  handleDelete: () => void;
}) => {

  return (
    <>
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

export default AllowanceRowDeleteSidebar;