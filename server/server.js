const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const http = require("http");
const routes = require("./routes/routes");
const app = express();
const path = require("path");
const rateLimit = require("./helper/rate-limiter");
const compression = require("compression");
const dotenv = require("dotenv");
dotenv.config();

app.use(helmet());

app.use(compression());

app.disable("x-powered-by");

app.use(express.static(path.join(__dirname, "../dist/blasrs-external")));

app.get("/*", (req, res) => res.sendFile(path.join(__dirname)));

app.use(express.json());
app.use(cors());
app.use(rateLimit);
app.use(routes);

const port = process.env.PORT;
const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Running on port ${port}`);
});
