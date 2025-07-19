import { hasHtmlTags, hasSQLKeywords, toTitleCase, properCasing } from "@utils/helper";
import { executeQuery } from "db/connection";
import spCount, { CountDataProps } from '@utils/spCount';
import { EmployeeId, EmployeeDataProps, KYCDataProps } from "lib/interfaces";
import { generateVerificationCode, registerEmployeeToKYC, getEmployeeLoans, updateEmployeeKYCInfo } from '@utils/partnerAPIs';
import moment from '@constant/momentTZ';
import { MCASH_MLWALLET, EMPLOYEE_STATUS, ML_WALLET_STATUS } from '@constant/variables';
import { SERVICE_NAME } from '@constant/partnerAPIDetails';
import { getCKYCInfo } from '@utils/partnerApiServerUtils';
import { QueryTypes } from 'sequelize';
import validateSchema from "@utils/validateSchema";
import {
  SCHEMA_ALLOWANCE_BREAKDOWN,
  SCHEMA_EMPLOYEES_BENEFITS,
  SCHEMA_EMPLOYEES_LEAVES,
  SCHEMA_EMPLOYEES_PROFILES,
  SCHEMA_EMPLOYEES,
  SCHEMA_USER_ROLES,
  SCHEMA_USERS
} from 'lib/schemas';
import {
  EMPLOYEES_SEARCH,
  COMPANIES_GET_ONE,
  EMPLOYEES_COUNT,
  EMPLOYEES_PROFILE_COUNT,
  USER_ROLES_GET_ONE,
  EMPLOYEES_GET,
  EMPLOYEE_BENEFITS_GET,
  USER_ROLES_GET,
  USER_GET_ADMIN_USER,
  USERS_GET,
  EMPLOYEES_INSERT,
  ALLOWANCE_BREAKDOWNS_INSERT_EMPLOYEE,
  EMPLOYEES_UPDATE_ALLOWANCE_BREAKDOWN,
  EMPLOYEE_LEAVES_INSERT,
  EMPLOYEE_BENEFITS_INSERT,
  EMPLOYEE_PROFILE_INSERT,
  EMPLOYEES_UPDATE_KYC,
  EMPLOYEES_ACTIVATE,
  USERS_UPDATE_EMPLOYEE,
  USERS_INSERT,
  VERIFICATION_CODES_INSERT,
  ALLOWANCE_BREAKDOWNS_UPDATE_EMPLOYEE,
  COMPANIES_UPDATE_CONTACT_INFO,
  EMPLOYEE_BENEFITS_UPDATE,
  EMPLOYEE_LEAVES_UPDATE,
  EMPLOYEE_PROFILE_UPDATE,
  EMPLOYEES_UPDATE,
  ATTENDANCES_GET_CHECK_UNPOSTED,
  ATTENDANCE_APPLICATIONS_CHECK_UNAPPROVED,
  DEDUCTION_GET_CHECK_UNPOSTED,
  DEDUCTION_GET_CHECK_UNSETTLED,
  EMPLOYEES_DEACTIVATE,
  EMPLOYEES_DELETE,
  PAYROLLS_GET_CHECK_UNPOSTED,
  USERS_ACTIVE,
  USERS_DEACTIVE,
  USERS_DELETE,
  VERIFICATION_CODES_UPDATE_EXPIRY,
  USERS_UPDATE_EMPLOYEE_ID
} from '@constant/storedProcedures';
import { transformPaginatedData } from "@utils/transformPaginatedData";
import { QueryReturnTypeEnum } from "@enums/query-return-type";

export class Employee {
  public data: EmployeeDataProps = {};
  private invalids: string[] = [];
  public validationErrors: string[] = [];

  public getData(): EmployeeDataProps {
    return this.data;
  }

  public setData(data: EmployeeDataProps): this {
    this.data = { ...data };

    return this;
  }

  public updateData(updatedData: Partial<EmployeeDataProps>): this {
    this.data = { ...this.data, ...updatedData };
    return this;
  }

  public checkScriptTags(): void {
    const errKeys: string[] = Object.keys(this.data).filter((key: string) => hasHtmlTags(this.data[key]));
    if (errKeys.length) {
      const formattedKeys: string[] = errKeys.map((key: string) => toTitleCase(key.replace(/([A-Z])/g, ' $1').trim()));
      this.validationErrors.push(`Inputs contain possible script tags: ${formattedKeys.join(', ')}`);
    }
  }

