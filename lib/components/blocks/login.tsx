'use client';

import { useEffect, useRef, useState } from 'react';

import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import { Controller, useForm } from 'react-hook-form';

import { StyleSheet } from '@react-pdf/renderer';

// Images
import axios from 'axios';
import { Dialog } from 'primereact/dialog';
import 'primereact/resources/primereact.min.css';
import { ScrollPanel } from 'primereact/scrollpanel';
import LoginBG from 'public/images/cclex.jpg';
import ReCAPTCHA from 'react-google-recaptcha';
import AcceptTermsAndConditions from './acceptTermsAndConditions';
import TermsAndConditions from './termsAndConditions';
import { FirestoreService } from "lib/classes/gcp/FirestoreService";
import ClientLogger from 'lib/classes/logger/ClientLogger';

const firestoreService = new FirestoreService();
const logger = new ClientLogger();

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

function Login() {
  const [companyId, setCompanyId] = useState(-1);
  const [userId, setUserId] = useState(-1);
  const [inputsFilled, setInputsFilled] = useState(false);
  const [loginButtonText, setLoginButtonText] = useState('Login');
  const toastBottomLeft = useRef(null);
  const [acceptVisible, setAcceptVisible] = useState(false);
  const [isResetSuccessful, setIsResetSuccessful] = useState(false);
  const toast = useRef(null);
  // do not remove code below
  const recaptchaRef = useRef<any>(null);

  const show = () => {
    (toastBottomLeft.current as any)?.show({
      severity: 'success',
      summary: 'Form Submitted',
      detail: getValues('username'),
    });
  };
  const [visible, setVisible] = useState(false);
  const defaultValues = {
    username: '',
    password: '',
  };
  const [forgotPassEmail, setForgotPassEmail] = useState('');
  const {
    control,
    formState: { errors, isDirty, isValid, isSubmitting },
    handleSubmit,
    getValues,
    reset,
    watch,
  } = useForm({ defaultValues });
  const [reCaptchaToken, setReCaptchaToken] = useState(null);
  const [isLogin, setIsLogin] = useState(true);

  const onSubmit = async (data: any) => {
    data.value && show();
    data.reCaptchaToken = reCaptchaToken;
    setLoginButtonText('Validating...');

    try {
      const login: any = await axios.post('/api/auth/login', data);
      const loginData = login.data;

      await firestoreService.signInWithCustomToken(loginData.token);

      setCompanyId(loginData.userData.company.companyId);
      setUserId(loginData.userData.userId);
      if (
        loginData &&
        loginData.termsConditionsAccepted === 0 &&
        loginData.userData.role === 'ADMIN'
      ) {
        setAcceptVisible(true);
        recaptchaRef.current.reset();
        recaptchaRef.current.execute();
        setLoginButtonText('Login');
      } else {
        location.reload();
      }
    } catch (error: any) {
      const response = error?.response?.data;
      getFormErrorMessage(response.message);
      setLoginButtonText('Login');
      recaptchaRef.current.reset();
      recaptchaRef.current.execute();

      logger.warn({ onLoginError: JSON.stringify(error) });
    }
  };

  const getFormErrorMessage = (message: string) => {
    (toastBottomLeft.current as any)?.replace({
      severity: 'error',
      detail: message,
      life: 10000,
    });
  };

  // do not remove code below
  useEffect(() => {
    if (inputsFilled) {
      if (reCaptchaToken == null) {
        recaptchaRef.current.execute();
      }
    } else {
      setReCaptchaToken(null);
      recaptchaRef.current.reset();
    }
  }, [inputsFilled, reCaptchaToken]);

  return (
    <div className="flex flex-col lg:flex-row login">
      <div className="flex flex-col h-screen md:w-auto w-full">
        <Toast ref={toastBottomLeft} position="bottom-left" />
        <div className="card flex justify-center items-center flex-col lg:w-[600px] login gap-5 h-[100%]">
          <div className="font-extrabold mb-7 text-[18px]">
            {isLogin ? 'Payroll Pro Portal Login' : 'Forgot Password'}
          </div>
          <div className="w-full">
            {isLogin ? (
              <>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col gap-8 w-full form"
                >
                  <Toast ref={toast} />
                  <Controller
                    name="username"
                    control={control}
                    rules={{ required: 'Username is required.' }}
                    render={({ field, fieldState }) => (
                      <div className="flex flex-col justify-center items-center login">
                        <>
                          <label
                            htmlFor={field.name}
                            className={classNames('w-full', {
                              'p-error': errors.username,
                            })}
                          ></label>
                          <span className="p-float-label w-[80%]">
                            <InputText
                              id={field.name}
                              value={field.value}
                              className={classNames('w-full', {
                                'p-invalid': fieldState.error,
                              })}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                const password = getValues('password');
                                const username = e.target.value;
                                setInputsFilled(
                                  username.trim() !== '' &&
                                  password.trim() !== ''
                                );
                              }}
                            />
                            <label htmlFor={field.name}>Username</label>
                          </span>
                        </>
                      </div>
                    )}
                  />
                  <Controller
                    name="password"
                    control={control}
                    rules={{ required: 'Password is required.' }}
                    render={({ field, fieldState }) => (
                      <div className="flex flex-col justify-center items-center login">
                        <>
                          <label
                            htmlFor={field.name}
                            className={classNames('w-full', {
                              'p-error': errors.username,
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
                                const username = getValues('username');
                                const password = e.target.value;
                                setInputsFilled(
                                  username.trim() !== '' &&
                                  password.trim() !== ''
                                );
                              }}
                            />
                            <label htmlFor={field.name}>Password</label>
                          </span>
                        </>
                      </div>
                    )}
                  />

                  <div className="w-[50%] m-auto">
                    <Button
                      label={loginButtonText}
                      type="submit"
                      className="p-button block w-full"
                      disabled={
                        isSubmitting || !inputsFilled || !reCaptchaToken
                      }
                    />
                  </div>
                </form>
                <div
                  className="mt-5 text-center text-md text-black cursor-pointer hover:text-gray-600 underline"
                  onClick={() => setIsLogin(false)}
                >
                  Forgot Password?
                </div>
              </>
            ) : (
              <>
                {!isResetSuccessful ? (
                  <div className="flex flex-col justify-center items-center login px-[5vw] self-center gap-5 ">
                    <div className="w-full">
                      <label
                        htmlFor={'forgotPassEmail'}
                        className="w-full items-center justify-center text-gray-700 mb-5"
                      >
                        Enter your email
                      </label>

                      <InputText
                        id={'forgotPassEmail'}
                        value={forgotPassEmail}
                        // className={classNames('w-full', {
                        //   'p-invalid': fieldState.error,
                        // })}
                        className="w-full mb-10"
                        onChange={(e) => {
                          setForgotPassEmail(e.target.value);
                        }}
                      />
                    </div>
                    <Button
                      onClick={async () => {
                        const response = axios
                          .post('/api/auth/forgotPassword', {
                            email: forgotPassEmail,
                          })
                          .then((response: any) => {
                            (toastBottomLeft.current as any)?.replace({
                              severity: 'success',
                              summary: 'Successfully Sent',
                              detail: response.data.message,
                              life: 10000,
                            });
                            setIsResetSuccessful(true);
                            setForgotPassEmail('');
                          })
                          .catch((error: any) => {
                            (toastBottomLeft.current as any)?.replace({
                              severity: 'error',
                              summary: 'Something went wrong...',
                              detail: error.response.data.message,
                              life: 10000,
                            });
                          });
                      }}
                    >
                      Send Reset Link
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col justify-center items-center login px-[5vw] self-center gap-5 ">
                    <div className="w-full text-center">
                      Reset link has been sent to your email address. Please
                      check your email.
                    </div>
                  </div>
                )}

                <div
                  className="mt-5 text-center text-md text-black cursor-pointer hover:text-gray-600 underline"
                  onClick={() => {
                    setIsResetSuccessful(false);
                    setIsLogin(true);
                  }}
                >
                  Back to Login
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex justify-between p-5">
          <button
            onClick={() => {
              setVisible(true);
            }}
          >
            Terms and Conditions
          </button>
          <ReCAPTCHA
            sitekey={`${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
            onChange={(token: any) => setReCaptchaToken(token)}
            className="mb-5"
            badge="inline"
            size="invisible"
            ref={recaptchaRef}
            onError={(err: any) => console.log(err)}
          />
        </div>
      </div>
      <div className="card flex justify-content-center ">
        <Dialog
          header="ML Payroll PRO Terms and Conditions"
          visible={visible}
          className="w-[92vw] md:w-[55vw] "
          onHide={() => setVisible(false)}
        >
          <ScrollPanel className="tnc-panel h-[75vh]  pb-5 mx-0 md:ml-2 pr-3 mt-0">
            <TermsAndConditions></TermsAndConditions>
          </ScrollPanel>
        </Dialog>
      </div>
      <AcceptTermsAndConditions
        userId={userId}
        watch={watch}
        visible={acceptVisible}
        setVisible={setAcceptVisible}
        companyId={companyId}
        setInputsFilled={setInputsFilled}
        reset={reset}
        reCaptchaToken={reCaptchaToken}
        setLoginButtonText={setLoginButtonText}
        getFormErrorMessage={getFormErrorMessage}
        handleSubmit={handleSubmit}
      ></AcceptTermsAndConditions>
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
          <div className="font-bold text-white text-[30px] md:text-[40px] lg:text-[55px]">
            <div>Your one stop, </div>
            <div className="sm:-mt-5">payroll management system</div>
          </div>
          <div className="text-white text-[15px] sm:text-xl my-5 w-[60%] md:w-[70%] lg:w-[90%]">
            Achieve seamless government compliance and effortless accessibility
            with just one click. Simplify your company&apos;s payroll process
            and start generating pay slips instantly!
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
