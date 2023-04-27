const xlsxFile = require("read-excel-file/node");
const TOTAL_BROKER_RECORDS = require("../constants/app.constant");
const {
  FILE_TEMPLATE_CONTENT,
  FILE_SECONDARY_CODES,
} = require("../constants/file-template.constant");

const validateBrokerSubmission = async (filePath) => {
  return xlsxFile(filePath).then((rows) => {
    fileRecords = rows.length - 1;
    brokerMetaData = rows.splice(0, 3);

    if (fileRecords !== TOTAL_BROKER_RECORDS) {
      return {
        statusCode: 406,
        message: "The file does not contain 916 records.",
        error: true,
      };
    }

    const isValidDate = validatePeriodEnded(brokerMetaData[1][2]);

    if(isValidDate.statusCode !== 200) {
      return isValidDate;
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
        for (let i = 0; i < rows.length; i++) {
          if (
            rows[i][0] !== FILE_TEMPLATE_CONTENT[i] ||
            rows[i][3] !== FILE_SECONDARY_CODES[i]
          ) {
            return {
              statusCode: 406,
              message:
                "Some of the contents of the file are missing or is in incorrect format. Please try again",
              error: true,
            };
          }
        }
        return {
          statusCode: 200,
          message: "The file is Valid",
          error: false,
        };
      }
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
    let periodEnded = rows[1][2];
    let totalDebit = 0;
    let totalCredit = 0;
    for (let i = 3; i < rows.length; i++) {
      totalDebit = totalDebit + rows[i][1];
      totalCredit = totalCredit + rows[i][2];
    }

    periodEnded = periodEnded.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    return {
      totalDebit,
      totalCredit,
      periodEnded,
    };
  });
};

const readExcelData = async (filePath) => {
  return xlsxFile(filePath).then((rows) => {
    rows.splice(0, 3);
    return rows;
  });
};

const validatePeriodEnded = (periodEnded) => {
  const date = new Date();
  let currentMonth = Number(date.getMonth()) + 1;
  currentMonth = currentMonth.toString();
  const currentYear = date.getFullYear();
  
  const periodDay = periodEnded.getDate();
  let periodMonth = Number(periodEnded.getMonth()) + 1;
  periodMonth = periodMonth.toString();
  const periodYear = periodEnded.getFullYear();

  if(periodDay !== 31 && periodDay !== 30 && periodDay !== 29) {
    return {
      statusCode: 406,
      message: "The entered date is invalid. Kindly enter the last date of the month.",
      error: true,
    }
  }
  if(periodMonth > currentMonth) {
    return {
      statusCode: 406,
      message: "The entered month is invalid. You cannot upload the submissions of the next month.",
      error: true,
    }
  }
  if(periodYear !== currentYear) {
    return {
      statusCode: 406,
      message: "The entered year is invalid. You cannot upload the submissions of the next year.",
      error: true,
    }
  } else {
    return {
      statusCode: 200
    }
  }
}

module.exports = {
  validateBrokerSubmission,
  validateSubmissionRecord,
  readExcelData,
};
