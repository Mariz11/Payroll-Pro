import React from 'react';
import axios from 'axios';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { set } from 'lodash';

const AuthenticationDialog = ({
  header,
  message,
  action,
  isVisible,
  setIsVisible,
  password,
  setPassword,
}: {
  header: string;
  message: string;
  action: () => void;
  setIsVisible: (isVisible: boolean) => void;
  isVisible: boolean;
  password: string;
  setPassword: (password: string) => void;
}) => {
  return (
    <div>
      <>
        <Dialog
          header={header}
          visible={isVisible}
          modal={true}
          style={{
            width: '30%',
            height: 'auto',
          }}
          onHide={() => {
            setIsVisible(false);
            setPassword('');
          }}
        >
          <div className="flex flex-col gap-5  p-5">
            {message}
            <InputText
              value={password}
              type="password"
              onChange={(event) => {
                setPassword(event.target.value);
              }}
            ></InputText>
            <div className="flex items-center justify-center">
              <Button
                onClick={action}
                label="Submit"
                className="self-center w-[40%] rounded-sm"
              />
            </div>
          </div>
        </Dialog>
      </>
    </div>
  );
};

export default AuthenticationDialog;