  public checkSQLInjection(): void {
    const errKeys: string[] = Object.keys(this.data).filter((key: string) => hasSQLKeywords(this.data[key]));
    if (errKeys.length) {
      const formattedKeys: string[] = errKeys.map((key: string) => toTitleCase(key.replace(/([A-Z])/g, ' $1').trim()));
      this.validationErrors.push(`Inputs contain possible SQL injection: ${formattedKeys.join(', ')}`);
    }
  }

  public async checkDuplicate(): Promise<void> {
    const { employeeId, companyId, employeeCode, emailAddress, contactNumber } = this.data;

    const extraLogic: Partial<EmployeeDataProps> = {};
    if (employeeId) extraLogic.employeeId = employeeId;

    const countData: Record<keyof CountDataProps, { storedProcName: string; params: object }> = {
      employeeCode: { storedProcName: EMPLOYEES_COUNT, params: { companyId: companyId, employeeCode: employeeCode, ...extraLogic } },
      emailAddress: { storedProcName: EMPLOYEES_PROFILE_COUNT, params: { emailAddress: emailAddress, ...extraLogic } },
      contactNumber: { storedProcName: EMPLOYEES_PROFILE_COUNT, params: { contactNumber: contactNumber, ...extraLogic } },
    };
    const countResults = await Promise.all(Object.entries(countData).map(async ([key, { storedProcName, params }]) =>
      (await spCount(storedProcName, params)) > 0 ? key : null
    ));
    const countErrors = countResults.filter(Boolean).map(key => key.replace(/([A-Z])/g, ' $1').trim());
    if (countErrors.length) this.validationErrors.push(`Following already exists: ${countErrors.map(toTitleCase).join(', ')}`);
  }

  public async checkFields(): Promise<void> {
    const schema = Object.assign(
      {},
      SCHEMA_ALLOWANCE_BREAKDOWN,
      SCHEMA_EMPLOYEES_BENEFITS,
      SCHEMA_EMPLOYEES_LEAVES,
      SCHEMA_EMPLOYEES_PROFILES,
      SCHEMA_USER_ROLES,
      SCHEMA_USERS,
      SCHEMA_EMPLOYEES
    );

    const { mergedData, mergedErrors } = await validateSchema(this.data, schema);
    if (mergedErrors.length) this.validationErrors = [...this.validationErrors, ...mergedErrors];
    this.updateData(mergedData);
  }

  public async checkAttendance(): Promise<void> {
    const [result]: any = await executeQuery(ATTENDANCES_GET_CHECK_UNPOSTED, {
      employeeId: this.data.employeeId
    });

    if (result?.totalCount > 0) {
      this.validationErrors.push('Unable to proceed because this employee still has attendance entries with a pending status.');
    }
  }

  public async checkPayroll(): Promise<void> {
    const [result]: any = await executeQuery(PAYROLLS_GET_CHECK_UNPOSTED, {
      employeeId: this.data.employeeId
    });

    if (result?.totalCount > 0) {
      this.validationErrors.push('Unable to proceed because this employee still has payroll entries with a pending status.');
    }
  }

  public async checkAttendanceApp(): Promise<void> {
    const [result]: any = await executeQuery(ATTENDANCE_APPLICATIONS_CHECK_UNAPPROVED, {
      employeeId: this.data.employeeId
    });

    if (result?.totalCount > 0) {
      this.validationErrors.push('Unable to proceed because this employee still has attendance application entries with a pending status.');
    }
  }

  public async checkPendingDeduction(): Promise<void> {
    const [result]: any = await executeQuery(DEDUCTION_GET_CHECK_UNPOSTED, {
      employeeId: this.data.employeeId
    });

    if (result?.totalCount > 0) {
      this.validationErrors.push('Unable to proceed because this employee still has deduction entries with a pending status.');
    }
  }

  public async checkUnsettledDeductions(): Promise<void> {
    const [result]: any = await executeQuery(DEDUCTION_GET_CHECK_UNSETTLED, {
      employeeId: this.data.employeeId
    });

    if (result?.totalCount > 0) {
      this.validationErrors.push('Unable to proceed because this employee still has unsettled deduction(s).');
    }
  }

