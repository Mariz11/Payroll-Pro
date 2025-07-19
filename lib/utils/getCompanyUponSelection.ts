import axios from 'axios';

const getCompanyUponSelection = async (companyId: number | null) => {
  try {
    const res = await axios.get(`/api/companyDetails?companyId=${companyId}`, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
      },
    });
    return res;
  } catch (err) {
    return err;
  }
};

export default getCompanyUponSelection;
