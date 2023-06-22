const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const db2 = require("ibm_db");
const fs = require("fs");
const API_ENDPOINTS = require("../constants/api-endpoints.constant");
const DB_QUERIES = require("../constants/db-queries.constant");
const oracleDb = require("../client/oracle-client");
const dotenv = require("dotenv");
const {
  validateBrokerSubmission,
  validateSubmissionRecord,
  readExcelData,
  deleteFileFromDirectory,
  validateDate,
} = require("../helper/helper");
const { generateToken, verifyToken } = require("../token/token");
const { DEFAULT_DATE } = require("../constants/app.constant");
dotenv.config();

const db2Config = Buffer.from(
  process.env.DB2_CONNECTION_STRING,
  "base64"
).toString("ascii");

/**
 * API Endpoint to download the excel template
 * @param {}
 */

router.get(API_ENDPOINTS.TEMPLATE, async (req, res) => {
  const token = req.get("Authorization");
  const isTokenValid = verifyToken(token);

  if (isTokenValid !== true) {
    res.send({
      statusCode: 401,
      message: "Session Expired",
      error: true,
    });
    return;
  }

  const templatePath = process.env.TEMPLATE_PATH;

  res.sendFile(templatePath);
});

/**
 * API Endpoint to get the list of submissions
 * @param {string} companyName
 */

router.get(API_ENDPOINTS.GET_SUBMISSIONS, (req, res) => {
  const { userCnic, userCuin } = req.query;

  const token = req.get("Authorization");
  const isTokenValid = verifyToken(token);

  if (isTokenValid !== true) {
    res.send({
      statusCode: 401,
      message: "Session Expired",
      error: true,
    });
    return;
  }

  oracleDb.getConnection(
    {
      user: process.env.ORACLEDB_USER,
      password: process.env.ORACLEDB_PASSWORD,
      connectString: process.env.ORACLEDB_CONNECT_STRING,
    },
    (err, conn) => {
      if (!err) {
        console.log("Connected to the database successfully");
      } else {
        console.log(
          "Error occurred while trying to connect to the database: " +
            err.message
        );
      }

      conn.execute(
        DB_QUERIES.FETCH_SUBMISSIONS,
        [userCnic, userCuin],
        (err, results) => {
          if (!err) {
            res.send(results.rows);
          } else {
            console.log(
              "Error occurred while fetching the submissions in Oracle " +
                err.message
            );
          }

          conn.release((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while closing the connection with the database " +
                  err.message
              );
            }
          });
        }
      );
    }
  );
});

router.get(API_ENDPOINTS.GET_PERIOD_ENDED_DATE, (req, res) => {
  const userCuin = req.query.userCuin;

  const token = req.get("Authorization");
  const isTokenValid = verifyToken(token);

  if (isTokenValid !== true) {
    res.send({
      statusCode: 401,
      message: "Session Expired",
      error: true,
    });
    return;
  }

  oracleDb.getConnection(
    {
      user: process.env.ORACLEDB_USER,
      password: process.env.ORACLEDB_PASSWORD,
      connectString: process.env.ORACLEDB_CONNECT_STRING,
    },
    (err, conn) => {
      if (!err) {
        console.log("Connected to the database successfully");
      } else {
        console.log(
          "Error occurred while trying to connect to the database: " +
            err.message
        );
      }

      conn.execute(
        DB_QUERIES.GET_PERIOD_ENDED_DATE,
        [userCuin],
        (err, results) => {
          if (!err) {
            if (!results.rows.flat().includes(null)) {
              res.send({
                data: results.rows,
                statusCode: 200,
                message: "Success",
                error: false,
              });
            } else {
              const data = DEFAULT_DATE;
              res.send({
                data,
                statusCode: 200,
                message: "No Record Found",
                error: false,
              });
            }
          } else {
            console.log(
              "Error occurred while fetching the submissions in Oracle " +
                err.message
            );
          }

          conn.release((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while closing the connection with the database " +
                  err.message
              );
            }
          });
        }
      );
    }
  );
});

/**
 * Handling file input
 */

const storageAlert = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "brokers_submissions");
  },
  filename: (req, file, cb) => {
    brokerSubmissionFile = file.originalname;
    if (
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      cb(null, brokerSubmissionFile);
    } else {
      console.log("Error occurred as the file type is incorrect");
    }
  },
});

const fileFilterAlert = (req, file, cb) => {
  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
    console.log(req.ip + " User is trying to upload incorrect file type");
  }
};

