import { duplicateInstanceMsg, serverErrorMsg } from '@constant/systemMsgs';
import moment from '@constant/momentTZ';
import { Toast } from 'primereact/toast';
import { RefObject, useEffect, useState } from 'react';
import {
  hasDuplicateTask,
  isCompanyProcessing,
  logTaskProcess,
} from './companyDetailsGetter';
import { uuidv4 } from './helper';
import { getTotalPayrolls, processDisbursement } from './mainFunctions';

export const cancelPayrollTasks = async (
  processingTasks: ProcessingPayroll[]
) => {
  const token: any = `Bearer ${process.env.NEXT_PUBLIC_JWT}`;
  const blob = new Blob(
    [JSON.stringify({ token: token, processingTasks: processingTasks })],
    {
      type: 'application/json',
    }
  );
  return navigator.sendBeacon(`/api/tasksProcesses/cancel`, blob);
};

export const useNetworkStatus = () => {
  const [isOnline, setOnline] = useState<{
    previous: boolean;
    current: boolean;
  }>({
    previous: true,
    current: true,
  });

  const updateNetworkStatus = () => {
    setOnline((prev: any) => ({
      previous: prev.current,
      current: navigator.onLine,
    }));
  };

  useEffect(() => {
    window.addEventListener('load', updateNetworkStatus);
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    return () => {
      window.removeEventListener('load', updateNetworkStatus);
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigator.onLine]);

  return { isOnline };
};

export const postPayroll = async ({
  toast,
  data,
  processingPayroll,
  setProcessingPayroll,
  setIsSubmitting,
  refetchParent,
}: {
  toast: RefObject<Toast>;
  data: PostPayrollData[];
  processingPayroll: ProcessingPayroll[];
  setProcessingPayroll: React.Dispatch<
    React.SetStateAction<ProcessingPayroll[]>
  >;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  refetchParent: () => void;
}) => {
  try {
    const dataToProcess: ProcessingPayroll[] = [];
    const finalData = [];
    // Prevent duplicate process
    for (let i = 0; i < data.length; i++) {
      const item: any = data[i];
      item.taskId = uuidv4();
      item.taskName = `Post Payroll`;
      item.totalProcess = 0;
      item.percentage = 0;
      item.createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
      item.successCount = 0;
      item.status = 0;
      item.failedRemarks = [];
      const checkExistingProcess = await isCompanyProcessing({
        taskName: 'Post Payroll',
        departmentName: item.departmentName,
        businessMonth: item.businessMonth,
        cycle: item.cycle,
      });
      if (checkExistingProcess) {
        item.status = 1;
        item.percentage = 100;
        item.isAborted = true;
        item.failedRemarks = [
          {
            headerTitle: item.departmentName,
            error: duplicateInstanceMsg,
          },
        ];
      } else {
        finalData.push(item);
        logTaskProcess({
          taskCode: item.taskId,
          taskName: item.taskName,
          departmentName: item.departmentName,
          businessMonth: item.businessMonth,
          cycle: item.cycle,
          status: 0,
        });
      }
      dataToProcess.push(item);
    }

    setProcessingPayroll((prev: ProcessingPayroll[]) => [
      ...prev,
      ...dataToProcess,
    ]);

    toast.current?.clear();

    for (let x = 0; x < finalData.length; x++) {
      const item = finalData[x];
      const {
        taskId,
        taskName,
        departmentId,
        departmentName,
        businessMonth,
        cycle,
        isDirect,
        isReposting,
      } = item;

      const count: any = await getTotalPayrolls({
        businessMonth: businessMonth,
        cycle: cycle,
        departmentId: departmentId,
        isDirect: isDirect,
        isReposting: isReposting,
      });
      const { companyDetails, totalPayroll } = count.data;
      if (!count.success) {
        setProcessingPayroll((prev: ProcessingPayroll[]) =>
          prev.map((item: ProcessingPayroll) => {
            if (item.taskId == taskId) {
              item.totalProcess = totalPayroll;
              item.status = 1;
              item.percentage = 100;
              item.failedRemarks = count.message;
            }
            return item;
          })
        );
        logTaskProcess({
          taskCode: taskId,
          taskName: taskName,
          status: 1,
        });
        continue;
      }
      let hasMore: boolean = true;
      let successCounter: number = 0;
      let processedCount: number = 0;
      let batchId: number | null = null;
      let batchNumber: string | null = null;
      const processedPayrollIDs: number[] = [];
      while (hasMore) {
        const hasDuplicate = await hasDuplicateTask({
          taskCode: taskId,
          taskName: taskName,
          departmentName: departmentName,
          businessMonth: businessMonth,
          cycle: cycle,
        });
        if (hasDuplicate) {
          hasMore = false;
          setProcessingPayroll((prev: ProcessingPayroll[]) =>
            prev.map((item: ProcessingPayroll) => {
              if (item.taskId == taskId) {
                item.totalProcess = totalPayroll;
                item.percentage = 100;
                item.successCount = 0;
                item.status = 1;
                item.isAborted = true;
                item.failedRemarks = [
                  {
                    headerTitle: item.departmentName,
                    error: duplicateInstanceMsg,
                  },
                ];
              }
              return item;
            })
          );
          break;
        }
        const process: any = await processDisbursement({
          departmentName: departmentName,
          businessMonth: businessMonth,
          cycle: cycle,
          departmentId: departmentId,
          isDirect: isDirect,
          isReposting: isReposting,
          batchId: batchId,
          batchNumber: batchNumber,
          companyDetails: companyDetails,
          processedPayrollIDs: processedPayrollIDs,
        });
        if (process.success) {
          successCounter = successCounter + 1;
        } else if (process.abort) {
          hasMore = false;
          setProcessingPayroll((prev: ProcessingPayroll[]) =>
            prev.map((item: ProcessingPayroll) => {
              if (item.taskId == taskId) {
                item.totalProcess = totalPayroll;
                item.percentage = 100;
                item.status = 1;
                item.isAborted = true;
                item.failedRemarks = process.message;
              }
              return item;
            })
          );
          break;
        }
        batchId = process.batchId ?? null;
        batchNumber = process.batchNumber ?? null;
        processedPayrollIDs.push(process.processedPayrollID);
        processedCount = processedCount + 1;

        setProcessingPayroll((prev: ProcessingPayroll[]) =>
          prev.map((item: ProcessingPayroll) => {
            if (item.taskId == taskId) {
              item.percentage = Math.round(
                (processedCount / totalPayroll) * 100
              );
              item.totalProcess = totalPayroll;
              item.successCount = successCounter;
              item.status = processedCount == totalPayroll ? 1 : 0;
              item.failedRemarks = [...item.failedRemarks, ...process.message];
            }
            return item;
          })
        );

        if (processedCount == totalPayroll) {
          hasMore = false;
          logTaskProcess({
            taskCode: taskId,
            taskName: taskName,
            status: 1,
          });
        }
      }
      refetchParent();
    }
    setIsSubmitting(false);
  } catch (error: any) {
    // localStorage.setItem('stuckPayroll', new Date().getTime().toString());
    setProcessingPayroll((prev: ProcessingPayroll[]) =>
      prev.map((item: ProcessingPayroll) => ({
        ...item,
        percentage: 100,
        status: 1,
        isAborted: true,
        failedRemarks: [
          {
            headerTitle: 'Something went wrong...',
            error: serverErrorMsg,
          },
        ],
      }))
    );

    setIsSubmitting(false);
  }
};
