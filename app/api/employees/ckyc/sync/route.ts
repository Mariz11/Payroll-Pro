import { isValidToken } from '@utils/jwt';
import { getRequestLogger } from '@utils/logger';
import { resetEmployeeVerification } from '@utils/partnerAPIs';
import { getCKYCInfo } from '@utils/partnerApiServerUtils';
import { Employee, EmployeeProfile, User } from 'db/models';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest, res: Response) {
  const requestLogger = getRequestLogger(req);
  const data = await req.json();
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const employees: any = await Employee.findAll({
      attributes: ['employeeId', 'ckycId'],
      include: [
        {
          attributes: ['contactNumber'],
          model: EmployeeProfile,
        },
      ],
    });

    for (let i = 0; i < employees.length; i++) {
      const {
        employeeId,
        ckycId,
        employee_profile: { contactNumber },
      } = employees[i];

      if (!ckycId) continue;

      // Get CKYC data of the employee
      const getCKYCInfoData: any = await getCKYCInfo({
        ckycId: ckycId,
      });
      if (!getCKYCInfoData.success) {
        continue;
      }

      const updatedCKYCData: UpdateEmployeePayload =
        getCKYCInfoData.responseData.data;

      // Reset Employee Verification if the contact number has been changed via Branch
      if (contactNumber != updatedCKYCData.cellphoneNumber) {
        const resetEmployeeVer = await resetEmployeeVerification({
          ckycId: ckycId,
        });
        if (!resetEmployeeVer.success) {
          continue;
        }
      }

      await EmployeeProfile.update(
        {
          firstName: updatedCKYCData.name.firstName,
          middleName: updatedCKYCData.name.middleName,
          lastName: updatedCKYCData.name.lastName,
          suffix: updatedCKYCData.name.suffix,
          contactNumber: updatedCKYCData.cellphoneNumber,
          // profilePicture: data.profilePicture,
          gender: updatedCKYCData.gender,
          nationality: updatedCKYCData.nationality,
          civilStatus: updatedCKYCData.civilStatus,
          birthDate: updatedCKYCData.birthDate,
          emailAddress: updatedCKYCData.email,
          streetAddress: updatedCKYCData.addresses.current.otherAddress,
          cityId: updatedCKYCData.addresses.current.addressL2Id,
          provinceId: updatedCKYCData.addresses.current.addressL1Id,
          countryId: updatedCKYCData.addresses.current.addressL0Id,
          zipCode: updatedCKYCData.addresses.current.zipCode,
          placeOfBirth: updatedCKYCData.placeOfBirth,
        },
        {
          where: {
            employeeId: employeeId,
          },
        }
      );

      await User.update(
        {
          contactNumber: updatedCKYCData.cellphoneNumber,
          emailAddress: updatedCKYCData.email,
          username: updatedCKYCData.email,
        },
        {
          where: {
            employeeId: employeeId,
          },
        }
      );
    }

    requestLogger.info({
      label: 'CRON: Sync CKYC',
      message: JSON.stringify({
        success: true,
        message: 'Successfully synched!',
      }),
    });
    return NextResponse.json({
      success: true,
      message: 'Successfully synched!',
    });
  } catch (e: any) {
    requestLogger.info({
      label: 'CRON: Sync CKYC',
      message: JSON.stringify(e),
    });
    return NextResponse.json(e);
  }
}
