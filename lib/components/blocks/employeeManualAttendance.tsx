'use client';

import React, { useEffect, useRef, useState } from 'react';

import LoginBG from 'public/images/cclex.jpg';
import ML_logo from '@images/MLLogo.png';
import { Button } from 'primereact/button';

import classNames from 'classnames';
import { decodeJwt } from 'jose';
import { InputText } from 'primereact/inputtext';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { getCompanyDetails } from '@utils/companyDetailsGetter';
import moment from '@constant/momentTZ';
import Image from 'next/image';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ML_FILE_UPLOAD_URL } from '@constant/partnerAPIDetails';
import { Controller, useForm } from 'react-hook-form';
import ReCAPTCHA from 'react-google-recaptcha';
import { cookies } from 'next/headers';

const EmployeeManualAttendance = ({
  isAuthenticated,
  companyData,
}: {
  isAuthenticated: boolean;
  companyData: any;
}) => {
  const router = useRouter();
  const toastBottomLeft = useRef(null);
  const params = useParams();
  const show = () => {
    (toastBottomLeft.current as any)?.show({
      severity: 'success',
      summary: 'Form Submitted',
      detail: getValues('username'),
    });
  };
  const [reCaptchaToken, setReCaptchaToken] = useState(null);
  const recaptchaRef = useRef<any>(null);
  const toast = useRef<Toast>(null);
  const [loginButtonText, setLoginButtonText] = useState('Submit');
  const [logOutButtonText, setLogOutButtonText] = useState('Logout');
  const [isLoading, setIsLoading] = useState(true);
  const [manualLogoutVisible, setManualLogoutVisible] = useState(false);
  const [inputsFilled, setInputsFilled] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<any>(null);
  const [employeeCode, setEmployeeCode] = useState('');
  const [employeeDetails, setEmployeeDetails] = useState<any>(null);
  const [time, setTime] = useState('');
  const [visible, setVisible] = useState(false);
  const [visible2, setVisible2] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const getFormErrorMessage = (message: string) => {
    (toastBottomLeft.current as any)?.show({
      severity: 'error',
      detail: message,
      life: 3000,
    });
  };
  const [userData, setUserData] = useState<any>(null);
  const [company, setCompany] = useState({
    // COMPANY DATA
    logo: '/images/noimage.jpg',
    companyName: '',
    companyId: -1,
    // EMPLOYEE DATA
    employeeShifId: -1,
  });
  const [submitting, setSubmitting] = useState({
    employeeCode: false,
  });
  const [buttons, setButtons] = useState({
    timeIn: true,
    timeOut: true,
    lunchIn: true,
    lunchOut: true,
  });

  const defaultValues = {
    username: '',
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
  useEffect(() => {
    setTimeout(() => {
      setTime(moment().format('h:mm:ss a'));
    }, 1000);
  }, [time]);

  const onSubmit = async (data: any) => {
    data.value && show();
    setInputsFilled(false);
    setLoginButtonText('Validating...');
    data.reCaptchaToken = reCaptchaToken;
    try {
      if (!isAuthenticated) {
        const login: any = await axios.post('/api/auth/manualLogin', {
          ...data,
        });
        const loginData = login.data;

        setUserData(loginData.data);
        // console.log(loginData.data);
        if (loginData && loginData.userData.role === 'ADMIN') {
          reset();
          location.reload();
          setLoginButtonText('Login');
        } else {
          reset();
          location.reload();
        }
      } else {
        axios
          .post('/api/auth/manualLogout', { ...data })
          .then((res: any) => {
            reset();
            location.reload();
            setLogOutButtonText('Logout');
          })
          .catch((err: any) => {
            toast.current?.replace({
              severity: 'error',
              summary: err.response.data.message,
              life: 5000,
            });
          });
      }

      // console.log(login);
    } catch (error: any) {
      const response = error?.response?.data;
      getFormErrorMessage(response.message);
      setLoginButtonText('Login');
      reset();
    }
  };
  // useEffect(() => {
  //   (async function () {

  //     const companyDetails = (await getCompanyDetails(
  //       Number(params.companyId)
  //     )) as any;

  //     if (!companyDetails) {
  //       (function () {
  //         toast.current?.replace({
  //           severity: 'error',
  //           summary: 'Company not found. Double check the URL.',
  //           life: 3000,
  //         });
  //       })();
  //     } else {
  //       setCompany((prev) => ({
  //         ...prev,
  //         logo: companyDetails?.urlLogo || '/images/noimage.jpg',
  //         companyId: companyDetails?.companyId || -1,
  //         companyName: companyDetails?.companyName || '',
  //       }));
  //     }
  //   })();
  // }, [companyData]);

  useEffect(() => {
    if (companyData) {
      getCompanyDetails(Number(companyData.companyId))
        .then((res: any) => {
          setCompany((prev) => ({
            ...prev,
            logo: res?.urlLogo || '/images/noimage.jpg',
            companyId: res?.companyId || -1,
            companyName: res?.companyName || '',
          }));

          setIsLoading(false);
          if (res.urlLogo) {
            setCompanyLogo(
              `${ML_FILE_UPLOAD_URL}/${encodeURIComponent(res.urlLogo)}`
            );
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyData]);

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
        <div className="font-extrabold mt-10 text-[18px] text-center">
          {time.toUpperCase()}
        </div>

        <div className="card flex justify-center items-center flex-col lg:w-[600px] login gap-5 h-[90%]">
          {isAuthenticated && isLoading ? (
            <div className="w-full text-center">
              <i
                className="pi pi-spin pi-spinner"
                style={{ fontSize: '1.3rem' }}
              ></i>
            </div>
          ) : companyLogo ? (
            <Image
              src={companyLogo}
              height={100}
              width={100}
              alt={company.companyName || "Company's Logo"}
            />
          ) : (
            <h2 className="text-[35px] font-bold">
              {companyData ? companyData.companyName : ''}
            </h2>
          )}
          <div className="font-extrabold mb-7 text-[18px]">
            Attendance Tracking Portal
          </div>
          <div className="w-full">
            {!isAuthenticated && (
              <div className="w-full">
                <Toast ref={toastBottomLeft} position="bottom-left" />
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
                      <div className="flex flex-col justify-center items-center loginw-[90%]">
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
                      <div className="flex flex-col justify-center items-center loginw-[90%]">
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
                      className="w-full p-button m-auto"
                      // disabled={!inputsFilled}
                      disabled={!inputsFilled || !reCaptchaToken}
                    />
                  </div>
                </form>
              </div>
            )}
            {isAuthenticated && (
              <form
                className="flex flex-col gap-8 w-full form"
                onSubmit={(e) => {
                  // console.log(company)
                  e.preventDefault();

                  checkEmployeeCode();
                }}
              >
                <div className="flex flex-col justify-center items-center loginw-[90%]">
                  <>
                    <label
                      htmlFor="Employee COde"
                      className={classNames('w-full')}
                    />
                    <span className="p-float-label w-[80%]">
                      <InputText
                        id="Employee Code"
                        value={employeeCode}
                        className={classNames('w-full')}
                        onChange={(e) => setEmployeeCode(e.target.value)}
                      />
                      <label htmlFor="Employee Code">Employee ID</label>
                    </span>
                  </>
                </div>
                <div className="flex justify-center items-start w-full">
                  <Button
                    label={
                      !submitting.employeeCode ? 'Submit' : 'Submitting...'
                    }
                    type="submit"
                    disabled={
                      employeeCode.trim() === '' || submitting.employeeCode
                    }
                    className="w-[80%] p-button"
                  />
                </div>
                <div className="flex justify-center items-start w-full">
                  <Button
                    label={'Logout Portal'}
                    type="button"
                    severity="secondary"
                    color="secondary"
                    className="w-[80%] p-button"
                    onClick={() => setManualLogoutVisible(true)}
                  />
                </div>
              </form>
            )}
          </div>
        </div>
        <ReCAPTCHA
          sitekey={`${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
          onChange={(token: any) => setReCaptchaToken(token)}
          className="mb-5 w-[50%] ml-auto"
          badge="inline"
          size="invisible"
          ref={recaptchaRef}
          onError={(err: any) => console.log(err)}
        />
      </div>

      <div className="w-full relative">
        <div
          className="w-full h-[100vh]"
          style={{
            backgroundImage: `url(${LoginBG.src})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: '0.9',
            position: 'absolute',
            zIndex: '-1',
          }}
        />
        <div className="w-full h-full absolute top-0 left-0 bg-[#d60000] opacity-60 z-10" />
        <div className="sm:h-[100vh] py-20 sm:py-0 flex justify-center items-start md:px-10 lg:px-15 flex-col relative z-30">
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

      <Dialog
        header="Warning attendance exist"
        visible={visible2}
        style={{ width: '50vw' }}
        onHide={() => {}}
        closable={false}
      >
        <div className="my-5">
          <div className="text-center">
            <p>Your attendance already exist. Contact HR admin.</p>
          </div>

          <div className="flex justify-center items-center my-3">
            <Button
              label="Ok"
              className="p-button w-[130px]"
              rounded
              onClick={() => setVisible2(false)}
            />
          </div>
        </div>
      </Dialog>
      {isAuthenticated && (
        <Dialog
          header="Logout Portal"
          visible={manualLogoutVisible}
          style={{ width: '50vw', minHeight: '40vh' }}
          onHide={() => {
            setManualLogoutVisible(false);
          }}
          closable={true}
        >
          <div className=" mt-10 min-h-500">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-8 w-full form p-5 "
            >
              <Controller
                name="username"
                control={control}
                rules={{ required: 'Username is required.' }}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col justify-center items-center loginw-[90%]">
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
                              username.trim() !== '' && password.trim() !== ''
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
                  <div className="flex flex-col justify-center items-center loginw-[90%]">
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
                              username.trim() !== '' && password.trim() !== ''
                            );
                          }}
                        />
                        <label htmlFor={field.name}>Password</label>
                      </span>
                    </>
                  </div>
                )}
              />

              <div className="flex justify-center items-start w-full">
                <div>
                  <Button
                    label={logOutButtonText}
                    type="submit"
                    severity="secondary"
                    className="manual-logout-button w-full p-button m-auto rounded-full"
                    // disabled={!inputsFilled}
                    disabled={!inputsFilled || !reCaptchaToken}
                  />
                </div>
              </div>
            </form>
          </div>
        </Dialog>
      )}

      <Dialog
        header={
          // !isSubmitting &&
          // buttons.timeIn &&
          // buttons.lunchOut &&
          // buttons.lunchIn &&
          // buttons.timeOut
          isDone ? 'Attendance Complete' : 'Select Options'
        }
        visible={visible}
        style={{ width: '50vw' }}
        onHide={() => {
          setIsDone(false);
          setVisible(false);
        }}
      >
        <div className="flex justify-center items-center gap-2 my-5">
          {isDone ? (
            <p className="font-semibold text-xl">{"You're done for the day"}</p>
          ) : (
            <>
              <Button
                label="Time In"
                className="p-button w-[130px]"
                rounded
                disabled={buttons.timeIn}
                onClick={() => timeInOutLunchInOut('TIME_IN')}
              />
              <Button
                label="Lunch Out"
                className="p-button w-[130px]"
                rounded
                disabled={buttons.lunchOut}
                onClick={() => timeInOutLunchInOut('LUNCH_OUT')}
              />
              <Button
                label="Lunch In"
                className="p-butto w-[130px]n"
                rounded
                disabled={buttons.lunchIn}
                onClick={() => timeInOutLunchInOut('LUNCH_IN')}
              />
              <Button
                label="Time Out"
                className="p-button w-[130px]"
                rounded
                disabled={buttons.timeOut}
                onClick={() => timeInOutLunchInOut('TIME_OUT')}
              />
            </>
          )}
        </div>
      </Dialog>

      {/* TOAST */}
      <Toast ref={toast} position="bottom-left" />
    </div>
  );

  function checkEmployeeCode() {
    setSubmitting((prev) => ({ ...prev, employeeCode: true }));

    let config = {
      method: 'PATCH',
      maxBodyLength: Infinity,
      url: `/api/employeeCode`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
      },
      data: JSON.stringify({
        employeeCode: employeeCode,
        companyId: company.companyId,
        loggedTime: moment().format('HH:mm:ss'),
      }),
    };

    axios
      .request(config)
      .then((response: any) => {
        if (response.data.status != 200) {
          (function () {
            toast.current?.replace({
              severity: 'error',
              summary: response.data.message,
              life: 3000,
            });
          })();
        } else {
          if (response.data.message === 'Existing Attendance') {
            setVisible2(true);
          } else {
            setVisible(true);
            const { employeeData, attendanceData } = response.data.data;
            setEmployeeDetails(employeeData);

            if (attendanceData && attendanceData.timeIn) {
              if (attendanceData.timeOut) {
                setIsDone(() => true);
              } else {
                setButtons({
                  timeIn: attendanceData.timeIn == null ? false : true,
                  timeOut: false,
                  lunchIn:
                    attendanceData?.manualLoginAction === 'LUNCH_IN'
                      ? false
                      : true,
                  lunchOut:
                    attendanceData?.manualLoginAction === 'LUNCH_OUT'
                      ? false
                      : true,
                });
              }
            } else {
              setButtons({
                timeIn: false,
                timeOut: true,
                lunchIn: true,
                lunchOut: true,
              });
            }
          }
        }

        setSubmitting((prev) => ({ ...prev, employeeCode: false }));
      })
      .catch((error) => {
        console.log(error);
        toast.current?.replace({
          severity: 'error',
          summary: error.message,
          life: 3000,
        });
        setSubmitting((prev) => ({ ...prev, employeeCode: false }));
      });
  }

  function timeInOutLunchInOut(action: string) {
    setButtons((prev) => ({
      ...prev,
      timeIn: true,
      lunchIn: true,
      lunchOut: true,
      timeOut: true,
    }));
    let config = {
      method: 'PUT',
      maxBodyLength: Infinity,
      url: `/api/employeeCode?attendanceAction=${action}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
      },
      data: JSON.stringify({
        employeeData: employeeDetails,
        companyId: company.companyId,
        loggedTime: moment().format('HH:mm:ss'),
      }),
    };
    // setIsSubmitting(true);
    // setButtons((prev) => ({
    //   ...prev,
    //   timeIn:
    //     true,
    //   lunchIn:
    //     true,
    //   lunchOut
    //     : true,
    //   timeOut:
    //     true,
    // }));
    setIsDone(false);
    axios
      .request(config)
      .then((response: any) => {
        if (response.data.success) {
          toast.current?.replace({
            severity: 'success',
            summary: response.data.message,
            life: 5000,
          });
          setVisible(false);
          setEmployeeCode('');
        }
      })
      .catch((error) => {
        toast.current?.replace({
          severity: 'error',
          summary: error.response.data.message,
          life: 5000,
        });
      });

    // setButtons((prev) => ({
    //   ...prev,
    //   timeIn:
    //     true,
    //   lunchIn:
    //     true,
    //   lunchOut
    //     : true,
    //   timeOut:
    //     true,
    // }));
    // setTimeout(() => {
    //   setIsSubmitting(() => false);
    // }, 500);
  }
};

export default EmployeeManualAttendance;
