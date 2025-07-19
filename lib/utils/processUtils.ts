import axios from "axios";

export async function interruptedProcesses({
  taskIds,
  action,
}: {
  taskIds: number[];
  action: 'get' | 'acknowledge';
}) {
  const jwt = process.env.NEXT_PUBLIC_JWT; // Adjust if JWT is stored elsewhere

  try {
    if (action === 'get') {
      const response = await axios.get('/api/configurations/processes/interruptedProcesses', {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      return response.data;
    } else if (action === 'acknowledge') {
      const response = await axios.put(
        '/api/configurations/processes/interruptedProcesses',
        { taskIds },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      return response.data;
    }
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error?.response?.data?.message || error.message,
    };
  }
}

export async function logTaskProcess({
  taskCode,
  taskName,
  departmentName,
  businessMonth,
  cycle,
  status,
}: {
  taskCode: string | number;
  taskName: string;
  departmentName?: string | null;
  businessMonth?: string | null;
  cycle?: string | null;
  status: number;
}) {
  const jwt = process.env.NEXT_PUBLIC_JWT; // Adjust if JWT is stored elsewhere
  try {
    if (status === 0) {
      // Insert new task process
      const response = await axios.post(
        '/api/configurations/processes/logProcesses',
        {
          taskCode,
          taskName,
          departmentName,
          businessMonth,
          cycle,
        },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      return {
        success: true,
        message: 'Successfully Created',
        result: response.data,
      };
    } else {
      // Update task process
      const response = await axios.put(
        '/api/configurations/processes/logProcesses',
        { taskCode },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      return {
        success: true,
        message: 'Successfully Updated',
        result: response.data,
      };
    }
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error?.response?.data?.message || error.message,
    };
  }
}