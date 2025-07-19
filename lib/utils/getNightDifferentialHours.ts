import moment from '@constant/momentTZ';

export default function getNightDifferentialHours(
  date: any,
  timeIn: any,
  lunchStart: any,
  lunchEnd: any,
  timeOut: any,
  nightDiffStart: any,
  nightDiffEnd: any,
  shiftTimeIn: any
) {
  const parsedDate = moment(date, 'YYYY-MM-DD').format('MM/DD/YY');

  console.log({
    date: date,
    timeIn: timeIn,
    lunchStart: lunchStart,
    lunchEnd: lunchEnd,
    timeOut: timeOut,
    nightDiffStart: nightDiffStart,
    nightDiffEnd: nightDiffEnd,
  });

  let usedTimeIn = timeIn;
  if (
    (timeIn < shiftTimeIn && timeIn < timeOut) ||
    (timeIn < shiftTimeIn && timeOut < shiftTimeIn)
  ) {
    usedTimeIn = timeIn;
  }
  let timeInFormatted = moment(`${parsedDate} ${usedTimeIn}`, 'MM/DD/YY HH:mm');
  let lunchStartFormatted = moment(
    `${parsedDate} ${lunchStart}`,
    'MM/DD/YY HH:mm'
  );
  let lunchEndFormatted = moment(`${parsedDate} ${lunchEnd}`, 'MM/DD/YY HH:mm');
  let timeOutFormatted = moment(`${parsedDate} ${timeOut}`, 'MM/DD/YY HH:mm');

  let nightDiffStartFormatted = moment(
    `${parsedDate} ${nightDiffStart}`,
    'MM/DD/YY HH:mm'
  );
  let nightDiffEndFormatted = moment(
    `${parsedDate} ${nightDiffEnd}`,
    'MM/DD/YY HH:mm'
  );

  let tempStart = moment(`${parsedDate} ${nightDiffStart}`, 'MM/DD/YYYY HH:mm');
  let tempEnd = moment(`${parsedDate} ${nightDiffEnd}`, 'MM/DD/YYYY HH:mm');
  let hoursDifference = moment
    .duration(tempEnd.diff(tempStart.subtract('1', 'day')))
    .asHours();

  if (timeOutFormatted.isSameOrBefore(timeInFormatted)) {
    timeOutFormatted.add('1', 'day');
  }

  if (lunchStart && lunchEnd) {
    if (lunchStartFormatted.isSameOrBefore(timeInFormatted)) {
      lunchStartFormatted.add('1', 'day');
    }

    if (lunchEndFormatted.isSameOrBefore(timeInFormatted)) {
      lunchEndFormatted.add('1', 'day');
    }
  }

  if (nightDiffEndFormatted.isSameOrBefore(timeInFormatted)) {
    nightDiffEndFormatted.add('1', 'day');
  }

  if (
    moment
      .duration(nightDiffEndFormatted.diff(nightDiffStartFormatted))
      .asHours() !== hoursDifference
  ) {
    nightDiffStartFormatted.subtract('1', 'day');
  }

  let nightDiffHours = 0;

  if (timeInFormatted.isBefore(timeOutFormatted)) {
    let currentStart = moment.max(timeInFormatted, nightDiffStartFormatted);
    let currentEnd = moment.min(timeOutFormatted, nightDiffEndFormatted);

    if (currentStart.isBefore(currentEnd)) {
      nightDiffHours = currentEnd.diff(currentStart, 'minutes') / 60;

      if (
        lunchStart &&
        lunchEnd &&
        lunchStartFormatted.isBefore(lunchEndFormatted)
      ) {
        let lunchStartInDiff = moment.max(
          lunchStartFormatted,
          nightDiffStartFormatted
        );
        let lunchEndInDiff = moment.min(
          lunchEndFormatted,
          nightDiffEndFormatted
        );

        if (lunchStartInDiff.isBefore(lunchEndInDiff)) {
          let lunchOverlap =
            lunchEndInDiff.diff(lunchStartInDiff, 'minutes') / 60;
          nightDiffHours -= lunchOverlap;
        }
      }
    }
  }
  return Math.floor(nightDiffHours);
}

// export default function getNightDifferentialHours(
//   date: any,
//   timeIn: any,
//   lunchStart: any,
//   lunchEnd: any,
//   timeOut: any,
//   nightDiffStart: any,
//   nightDiffEnd: any
// ) {
//   const parsedDate = moment(date, 'YYYY-MM-DD').format('MM/DD/YY');

