'use client';
import NotFound from 'app/not-found';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Divider } from 'primereact/divider';
import LoadingScreen from 'lib/components/loading/loading';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const Page = () => {
  const router = useRouter();
  const [logs, setLogs] = useState<any>([]);
  const [error, setError] = useState<any>(null);
  const [roleName, setRoleName] = useState<any>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  //   const search = window.location.search;
  //   const params = new URLSearchParams(search);
  //   const date = params.get('date') || '';

  // Get the current path and query
  const currentPath = usePathname();
  const currentQuery = useSearchParams();
  const date = currentQuery.get('date');
  const fetchLogs = async () => {
    // console.log('fetching...');
    try {
      const response = await fetch(
        `/api/dbLogs?${date ? `date=${date}` : ''}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        }
      );
      // data consists of the file name, and an array of its contents
      const data = await response.json();
      if (data) {
        if (data.error != null) {
          setError(data.error);
        } else {
          setError(null);
          setLogs(() => data.logs);
        }
      }
    } catch (err) {
      setError(err);
      console.error('failed to fetch logs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(`/api/user/role`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      })
      .then((res: any) => {
        setRoleName(res.data.message.roleName);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    // simulate log trail
    fetchLogs();
    // const interval = setInterval(fetchLogs, 5000);
    // return () => clearInterval(interval);
  }, []);

  // verify access
  let isAllowed = roleName === 'SUPER ADMIN' ? true : false;
  if (isLoading) {
    return <LoadingScreen />;
  }
  if (!isAllowed) {
    return <NotFound />;
  }

  return (
    <div className="bg-black text-white p-4 h-screen overflow-y-auto">
      <h1 className="text-lg">Logs</h1>
      <Divider />
      {error != null ? (
        <p
          style={{
            color: '#AAA',
            fontSize: '12px',
            lineHeight: '1.8',
            fontFamily: 'calibri',
          }}
        >
          Error Retrieving Logs:{error}
        </p>
      ) : (
        <>
          {' '}
          <ul className="mt-2">
            {logs.flatMap((log: any, logIndex: number) => {
              // const contentArr = log.content.split('\r\n').filter(Boolean);
              // return contentArr.map((content: any, contentIndex: number) => (
              return (
                <div style={{ display: 'flex', justifyContent: 'left' }}>
                  <p
                    key={logIndex}
                    style={{
                      color: '#AAA',
                      fontSize: '12px',
                      lineHeight: '1.8',
                      fontFamily: 'calibri',
                    }}
                  >
                    {`${log.createdAt} `}
                  </p>
                  <p
                    style={{
                      color: '#AAA',
                      fontSize: '12px',
                      lineHeight: '1.8',
                      fontFamily: 'calibri',
                      paddingLeft: '10px',
                    }}
                  >
                    {`[${log.origin}] ${log.message} ${log.payload ? log.payload : ''
                      }`}
                  </p>
                </div>
              );

              // ));
            })}
          </ul>
        </>
      )}
    </div>
  );
};

export default Page;
