export const sssBracketArray: Array<{
  start: number;
  end: number;
  ER: number;
  EE: number;
  EC: number;
}> = [
  { start: 0.0, end: 4249.99, ER: 380, EE: 180, EC: 10 },
  { start: 4250, end: 4749.99, ER: 427.5, EE: 202.5, EC: 10 },
  { start: 4750, end: 5249.99, ER: 475, EE: 225, EC: 10 },
  { start: 5250, end: 5749.99, ER: 522.5, EE: 247.5, EC: 10 },
  { start: 5750, end: 6249.99, ER: 570, EE: 270, EC: 10 },
  { start: 6250, end: 6749.99, ER: 617.5, EE: 292.5, EC: 10 },
  { start: 6750, end: 7249.99, ER: 665, EE: 315, EC: 10 },
  { start: 7250, end: 7749.99, ER: 712.5, EE: 337.5, EC: 10 },
  { start: 7750, end: 8249.99, ER: 760, EE: 360, EC: 10 },
  { start: 8250, end: 8749.99, ER: 807.5, EE: 382.5, EC: 10 },
  { start: 8750, end: 9249.99, ER: 855, EE: 405, EC: 10 },
  { start: 9250, end: 9749.99, ER: 902.5, EE: 427.5, EC: 10 },
  { start: 9750, end: 10249.99, ER: 950, EE: 450, EC: 10 },
  { start: 10250, end: 10749.99, ER: 997.5, EE: 472.5, EC: 10 },
  { start: 10750, end: 11249.99, ER: 1045, EE: 495, EC: 10 },
  { start: 11250, end: 11749.99, ER: 1092.5, EE: 517.5, EC: 10 },
  { start: 11750, end: 12249.99, ER: 1140, EE: 540, EC: 10 },
  { start: 12250, end: 12749.99, ER: 1187.5, EE: 562.5, EC: 10 },
  { start: 12750, end: 13249.99, ER: 1235, EE: 585, EC: 10 },
  { start: 13250, end: 13749.99, ER: 1282.5, EE: 607.5, EC: 10 },
  { start: 13750, end: 14249.99, ER: 1330, EE: 630, EC: 10 },
  { start: 14250, end: 14749.99, ER: 1377.5, EE: 652.5, EC: 10 },
  { start: 14750, end: 15249.99, ER: 1425, EE: 675, EC: 30 },
  { start: 15250, end: 15749.99, ER: 1472.5, EE: 697.5, EC: 30 },
  { start: 15750, end: 16249.99, ER: 1520, EE: 720, EC: 30 },
  { start: 16250, end: 16749.99, ER: 1567.5, EE: 742.5, EC: 30 },
  { start: 16750, end: 17249.99, ER: 1615, EE: 765, EC: 30 },
  { start: 17250, end: 17749.99, ER: 1662.5, EE: 787.5, EC: 30 },
  { start: 17750, end: 18249.99, ER: 1710, EE: 810, EC: 30 },
  { start: 18250, end: 18749.99, ER: 1757.5, EE: 832.5, EC: 30 },
  { start: 18750, end: 19249.99, ER: 1805, EE: 855, EC: 30 },
  { start: 19250, end: 19749.99, ER: 1852.5, EE: 877.5, EC: 30 },
  { start: 19750, end: 20249.99, ER: 1900, EE: 900, EC: 30 },
  { start: 20250, end: 20749.99, ER: 1900, EE: 900, EC: 30 },
  { start: 20750, end: 21249.99, ER: 1900, EE: 900, EC: 30 },
  { start: 21250, end: 21749.99, ER: 1900, EE: 900, EC: 30 },
  { start: 21750, end: 22249.99, ER: 1900, EE: 900, EC: 30 },
  { start: 22250, end: 22749.99, ER: 1900, EE: 900, EC: 30 },
  { start: 22750, end: 23249.99, ER: 1900, EE: 900, EC: 30 },
  { start: 23250, end: 23749.99, ER: 1900, EE: 900, EC: 30 },
  { start: 23750, end: 24249.99, ER: 1900, EE: 900, EC: 30 },
  { start: 24250, end: 24749.99, ER: 1900, EE: 900, EC: 30 },
  { start: 24750, end: 25249.99, ER: 1900, EE: 900, EC: 30 },
  { start: 25250, end: 25749.99, ER: 1900, EE: 900, EC: 30 },
  { start: 25750, end: 26249.99, ER: 1900, EE: 900, EC: 30 },
  { start: 26250, end: 26749.99, ER: 1900, EE: 900, EC: 30 },
  { start: 26750, end: 27249.99, ER: 1900, EE: 900, EC: 30 },
  { start: 27250, end: 27749.99, ER: 1900, EE: 900, EC: 30 },
  { start: 27750, end: 28249.99, ER: 1900, EE: 900, EC: 30 },
  { start: 28250, end: 28749.99, ER: 1900, EE: 900, EC: 30 },
  { start: 28750, end: 29249.99, ER: 1900, EE: 900, EC: 30 },
  { start: 29250, end: 29749.99, ER: 1900, EE: 900, EC: 30 },
  { start: 29750, end: 99999999.99, ER: 1900, EE: 900, EC: 30 },
];
export const getValuesFromSSSBracket = (pay: number) => {
  const sssBracketArrayArray: Array<{
    start: number;
    end: number;
    ER: number;
    EE: number;
    EC: number;
  }> = sssBracketArray;

  for (let i = 0; i < sssBracketArrayArray.length; i++) {
    if (
      pay >= sssBracketArrayArray[i].start &&
      pay <= sssBracketArrayArray[i].end
    ) {
      return {
        success: true,

        ER: sssBracketArrayArray[i].ER,
        EE: sssBracketArrayArray[i].EE,
        EC: sssBracketArrayArray[i].EC,
      };
    }
  }
  return {
    success: false,
    ER: 0,
    EE: 0,
    EC: 0,
  };
};
