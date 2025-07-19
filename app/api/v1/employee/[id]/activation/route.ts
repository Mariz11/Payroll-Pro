import moment from '@constant/momentTZ';
import { tokenChecker } from '@utils/externalApiFunctions';
import { getRequestLogger } from '@utils/logger';
import {
  userCredentialEmailContent,
  userCredentialSMSContent,
} from '@utils/notificationContentFormatter';
import { generatePassword, sendEmail, sendSMS } from '@utils/partnerAPIs';
import bcrypt from 'bcrypt';
import {
  Company,
  Employee,
  EmployeeProfile,
  User,
  UserRole,
  VerificationCode,
} from 'db/models';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestLogger = getRequestLogger(req);
  const userToken: any = req.headers.get('authorization');

  if (!(await tokenChecker(userToken))) {
    requestLogger.error({
      label: 'MCash Activation',
      message: JSON.stringify({
        success: false,
        message: 'Invalid Token.',
        statusCode: 401,
      }),
    });
    return NextResponse.json(
      { success: false, message: 'Invalid Token.', statusCode: 401 },
      { status: 401 }
    );
  }

  try {
    const { verificationCode } = await req.json();
    const ckycId = params.id;

    if (!verificationCode || !ckycId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Verification Code is required.',
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    const employee: any = await Employee.findOne({
      where: {
        ckycId: ckycId,
      },
      include: [
        { model: EmployeeProfile },
        {
          model: Company,
          attributes: ['contactNumber', 'emailAddress'],
        },
      ],
    });

    const verifyCode: any = await VerificationCode.findOne({
      where: {
        employeeId: employee.employeeId,
        generatedCode: verificationCode,
        isUsed: false,
        isExpired: false,
      },
    });

    if (!verifyCode) {
      requestLogger.error({
        label: 'MCash Activation',
        message: JSON.stringify({
          success: false,
          message: 'Incorrect Verification Code provided.',
          payload: {
            ckycId: ckycId,
            verificationCode: verificationCode,
          },
          statusCode: 401,
        }),
      });
      return NextResponse.json(
        {
          success: false,
          message: 'Incorrect Verification Code provided.',
          statusCode: 401,
        },
        { status: 401 }
      );
    } else {
      // Check if expired
      const createdAt = moment(verifyCode.createdAt).add(1, 'days');
      const currentDateTime = moment();

      if (currentDateTime > createdAt) {
        await VerificationCode.update(
          {
            isExpired: 1,
          },
          {
            where: {
              employeeId: employee.employeeId,
              generatedCode: verificationCode,
            },
          }
        );
        requestLogger.error({
          label: 'MCash Activation',
          message: JSON.stringify({
            success: false,
            message: 'Verification Code has expired.',
            payload: {
              ckycId: ckycId,
              verificationCode: verificationCode,
            },
            statusCode: 403,
          }),
        });
        return NextResponse.json(
          {
            success: false,
            message: 'Verification Code has expired',
            statusCode: 403,
          },
          { status: 403 }
        );
      } else {
        await VerificationCode.update(
          {
            isUsed: 1,
          },
          {
            where: {
              employeeId: employee.employeeId,
              generatedCode: verificationCode,
            },
          }
        );

        await Employee.update(
          {
            employeeStatus: 1,
            mlWalletStatus: 1,
          },
          {
            where: {
              employeeId: employee.employeeId,
            },
          }
        );

        // User Account details
        const firstName = employee?.employee_profile?.firstName;
        const middleName = employee?.employee_profile?.middleName;
        const lastName = employee?.employee_profile?.lastName;
        const suffix = employee?.employee_profile?.suffix;
        const birthDate = employee?.employee_profile?.birthDate;
        const contactNumber = employee?.employee_profile?.contactNumber;
        const employeeId = employee.employeeId;
        const companyId = employee.companyId;
        const emailAddress = employee?.employee_profile?.emailAddress;
        const username = emailAddress;
        const password = generatePassword();
        const hashedPass = await bcrypt.hash(password, 10);

        const checkIfEmailReused: any = await User.findOne({
          where: {
            emailAddress: emailAddress,
          },
        });

        if (checkIfEmailReused) {
          await User.update(
            {
              employeeId: employeeId,
              companyId: companyId,
              firstName: firstName,
              middleName: middleName,
              lastName: lastName,
              suffix: suffix,
              birthDate: birthDate,
              emailAddress: emailAddress,
              contactNumber: contactNumber,
              username: emailAddress,
              isActive: 1,
              password: hashedPass,
            },
            {
              where: {
                userId: checkIfEmailReused.userId,
              },
            }
          );
        } else {
          // Check if user account already exists
          const checkIfEmployeeHasAccount: any = await User.findOne({
            where: {
              employeeId: employeeId,
            },
          });

          if (checkIfEmployeeHasAccount) {
            const role: any = await UserRole.findOne({
              where: {
                userRoleId: checkIfEmployeeHasAccount.roleId,
              },
            });

            await User.update(
              {
                isActive: 1,
                password: hashedPass,
                role: role.roleName,
                roleId: role.roleId,
              },
              {
                where: {
                  userId: checkIfEmployeeHasAccount.userId,
                  employeeId: employeeId,
                },
              }
            );
          } else {
            // Create User Account
            const role: any = await UserRole.findOne({
              where: { companyId: companyId, roleName: 'EMPLOYEE' },
            });
            await User.create({
              employeeId: employeeId,
              companyId: companyId,
              role: role.roleName,
              roleId: role.userRoleId,
              firstName: firstName,
              middleName: middleName,
              lastName: lastName,
              suffix: suffix,
              birthDate: birthDate,
              emailAddress: emailAddress,
              contactNumber: contactNumber,
              username: emailAddress,
              isActive: 1,
              password: hashedPass,
            });
          }
        }

        // Send Account Credentials via Email and SMS
        sendEmail({
          to: emailAddress,
          subject: `Account Credentials`,
          content: userCredentialEmailContent({
            username: username,
            password: password,
            logo: employee.tierLabel,
          }),
        });

        sendSMS({
          recepientNo: employee.employee_profile.contactNumber,
          content: userCredentialSMSContent({
            username: username,
            password: password,
            companyName: employee.tierLabel,
            contactNumber: employee.company.contactNumber,
            emailAddress: employee.company.emailAddress,
          }),
          sender: 'MLHUILLIER',
        });

        requestLogger.info({
          label: 'MCash Activation',
          message: JSON.stringify({
            success: true,
            message: 'Verification successful.',
            payload: {
              ckycId: ckycId,
              verificationCode: verificationCode,
            },
            statusCode: 200,
          }),
        });
        return NextResponse.json(
          {
            success: true,
            message: 'Verification successful.',
            statusCode: 200,
          },
          { status: 200 }
        );
      }
    }
  } catch (error: any) {
    console.log(error);

    requestLogger.error({
      label: 'MCash Activation',
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
