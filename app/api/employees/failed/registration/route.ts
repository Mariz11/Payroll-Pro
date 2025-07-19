import { properCasing, removeExtraSpaces, uuidv4 } from '@utils/helper';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import {
  userCredentialEmailContent,
  userCredentialSMSContent,
  verifyUserEmailContent,
  verifyUserSMSContent,
} from '@utils/notificationContentFormatter';
import {
  generatePassword,
  generateVerificationCode,
  registerEmployeeToKYC,
  sendEmail,
  sendSMS,
} from '@utils/partnerAPIs';
import {
  ActivityLog,
  Company,
  Employee,
  EmployeeProfile,
  Shift,
  User,
  UserRole,
  VerificationCode,
} from 'db/models';
import moment from '@constant/momentTZ';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { taskCodeGenerator } from '@utils/mainFunctions';
import { MCASH_MLWALLET } from '@constant/variables';
import { Op } from 'sequelize';
const romanNumeralRe =
  /^(M{0,3})(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('Authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  try {
    const url = new URL(req.url);
    const offset = Number(url.searchParams.get('offset'));
    const limit = Number(url.searchParams.get('limit'));

    const data = await EmployeeProfile.findAll({
      include: [
        {
          attributes: [
            'employeeCode',
            'modeOfPayroll',
            'mismatchedInfos',
            'failedRegistrationRemarks',
          ],
          model: Employee,
          where: {
            companyId: companyId,
            employeeStatus: 3,
          },
        },
      ],
      // offset: offset,
      // limit: limit,
      subQuery: true,
      order: [['employeeId', 'ASC']],
    });
    return NextResponse.json(data);
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.log(error);
    else return NextResponse.json(error, { status: 500 });
  }
}

