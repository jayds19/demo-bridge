import express from "express";

import { logRequest } from "./middleware/logging.js";
import { handleError, asyncErrorWrapper } from "./middleware/errors.js";
import { prepareCredit } from "./handlers/credits.js";

const app = express();

app.use(express.json());
app.use(logRequest);

const bankName = "ACAP";
const port = 3001;

app.get("/", (req, res) => {
  res.send(`${bankName} is running!`);
});

app.post("/credits", asyncErrorWrapper(prepareCredit));

app.use(handleError);

app.listen(port, () => {
  console.log(`${bankName} running on port ${port}`);
});
