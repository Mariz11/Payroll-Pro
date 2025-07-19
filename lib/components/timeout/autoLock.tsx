'use client';
import React, { useEffect, useState, useRef, useContext } from 'react';
import { useIdleTimer } from 'react-idle-timer';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { set } from 'lodash';
import { GlobalContainer } from 'lib/context/globalContext';

const AutoLock = (props: any) => {
  const [currentUrl, setCurrentUrl] = useState('');
  const toastRef = useRef<any>(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);
  const context = useContext(GlobalContainer);
  const [isLock, setIsLock] = useState(false);
  const [password, setPassword] = useState<string>('');

  const onIdle = () => {
    // console.log('timedout');
    if (
      !currentUrl.includes('admin') &&
      !currentUrl.includes('employee') &&
      !currentUrl.includes('superAdmin') &&
      !currentUrl.includes('page')
    ) {
      return;
    }

    axios
      .post('/api/lock', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      })
      .then((res: any) => {
        if (res.data.success) {
          setIsLock(() => res.data.isLocked);
        }
      });
  };
  const onActive = () => {
    // console.log('unlocked');
    // setIsLock(false);
  };
  // const onAction = () => { console.log('onAction'); }
  const { getRemainingTime } = useIdleTimer({
    onIdle,
    onActive,
    name: 'autoLock',
    // onAction,
    // dev time out
    timeout: process.env.NEXT_PUBLIC_AUTOLOCK_TIMEOUT
      ? Number(process.env.NEXT_PUBLIC_AUTOLOCK_TIMEOUT)
      : 300000,
    // prod time out
    leaderElection: true,
    syncTimers: 200,
    // timeout: 20_000,
    throttle: 500,
    crossTab: true,
  });

  useQuery({
    refetchOnWindowFocus: true,
    queryKey: ['checkisLockQuery'],
    queryFn: async () => {
      if (context?.userData) {
        return await axios
          .get('/api/lock', {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
            },
          })
          .then((res: any) => {
            if (res.data.message.isLocked) {
              setIsLock(() => true);
            } else {
              setIsLock(() => false);
            }
            return false;
          });
      } else {
        return [];
      }
    },
  });
  if (
    !currentUrl.includes('admin') &&
    !currentUrl.includes('employee') &&
    !currentUrl.includes('superAdmin') &&
    !currentUrl.includes('page')
  ) {
    return props.children;
  }
  return (
    <>
      {!isLock && props.children}
      {isLock && (
        <>
          <Toast ref={toastRef} position="bottom-left" />
          <Dialog
            style={{ width: '500px', height: '250px', padding: '5px' }}
            visible={isLock}
            header="Inactive User"
            closable={false}
            onHide={() => {
              setIsLock(false);
            }}
          >
            <div className="flex flex-col items-center justify-center gap-5">
              Session has timed out. Please Enter Password
              <div>
                <InputText
                  type="password"
                  className=" ml-5"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button
                onClick={(e) => {
                  // console.log(currentUrl);
                  e.preventDefault();

                  // unlocks user
                  axios
                    .put(
                      '/api/lock',
                      { password: password },
                      {
                        headers: {
                          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                        },
                      }
                    )
                    .then((res: any) => {
                      if (res.data.success === true) {
                        setIsLock(false);
                      } else {
                        toastRef.current?.replace({
                          severity: 'error',
                          summary: res.data.message,
                          life: 5000,
                        });
                      }
                    })
                    .catch((err) => {
                      toastRef.current?.replace({
                        severity: 'error',
                        summary: err?.message,
                        life: 5000,
                      });
                    });
                }}
              >
                Activate
              </Button>
            </div>
          </Dialog>
        </>
      )}
    </>
  );
};

export default AutoLock;
