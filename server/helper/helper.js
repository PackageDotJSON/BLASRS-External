const xlsxFile = require("read-excel-file/node");
const TOTAL_BROKER_RECORDS = require("../constants/app.constant");
const { FILE_TEMPLATE_CONTENT, FILE_SECONDARY_CODES } = require('../constants/file-template.constant');

const validateBrokerSubmission = async (filePath) => {
  return xlsxFile(filePath).then((rows) => {
    fileRecords = rows.length - 1;
    brokerMetaData = rows.splice(0, 3);

    if (fileRecords !== TOTAL_BROKER_RECORDS) {
      return {
        statusCode: 406,
        message: 'The file does not contain 916 records.',
        error: true,
      };
    }

    if (
      brokerMetaData[0][0] === "Broker's Name" &&
      brokerMetaData[0][1] === "Broker's CUIN" &&
      brokerMetaData[0][2] === "Period Ended (dd/mm/yyyy)" &&
      brokerMetaData[0][3] === "Date of Filing (dd/mm/yyyy)"
    ) {
      if (
        brokerMetaData[2][0] === "Description" &&
        brokerMetaData[2][1] === "Debit" &&
        brokerMetaData[2][2] === "Credit" &&
        brokerMetaData[2][3] === "Secondary \nCodes"
      ) {
        for(let i = 0; i < rows.length; i++) {
          if(rows[i][0] !== FILE_TEMPLATE_CONTENT[i] || rows[i][3] !== FILE_SECONDARY_CODES[i]) {
            return {
              statusCode: 406,
              message: 'Some of the contents of the file are missing or is in incorrect format. Please try again',
              error: true,
            };
          }
        }
        return {
          statusCode: 200,
          message: 'Valid file',
          error: false,
        };
      }
    } else {
      return {
        statusCode: 406,
        message: 'Invalid file template',
        error: true,
      };
    }
  });
};

module.exports = validateBrokerSubmission;
