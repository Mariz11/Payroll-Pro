// applies to tier charged companies
export const calculateCharge = (netPay: number, charges: any[]) => {
  let charge = 0;
  // find charge tier and
  let i = 0;
  for (i = 0; i < charges.length; i++) {
    const chargeObj = charges[i];
    if (netPay >= chargeObj.tierStart && netPay <= chargeObj.tierEnd) {
      charge = chargeObj.charge;
      break;
    }
  }
  // if doesnt find any charge, then set charge to last tier
  if (i >= charges.length) {
    charge = 0;
  }
  return charge;
};