//   let timeInFormatted = moment(`${parsedDate} ${timeIn}`, 'MM/DD/YYYY HH:mm');
//   let lunchStartFormatted = moment(
//     `${parsedDate} ${lunchStart}`,
//     'MM/DD/YYYY HH:mm'
//   );
//   let lunchEndFormatted = moment(
//     `${parsedDate} ${lunchEnd}`,
//     'MM/DD/YYYY HH:mm'
//   );
//   let timeOutFormatted = moment(`${parsedDate} ${timeOut}`, 'MM/DD/YYYY HH:mm');

//   let nightDiffStartFormatted = moment(
//     `${parsedDate} ${nightDiffStart}`,
//     'MM/DD/YYYY HH:mm'
//   );
//   let nightDiffEndFormatted = moment(
//     `${parsedDate} ${nightDiffEnd}`,
//     'MM/DD/YYYY HH:mm'
//   );

//   let tempStart = moment(`${parsedDate} ${nightDiffStart}`, 'MM/DD/YYYY HH:mm');
//   let tempEnd = moment(`${parsedDate} ${nightDiffEnd}`, 'MM/DD/YYYY HH:mm');
//   let hoursDifference = moment
//     .duration(tempEnd.diff(tempStart.subtract('1', 'day')))
//     .asHours();

//   if (timeOutFormatted.isSameOrBefore(timeInFormatted)) {
//     timeOutFormatted.add('1', 'day');
//   }

//   if (lunchStart && lunchEnd) {
//     if (lunchStartFormatted.isSameOrBefore(timeInFormatted)) {
//       lunchStartFormatted.add('1', 'day');
//     }

//     if (lunchEndFormatted.isSameOrBefore(timeInFormatted)) {
//       lunchEndFormatted.add('1', 'day');
//     }
//   }

//   if (nightDiffEndFormatted.isSameOrBefore(timeInFormatted)) {
//     nightDiffEndFormatted.add('1', 'day');
//   }

//   if (
//     moment
//       .duration(nightDiffEndFormatted.diff(nightDiffStartFormatted))
//       .asHours() !== hoursDifference
//   ) {
//     nightDiffEndFormatted.add('1', 'day');
//   }

//   // console.log(`Time In: ${timeInFormatted.format('MM-DD-YYYY hh:mm:ss A')}`);
//   // console.log(
//   //   `Lunch Start: ${
//   //     lunchStartFormatted
//   //       ? lunchStartFormatted.format('MM-DD-YYYY hh:mm:ss A')
//   //       : 'N/A'
//   //   }`
//   // );
//   // console.log(
//   //   `Lunch End: ${
//   //     lunchEndFormatted
//   //       ? lunchEndFormatted.format('MM-DD-YYYY hh:mm:ss A')
//   //       : 'N/A'
//   //   }`
//   // );
//   // console.log(`Time Out: ${timeOutFormatted.format('MM-DD-YYYY hh:mm:ss A')}`);

//   // console.log(
//   //   `Night Diff Start: ${nightDiffStartFormatted.format(
//   //     'MM-DD-YYYY hh:mm:ss A'
//   //   )}`
//   // );
//   // console.log(
//   //   `Night Diff End: ${nightDiffEndFormatted.format('MM-DD-YYYY hh:mm:ss A')}`
//   // );

//   let nightDiffHours = 0;

//   if (timeInFormatted.isBefore(timeOutFormatted)) {
//     let currentStart = moment.max(timeInFormatted, nightDiffStartFormatted);
//     let currentEnd = moment.min(timeOutFormatted, nightDiffEndFormatted);

//     if (currentStart.isBefore(currentEnd)) {
//       nightDiffHours = currentEnd.diff(currentStart, 'minutes') / 60;

//       if (
//         lunchStart &&
//         lunchEnd &&
//         lunchStartFormatted.isBefore(lunchEndFormatted)
//       ) {
//         let lunchStartInDiff = moment.max(
//           lunchStartFormatted,
//           nightDiffStartFormatted
//         );
//         let lunchEndInDiff = moment.min(
//           lunchEndFormatted,
//           nightDiffEndFormatted
//         );

//         if (lunchStartInDiff.isBefore(lunchEndInDiff)) {
//           let lunchOverlap =
//             lunchEndInDiff.diff(lunchStartInDiff, 'minutes') / 60;
//           nightDiffHours -= lunchOverlap;
//         }
//       }
//     }
//   }
//   nightDiffHours = Math.floor(nightDiffHours);
//   return nightDiffHours;
// }
