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

export async function processPrepareCredit(entry) {
  const action = entry.actions[entry.processingAction];

  try {
    // Parse data from the Entry and validate it.
    validateEntity(
      { hash: entry.hash, data: entry.data, meta: entry.meta },
      ledgerSigner
    );
    validateEntity(entry.data?.intent);
    validateAction(action.action, entry.processingAction);

    const { address, symbol, amount } = extractAndValidateData({
      entry,
      schema: "credit",
    });

    // Save extracted data into Entry, we will need this for other Actions.
    entry.schema = "credit";
    entry.account = address.account;
    entry.symbol = symbol;
    entry.amount = amount;

    // Save Entry.
    await updateEntry(entry);
    // Save Intent from Entry.
    await saveIntent(entry.data.intent);

    // Processing prepeare Action for Credit Entry in the core is simple and
    // only checks if the account exists and is active. If something is wrong,
    // an Error will be thrown, and we will catch it later.
    const coreAccount = core.getAccount(Number(entry.account));
    coreAccount.assertIsActive();

    action.state = "prepared";
  } catch (error) {
    console.log(error);
    action.state = "failed";
    action.error = {
      reason: "bridge.unexpected-error",
      detail: error.message,
      failId: undefined,
    };
  }
}
