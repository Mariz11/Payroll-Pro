import { payloadValidator, tokenChecker } from '@utils/externalApiFunctions';
import { getRequestLogger } from '@utils/logger';
import { Employee, EmployeeProfile, User } from 'db/models';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestLogger = getRequestLogger(req);
  const userToken: any = req.headers.get('authorization');

  if (!(await tokenChecker(userToken))) {
    requestLogger.error({
      label: 'Employee Update from CKYC',
      message: JSON.stringify({
        success: false,
        message: 'Invalid Token.',
        payload: {
          token: userToken,
        },
        statusCode: 401,
      }),
    });
    return NextResponse.json(
      { success: false, message: 'Invalid Token.', statusCode: 401 },
      { status: 401 }
    );
  }

  interface UpdateKCYPayload {
    firstName: string;
    lastName: string;
    middleName: string | null;
    suffix: string | null;
    contactNumber: string;
    emailAddress: string;
    address: {
      countryId: number;
      provinceId: number;
      cityId: number;
      streetAddress: string;
    };
    zipCode: string | null;
    birthDate: string;
    placeOfBirth: string;
    nationality: string;
    gender: string;
    civilStatus: string;
    customerPhoto: string | null;
  }

  try {
    const payload: UpdateKCYPayload = await req.json();
    const ckycId = params.id;

    const {
      firstName,
      lastName,
      middleName,
      suffix,
      contactNumber,
      emailAddress,
      zipCode,
      birthDate,
      placeOfBirth,
      nationality,
      gender,
      civilStatus,
      customerPhoto,
    } = payload;

    const countryId = payload?.address?.countryId;
    const provinceId = payload?.address?.provinceId;
    const cityId = payload?.address?.cityId;
    const streetAddress = payload?.address?.streetAddress;

    const expectedKeys = [
      'firstName',
      'lastName',
      'middleName',
      'suffix',
      'contactNumber',
      'emailAddress',
      'address',
      'zipCode',
      'birthDate',
      'placeOfBirth',
      'nationality',
      'gender',
      'civilStatus',
      'customerPhoto',
    ];

    const payloadVal = await payloadValidator({ payload, expectedKeys });
    if (payloadVal.errors > 0) {
      const message = payloadVal.message;
      const statusCode = 400;

      requestLogger.error({
        label: 'Employee Update from CKYC',
        message: JSON.stringify({
          success: false,
          message: message,
          payload: {
            ...payload,
          },
          statusCode: statusCode,
        }),
      });
      return NextResponse.json(
        {
          success: false,
          message: message,
          statusCode: statusCode,
        },
        { status: statusCode }
      );
    }

    // Check Contact Number format
    if (
      contactNumber &&
      (contactNumber.length != 11 ||
        !contactNumber?.startsWith('09') ||
        contactNumber?.match('[a-zA-Z]+'))
    ) {
      requestLogger.error({
        label: 'Employee Update from CKYC',
        message: JSON.stringify({
          success: false,
          message:
            'Invalid Contact Number format. Format should be in 09xxxxxxxxx',
          payload: {
            ckycId: ckycId,
            ...payload,
          },
          statusCode: 400,
        }),
      });
      return NextResponse.json(
        {
          success: true,
          message:
            'Invalid Contact Number format. Format should be in 09xxxxxxxxx',
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    // Check if Employee exists
    const employee: any = await Employee.findOne({
      where: {
        ckycId: ckycId,
      },
    });

    if (!employee) {
      requestLogger.error({
        label: 'Employee Update from CKYC',
        message: JSON.stringify({
          success: false,
          message: `No record matched with Employee#${ckycId} on our database.`,
          payload: {
            ckycId: ckycId,
          },
          statusCode: 404,
        }),
      });
      return NextResponse.json(
        {
          success: false,
          message: `No record matched with Employee#${ckycId} on our database.`,
          statusCode: 404,
        },
        { status: 404 }
      );
    }

    const objToUpdate = {
      firstName,
      lastName,
      middleName,
      suffix,
      contactNumber,
      emailAddress,
      countryId,
      provinceId,
      cityId,
      streetAddress,
      zipCode,
      birthDate,
      placeOfBirth,
      nationality,
      gender,
      civilStatus,
      profilePicture:
        customerPhoto == '' || customerPhoto == null ? null : customerPhoto,
    } as any;

    const userObjToUpdate = {
      firstName,
      lastName,
      middleName,
      suffix,
      contactNumber,
      emailAddress,
      username: emailAddress,
      birthDate,
    } as any;

    if (firstName === undefined) {
      delete objToUpdate.firstName;
      delete userObjToUpdate.firstName;
    }
    if (lastName === undefined) {
      delete objToUpdate.lastName;
      delete userObjToUpdate.lastName;
    }
    if (middleName === undefined) {
      delete objToUpdate.middleName;
      delete userObjToUpdate.middleName;
    }
    if (suffix === undefined) {
      delete objToUpdate.suffix;
      delete userObjToUpdate.suffix;
    }
    if (contactNumber === undefined) {
      delete objToUpdate.contactNumber;
      delete userObjToUpdate.contactNumber;
    }
    if (emailAddress === undefined) {
      delete objToUpdate.emailAddress;
      delete userObjToUpdate.emailAddress;
      delete userObjToUpdate.username;
    }
    if (birthDate === undefined) {
      delete objToUpdate.birthDate;
      delete userObjToUpdate.birthDate;
    }
    if (countryId === undefined) delete objToUpdate.countryId;
    if (provinceId === undefined) delete objToUpdate.provinceId;
    if (cityId === undefined) delete objToUpdate.cityId;
    if (streetAddress === undefined) delete objToUpdate.streetAddress;
    if (zipCode === undefined) delete objToUpdate.zipCode;
    if (placeOfBirth === undefined) delete objToUpdate.placeOfBirth;
    if (nationality === undefined) delete objToUpdate.nationality;
    if (gender === undefined) delete objToUpdate.gender;
    if (civilStatus === undefined) delete objToUpdate.civilStatus;
    if (customerPhoto === undefined) delete objToUpdate.profilePicture;

    // Updated Employee Profile
    const updateProfile = await EmployeeProfile.update(objToUpdate, {
      where: {
        employeeId: employee.employeeId,
      },
    });
    const updatedUser = await User.update(userObjToUpdate, {
      where: { employeeId: employee.employeeId },
    });

    if (updateProfile) {
      requestLogger.info({
        label: 'Employee Update from CKYC',
        message: JSON.stringify({
          success: true,
          message: `Successfully updated Employee#${ckycId}.`,
          payload: {
            ckycId: ckycId,
            ...objToUpdate,
          },
          statusCode: 200,
        }),
      });
      return NextResponse.json(
        {
          success: true,
          message: `Successfully updated Employee#${ckycId}.`,
          statusCode: 200,
        },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.log(error);

    requestLogger.error({
      label: 'Employee Update from CKYC',
      message: JSON.stringify(error),
    });
    return NextResponse.json(
      {
        success: false,
        message: 'Something went wrong...',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
