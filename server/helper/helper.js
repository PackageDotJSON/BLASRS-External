const xlsxFile = require("read-excel-file/node");
const { TOTAL_BROKER_RECORDS, REGULAR_EXPRESSION_EXCEL_SHEET } = require("../constants/app.constant");
const {
  FILE_TEMPLATE_CONTENT,
  FILE_SECONDARY_CODES,
} = require("../constants/file-template.constant");
const fs = require("fs");

const validateBrokerSubmission = async (filePath) => {
  return xlsxFile(filePath).then((rows) => {
    fileRecords = rows.length - 1;
    brokerMetaData = rows[0];
    rows.shift();

    if (fileRecords !== TOTAL_BROKER_RECORDS) {
      return {
        statusCode: 406,
        message: "The file does not contain 914 records.",
        error: true,
      };
    }
    if (
      brokerMetaData[0] === "Description" &&
      brokerMetaData[1] === "Debit" &&
      brokerMetaData[2] === "Credit" &&
      brokerMetaData[3] === "Secondary \nCodes"
    ) {
      for (let i = 0; i < rows.length; i++) {
        if (
          rows[i][0] !== FILE_TEMPLATE_CONTENT[i] ||
          rows[i][3] !== FILE_SECONDARY_CODES[i]
        ) {
          return {
            statusCode: 406,
            message:
              "Invalid Description or Secondary Codes has been found in the file. Please follow the given template.",
            error: true,
          };
        }
      }
      return {
        statusCode: 200,
        message: "The file is Valid",
        error: false,
      };
    } else {
      return {
        statusCode: 406,
        message: "Invalid file template",
        error: true,
      };
    }
  });
};

const validateSubmissionRecord = async (filePath) => {
  return xlsxFile(filePath).then((rows) => {
    let totalDebit = 0;
    let totalCredit = 0;

    for (let i = 1; i < rows.length; i++) {
      if (typeof totalDebit !== "number" || typeof totalCredit !== "number") {
        return {
          totalDebit,
          totalCredit,
          message: 'The data type of Debit or Credit column has been altered.',
          error: true,
        };
      }

      if(REGULAR_EXPRESSION_EXCEL_SHEET.test(rows[i][1]) || REGULAR_EXPRESSION_EXCEL_SHEET.test(rows[i][2])) {
        return {
          totalDebit,
          totalCredit,
          message: 'The Debit or the Credit column contains an invalid entry.',
          error: true
        }
      }

      totalDebit = totalDebit + rows[i][1];
      totalCredit = totalCredit + rows[i][2];
    }

    if (totalDebit !== totalCredit) {
      return {
        totalDebit,
        totalCredit,
        message: 'The total Debit amount is not equal to the total Credit amount',
        error: true,
      };
    }

    return {
      totalDebit,
      totalCredit,
      error: false,
    };
  });
};

const validateDate = (periodEnded) => {
  const period = periodEnded.split("/");
  const date = new Date();

  const month = date.getMonth();
  const year = date.getFullYear();

  if (year !== Number(period[2])) {
    return {
      statusCode: 406,
      message: "You cannot upload the submission of the next year.",
      error: true,
    };
  }

  if(month < Number(period[1])) {
    return {
      statusCode: 406,
      message: "You cannot upload the submission of the next month.",
      error: true,
    }
  }

  return {
    statusCode: 200,
    message: 'Ok',
    error: false
  }
};

const readExcelData = async (filePath) => {
  return xlsxFile(filePath).then((rows) => {
    rows.splice(0, 1);
    return rows;
  });
};

const deleteFileFromDirectory = (filePath) => {
  try {
    fs.unlinkSync(filePath);

    console.log("File Deleted Successfully");
  } catch (err) {
    console.log("Error occurred while trying to delete file ", err);
  }
};

module.exports = {
  validateBrokerSubmission,
  validateSubmissionRecord,
  validateDate,
  readExcelData,
  deleteFileFromDirectory,
};