  public async checkLoan(): Promise<void> {
    const { modeOfPayroll } = this.data;
    if (modeOfPayroll !== 'KWARTA PADALA') return;

    const getLoans = await getEmployeeLoans({ ckycId: this.data.ckycId });
    if (getLoans.success) {
      const loans = getLoans.data;
      if (loans.length > 0) {
        if (
          loans.filter(
            (loan: any) =>
              loan.status == 'DISBURSED' &&
              loan.loan_type.loan_type_name == 'Salary Loan'
          ).length > 0
        ) {
          this.validationErrors.push('Unable to update Mode of Payroll to Kwarta Padala as this employee has a disbursed Salary Loan.');
        }
      }
    }
  }

  public getCheckErrors(): string[] {
    if (this.invalids.length)
      this.validationErrors.push(`Following has invalid format: ${this.invalids.join(', ')}`);

    return [...this.validationErrors];
  }

  public async getEmployee(): Promise<any> {
    const [result] = await executeQuery(EMPLOYEES_GET, {
      employeeId: this.data.employeeId
    });

    return result;
  }

  public async getBenefit(): Promise<any> {
    const [benefits] = await executeQuery(EMPLOYEE_BENEFITS_GET, {
      employeeId: this.data.employeeId
    });

    return benefits;
  }

  public async getCompanyDetails(): Promise<any> {
    try {
      const [companyDetails]: any = await executeQuery(COMPANIES_GET_ONE, {
        companyId: this.data.companyId
      });

      return companyDetails;
    } catch (error) {
      let errorMessage = "Something went wrong while getting company details";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      throw new Error(errorMessage);
    }
  }

  public async getRole(): Promise<any> {
    try {
      const [selectedRole]: any = await executeQuery(USER_ROLES_GET, {
        companyId: this.data.companyId,
        userRoleId: this.data.userRoleId,
      });

      return selectedRole;
    } catch (error) {
      let errorMessage = "Something went wrong while getting employee role";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      throw new Error(errorMessage);
    }
  }

  public async getRoleByName(name: string): Promise<any> {
    try {
      const [result] = await executeQuery(USER_ROLES_GET_ONE, {
        companyId: this.data.companyId,
        roleName: name
      });

      return result;
    } catch (error) {
      let errorMessage = "Something went wrong while getting employee role";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      throw new Error(errorMessage);
    }
  }

  public async getAdminUser(): Promise<any> {
    try {
      const [adminUser]: any = await executeQuery(USER_GET_ADMIN_USER, {
        emailAddress: this.data.emailAddress,
        contactNumber: this.data.contactNumber
      });

      return adminUser;
    } catch (error) {
      let errorMessage = "Something went wrong while getting admin user";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      throw new Error(errorMessage);
    }
  }

  public async getUser(): Promise<any> {
    try {
      const [user]: any = await executeQuery(USERS_GET, {
        employeeId: this.data.employeeId,
      });

      return user;
    } catch (error) {
      let errorMessage = "Something went wrong while getting user";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      throw new Error(errorMessage);
    }
  }

  public async searchEmployees({ companyId, departmentId, modeOfPayroll, search, limit, offset }: {
    companyId: number,
    departmentId: string,
    modeOfPayroll: string,
    search: string,
    offset: number,
    limit: number
  }): Promise<{} | undefined> {
    try {
      const batchUploads = await executeQuery(
        EMPLOYEES_SEARCH, { companyId, departmentId, modeOfPayroll, search, limit, offset },
        [], QueryTypes.SELECT, null, QueryReturnTypeEnum.RAW
      );
      const hasContent = batchUploads.length === 3;
      const batchResult = hasContent ? transformPaginatedData(batchUploads) : undefined;

      return {
        count: batchResult?.count ?? 0,
        rows: batchResult?.rows ?? [],
      };
    } catch (error) {
      let errorMessage = "Something went wrong while searching employees";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      throw new Error(errorMessage);
    }
  }

  public async addKYC(): Promise<any> {
    try {
      const requestData: KYCDataProps = {
        mobileNumber: this.data.contactNumber,
        firstName: properCasing(this.data.firstName),
        lastName: properCasing(this.data.lastName),
        middleName: this.data.middleName ? properCasing(this.data.middleName) : '',
        suffix: this.data.suffix,
        email: this.data.emailAddress,
        addressL0Id: Number(this.data.countryId),
        addressL1Id: Number(this.data.provinceId),
        addressL2Id: Number(this.data.cityId),
        otherAddress: properCasing(this.data.streetAddress),
        zipCode: this.data.zipCode, // !Important: Not a string to avoid error "Incorrect integer value: 'NULL' for column 'p_zip_code' at row 1"
        tierLabel: this.data.tierLabel,
        birthDate: moment(this.data.birthDate).format('YYYY-MM-DD'),
        placeOfBirth: properCasing(this.data.placeOfBirth),
        nationality: this.data.nationality,
        gender: this.data.gender,
        civilStatus: properCasing(this.data.civilStatus),
      };

      return await registerEmployeeToKYC(requestData);
    } catch (error) {
      let errorMessage = "Something went wrong while adding employee KYC";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      throw new Error(errorMessage);
    }
  }