export async function PATCH(req: Request, res: Response) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;
  const companyName = selectedCompData
    ? selectedCompData.companyName
    : seshData.company.companyName;
  const companyTierLabel = selectedCompData
    ? selectedCompData.tierLabel
    : seshData.company.tierLabel;
  const userId = seshData.userId;

  try {
    const payload = await req.json();
    const employeeCodes: any = [];

    const companyDetails: any = await Company.findOne({
      attributes: ['companyId', 'emailAddress', 'contactNumber'],
      where: {
        companyId: companyId,
      },
    });


    const allErrors: any = [];
    for (let i = 0; i < payload.length; i++) {
      const errorMessages = [];
      const data = payload[i];
      let failedRegistrationRemarks: any = null;

      const employeeDetails: any = await Employee.findOne({
        where: {
          employeeId: data.employeeId,
        },
        attributes: [
          'employeeId',
          'shiftId',
          'basicPay',
          'allowance',
          'modeOfPayroll',
        ],
      });

      const { employeeId, modeOfPayroll } = employeeDetails;

      if (data.contactNumber.charAt(0) != '0') {
        data.contactNumber = `0${data.contactNumber}`;
      }

      data.birthDate = moment(moment(data.birthDate)).isValid()
        ? moment(data.birthDate).format('YYYY-MM-DD')
        : moment(data.birthDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
      const emailAddress = removeExtraSpaces(data.emailAddress.toLowerCase());
      const employeeFullName = `${removeExtraSpaces(
        data.lastName
      )}, ${removeExtraSpaces(data.firstName)}${removeExtraSpaces(data.middleName)
          ? ' ' + removeExtraSpaces(data.middleName)
          : ''
        }${!removeExtraSpaces(data.suffix) ||
          removeExtraSpaces(data.suffix) == ''
          ? ''
          : romanNumeralRe.test(removeExtraSpaces(data.suffix))
            ? ', ' + removeExtraSpaces(data.suffix)
            : ', ' + removeExtraSpaces(data.suffix) + '.'
        }`;

      const duplicateEmail = await EmployeeProfile.findOne({
        attributes: ['employeeId', 'emailAddress'],
        where: {
          emailAddress: emailAddress,
          [Op.not]: {
            employeeId: employeeId,
          },
        },
        include: [
          {
            attributes: ['employeeId'],
            model: Employee,
            where: {
              deletedAt: null,
            },
            required: true,
          },
        ],
      });
      if (duplicateEmail) {
        errorMessages.push(`Email Address: ${emailAddress} already exists`);
      }

      const duplicatePN = await EmployeeProfile.findOne({
        attributes: ['employeeId', 'contactNumber'],
        where: {
          contactNumber: data.contactNumber,
          [Op.not]: {
            employeeId: employeeId,
          },
        },
        include: [
          {
            attributes: ['employeeId'],
            model: Employee,
            where: {
              deletedAt: null,
            },
            required: true,
          },
        ],
      });
      if (duplicatePN) {
        errorMessages.push(
          `Contact Number: ${data.contactNumber} already exists`
        );
      }

      if (errorMessages.length > 0) {
        allErrors.push({
          employeeFullName: employeeFullName,
          errorMessage: errorMessages,
        });
        continue;
      }

      if (allErrors.length > 0) {
        continue;
      }

      const registerEmployee: any = await registerEmployeeToKYC({
        mobileNumber: data.contactNumber,
        firstName: properCasing(data.firstName),
        lastName: properCasing(data.lastName),
        middleName: properCasing(data.middleName),
        suffix: removeExtraSpaces(data.suffix),
        email: emailAddress,
        addressL0Id: data.countryId,
        addressL1Id: data.provinceId,
        addressL2Id: data.cityId,
        otherAddress: properCasing(data.streetAddress),
        zipCode: data.zipCode,
        tierLabel: companyTierLabel,
        birthDate: moment(data.birthDate).format('YYYY-MM-DD'),
        placeOfBirth: properCasing(data.placeOfBirth),
        nationality: data.nationality
          ? data.nationality.toUpperCase()
          : data.nationality,
        gender: data.gender,
        civilStatus: properCasing(data.civilStatus),
      });

      let mlWalletStatus = 0;
      let mismatchedInfos = null;
      if (!registerEmployee.success) {
        if (registerEmployee.mismatchedInfos) {
          mlWalletStatus = 3;
          mismatchedInfos = registerEmployee.mismatchedInfos;
        } else {
          mlWalletStatus = 3;
          failedRegistrationRemarks = registerEmployee.message;
        }
      }

      const { responseData } = registerEmployee;
      const employeeTierLabel = responseData?.tier?.label ?? null;
      data.ckycId = responseData?.ckycId ?? null;
      data.mlWalletId = responseData?.moneyAccountId ?? null;

      await Employee.update(
        {
          tierLabel: employeeTierLabel,
          ckycId: data.ckycId,
          mlWalletStatus: mlWalletStatus,
          employeeStatus:
            modeOfPayroll == 'KWARTA PADALA' && mlWalletStatus != 3
              ? 1
              : mlWalletStatus,
          mlWalletId: data.mlWalletId,
          mismatchedInfos: mismatchedInfos,
          failedRegistrationRemarks: Array.isArray(failedRegistrationRemarks)
            ? failedRegistrationRemarks.join(', ')
            : failedRegistrationRemarks,
        },
        {
          where: {
            employeeId: data.employeeId,
          },
        }
      );

      await EmployeeProfile.update(
        {
          firstName: data.firstName,
          middleName: data.middleName,
          lastName: data.lastName,
          suffix: data.suffix,
          contactNumber: data.contactNumber,
          birthDate: data.birthDate,
          emailAddress: emailAddress,
        },
        {
          where: {
            employeeId: data.employeeId,
          },
        }
      );

      const password = generatePassword();
      const checkIfEmailReused: any = await User.findOne({
        where: {
          emailAddress: emailAddress,
        },
      });

      const userDetails: any = {};
      userDetails.employeeId = data.employeeId;
      userDetails.firstName = data.firstName;
      userDetails.middleName = data.middleName;
      userDetails.lastName = data.lastName;
      userDetails.suffix = romanNumeralRe.test(data.suffix)
        ? data.suffix.toUpperCase()
        : properCasing(data.suffix)
          ? ''
          : properCasing(data.suffix);
      userDetails.birthDate = data.birthDate;
      userDetails.emailAddress = emailAddress;
      userDetails.contactNumber = data.contactNumber;
      userDetails.username = emailAddress;
      userDetails.password = await bcrypt.hash(password, 10);
      const reuseDetailsForAdmin: any = await User.findOne({
        where: {
          [Op.or]: {
            emailAddress: emailAddress,
            contactNumber: data.contactNumber,
          },
          role: 'ADMIN',
          isActive: 1,
        },
      });
      const isDefaultAdmin =
        reuseDetailsForAdmin && reuseDetailsForAdmin.isDefault;
      if (reuseDetailsForAdmin) {
        if (isDefaultAdmin) {
          delete userDetails.role;
          delete userDetails.roleId;
        }
        userDetails['userId'] = reuseDetailsForAdmin.userId;
        userDetails.password = reuseDetailsForAdmin.password;
      }
      userDetails.isActive = MCASH_MLWALLET.includes(modeOfPayroll)
        ? isDefaultAdmin
          ? 1
          : 0
        : 1;
      await User.update(userDetails, {
        where: { employeeId: data.employeeId },
      });
      if (registerEmployee.success) {
        employeeCodes.push(data.employeeCode);
        if (MCASH_MLWALLET.includes(modeOfPayroll)) {
          // Insert verification code to DB
          const verificationCode = generateVerificationCode();
          await VerificationCode.create({
            employeeId: data.employeeId,
            generatedCode: verificationCode,
            contactNumber: data.contactNumber,
          });

          // Send Verification code via Email and SMS
          const logo = companyTierLabel;
          sendEmail({
            to: data.emailAddress,
            subject: `${verificationCode} is your verification code`,
            content: verifyUserEmailContent({
              verificationCode: verificationCode,
              logo: logo,
            }),
          });

          sendSMS({
            recepientNo: data.contactNumber,
            content: verifyUserSMSContent({
              verificationCode: verificationCode,
            }),
            sender: 'MLWALLET',
          });
        } else if (modeOfPayroll == 'KWARTA PADALA') {
          // Send Account Credentials via Email and SMS
          if (!checkIfEmailReused) {
            sendEmail({
              to: emailAddress,
              subject: `Account Credentials`,
              content: userCredentialEmailContent({
                username: emailAddress,
                password: password,
                logo: companyTierLabel,
              }),
            });

            sendSMS({
              recepientNo: data.contactNumber,
              content: userCredentialSMSContent({
                username: emailAddress,
                password: password,
                companyName: companyTierLabel,
                contactNumber: companyDetails.contactNumber,
                emailAddress: companyDetails.emailAddress,
              }),
              sender: 'MLHUILLIER',
            });
          }
        }
      }
    } // end of for loop

    let response = {
      success: true,
      severity: 'success',
      message: 'Successfully imported',
    };

    if (allErrors.length > 0) {
      response = {
        success: false,
        severity: 'error',
        message: allErrors,
      };
    } else {
      await ActivityLog.create({
        companyId: companyId,
        userId: userId,
        message: `Imported Employees [Employee Codes: ${employeeCodes.toString()}]`,
      });

      if (payload.length != employeeCodes.length) {
        response = {
          severity: 'warn',
          success: true,
          message:
            'Some rows were not successfully imported. Please check on Unregistered Employees section.',
        };
      }
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.log(error);
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.log(error);
    else
      return NextResponse.json(
        {
          success: false,
          message: 'Something went wrong...',
          error: { ...error },
        },
        { status: 500 }
      );
  }
}

export async function DELETE(req: Request, res: Response) {
  const userToken: any = req.headers.get('authorization');

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const data = await req.json();
    const checkUser: any = await User.findOne({
      attributes: ['userId', 'isDefault'],
      where: {
        employeeId: data.employeeId,
      },
    });
    const isDefaultAdmin: boolean = checkUser && checkUser.isDefault;

    if (isDefaultAdmin) {
      await User.update(
        { employeeId: null },
        { where: { employeeId: data.employeeId } }
      );
    } else {
      await User.update(
        {
          isActive: 0,
          deletedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        },
        { where: { employeeId: data.employeeId } }
      );
    }

    await Employee.destroy({ where: { employeeId: data.employeeId } });

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully Deleted',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log(error);
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.log(error);
    else
      return NextResponse.json(
        {
          success: false,
          message: 'Something went wrong...',
          error: { ...error },
        },
        { status: 500 }
      );
  }
}
