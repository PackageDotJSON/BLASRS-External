const express = require("express");
const cors = require("cors");
const http = require("http");
const routes = require("./routes/routes");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

app.disable("x-powered-by");

app.use(express.json());
app.use(cors());
app.use(routes);

const port = process.env.PORT;
const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Running on port ${port}`);
});