  public async addEmployee(): Promise<EmployeeId> {
    try {
      const [employeeId]: any = await executeQuery(EMPLOYEES_INSERT, {
        employeeCode: this.data.employeeCode,
        companyId: this.data.companyId,
        tierLabel: this.data.tierLabel,
        ckycId: this.data.ckycId,
        mlWalletId: this.data.mlWalletId,
        departmentId: this.data.departmentId,
        shiftId: this.data.shiftId,
        hiringDate: this.data.hiringDate,
        startDate: this.data.startDate,
        employeeStatus: this.data.employeeStatus,
        employmentStatus: this.data.employmentStatus,
        dayOff: this.data.dayOff,
        dailyRate: this.data.dailyRate,
        basicPay: this.data.basicPay,
        monthlyAllowance: this.data.monthlyAllowance,
        allowance: this.data.allowance,
        tinNumber: this.data.tinNumber,
        overtimeRateRegDays: this.data.overtimeRateRegDays,
        overtimeRateHolidays: this.data.overtimeRateHolidays,
        overtimeRateRestDays: this.data.overtimeRateRestDays,
        positionTitle: this.data.positionTitle,
        modeOfPayroll: this.data.modeOfPayroll,
        applyWithholdingTax: this.data.applyWithholdingTax,
        referenceFiles: this.data.referenceFiles,
        isMonthlyRated: this.data.isMonthlyRated
      }, [], QueryTypes.INSERT);

      return employeeId;
    } catch (error) {
      let errorMessage = "Something went wrong while adding employee";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      throw new Error(errorMessage);
    }
  }

  public async addAllowanceBreakdowns() {
    try {
      const { employeeId } = this.data;
      if (!employeeId) throw new Error('No employee id generated');

      const [allowanceBreakdownId]: any = await executeQuery(ALLOWANCE_BREAKDOWNS_INSERT_EMPLOYEE, {
        companyId: this.data.companyId,
        employeeId,
        allowanceType: this.data.allowanceType,
        monthlyAmounts: this.data.monthlyAmounts,
        dailyAmounts: this.data.dailyAmounts
      }, [], QueryTypes.INSERT);

      return allowanceBreakdownId;
    } catch (error) {
      let errorMessage = "Something went wrong while adding employee allowance breakdown";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      throw new Error(errorMessage);
    }
  }

  public async addLeaves() {
    try {
      await executeQuery(EMPLOYEE_LEAVES_INSERT, {
        employeeId: this.data.employeeId,
        vacationLeaveCredits: this.data.vacationLeaveCredits,
        sickLeaveCredits: this.data.sickLeaveCredits,
        soloParentLeaveCredits: this.data.soloParentLeaveCredits,
        paternityLeaveCredits: this.data.paternityLeaveCredits,
        maternityLeaveCredits: this.data.maternityLeaveCredits,
        serviceIncentiveLeaveCredits: this.data.serviceIncentiveLeaveCredits,
        otherLeaveCredits: this.data.otherLeaveCredits,
        emergencyLeaveCredits: this.data.emergencyLeaveCredits,
        birthdayLeaveCredits: this.data.birthdayLeaveCredits,
      }, [], QueryTypes.INSERT);
    } catch (error) {
      let errorMessage = "Something went wrong while adding employee leaves";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      throw new Error(errorMessage);
    }
  }

  public async addBenefits() {
    try {
      await executeQuery(EMPLOYEE_BENEFITS_INSERT, {
        employeeId: this.data.employeeId,
        sssId: this.data.sssId,
        sssContributionRate: this.data.sssContributionRate,
        sssERShareRate: this.data.sssERShareRate,
        sssECShareRate: this.data.sssECShareRate,
        philHealthId: this.data.philHealthId,
        philHealthContributionRate: this.data.philHealthContributionRate,
        philHealthERShareRate: this.data.philHealthERShareRate,
        pagIbigId: this.data.pagIbigId,
        pagIbigContributionRate: this.data.pagIbigContributionRate,
        pagIbigERShareRate: this.data.pagIbigERShareRate,
      }, [], QueryTypes.INSERT);
    } catch (error) {
      let errorMessage = "Something went wrong while adding employee benefits";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      throw new Error(errorMessage);
    }
  }

