'use client';

import { useEffect, useRef, useState } from 'react';

import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import { Controller, useForm } from 'react-hook-form';

// import { TermsAndConditions } from 'public/docs/ML-Payroll-PRO-Terms-and-Conditions.pdf';
import Logo from '/public/company_logos/MLLogo.png';
// import { TermsAndConditions } from 'public/docs/ML-Payroll-PRO-Terms-and-Conditions.pdf';
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFViewer,
} from '@react-pdf/renderer';

// Images
import 'primereact/resources/primereact.min.css';
import LoginBG from 'public/images/cclex.jpg';
import Image from 'next/image';
import axios from 'axios';
import Link from 'next/link';
import { Dialog } from 'primereact/dialog';
import { ScrollPanel } from 'primereact/scrollpanel';
import TermsAndConditions from './termsAndConditions';
import AcceptTermsAndConditions from './acceptTermsAndConditions';
import ReCAPTCHA from 'react-google-recaptcha';
import { ProgressSpinner as Spinner } from 'primereact/progressspinner';
import { useRouter } from 'next/navigation';
const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#E4E4E4',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
});

// Create Document Component

function ResetPassword({ token }: { token: string | undefined }) {
  const [companyId, setCompanyId] = useState(-1);
  const router = useRouter();
  const [userId, setUserId] = useState(-1);
  const [inputsFilled, setInputsFilled] = useState(false);
  const [submitButtonText, setsubmitButtonText] = useState('Submit');
  const toastBottomLeft = useRef(null);
  const [isSuccessfullyReset, setIsSuccessfullyReset] = useState(false);
  const upperCaseAndSpecialCharactersRE =
    /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
  const toast = useRef(null);
  const recaptchaRef = useRef<any>(null);

  //   const show = () => {
  //     (toastBottomLeft.current as any)?.show({
  //       severity: 'success',
  //       summary: 'Form Submitted',
  //       detail: getValues('username'),
  //     });
  //   };
  const [visible, setVisible] = useState(false);
  const defaultValues = {
    confirmPassword: '',
    password: '',
  };
  const {
    control,
    formState: { errors, isDirty, isValid },
    handleSubmit,
    getValues,
    reset,
    watch,
  } = useForm({ defaultValues });
  const [isTokenValid, setisTokenValid] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };
  const onSubmit = async (data: any) => {
    data.value;

    if (data.password.length < 8) {
      (toastBottomLeft.current as any)?.replace({
        severity: 'error',
        detail: 'Password must be at least 8 characters long',
        life: 10000,
      });
      return;
    }
    if (data.password.length > 30) {
      (toastBottomLeft.current as any)?.replace({
        severity: 'error',
        detail: 'Password must not exceed 30 characters',
        life: 10000,
      });
      return;
    }
    if (
      !upperCaseAndSpecialCharactersRE.test(data.password) ||
      data.password == data.password.toLowerCase()
    ) {
      (toastBottomLeft.current as any)?.replace({
        severity: 'error',
        detail:
          'Please create a stronger password using a mix of uppercase and lowercase letters, numbers, and special characters.',
        life: 10000,
      });
      return;
    }
    if (data.password !== data.confirmPassword) {
      (toastBottomLeft.current as any)?.replace({
        severity: 'error',
        detail: 'Passwords do not match',
        life: 10000,
      });
      return;
    }
    setsubmitButtonText('Submitting...');
    try {
      const res: any = await axios.put('/api/auth/forgotPassword', {
        token,
        password: data.password,
      });
      if (res.data.success) {
        (toastBottomLeft.current as any)?.replace({
          severity: 'success',
          detail: 'Password has been reset successfully',
          life: 10000,
        });
        reset();
        setIsSuccessfullyReset(true);
      }
    } catch (error: any) {
      (toastBottomLeft.current as any)?.replace({
        severity: 'error',
        detail: error.response.data.message,
        life: 10000,
      });
    }
    setsubmitButtonText('Submit');
  };

  const getFormErrorMessage = (message: string) => {
    (toastBottomLeft.current as any)?.replace({
      severity: 'error',
      detail: message,
      life: 10000,
    });
  };

  useEffect(() => {
    // if (inputsFilled) {
    //   if (reCaptchaToken == null) {
    //     recaptchaRef.current.execute();
    //   }
    // } else {
    //   setReCaptchaToken(null);
    //   recaptchaRef.current.reset();
    // }
  }, []);
  useEffect(() => {
    setIsLoading(true);
    axios.get('/api/auth/forgotPassword', { params: { token } }).then((res) => {
      setIsLoading(false);
      if (res.data.success) {
        setisTokenValid(true);
        setErrorMessage('');
        setIsLoading(false);
      } else {
        setisTokenValid(false);
        setErrorMessage(res.data.message);
        setIsLoading(false);
      }
    });
  }, [token]);

  return (
    <div className="flex flex-col lg:flex-row login">
      <div className="flex flex-col h-screen md:w-auto w-full">
        <Toast ref={toastBottomLeft} position="bottom-left" />
        <div className="card flex justify-center items-center flex-col lg:w-[600px] login gap-5 h-[100%]">
          <div className="font-extrabold mb-7 text-[18px]">
            Payroll Pro Reset Password
            {/* {token} */}
          </div>
          <div className="w-full">
            <>
              {isTokenValid && !isSuccessfullyReset ? (
                <>
                  {isLoading ? (
                    <div className="flex justify-center items-center">
                      <Spinner />
                    </div>
                  ) : (
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="flex flex-col gap-8 w-full form"
                    >
                      <Toast ref={toast} />
                      <Controller
                        name="password"
                        control={control}
                        rules={{
                          required: 'Password is required.',
                        }}
                        render={({ field, fieldState }) => (
                          <div className="flex flex-col justify-center items-center login">
                            <>
                              <label
                                htmlFor={field.name}
                                className={classNames('w-full', {
                                  'p-error': errors.password,
                                })}
                              ></label>
                              <span className="p-float-label w-[80%]">
                                <InputText
                                  id={field.name}
                                  type="password"
                                  value={field.value}
                                  className={classNames('w-full', {
                                    'p-invalid': fieldState.error,
                                  })}
                                  onChange={(e) => {
                                    field.onChange(e.target.value);
                                    const confirmPassword =
                                      getValues('confirmPassword');
                                    const password = e.target.value;
                                    setInputsFilled(
                                      confirmPassword.trim() !== '' &&
                                        password.trim() !== ''
                                    );
                                  }}
                                />
                                <label htmlFor={field.name}>New Password</label>
                              </span>
                            </>
                          </div>
                        )}
                      />
                      <Controller
                        name="confirmPassword"
                        control={control}
                        rules={{
                          required: 'Confirm Password is required.',
                        }}
                        render={({ field, fieldState }) => (
                          <div className="flex flex-col justify-center items-center login">
                            <>
                              <label
                                htmlFor={field.name}
                                className={classNames('w-full', {
                                  'p-error': errors.confirmPassword,
                                })}
                              ></label>
                              <span className="p-float-label w-[80%]">
                                <InputText
                                  id={field.name}
                                  type="password"
                                  value={field.value}
                                  className={classNames('w-full', {
                                    'p-invalid': fieldState.error,
                                  })}
                                  onChange={(e) => {
                                    field.onChange(e.target.value);
                                    const password = getValues('password');
                                    const confirmPassword = e.target.value;
                                    setInputsFilled(
                                      confirmPassword.trim() !== '' &&
                                        password.trim() !== ''
                                    );
                                  }}
                                />
                                <label htmlFor={field.name}>
                                  Confirm Password
                                </label>
                              </span>
                            </>
                          </div>
                        )}
                      />

                      <div className="w-[50%] m-auto">
                        <Button
                          label={submitButtonText}
                          type="submit"
                          className="p-button block w-full"
                          disabled={!inputsFilled}
                        />
                      </div>
                    </form>
                  )}
                </>
              ) : (
                <div className="card flex justify-center items-center flex-col lg:w-[600px] login gap-5 h-[100%]">
                  {' '}
                  {isSuccessfullyReset ? (
                    <>Password has been reset successfully</>
                  ) : (
                    <>{errorMessage}</>
                  )}
                  <div
                    className="mt-5 text-center text-md text-black cursor-pointer hover:text-gray-600 underline"
                    onClick={() => {
                      router.push('/');
                    }}
                  >
                    Back to Login Page
                  </div>
                </div>
              )}
            </>
          </div>
        </div>
      </div>

      {/* ASK FOR DEMO */}
      <div className="w-full relative">
        {/* Background Image */}
        <div
          className="w-full h-[100vh]"
          style={{
            backgroundImage: `url(${LoginBG.src})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: '0.9',
            position: 'absolute',
            zIndex: -1,
          }}
        ></div>

        {/* Red Background */}
        <div
          className="w-full h-full absolute top-0 left-0"
          style={{
            backgroundColor: '#d60000',
            opacity: '0.6',
          }}
        />

        {/* Content */}
        <div
          className="sm:h-[100vh] py-20 sm:py-0 flex justify-center items-start md:px-10 lg:px-15 flex-col relative"
          style={{
            zIndex: 30,
          }}
        >
          <span className="font-bold text-white text-[30px] md:text-[40px] lg:text-[55px]">
            <p>Your one stop, </p>
            <p className="sm:-mt-5">payroll management system</p>
          </span>
          <p className="text-white text-[15px] sm:text-xl my-5 w-[60%] md:w-[70%] lg:w-[90%]">
            Achieve seamless government compliance and effortless accessibility
            with just one click. Simplify your company&apos;s payroll process
            and start generating pay slips instantly!
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
