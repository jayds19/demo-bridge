import { beginActionNew, endAction, saveIntent } from "./common.js";
import { updateEntry } from "../persistence.js";
import { ledgerSigner, notifyLedger } from "../ledger.js";
import {
  extractAndValidateData,
  validateAction,
  validateEntity,
} from "../validators.js";
import core from "../core.js";

export async function prepareCredit(req, res) {
  const action = "prepare";

  // Begin the Action processing for new Entry which will also save it.
  let { alreadyRunning, entry } = await beginActionNew({
    request: req,
    action,
  });

  // The Entry is already saved, so we can return 202 Accepted to the Ledger
  // so that it stops redelivering the Action.
  res.sendStatus(202);

  if (!alreadyRunning) {
    await processPrepareCredit(entry);
    await endAction(entry);

    // If Entry is in final state, return the result to Ledger
    await notifyLedger(entry, action, ["prepared", "failed"]);
  }
}

export function processPrepareCredit(entry) {}