  public async addProfile() {
    try {
      await executeQuery(EMPLOYEE_PROFILE_INSERT, {
        employeeId: this.data.employeeId,
        firstName: this.data.firstName,
        middleName: this.data.middleName,
        lastName: this.data.lastName,
        suffix: this.data.suffix,
        profilePicture: this.data.profilePicture,
        contactNumber: this.data.contactNumber,
        emergencyContactNumber1: this.data.emergencyContactNumber1,
        emergencyContactNumber2: this.data.emergencyContactNumber2,
        birthDate: this.data.birthDate,
        emailAddress: this.data.emailAddress,
        streetAddress: this.data.streetAddress,
        cityId: this.data.cityId,
        provinceId: this.data.provinceId,
        countryId: this.data.countryId,
        zipCode: this.data.zipCode,
        educationalAttainment: this.data.educationalAttainment,
        schoolGraduated: this.data.schoolGraduated,
        degree: this.data.degree,
        gender: this.data.gender,
        placeOfBirth: this.data.placeOfBirth,
        nationality: this.data.nationality,
        civilStatus: this.data.civilStatus
      }, [], QueryTypes.INSERT);
    } catch (error) {
      let errorMessage = "Something went wrong while adding employee profile";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      throw new Error(errorMessage);
    }
  }

  public async addNormalUser(hashPass: string) {
    try {
      const selectedRole = await this.getRole();

      await executeQuery(USERS_INSERT,
        {
          companyId: this.data.companyId,
          employeeId: this.data.employeeId,
          firstName: this.data.firstName,
          middleName: this.data.middleName,
          lastName: this.data.lastName,
          suffix: this.data.suffix,
          birthDate: this.data.birthDate,
          contactNumber: this.data.contactNumber,
          emailAddress: this.data.emailAddress,
          username: this.data.emailAddress,
          password: hashPass,
          isActive: MCASH_MLWALLET.includes(this.data.modeOfPayroll) ? 0 : 1,
          role: selectedRole.roleName,
          roleId: selectedRole.userRoleId,
        }, [], QueryTypes.INSERT
      );
    } catch (error) {
      let errorMessage = "Something went wrong while adding normal user";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      throw new Error(errorMessage);
    }
  }

  public async addAdminUser(adminUser) {
    try {

      let role = adminUser.role ?? '';
      let roleId = adminUser.roleId ?? null;

      const isDefaultAdmin = adminUser && adminUser.isDefault;

      if (!isDefaultAdmin) {
        const selectedRole = await this.getRole();

        role = selectedRole.roleName;
        roleId = selectedRole.userRoleId;
      }

      await executeQuery(`users_update_employee_data`,
        {
          user_id: adminUser.userId,
          company_id: this.data.companyId,
          employee_id: this.data.employeeId,
          first_name: this.data.firstName,
          middle_name: this.data.middleName,
          last_name: this.data.lastName,
          suffix: this.data.suffix,
          birth_date: this.data.birthDate,
          contact_number: this.data.contactNumber,
          email_address: this.data.emailAddress,
          username: this.data.emailAddress,
          role: role,
          role_id: roleId,
          is_active: MCASH_MLWALLET.includes(this.data.modeOfPayroll) ? isDefaultAdmin ? 1 : 0 : 1
        }, [], QueryTypes.UPDATE
      );
    } catch (error) {
      let errorMessage = "Something went wrong while adding admin user";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      throw new Error(errorMessage);
    }
  }

  public async addVerificationCode() {
    const verificationCode = generateVerificationCode();

    await executeQuery(VERIFICATION_CODES_INSERT, {
      employeeId: this.data.employeeId,
      generatedCode: verificationCode,
      contactNumber: this.data.contactNumber
    }, [], QueryTypes.INSERT);

    return verificationCode;
  }

