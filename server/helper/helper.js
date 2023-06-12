const xlsxFile = require("read-excel-file/node");
const writeXlsxFile = require("xlsx-populate");
const {
  TOTAL_BROKER_RECORDS,
  EVEN_MONTHS,
  ODD_MONTHS,
} = require("../constants/app.constant");
const {
  FILE_TEMPLATE_CONTENT,
  FILE_SECONDARY_CODES,
} = require("../constants/file-template.constant");
const fs = require("fs");

const generateExcelTemplate = async (filePath, companyName, companyCuin) => {
  return writeXlsxFile
    .fromFileAsync(filePath)
    .then((workbook) => {
      const sheet = workbook.sheet(0);
      const firstRow = sheet.row(2);

      firstRow.cell(1).value(companyName);
      firstRow.cell(2).value(companyCuin);

      return workbook.toFileAsync(filePath);
    })
    .then(() => {
      console.log("Excel Updated Successfully");
    })
    .catch((err) => {
      console.log("Error Updating Excel file", err);
    });
};

const validateBrokerSubmission = async (filePath, companyName, companyCuin) => {
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

    if (companyName !== brokerMetaData[1][0]) {
      return {
        statusCode: 406,
        message:
          "The company name in the Excel file does not correspond to the currently logged-in company",
        error: true,
      };
    }

    if (companyCuin !== brokerMetaData[1][1]) {
      return {
        statusCode: 406,
        message:
          "The company CUIN in the Excel file does not correspond to the currently logged-in company",
        error: true,
      };
    }

    const isValidDate = validatePeriodEnded(brokerMetaData[1][2]);

    if (isValidDate.statusCode !== 200) {
      return isValidDate;
    }

    if (
      brokerMetaData[0][0] === "Broker's Name" &&
      brokerMetaData[0][1] === "Broker's CUIN" &&
      brokerMetaData[0][2] === "Period Ended (dd/mm/yyyy)"
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
    let stringError = false;

    for (let i = 3; i < rows.length; i++) {
      if(typeof totalDebit !== 'number' || typeof totalCredit !== 'number') {
        stringError = true;
        break;
      }

      totalDebit = totalDebit + rows[i][1];
      totalCredit = totalCredit + rows[i][2];
    }

    if(stringError) {
      return {
        totalDebit,
        totalCredit,
        periodEnded,
        error: true,
      }
    }

    periodEnded = periodEnded.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    if (totalDebit !== totalCredit) {
      return {
        totalDebit,
        totalCredit,
        periodEnded,
        error: true,
      };
    }
    return {
      totalDebit,
      totalCredit,
      periodEnded,
      error: false,
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

  let periodDay;

  try {
    periodDay = periodEnded.getDate();
  } catch (error) {
    if (error) {
      return {
        statusCode: 406,
        message:
          "The entered date is invalid. Kindly enter the last date of the month.",
        error: true,
      };
    }
  }

  let periodMonth = Number(periodEnded.getMonth()) + 1;
  periodMonth = periodMonth.toString();
  const periodYear = periodEnded.getFullYear();

  if (Number(periodMonth) === 2) {
    if (periodDay !== 29 && periodDay !== 28) {
      return {
        statusCode: 406,
        message:
          "The entered date is invalid. Kindly enter the last date of the month.",
        error: true,
      };
    }
  }

  if (EVEN_MONTHS.includes(Number(periodMonth))) {
    console.log(periodMonth, ' in even')
    if (periodDay !== 31) {
      return {
        statusCode: 406,
        message:
          "The entered date is invalid. Kindly enter the last date of the month i.e., 31.",
        error: true,
      };
    }
  }
  if (ODD_MONTHS.includes(Number(periodMonth))) {
    console.log(periodMonth, ' in odd')
    if (periodDay !== 30) {
      return {
        statusCode: 406,
        message:
          "The entered date is invalid. Kindly enter the last date of the month i.e., 30",
        error: true,
      };
    }
  }

  if (Number(periodMonth) > Number(currentMonth)) {
    return {
      statusCode: 406,
      message:
        "The entered month is invalid. You cannot upload the submissions of the next month.",
      error: true,
    };
  }
  if (periodYear !== currentYear) {
    return {
      statusCode: 406,
      message:
        "The entered year is invalid. You cannot upload the submissions of the previous or the next year.",
      error: true,
    };
  } else {
    return {
      statusCode: 200,
    };
  }
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
  readExcelData,
  generateExcelTemplate,
  deleteFileFromDirectory,
};
