import moment from '@constant/momentTZ';
import { MCASH_MLWALLET } from '@constant/variables';
import { reuseUserDetailsForEmployeeReg } from '@utils/companyDetailsGetter';
import { checkNullRequiredProperties } from '@utils/employeeImport';
import { tokenChecker } from '@utils/externalApiFunctions';
import { properCasing, removeExtraSpaces, removeNYe } from '@utils/helper';
import { getRequestLogger } from '@utils/logger';
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
import bcrypt from 'bcrypt';
import connection from 'db/connection';
import {
  ActivityLog,
  City,
  Company,
  Country,
  Department,
  Employee,
  EmployeeBenefit,
  EmployeeLeave,
  EmployeeProfile,
  Province,
  Shift,
  User,
  UserRole,
  VerificationCode,
} from 'db/models';
import { NextRequest, NextResponse } from 'next/server';
const romanNumeralRe =
  /^(M{0,3})(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;

export async function POST(req: NextRequest) {
  const requestLogger = getRequestLogger(req);
  const userToken: any = req.headers.get('authorization');

  if (!(await tokenChecker(userToken))) {
    const response = {
      success: false,
      message: 'Invalid Token.',
      payload: {
        token: userToken,
      },
      statusCode: 401,
    };
    requestLogger.error({
      label: 'Import Employee',
      message: JSON.stringify(response),
    });
    return NextResponse.json(response, { status: response.statusCode });
  }

  try {
    const payload: EmployeeImportDetails = await req.json();
    let {
      taskCode,
      companyId,
      userId,
      shiftId,
      departmentId,
      employeeCode,
      role,
      lastName,
      firstName,
      middleName,
      suffix,
      hiringDate,
      startDate,
      contactNumber,
      emergencyContactNumber1,
      emergencyContactNumber2,
      emailAddress,
      streetAddress,
      city,
      province,
      country,
      zipCode,
      placeOfBirth,
      birthDate,
      gender,
      civilStatus,
      nationality,
      educationalAttainment,
      schoolGraduated,
      degree,
      positionTitle,
      dayOff,
      employmentStatus,
      modeOfPayroll,
      basicPay,
      tinNumber,
      allowance,
      vacationLeaveCredits,
      sickLeaveCredits,
      serviceIncentiveLeaveCredits,
      soloParentLeaveCredits,
      paternityLeaveCredits,
      maternityLeaveCredits,
      otherLeaveCredits,
      emergencyLeaveCredits,
      birthdayLeaveCredits,
      sssId,
      sssContributionRate,
      sssERShareRate,
      sssECShareRate,
      philHealthId,
      philHealthContributionRate,
      philHealthERShareRate,
      pagIbigId,
      pagIbigContributionRate,
      pagIbigERShareRate,
    } = payload;

    // Check payload
    const checkPayload = checkNullRequiredProperties(payload);
    if (!checkPayload.success) {
      return NextResponse.json(checkPayload, { status: 400 });
    }

    let cityId: any = null;
    let provinceId: any = null;
    let countryId: any = null;

    const acceptedSuffixes = ['JR', 'JRA', 'SR', 'I', 'II', 'III', 'IV', 'V'];
    let mlWalletStatus = 0;
    let mismatchedInfos: any = null;
    let employeeTierLabel: any = null;
    let failedRegistrationRemarks: any = null;
    let employeeId: any = null;
    let ckycId: any = null;
    let mlWalletId: any = null;
    modeOfPayroll = modeOfPayroll.toUpperCase();

    // if (typeof basicPay == 'string') {
    // basicPay = parseFloat(basicPay.replaceAll(',', ''));
    // }
    // if (typeof allowance == 'string' && allowance != '') {
    // allowance = parseFloat(allowance.replaceAll(',', ''));
    // }

    if (contactNumber.charAt(0) != '0') {
      contactNumber = `0${contactNumber}`;
    }
    // convert wrong format of ñ from excel
    firstName = removeNYe(firstName);
    lastName = removeNYe(lastName);
    middleName = middleName ? removeNYe(middleName) : null;
    suffix = suffix ? removeExtraSpaces(suffix).toUpperCase() : null;

    const employeeFullName = `${removeExtraSpaces(
      lastName
    )}, ${removeExtraSpaces(firstName)}${
      middleName ? ' ' + removeExtraSpaces(middleName) : ''
    }${!suffix ? '' : ', ' + removeExtraSpaces(suffix) + '.'}`;
    birthDate = moment(moment(birthDate)).isValid()
      ? moment(birthDate).format('YYYY-MM-DD')
      : moment(birthDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
    emailAddress = removeExtraSpaces(emailAddress.toLowerCase());

    // Get company details
    const companyDetails: any = await Company.findByPk(companyId, {
      attributes: [
        'tierLabel',
        'workingDays',
        'companyName',
        'emailAddress',
        'contactNumber',
      ],
    });
    if (!companyDetails) {
      const response = {
        success: false,
        message: `No company found with companyId ${companyId}.`,
        payload,
        statusCode: 404,
      };
      requestLogger.error({
        label: 'Import Employee',
        message: JSON.stringify(response),
      });
      return NextResponse.json(response, { status: response.statusCode });
    }

    // Check if suffix is valid
    if (suffix && !acceptedSuffixes.includes(suffix)) {
      const response = {
        success: false,
        message: `Invalid suffix ${suffix}. Please use one of these formats: ${acceptedSuffixes.join(
          ', '
        )}`,
        payload,
        statusCode: 400,
      };
      requestLogger.error({
        label: 'Import Employee',
        message: JSON.stringify(response),
      });
      return NextResponse.json(response, { status: response.statusCode });
    }

    // Check for duplicate employee codes
    const duplicateEmployeeCode = await Employee.findOne({
      attributes: ['employeeId', 'employeeCode'],
      where: {
        companyId: companyId,
        employeeCode: employeeCode,
      },
    });
    if (duplicateEmployeeCode) {
      const duplicateDetails = await EmployeeProfile.findOne({
        attributes: ['employeeId'],
        where: {
          firstName: firstName,
          lastName: lastName,
          contactNumber: contactNumber,
          emailAddress: emailAddress,
        },
      });

      if (duplicateDetails) {
        return NextResponse.json(
          {
            success: true,
            message: `${employeeFullName} already exists on the database.`,
          },
          { status: 200 }
        );
      } else {
        const response = {
          success: false,
          message: `Employee Code ${employeeCode} already exists.`,
          payload,
          statusCode: 400,
        };
        requestLogger.error({
          label: 'Import Employee',
          message: JSON.stringify(response),
        });
        return NextResponse.json(response, { status: response.statusCode });
      }
    }

    // Check for duplicate email address
    const duplicateEmailAddress = await EmployeeProfile.findOne({
      attributes: ['emailAddress'],
      where: {
        emailAddress: emailAddress,
      },
    });
    if (duplicateEmailAddress) {
      const response = {
        success: false,
        message: `Email Address ${emailAddress} already exists.`,
        payload,
        statusCode: 400,
      };
      requestLogger.error({
        label: 'Import Employee',
        message: JSON.stringify(response),
      });
      return NextResponse.json(response, { status: response.statusCode });
    }

    // Check for duplicate contact number
    const duplicateContactNo = await EmployeeProfile.findOne({
      attributes: ['contactNumber'],
      where: {
        contactNumber: contactNumber,
      },
    });
    if (duplicateContactNo) {
      const response = {
        success: false,
        message: `Contact number ${contactNumber} already exists.`,
        payload,
        statusCode: 400,
      };
      requestLogger.error({
        label: 'Import Employee',
        message: JSON.stringify(response),
      });
      return NextResponse.json(response, { status: response.statusCode });
    }

    // Check if city exists
    const getCity: any = await City.findOne({
      attributes: ['cityId', 'name'],
      where: {
        name: city.toUpperCase(),
      },
    });
    if (!getCity) {
      const response = {
        success: false,
        message: `City ${city.toUpperCase()} doesn't exist.`,
        payload,
        statusCode: 404,
      };
      requestLogger.error({
        label: 'Import Employee',
        message: JSON.stringify(response),
      });
      return NextResponse.json(response, { status: response.statusCode });
    } else {
      cityId = getCity.cityId;
    }

    // Check if province exists
    const getProvince: any = await Province.findOne({
      attributes: ['provinceId', 'name'],
      where: {
        name: province.toUpperCase(),
      },
    });
    if (!getProvince) {
      const response = {
        success: false,
        message: `Province ${province.toUpperCase()} doesn't exist.`,
        payload,
        statusCode: 404,
      };
      requestLogger.error({
        label: 'Import Employee',
        message: JSON.stringify(response),
      });
      return NextResponse.json(response, { status: response.statusCode });
    } else {
      provinceId = getProvince.provinceId;
    }

    // Check if country exists
    const getCountry: any = await Country.findOne({
      attributes: ['countryId', 'name'],
      where: {
        name: country.toUpperCase(),
      },
    });
    if (!getCountry) {
      const response = {
        success: false,
        message: `Country ${country.toUpperCase()} doesn't exist.`,
        payload,
        statusCode: 404,
      };
      requestLogger.error({
        label: 'Import Employee',
        message: JSON.stringify(response),
      });
      return NextResponse.json(response, { status: response.statusCode });
    } else {
      countryId = getCountry.countryId;
    }

    // get shift for getting working hours
    const shift: any = await Shift.findByPk(shiftId, {
      attributes: ['workingHours'],
    });
    if (!shift) {
      const response = {
        success: false,
        message: `No shift found with shiftId ${shiftId}.`,
        payload,
        statusCode: 404,
      };
      requestLogger.error({
        label: 'Import Employee',
        message: JSON.stringify(response),
      });
      return NextResponse.json(response, { status: response.statusCode });
    }

    // get department for getting working hours
    const department: any = await Department.findByPk(departmentId, {
      attributes: ['departmentId'],
    });
    if (!department) {
      const response = {
        success: false,
        message: `No department found with departmentId ${departmentId}.`,
        payload,
        statusCode: 404,
      };
      requestLogger.error({
        label: 'Import Employee',
        message: JSON.stringify(response),
      });
      return NextResponse.json(response, { status: response.statusCode });
    }

    // Check if user role exists
    const userRole: any = await UserRole.findOne({
      where: { companyId: companyId, roleName: role.toUpperCase() },
    });
    if (!userRole) {
      const response = {
        success: false,
        message: `No role found with role ${role.toUpperCase()}.`,
        payload,
        statusCode: 404,
      };
      requestLogger.error({
        label: 'Import Employee',
        message: JSON.stringify(response),
      });
      return NextResponse.json(response, { status: response.statusCode });
    }

    const registerEmployee: any = await registerEmployeeToKYC({
      mobileNumber: contactNumber,
      firstName: properCasing(firstName),
      lastName: properCasing(lastName),
      middleName: middleName ? properCasing(middleName) : '',
      suffix: suffix || '',
      email: emailAddress,
      addressL0Id: countryId,
      addressL1Id: provinceId,
      addressL2Id: cityId,
      otherAddress: properCasing(streetAddress),
      zipCode: zipCode,
      tierLabel: companyDetails.tierLabel,
      birthDate: birthDate,
      placeOfBirth: properCasing(placeOfBirth),
      nationality: nationality ? nationality.toUpperCase() : nationality,
      gender: gender,
      civilStatus: properCasing(civilStatus),
    });

    if (!registerEmployee.success) {
      if (registerEmployee.mismatchedInfos) {
        mlWalletStatus = 3;
        mismatchedInfos = registerEmployee.mismatchedInfos;
      } else {
        mlWalletStatus = 3;
        failedRegistrationRemarks = registerEmployee.message;
      }
      requestLogger.error({
        label: `Import Employee`,
        message: `${employeeCode}: ${JSON.stringify(registerEmployee)}`,
      });
    }
    const { responseData } = registerEmployee;
    employeeTierLabel = responseData?.tier?.label ?? null;
    ckycId = responseData?.ckycId ?? null;
    mlWalletId = responseData?.moneyAccountId ?? null;

    let autoComputeValues = {
      dailyRate: 0,
      overtimeRateRegDays: 0,
      overtimeRateHolidays: 0,
      overtimeRateRestDays: 0,
      sssContributionRate: 0,
      sssERShareRate: 0,
      sssECShareRate: 0,
      philHealthContributionRate: 0,
      philHealthERShareRate: 0,
      pagIbigContributionRate: 0,
      pagIbigERShareRate: 0,
    };

    autoComputeValues.dailyRate = +(
      (basicPay * 12) /
      companyDetails.workingDays
    ).toFixed(2);

    // get hourly rate for ot rate
    const hourlyRate = +(
      autoComputeValues.dailyRate / shift.workingHours
    ).toFixed(2);
    autoComputeValues.overtimeRateRegDays = +(hourlyRate * 1.25).toFixed(2);
    autoComputeValues.overtimeRateHolidays = +(hourlyRate * 1.69).toFixed(2);
    autoComputeValues.overtimeRateRestDays = +(hourlyRate * 1.69).toFixed(2);

    if (sssId !== '') {
      autoComputeValues.sssContributionRate = basicPay * 0.045;
      if (autoComputeValues.sssContributionRate > 900) {
        autoComputeValues.sssContributionRate = 900;
      }
      autoComputeValues.sssERShareRate = basicPay * 0.095;
      if (autoComputeValues.sssERShareRate > 1900) {
        autoComputeValues.sssERShareRate = 1900;
      }
      autoComputeValues.sssECShareRate = basicPay * 0.045;
      if (autoComputeValues.sssECShareRate > 900) {
        autoComputeValues.sssECShareRate = 900;
      }
    }
    if (philHealthId !== '') {
      autoComputeValues.philHealthContributionRate = basicPay * 0.02;
      autoComputeValues.philHealthERShareRate = basicPay * 0.02;
    }
    if (pagIbigId !== '') {
      autoComputeValues.pagIbigContributionRate = basicPay * 0.02;
      autoComputeValues.pagIbigERShareRate = basicPay * 0.02;
    }
    // calculate monthly allowance rate
    let monthlyAllowance = 0;
    if (allowance > 0) {
      monthlyAllowance = +(
        (allowance * companyDetails.workingDays) /
        12
      ).toFixed(2);
    }

    try {
      await connection.transaction(async (t: any) => {
        const insertEmployee: any = await Employee.create(
          {
            companyId: companyId,
            tierLabel: employeeTierLabel,
            employeeCode: employeeCode,
            ckycId: ckycId,
            mlWalletStatus: mlWalletStatus,
            employeeStatus:
              modeOfPayroll == 'KWARTA PADALA' && mlWalletStatus != 3
                ? 1
                : mlWalletStatus,
            mlWalletId: mlWalletId,
            hiringDate: hiringDate,
            startDate: startDate,
            employmentStatus: employmentStatus,
            dayOff: dayOff ?? '',
            basicPay: basicPay,
            dailyRate: autoComputeValues.dailyRate,
            monthlyAllowance: monthlyAllowance,
            allowance: allowance,
            tinNumber: tinNumber,
            overtimeRateRegDays: autoComputeValues.overtimeRateRegDays,
            overtimeRateHolidays: autoComputeValues.overtimeRateHolidays,
            overtimeRateRestDays: autoComputeValues.overtimeRateRestDays,
            positionTitle: positionTitle,
            applyWithholdingTax: true,
            modeOfPayroll: modeOfPayroll,
            mismatchedInfos: mismatchedInfos,
            shiftId: shiftId,
            departmentId: departmentId,
            failedRegistrationRemarks: failedRegistrationRemarks,
          },
          { transaction: t }
        );

        employeeId = insertEmployee.employeeId;

        await EmployeeLeave.create(
          {
            employeeId: employeeId,
            vacationLeaveCredits: vacationLeaveCredits,
            sickLeaveCredits: sickLeaveCredits,
            soloParentLeaveCredits: soloParentLeaveCredits,
            paternityLeaveCredits: paternityLeaveCredits,
            maternityLeaveCredits: maternityLeaveCredits,
            serviceIncentiveLeaveCredits: serviceIncentiveLeaveCredits,
            otherLeaveCredits: otherLeaveCredits,
            emergencyLeaveCredits: emergencyLeaveCredits,
            birthdayLeaveCredits: birthdayLeaveCredits,
          },
          { transaction: t }
        );

        await EmployeeBenefit.create(
          {
            employeeId: employeeId,
            sssId: sssId == '' ? null : sssId,
            sssContributionRate: sssContributionRate,
            sssERShareRate: sssERShareRate,
            sssECShareRate: sssECShareRate,
            philHealthId: philHealthId == '' ? null : philHealthId,
            philHealthContributionRate: philHealthContributionRate,
            philHealthERShareRate: philHealthERShareRate,
            pagIbigId: pagIbigId == '' ? null : pagIbigId,
            pagIbigContributionRate: pagIbigContributionRate,
            pagIbigERShareRate: pagIbigERShareRate,
          },
          { transaction: t }
        );

        await EmployeeProfile.create(
          {
            employeeId: employeeId,
            firstName: firstName,
            middleName: middleName,
            lastName: lastName,
            suffix: suffix,
            contactNumber: contactNumber,
            emergencyContactNumber1: emergencyContactNumber1,
            emergencyContactNumber2: emergencyContactNumber2,
            birthDate: birthDate,
            emailAddress: emailAddress,
            streetAddress: streetAddress,
            cityId: cityId,
            provinceId: provinceId,
            countryId: countryId,
            zipCode: zipCode,
            educationalAttainment: educationalAttainment,
            schoolGraduated: schoolGraduated,
            degree: degree,
            gender: gender,
            placeOfBirth: placeOfBirth,
            nationality: nationality,
            civilStatus: civilStatus,
          },
          { transaction: t }
        );

        // Create User Account
        const password = generatePassword();
        const checkIfEmailReused: any = await User.findOne({
          where: {
            emailAddress: emailAddress,
          },
        });

        const logo = companyDetails.tierLabel;
        const userDetails: any = {};
        userDetails.employeeId = employeeId;
        userDetails.companyId = companyId;
        userDetails.role = userRole.roleName;
        userDetails.roleId = userRole.userRoleId;
        userDetails.firstName = firstName;
        userDetails.middleName = middleName;
        userDetails.lastName = lastName;
        userDetails.suffix = suffix;
        userDetails.birthDate = birthDate;
        userDetails.emailAddress = emailAddress;
        userDetails.contactNumber = contactNumber;
        userDetails.username = emailAddress;
        userDetails.password = await bcrypt.hash(password, 10);
        const reuseUserDetails: any = await reuseUserDetailsForEmployeeReg({
          emailAddress: emailAddress,
          contactNumber: contactNumber,
        });
        const isDefaultAdmin = reuseUserDetails && reuseUserDetails.isDefault;
        if (reuseUserDetails) {
          if (isDefaultAdmin) {
            delete userDetails.role;
            delete userDetails.roleId;
          }
          userDetails['userId'] = reuseUserDetails.userId;
          userDetails.password = reuseUserDetails.password;
        }
        userDetails.isActive = MCASH_MLWALLET.includes(modeOfPayroll)
          ? isDefaultAdmin
            ? 1
            : 0
          : 1;
        await User.upsert(userDetails, { transaction: t });

        if (registerEmployee.success) {
          if (MCASH_MLWALLET.includes(modeOfPayroll)) {
            // Insert verification code to DB
            const verificationCode = generateVerificationCode();
            await VerificationCode.create(
              {
                employeeId: employeeId,
                generatedCode: verificationCode,
                contactNumber: contactNumber,
              },
              { transaction: t }
            );

            // Send Verification code via Email and SMS
            sendEmail({
              to: emailAddress,
              subject: `${verificationCode} is your verification code`,
              content: verifyUserEmailContent({
                verificationCode: verificationCode,
                logo: logo,
              }),
            });

            sendSMS({
              recepientNo: contactNumber,
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
                  logo: logo,
                }),
              });

              sendSMS({
                recepientNo: contactNumber,
                content: userCredentialSMSContent({
                  username: emailAddress,
                  password: password,
                  companyName: companyDetails.companyName,
                  contactNumber: companyDetails.contactNumber,
                  emailAddress: companyDetails.emailAddress,
                }),
                sender: 'MLHUILLIER',
              });
            }
          }
        }
      });
    } catch (error: any) {
      console.log(error);
      const response = {
        success: false,
        message: `${employeeFullName}: ${error.message}`,
        payload,
        statusCode: 500,
      };
      requestLogger.error({
        label: 'Import Employee',
        message: JSON.stringify(response),
      });
      return NextResponse.json(response, { status: response.statusCode });
    }

    await ActivityLog.create({
      companyId: companyId,
      userId: userId,
      message: `${employeeFullName} has been inserted successfully`,
    });

    return NextResponse.json(
      {
        success: true,
        message: `${employeeFullName} has been inserted successfully`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log(error);

    requestLogger.error({
      label: 'Import Employee',
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