  public async updateKYC(userId: string): Promise<any> {
    try {
      const ckyInfo: any = await getCKYCInfo({ ckycId: this.data.ckycId });
      if (!ckyInfo.success) return ckyInfo;

      const ckycData: UpdateEmployeePayload = ckyInfo.responseData.data;
      ckycData.addresses.current.addressL0Id = Number(this.data.countryId);
      ckycData.addresses.current.addressL1Id = Number(this.data.provinceId);
      ckycData.addresses.current.addressL2Id = Number(this.data.cityId);
      ckycData.addresses.current.otherAddress = this.data.streetAddress;
      ckycData.addresses.current.zipCode = this.data.zipCode; // !Important: Not a string to avoid error "Incorrect integer value: 'NULL' for column 'p_zip_code' at row 1"
      ckycData.addresses.permanent.addressL0Id = Number(this.data.countryId);
      ckycData.addresses.permanent.addressL1Id = Number(this.data.provinceId);
      ckycData.addresses.permanent.addressL2Id = Number(this.data.cityId);
      ckycData.addresses.permanent.otherAddress = this.data.streetAddress;
      ckycData.name.firstName = this.data.firstName;
      ckycData.name.lastName = this.data.lastName;
      ckycData.name.middleName = this.data.middleName || '';
      ckycData.name.suffix = this.data.suffix;
      ckycData.birthDate = this.data.birthDate;
      ckycData.cellphoneNumber = this.data.contactNumber;
      ckycData.civilStatus = this.data.civilStatus;
      ckycData.modifiedByService = String(SERVICE_NAME);
      ckycData.email = this.data.emailAddress;
      ckycData.gender = this.data.gender;
      ckycData.placeOfBirth = this.data.placeOfBirth;
      ckycData.nationality = this.data.nationality;
      ckycData.pictures.customerPhoto = this.data.profilePicture ?? ckycData.pictures.customerPhoto;
      ckycData['userDetails'] = {
        mlUserId: Number(userId),
        // mlUserFirstName: seshData.firstName ?? seshData.emailAddress,
        // mlUserLastName: seshData.lastName ?? seshData.emailAddress,
      };

      return await updateEmployeeKYCInfo(ckycData);
    } catch (error) {
      let errorMessage = "Something went wrong while updating employee KYC";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      throw new Error(errorMessage);
    }
  }

  public async updateEmployee(): Promise<void> {
    try {
      const { employeeStatus, modeOfPayroll, mlWalletStatus } = this.data;

      let status = employeeStatus;
      if (employeeStatus === 2) {
        status = employeeStatus;
      } else if (modeOfPayroll === 'KWARTA PADALA') {
        status = EMPLOYEE_STATUS.indexOf('ACTIVATED');
      } else if (MCASH_MLWALLET.includes(modeOfPayroll) && mlWalletStatus === ML_WALLET_STATUS.indexOf('PENDING')) {
        status = EMPLOYEE_STATUS.indexOf('PENDING');
      } else {
        status = EMPLOYEE_STATUS.indexOf('ACTIVATED');
      }

      await executeQuery(EMPLOYEES_UPDATE, {
        employeeId: this.data.employeeId,
        employeeCode: this.data.employeeCode,
        departmentId: this.data.departmentId,
        shiftId: this.data.shiftId,
        hiringDate: this.data.hiringDate,
        startDate: this.data.startDate,
        employmentStatus: this.data.employmentStatus,
        dayOff: this.data.dayOff,
        dailyRate: this.data.dailyRate,
        basicPay: this.data.basicPay,
        allowanceBreakdown: this.data.allowanceBreakdown,
        monthlyAllowance: this.data.monthlyAllowance,
        allowance: this.data.allowance,
        tinNumber: this.data.tinNumber,
        overtimeRateRegDays: this.data.overtimeRateRegDays,
        overtimeRateHolidays: this.data.overtimeRateHolidays,
        overtimeRateRestDays: this.data.overtimeRateRestDays,
        positionTitle: this.data.positionTitle,
        modeOfPayroll: modeOfPayroll,
        referenceFiles: this.data.referenceFiles,
        employeeStatus: status,
        applyWithholdingTax: this.data.applyWithholdingTax,
        isMonthlyRated: this.data.isMonthlyRated
      }, [], QueryTypes.UPDATE);
    } catch (error) {
      let errorMessage = "Something went wrong while updating employee";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      throw new Error(errorMessage);
    }
  }

  public async updateEmployeeMinimal(): Promise<void> {
    try {
      await executeQuery(EMPLOYEES_UPDATE_KYC, {
        employeeId: this.data.employeeId,
        companyId: this.data.companyId,
        tierLabel: this.data.tierLabel,
        ckycId: this.data.ckycId,
        mlWalletId: this.data.mlWalletId,
        mismatchedInfos: this.data.mismatchedInfos
      }, [], QueryTypes.UPDATE);
    } catch (error) {
      let errorMessage = "Something went wrong while updating employee";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      throw new Error(errorMessage);
    }
  }

