const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const { readdirSync } = require("fs");
const app = express();
app.use(express.json());

app.use(cors());
app.use(fileUpload({
  useTempFiles: true, 
}));

// routes
readdirSync("./routes").map((r) => app.use("/", require("./routes/" + r)));

// database
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
  })
  .then(() => console.log("Database connected success"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log("Server is listenign on ", +PORT);
});
