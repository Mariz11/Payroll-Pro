import moment from '@constant/momentTZ';
import { cancelPayrollTasks, useNetworkStatus } from '@utils/disbursementFn';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Chip } from 'primereact/chip';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { Knob } from 'primereact/knob';
import { classNames } from 'primereact/utils';
import { useEffect, useState } from 'react';
import { interruptedProcesses, logTaskProcess } from '@utils/processUtils';

const ProgressBar = ({
  processingPayroll,
  setProcessingPayroll,
}: {
  processingPayroll: ProcessingPayroll[];
  setProcessingPayroll: (f: ProcessingPayroll[]) => void;
}) => {
  const { isOnline } = useNetworkStatus();
  const [showErrors, setShowErrors] = useState<any[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(true);
  const [alertUser, setAlertUser] = useState<boolean>(false);
  const [interruptedTasks, setInterruptedTasks] = useState<
    {
      taskId: number;
      taskName: string;
      departmentName: string;
      businessMonth: string;
      cycle: string;
    }[]
  >([]);

  const hasInterruptedTasks = async () => {
    if (!isOnline.current) {
      location.reload();
      return;
    }
    const cancelledTasks: any = await interruptedProcesses({
      taskIds: [],
      action: 'get',
    });

    if (cancelledTasks.length > 0) {
      setProcessingPayroll([]);
      setInterruptedTasks(cancelledTasks);
      setAlertUser(true);
      setShowDialog(false);
      localStorage.removeItem('stuckPayroll');
    }
  };

  // When the user reloads the page while disbursement is in progress
  useEffect(() => {
    if (processingPayroll && processingPayroll.length == 0) {
      return;
    }
    setShowDialog(true);

    // localStorage.removeItem('stuckPayroll');

    // if:
    // when the internet connection is restored
    // we cancel the interrupted tasks
    // else:
    // when disconnected to the internet while disbursement is in progress
    // we save the network status in local storage, in case the internet connection took a while to be restored
    // so when the window is reloaded or closed we can check if there are any stuck tasks
    // if (!isOnline.previous && isOnline.current) {
    //   cancelPayrollTasks(
    //     processingPayroll.filter((i: ProcessingPayroll) => i.percentage != 100)
    //   ).then((res: any) => {
    //     if (res) {
    //       hasInterruptedTasks();
    //     }
    //   });
    // }

    if (
      processingPayroll.filter(
        (i: ProcessingPayroll) => i.isAborted && i.isAborted == true
      ).length > 0
    ) {
      localStorage.setItem('stuckPayroll', new Date().getTime().toString());
      processingPayroll.map((item: ProcessingPayroll) => {
        if (item.isAborted) {
          logTaskProcess({
            taskCode: item.taskId,
            taskName: item.taskName,
            status: 2,
          });
        }
      });
    }

    // an event listener to cancel stuck tasks when the window is reloaded or closed
    const handleBeforeUnload = (event: any) => {
      event.preventDefault();
      event.returnValue = ''; // Triggers browser's default confirm
    };
    const handlePageHide = () => {
      cancelPayrollTasks(
        processingPayroll.filter((i: ProcessingPayroll) => i.percentage != 100)
      );
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide); // Detects actual page exit
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [processingPayroll, isOnline]);

  useEffect(() => {
    // checks on localstorage if there are stuck tasks to cancel
    if (localStorage.getItem('stuckPayroll')) {
      cancelPayrollTasks(
        processingPayroll.filter((i: ProcessingPayroll) => i.percentage != 100)
      ).then((res: any) => {
        if (res) {
          hasInterruptedTasks();
        }
      });
    } else {
      hasInterruptedTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hideDialog = () => {
    setProcessingPayroll([]);
    setInterruptedTasks([]);
    setShowDialog(false);
    hasInterruptedTasks();
  };

  return (
    <>
      {processingPayroll.length > 0 && (
        <>
          <Dialog
            visible={showDialog}
            position={'center'}
            header={'On Going Disbursements'}
            style={{ minWidth: '20vw', maxHeight: '385px' }}
            onHide={() => hideDialog()}
            draggable={false}
            resizable={false}
            closeOnEscape={false}
            closable={
              processingPayroll.filter((i: any) => i.status == 0).length == 0
            }
            breakpoints={{ '960px': '75vw', '641px': '100vw' }}
          >
            <div className="my-2 mx-0 relative">
              {processingPayroll &&
                processingPayroll.length > 0 &&
                processingPayroll.map((task: any, index: number) => (
                  <div key={index}>
                    <div className="flex items-center justify-between m-0 gap-5">
                      <div className="flex items-start justify-start gap-5">
                        <Chip
                          label={`${task.successCount}/${task.totalProcess}`}
                          style={{ fontSize: '15px' }}
                        />
                        <label>
                          {task.taskName}: {task.departmentName} - [
                          {task.businessMonth} - {task.cycle}]
                          <span style={{ fontSize: '12px', display: 'block' }}>
                            {moment(task.createdAt).format('LL LT')}
                          </span>
                        </label>
                        {task.failedRemarks.length > 0 && (
                          <Button
                            rounded
                            tooltip="View error details"
                            icon="pi pi-info-circle"
                            onClick={(e) => setShowErrors(task.failedRemarks)}
                            style={{
                              width: '20px',
                              height: '20px',
                              padding: '10px',
                            }}
                          />
                        )}
                      </div>
                      <div className="flex gap-2 items-center">
                        {task.isAborted ? (
                          <Badge value={'Aborted'} severity={'danger'} />
                        ) : (
                          ''
                        )}
                        <Knob
                          value={task.percentage}
                          valueTemplate={'{value}%'}
                          size={50}
                          readOnly
                          textColor="black"
                          valueColor="#4CAF50"
                        />
                      </div>
                    </div>
                    <Divider className="my-1" />
                  </div>
                ))}

              {processingPayroll.filter((i: any) => i.status == 0).length ==
                0 && (
                <div
                  style={{
                    position: 'sticky',
                    bottom: '0px',
                    background: '#fff',
                    textAlign: 'right',
                    padding: '10px 0',
                    fontSize: '15px',
                    display: 'block',
                  }}
                >
                  <button onClick={(e: any) => hideDialog()}>Clear All</button>
                </div>
              )}
              <p
                style={{
                  position: 'sticky',
                  bottom: '0px',
                  background: '#fff',
                  textAlign: 'right',
                  padding: '10px 0',
                  fontSize: '15px',
                  display: 'block',
                }}
                className="text-red-500 text-[14px]"
              >
                <strong>Note:</strong> Please do not refresh the page while
                posting of payroll is still in progress to avoid interruption.
                Should you want to access the other modules, please open a new
                tab.
              </p>
            </div>
          </Dialog>

          <Dialog
            header="Error Details"
            visible={showErrors.length > 0}
            breakpoints={{ '960px': '75vw', '641px': '100vw' }}
            onHide={() => {
              setShowErrors([]);
            }}
            dismissableMask={true}
            draggable={false}
            resizable={false}
          >
            <div className={'p-5'}>
              <div
                className={classNames({
                  'grid lg:grid-cols-2 sm:grid-cols-1 justify-start gap-5':
                    Array.isArray(showErrors) &&
                    showErrors.length > 0 &&
                    showErrors.length > 1,
                })}
              >
                {Array.isArray(showErrors) ? (
                  showErrors.length > 0 &&
                  showErrors.map((content: any, contentIndex: number) => {
                    return (
                      <div key={contentIndex} className="mb-5">
                        <h4 className="text-[15px] font-bold">
                          {content.headerTitle}
                        </h4>
                        {content.error && Array.isArray(content.error) ? (
                          <ul className="list-disc pl-5">
                            {content.error.map((err: any, errIndex: number) => (
                              <li key={errIndex}>{err}</li>
                            ))}
                          </ul>
                        ) : (
                          <p
                            dangerouslySetInnerHTML={{
                              __html: content.error,
                            }}
                          />
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p>{showErrors}</p>
                )}
              </div>
              <p className="mt-5 text-[#D61117] text-[13px]">
                <strong>Note:</strong> Please always check the{' '}
                <strong>For Reposting</strong> tab to reprocess any
                disbursements that have a failed status.
              </p>
            </div>
          </Dialog>
        </>
      )}
      <Dialog
        header="Disbursement Incomplete"
        footer={
          <Button
            label="Confirm"
            onClick={(event) => {
              interruptedProcesses({
                taskIds: interruptedTasks.map((i: any) => i.taskId),
                action: 'acknowledge',
              });
              setAlertUser(false);
              setShowDialog(false);
              setProcessingPayroll([]);
              setInterruptedTasks([]);
            }}
            className="w-8rem mt-5"
          ></Button>
        }
        visible={alertUser}
        style={{ width: '50vw' }}
        breakpoints={{ '960px': '75vw', '641px': '100vw' }}
        onHide={() => {
          setAlertUser(false);
        }}
        closable={false}
        dismissableMask={false}
        draggable={false}
        resizable={false}
      >
        <div className="py-5">
          <p className="mb-5">
            The previous disbursement(s) did not complete successfully:
          </p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
            {interruptedTasks.map((i: any, index: number) => (
              <li key={index}>
                {i.departmentName} - {i.businessMonth} - {i.cycle}
              </li>
            ))}
          </ul>
        </div>
      </Dialog>
    </>
  );
};

export default ProgressBar;