  public async updateLeaves(): Promise<void> {
    try {
      await executeQuery(EMPLOYEE_LEAVES_UPDATE, {
        employeeId: this.data.employeeId,
        vacationLeaveCredits: this.data.vacationLeaveCredits,
        sickLeaveCredits: this.data.sickLeaveCredits,
        soloParentLeaveCredits: this.data.soloParentLeaveCredits,
        paternityLeaveCredits: this.data.paternityLeaveCredits,
        maternityLeaveCredits: this.data.maternityLeaveCredits,
        serviceIncentiveLeaveCredits: this.data.serviceIncentiveLeaveCredits,
        otherLeaveCredits: this.data.otherLeaveCredits,
        emergencyLeaveCredits: this.data.emergencyLeaveCredits,
        birthdayLeaveCredits: this.data.birthdayLeaveCredits,
      }, [], QueryTypes.UPDATE);
    } catch (error) {
      let errorMessage = "Something went wrong while updating employee leaves";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      throw new Error(errorMessage);
    }
  }

  public async updateAllowanceBreakdowns(): Promise<void> {
    try {
      await executeQuery(ALLOWANCE_BREAKDOWNS_UPDATE_EMPLOYEE, {
        employeeId: this.data.employeeId,
        allowanceType: this.data.allowanceType,
        monthlyAmounts: this.data.monthlyAmounts,
        dailyAmounts: this.data.dailyAmounts
      }, [], QueryTypes.UPDATE);
    } catch (error) {
      let errorMessage = "Something went wrong while updating employee allowance breakdown";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      throw new Error(errorMessage);
    }
  }

  public async updateBenefits(BenefitId: Number): Promise<void> {
    try {
      await executeQuery(EMPLOYEE_BENEFITS_UPDATE, {
        employeeBenefitsId: BenefitId,
        employeeId: this.data.employeeId,
        sssId: this.data.sssId,
        sssContributionRate: this.data.sssContributionRate,
        sssERShareRate: this.data.sssERShareRate,
        sssECShareRate: this.data.sssECShareRate,
        philHealthId: this.data.philHealthId,
        philHealthContributionRate: this.data.philHealthContributionRate,
        philHealthERShareRate: this.data.philHealthERShareRate,
        pagIbigId: this.data.pagIbigId,
        pagIbigContributionRate: this.data.pagIbigContributionRate,
        pagIbigERShareRate: this.data.pagIbigERShareRate,
      }, [], QueryTypes.UPDATE);
    } catch (error) {
      let errorMessage = "Something went wrong while updating employee benefits";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      throw new Error(errorMessage);
    }
  }

  public async updateProfile(): Promise<void> {
    try {
      await executeQuery(EMPLOYEE_PROFILE_UPDATE, {
        employeeId: this.data.employeeId,
        firstName: this.data.firstName,
        middleName: this.data.middleName,
        lastName: this.data.lastName,
        suffix: this.data.suffix,
        profilePicture: this.data.profilePicture,
        contactNumber: this.data.contactNumber,
        emergencyContactNumber1: this.data.emergencyContactNumber1,
        emergencyContactNumber2: this.data.emergencyContactNumber2,
        birthDate: this.data.birthDate,
        emailAddress: this.data.emailAddress,
        streetAddress: this.data.streetAddress,
        cityId: this.data.cityId,
        provinceId: this.data.provinceId,
        countryId: this.data.countryId,
        zipCode: this.data.zipCode,
        educationalAttainment: this.data.educationalAttainment,
        schoolGraduated: this.data.schoolGraduated,
        degree: this.data.degree,
        gender: this.data.gender,
        placeOfBirth: this.data.placeOfBirth,
        nationality: this.data.nationality,
        civilStatus: this.data.civilStatus,
      }, [], QueryTypes.UPDATE);
    } catch (error) {
      let errorMessage = "Something went wrong while updating employee profile";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      throw new Error(errorMessage);
    }
  }

  public async updateCompany(): Promise<void> {
    try {
      await executeQuery(COMPANIES_UPDATE_CONTACT_INFO, {
        companyId: this.data.companyId,
        emailAddress: this.data.emailAddress,
        contactNumber: this.data.contactNumber,
      }, [], QueryTypes.UPDATE);
    } catch (error) {
      let errorMessage = "Something went wrong while updating company";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      throw new Error(errorMessage);
    }
  }

