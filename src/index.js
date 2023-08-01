import express from "express";

import { logRequest } from "./middleware/logging.js";
import { handleError, asyncErrorWrapper } from "./middleware/errors.js";
import {
  prepareCredit,
  commitCredit,
  abortCredit,
} from "./handlers/credits.js";
import { prepareDebit, commitDebit, abortDebit } from "./handlers/debits.js";
import { updateIntent } from "./handlers/intents.js";

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
app.post("/credits/:handle/abort", asyncErrorWrapper(abortCredit));
app.post("/debits", asyncErrorWrapper(prepareDebit));
app.post("/debits/:handle/commit", asyncErrorWrapper(commitDebit));
app.post("/debits/:handle/abort", asyncErrorWrapper(abortDebit));
app.post("/intents/:handle", asyncErrorWrapper(updateIntent));

app.use(handleError);

app.listen(port, () => {
  console.log(`${bankName} running on port ${port}`);
});
