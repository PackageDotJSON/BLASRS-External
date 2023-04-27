const express = require("express");
const cors = require("cors");
const http = require("http");
const routes = require("./routes/routes");
const app = express();
const path = require("path");
const compression = require("compression");
const dotenv = require("dotenv");
dotenv.config();

app.use(compression());

app.disable("x-powered-by");

app.enable("trust proxy");

app.use(express.static(__dirname + '/dist/blasrs-external'));

app.get('/*', (req, res) => res.sendFile(path.join(__dirname)));

app.use(express.json());
app.use(cors());
app.use(routes);

const port = process.env.PORT;
const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Running on port ${port}`);
});
