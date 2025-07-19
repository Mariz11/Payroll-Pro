import { StyleSheet, Text, View } from '@react-pdf/renderer';
import moment from '@constant/momentTZ';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  table: {
    width: '85%',
    border: '0.5px solid #000',
    borderCollapse: 'collapse',
    alignSelf: 'center',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    borderBottom: '0.5px solid #000',
  },
  cell: {
    borderRight: '0.5px solid #000',
    textAlign: 'center',
    paddingVertical: 5,
  },
  lastCell: {
    borderRight: 'none', // Remove the right border of the last cell in each row
  },
  header: {
    fontWeight: 'bold',
  },
  lastRow: {
    borderBottom: 'none', // Remove the bottom border of the last row
  },
  // Adjusted column widths to match a typical Excel table layout
  col1: {
    width: '13%',
  },
  col2: {
    width: '13%',
  },
  col3: {
    width: '13%',
  },
  col4: {
    width: '15%',
  },
  col5: {
    width: '20%',
  },
  col6: {
    width: '15%',
  },
  col7: {
    width: '15%',
  },
  novalue: {

  },
  bold: {
    fontWeight: "bold",
            fontFamily: "Helvetica-Bold",
  }
});

interface TimeKeepingReportTableProps {
  data: Array<{
    date: string;
    timeIn: string;
    timeOut: string;
    overtimeHours: number;
    nightDiffHours: number;
    lateHours: number;
    undertimeHours: number;
  }>;
}

const TimeKeepingReportTable: React.FC<TimeKeepingReportTableProps> = ({ data }) => {
  return (
    <View style={styles.table}>
      <View style={[styles.row, styles.header]}>
        <Text style={[styles.cell, styles.col1, styles.bold]}>Date</Text>
        <Text style={[styles.cell, styles.col2, styles.bold]}>Time In</Text>
        <Text style={[styles.cell, styles.col3, styles.bold]}>Time Out</Text>
        <Text style={[styles.cell, styles.col4, styles.bold]}>Overtime (hrs)</Text>
        <Text style={[styles.cell, styles.col5, styles.bold]}>Night Differential (hrs)</Text>
        <Text style={[styles.cell, styles.col6, styles.bold]}>Late (hrs)</Text>
        <Text style={[styles.cell, styles.col7, styles.lastCell,styles.bold]}>Undertime (hrs)</Text>
      </View>
      {data.map((row, i) => (
        <View
          key={i}
          style={[
            styles.row,
            i === data.length - 1 ? styles.lastRow : styles.novalue,
          ]}
        >
          <Text style={[styles.cell, styles.col1]}>{moment(row.date).format("MM/DD/YYYY")}</Text>
          <Text style={[styles.cell, styles.col2]}>{moment(`${row.date} ${row.timeIn}`).format("hh:mm A")}</Text>
          <Text style={[styles.cell, styles.col3]}>{moment(`${row.date} ${row.timeOut}`).format("hh:mm A")}</Text>
          <Text style={[styles.cell, styles.col4]}>{row.overtimeHours}</Text>
          <Text style={[styles.cell, styles.col5]}>{row.nightDiffHours}</Text>
          <Text style={[styles.cell, styles.col6]}>{row.lateHours}</Text>
          <Text style={[styles.cell, styles.col7, styles.lastCell]}>{row.undertimeHours}</Text>
        </View>
      ))}
    </View>
  );
};

TimeKeepingReportTable.propTypes = {
  data: PropTypes.array.isRequired,
};

export default TimeKeepingReportTable;
