import { Dialog } from 'primereact/dialog';
import { ScrollPanel } from 'primereact/scrollpanel';
import React, { useState } from 'react';
import TermsAndConditions from './termsAndConditions';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import {
  UseFormHandleSubmit,
  UseFormReset,
  UseFormWatch,
} from 'react-hook-form';
import axios from 'axios';
const AcceptTermsAndConditions = ({
  visible,
  setVisible,
  companyId,
  watch,
  userId,
  setInputsFilled,
  reCaptchaToken,
  setLoginButtonText,
  reset,
  getFormErrorMessage,
  handleSubmit,
}: {
  visible: boolean;
  setVisible: any;
  userId: number;
  companyId: number;
  watch: UseFormWatch<{
    username: string;
    password: string;
  }>;
  setInputsFilled: any;
  reCaptchaToken?: string | null;
  setLoginButtonText: any;
  reset: UseFormReset<{
    username: string;
    password: string;
  }>;
  handleSubmit: UseFormHandleSubmit<{
    username: string;
    password: string;
  }>;
  getFormErrorMessage: (message: string) => any;
}) => {
  const [checked, setChecked] = useState<boolean>(false);
  const handleTermsAndConditions = async (data: any) => {
    setInputsFilled(false);
    setLoginButtonText('Validating...');
    data.reCaptchaToken = reCaptchaToken;

    try {
      const res: any = await axios.put('/api/auth/login', {
        companyId: companyId,
        checked: checked,
        userId: userId,
      });

      const login: any = await axios.post('/api/auth/login', {
        ...data,
      });

      // const loginData = login.data;

      setLoginButtonText('Login');

      reset();
      if (res.data.success) {
        location.reload();
      }
    } catch (error: any) {
      console.log(error);
      const response = error?.response?.data;
      getFormErrorMessage(response.message);
      setLoginButtonText('Login');
      reset();
    }
  };
  return (
    <div className="card flex justify-content-center ">
      <Dialog
        header="ML Payroll PRO Terms and Conditions"
        visible={visible}
        className="w-[92vw] md:w-[55vw] "
        onHide={() => {
          reset();
          setVisible(false);
        }}
        closable={false}
      >
        <ScrollPanel className="tnc-panel h-[65vh]  mx-0 md:ml-2 pr-3 mt-0">
          <TermsAndConditions></TermsAndConditions>
          <div className="card flex justify-content-center gap-2 mt-10 align-middle ">
            <Checkbox
              onChange={(e) => {
                if (!e.checked || e.checked == undefined) {
                  setChecked(false);
                } else {
                  setChecked(e.checked);
                }
              }}
              checked={checked}
            ></Checkbox>{' '}
            I accept the Terms and Conditions
          </div>
        </ScrollPanel>
        <div className="m-[20px] flex justify-between">
          {/* <button
            className=" justify-self-end bg-white text-white"
            disabled={true}
          >
            {' '}
            Continue
          </button> */}
          <div className="text-red-600">
            Note: scroll down to accept the terms and conditions
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => {
                reset();
                setChecked(false);
                setVisible(false);
              }}
              severity="secondary"
              className=" justify-self-end"
            >
              {' '}
              Decline
            </Button>
            <Button
              onClick={handleSubmit(handleTermsAndConditions)}
              className=" justify-self-end"
              disabled={!checked}
            >
              {' '}
              Accept
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default AcceptTermsAndConditions;
