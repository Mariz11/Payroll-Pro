import axios from 'axios';

export async function checkDuplicateRoleName({
  companyId,
  roleName,
}: {
  companyId: number;
  roleName: string;
}) {

  const jwt = process.env.NEXT_PUBLIC_JWT;

  try {
    const formattedRoleName = roleName.trim().toLowerCase();
    const response = await axios.get('/api/user/role/duplicate', {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      params: {
        companyId,
        roleName: formattedRoleName,
      },
    });
    return response.data.duplicate;
  } catch (error: any) {
    console.log(error);
    return null;
  }
}