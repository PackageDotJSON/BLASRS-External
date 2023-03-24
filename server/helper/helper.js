const xlsxFile = require("read-excel-file/node");
const TOTAL_BROKER_RECORDS = require("../constants/app.constant");

const validateBrokerSubmission = async (filePath) => {
  return xlsxFile(filePath).then((rows) => {
    fileData = [...rows];
    fileRecords = rows.length - 1;

    if (fileRecords < TOTAL_BROKER_RECORDS) {
      return 'The file does not contain 914 records.';
    }

    if (
      rows[0][0] === 'Description' &&
      rows[0][1] === 'Debit' &&
      rows[0][2] === 'Credit' &&
      rows[0][3] === 'Secondary \nCodes'
    ) {
      return true;
    } else {
      return false;
    }
  });
};

module.exports = validateBrokerSubmission