  public async updateUser(): Promise<void> {
    try {
      const role = await this.getRole();
      let roleName = role.roleName;
      let roleId = role.userRoleId;

      const user = await this.getUser();
      const isDefaultAdmin: boolean = user && user.isDefault;

      if (isDefaultAdmin) {
        await this.updateCompany();

        const adminRole = await this.getRoleByName('ADMIN');
        roleName = adminRole.roleName;
        roleId = adminRole.userRoleId;
      }

      await executeQuery(USERS_UPDATE_EMPLOYEE, {
        userId: user.userId,
        firstName: this.data.firstName,
        middleName: this.data.middleName,
        lastName: this.data.lastName,
        suffix: this.data.suffix,
        birthDate: this.data.birthDate,
        contactNumber: this.data.contactNumber,
        emailAddress: this.data.emailAddress,
        username: this.data.emailAddress,
        role: roleName,
        roleId,
        isActive: user.isActive
      }, [], QueryTypes.UPDATE);
    } catch (error) {
      let errorMessage = "Something went wrong while updating company";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      throw new Error(errorMessage);
    }
  }

  public async updateVerificationCode(): Promise<void> {
    await executeQuery(VERIFICATION_CODES_UPDATE_EXPIRY, {
      employeeId: this.data.employeeId,
      contactNumber: this.data.contactNumber,
      isUsed: 0,
      isExpired: 0,
    }, [], QueryTypes.UPDATE);
  }

  public async updateEmployeeAllowanceBreakdown(): Promise<void> {
    try {
      const { allowanceBreakdownId } = this.data;
      if (!allowanceBreakdownId) throw new Error('No employee allowance breakdown id generated');

      await executeQuery(EMPLOYEES_UPDATE_ALLOWANCE_BREAKDOWN, {
        employeeId: this.data.employeeId,
        allowanceBreakdownId,
        allowanceBreakdown: this.data.allowanceBreakdown
      }, [], QueryTypes.UPDATE);
    } catch (error) {
      let errorMessage = "Something went wrong while updating employee allowance breakdown";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      throw new Error(errorMessage);
    }
  }

  public async updateEmployeeId(): Promise<void> {
    await executeQuery(USERS_UPDATE_EMPLOYEE_ID, {
      employeeId: this.data.employeeId
    }, [], QueryTypes.UPDATE);
  }

  public async activateEmployee(): Promise<void> {
    await executeQuery(EMPLOYEES_ACTIVATE, {
      employeeId: this.data.employeeId,
      employeeStatus: EMPLOYEE_STATUS.indexOf(MCASH_MLWALLET.includes(this.data.modeOfPayroll) ? 'PENDING' : 'ACTIVATED'),
      mlWalletStatus: ML_WALLET_STATUS.indexOf('PENDING'),
    }, [], QueryTypes.UPDATE);
  }

  public async deactivateEmployee(): Promise<void> {
    await executeQuery(EMPLOYEES_DEACTIVATE, {
      employeeId: this.data.employeeId,
      tierLabel: this.data.tierLabel ?? '',
      employeeStatus: EMPLOYEE_STATUS.indexOf('DEACTIVATED'),
      mlWalletStatus: ML_WALLET_STATUS.indexOf('DEACTIVATED'),
      modeOfSeparation: this.data.modeOfSeparation ?? ''
    }, [], QueryTypes.UPDATE);
  }

  public async activateUser(): Promise<void> {
    await executeQuery(USERS_ACTIVE, {
      employeeId: this.data.employeeId
    }, [], QueryTypes.UPDATE);
  }

  public async deactivateUser(): Promise<void> {
    await executeQuery(USERS_DEACTIVE, {
      userId: null,
      employeeId: this.data.employeeId,
      companyId: null
    }, [], QueryTypes.UPDATE);
  }

  public async deleteUser(): Promise<void> {
    await executeQuery(USERS_DELETE, {
      userId: null,
      employeeId: this.data.employeeId,
      companyId: null
    }, [], QueryTypes.UPDATE);
  }

  public async deleteEmployee(): Promise<void> {
    await executeQuery(EMPLOYEES_DELETE, {
      employeeId: this.data.employeeId
    }, [], QueryTypes.UPDATE);
  }
}