const uploadAlert = multer({
  storage: storageAlert,
  limits: { fileSize: 5000000 },
  fileFilter: fileFilterAlert,
});

/**
 * API Endpoint to upload the broker's sheet
 * @param {File}
 */

router.post(
  API_ENDPOINTS.POST_SUBMISSION,
  uploadAlert.single("sheetUpload"),
  async (req, res) => {
    const token = req.get("Authorization");
    const isTokenValid = verifyToken(token);

    if (isTokenValid !== true) {
      res.send({
        statusCode: 401,
        message: "Session Expired",
        error: true,
      });
      return;
    }

    const filePath = path.join(
      `${process.env.BROKER_FILE_PATH}/${req.file.filename}`
    );

    let isFileValid = await validateBrokerSubmission(filePath);

    if (isFileValid.statusCode === 200) {
      const totalRecords = await validateSubmissionRecord(filePath);
      isFileValid = { ...isFileValid, data: { ...totalRecords } };
    }

    deleteFileFromDirectory(filePath);

    res.send(isFileValid);
  }
);

const validateSubmission = (userId, companyIncno, periodEnded) => {
  return new Promise((resolve, reject) => {
    oracleDb.getConnection(
      {
        user: process.env.ORACLEDB_USER,
        password: process.env.ORACLEDB_PASSWORD,
        connectString: process.env.ORACLEDB_CONNECT_STRING,
      },
      (err, conn) => {
        if (!err) {
          console.log("Connected to the database successfully");
        } else {
          console.log(
            "Error occurred while trying to connect to the database: " +
              err.message
          );
        }

        conn.execute(
          DB_QUERIES.FETCH_SUBMISSIONS,
          [userId, companyIncno],
          (err, results) => {
            if (!err) {
              if (results.rows.length === 0) {
                conn.release((err) => {
                  if (!err) {
                    console.log("Connection closed with the database");
                  } else {
                    console.log(
                      "Error occurred while closing the connection with the database " +
                        err.message
                    );
                  }
                });
                resolve(true);
              }
              for (let i = 0; i < results.rows.length; i++) {
                if (results.rows[i][3] === periodEnded) {
                  conn.release((err) => {
                    if (!err) {
                      console.log("Connection closed with the database");
                    } else {
                      console.log(
                        "Error occurred while closing the connection with the database " +
                          err.message
                      );
                    }
                  });
                  resolve(false);
                }
              }
              resolve(true);
            } else {
              console.log(
                "Error occurred while fetching the submissions in Oracle " +
                  err.message
              );
            }

            conn.release((err) => {
              if (!err) {
                console.log("Connection closed with the database");
              } else {
                console.log(
                  "Error occurred while closing the connection with the database " +
                    err.message
                );
              }
            });
          }
        );
      }
    );
  });
};

/**
 * API Endpoint to confirm the user submission
 * @param {userId, userPin, recordType, companyId, companyName, companyIncno, submittedBy, recordCount, periodEnded, uploadFile}
 */

