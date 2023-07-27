import express from "express";

import { logRequest } from "./middleware/logging.js";
import { handleError, asyncErrorWrapper } from "./middleware/errors.js";
import { prepareCredit, commitCredit } from "./handlers/credits.js";
import { prepareDebit, commitDebit } from "./handlers/debits.js";

const app = express();

app.use(express.json());
app.use(logRequest);

const bankName = "ACAP";
const port = 3001;

app.get("/", (req, res) => {
  res.send(`${bankName} is running!`);
});

app.post("/credits", asyncErrorWrapper(prepareCredit));
app.post("/credits/:handle/commit", asyncErrorWrapper(commitCredit));
app.post("/debits", asyncErrorWrapper(prepareDebit));
app.post("/debits/:handle/commit", asyncErrorWrapper(commitDebit));

app.use(handleError);

app.listen(port, () => {
  console.log(`${bankName} running on port ${port}`);
});
