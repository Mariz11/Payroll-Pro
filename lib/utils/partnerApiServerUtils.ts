import axios from 'axios';
import { ML_CKCYC_API_DOMAIN } from 'lib/constant/partnerAPIDetails';
import { generateToken } from './partnerAPIs';
export async function getCKYCInfo({ ckycId }: { ckycId: string }) {
  const token = await generateToken();

  try {
    const response = await axios.get(
      `${ML_CKCYC_API_DOMAIN}/customers/exact-search?ckycId=${ckycId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        timeout: 300000,
      }
    );
    return {
      success: true,
      responseData: response?.data,
    };
  } catch (error: any) {
    const response = error.response;
    let statusCode = response?.status;
    let errorData = null;
    if (response.hasOwnProperty('data')) errorData = response?.data;
    else errorData = error;
    // logger.error({
    //   label: 'Get CKYC Info API',
    //   message: JSON.stringify(errorData),
    // });
    return {
      success: false,
      message: errorData.message,
      responseData: errorData,
      statusCode: statusCode,
    };
  }
}