router.post(
  API_ENDPOINTS.CONFIRM_SUBMISSION,
  uploadAlert.single("uploadFile"),
  (req, res) => {
    const token = req.get("Authorization");
    const isTokenValid = verifyToken(token);

    if (isTokenValid !== true) {
      res.send({
        statusCode: 401,
        message: "Session Expired",
        error: true,
      });
      return;
    }

    if (req.body && req.file) {
      const {
        userId,
        userPin,
        recordType,
        companyId,
        companyName,
        companyIncno,
        submittedBy,
        recordCount,
        periodEnded,
      } = req.body;

      const isDateValid = validateDate(periodEnded);

      if(isDateValid.error === true) {
        res.send(isDateValid);
        return;
      }

      let isSubmissionValid = true;

      validateSubmission(userId, companyIncno, periodEnded).then((value) => {
        isSubmissionValid = value;
        if (isSubmissionValid) {
          const recordCountNum = Number(recordCount);
          const fileBuffer = fs.readFileSync(req.file.path);
          const blobData = Buffer.from(fileBuffer);

          const bindParams = {
            userId,
            userPin,
            recordType,
            companyId,
            companyName,
            companyIncno,
            submittedBy,
            recordCountNum,
            periodEnded,
            blobData: {
              dir: oracleDb.BIND_IN,
              type: oracleDb.BLOB,
              val: blobData,
            },
          };

          oracleDb.getConnection(
            {
              user: process.env.ORACLEDB_USER,
              password: process.env.ORACLEDB_PASSWORD,
              connectString: process.env.ORACLEDB_CONNECT_STRING,
              autoCommit: true,
            },
            (err, conn) => {
              if (!err) {
                console.log("Connected to the database successfully");
              } else {
                console.log(
                  "Error occurred while trying to connect to the database: " +
                    err.message
                );
              }

              conn.execute(
                DB_QUERIES.INSERT_FILE,
                bindParams,
                async (err, results) => {
                  if (!err) {
                    const data = await readExcelData(req.file.path);

                    const bindVariables = data.map((row) => [
                      userId,
                      companyId,
                      companyName,
                      companyIncno,
                      submittedBy,
                      row[0],
                      row[1],
                      row[2],
                      row[3],
                    ]);

                    conn.executeMany(
                      DB_QUERIES.INSERT_FILE_DATA,
                      bindVariables,
                      async (err, results) => {
                        if (!err) {
                          await conn.commit();
                          deleteFileFromDirectory(req.file.path);
                          res.send({
                            statusCode: 200,
                            message: "File Uploaded Successfully",
                            error: false,
                          });
                        } else {
                          console.log(
                            "Error occurred while inserting file data in Oracle" +
                              err.message
                          );
                        }

                        conn.release((err) => {
                          if (!err) {
                            console.log("Connection closed with the database");
                          } else {
                            console.log(
                              "Error occurred while closing the connection with the database " +
                                err.message
                            );
                          }
                        });
                      }
                    );
                  } else {
                    console.log(
                      "Error occurred while fetching the submissions in Oracle " +
                        err.message
                    );
                  }
                }
              );
            }
          );
        } else {
          res.send({
            statusCode: 409,
            message:
              "The data already exists for the period mentioned in the file. Kindly upload for a different period",
            error: true,
          });
        }
      });
    }
  }
);

/**
 * API Endpoint to authenticate the user
 * @param {userCnic, userCuin, userPin}
 */

router.post(API_ENDPOINTS.AUTH, (req, res) => {
  const { userCnic, userCuin, userPin } = req.body;

  db2.open(db2Config, (err, conn) => {
    if (!err) {
      console.log("Connected Successfully");
    } else {
      console.log("Error occurred while connecting with DB2: " + err.message);
    }

    conn.query(
      DB_QUERIES.AUTH_USER,
      [userCnic, userCuin, userPin],
      (err, results) => {
        if (!err) {
          if (results[0]?.SIGNATORY_ALLOWED === "YES") {
            res.send({
              data: {
                token: generateToken(userCuin),
                companyName: results[0].COMPANY_NAME,
                companyId: results[0].COMPANY_ID,
              },
              statusCode: 200,
              message: "Authenticated",
              error: false,
            });
          } else {
            res.send({
              statusCode: 401,
              message: "Invalid Credentials",
              error: true,
            });
          }
        } else {
          console.log(
            "Error occurred while searching for all the data: " + err.message
          );
        }

        conn.close((err) => {
          if (!err) {
            console.log("Connection closed with the database");
          } else {
            console.log(
              "Error occurred while trying to close the connection with the database " +
                err.message
            );
          }
        });
      }
    );
  });
});

router.get(API_ENDPOINTS.DOWNLOAD_SUBMISSION, (req, res) => {
  const token = req.get("Authorization");
  const isTokenValid = verifyToken(token);

  const uploadId = req.query.uploadId;

  if (isTokenValid !== true) {
    res.send({
      statusCode: 401,
      message: "Session Expired",
      error: true,
    });
    return;
  }

  oracleDb.getConnection(
    {
      user: process.env.ORACLEDB_USER,
      password: process.env.ORACLEDB_PASSWORD,
      connectString: process.env.ORACLEDB_CONNECT_STRING,
    },
    (err, conn) => {
      if (!err) {
        console.log("Connected to the database successfully");
      } else {
        console.log(
          "Error occurred while trying to connect to the database: " +
            err.message
        );
      }

      conn.execute(DB_QUERIES.GET_FILE, [uploadId], async (err, results) => {
        if (!err) {
          const blob = results.rows[0][0];
          const excelData = await blob.getData();

          const filePath = path.join(
            __dirname,
            "../template/download-submission.xlsx"
          );
          fs.writeFileSync(filePath, excelData);

          res.sendFile(filePath);
        } else {
          console.log(
            "Error occurred while getting the submission file in Oracle " +
              err.message
          );
        }

        conn.release((err) => {
          if (!err) {
            console.log("Connection closed with the database");
          } else {
            console.log(
              "Error occurred while closing the connection with the database " +
                err.message
            );
          }
        });
      });
    }
  );
});

module.exports = router;
