const router = require("express").Router();
const multer = require('multer');
const path = require('path');
const API_ENDPOINTS = require("../constants/api-endpoints.constant");
const DB_QUERIES = require("../constants/db-queries.constant");
const oracleDb = require("../client/oracle-client");
const dotenv = require("dotenv");
const validateBrokerSubmission = require("../helper/helper");
dotenv.config();

/**
 * API Endpoint to download the excel template
 * @param {}
 */

router.get(API_ENDPOINTS.TEMPLATE, (req, res) => {
  const templatePath = process.env.TEMPLATE_PATH;
  res.sendFile(templatePath);
});

/**
 * API Endpoint to get the list of submissions
 * @param {string} companyName
 */

router.get(API_ENDPOINTS.GET_SUBMISSIONS, (req, res) => {
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

      conn.execute(DB_QUERIES.FETCH_SUBMISSIONS, (err, results) => {
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
      });
    }
  );
});

/**
 * API Endpoint to upload the broker's sheet
 * @param {File}
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

router.post(API_ENDPOINTS.POST_SUBMISSION, uploadAlert.single("sheetUpload"), async (req, res) => {
  const filePath = path.join(`${process.env.BROKER_FILE_PATH}/${req.file.filename}`);

  const isFileValid = await validateBrokerSubmission(filePath);

  console.log(isFileValid);
});

module.exports = router;
