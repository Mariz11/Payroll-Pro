'use server';
import { Department } from 'db/models';

export async function isDepartmentExisting(deptId: number) {
  const dept: any = await Department.findOne({
    where: {
      departmentId: deptId,
    },
    paranoid: true,
  });
  // console.log('dept!');
  // console.log(dept);
  if (dept) {
    return true;
  } else {
    return false;
  }
}
