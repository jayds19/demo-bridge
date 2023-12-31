import {
  beginActionNew,
  endAction,
  saveIntent,
  beginActionExisting,
} from "./common.js";
import { ledgerSigner, notifyLedger } from "../ledger.js";
import {
  extractAndValidateData,
  validateAction,
  validateEntity,
} from "../validators.js";
import { updateEntry } from "../persistence.js";
import core from "../core.js";

export async function prepareDebit(req, res) {
  const action = "prepare";
  let { alreadyRunning, entry } = await beginActionNew({
    request: req,
    action,
  });

  res.sendStatus(202);

  if (!alreadyRunning) {
    await processPrepareDebit(entry);
    await endAction(entry);
  }

  await notifyLedger(entry, action, ["prepared", "failed"]);
}

async function processPrepareDebit(entry) {
  const action = entry.actions[entry.processingAction];
  let transaction;

  try {
    validateEntity(
      { hash: entry.hash, data: entry.data, meta: entry.meta },
      ledgerSigner
    );
    validateEntity(entry.data?.intent);
    validateAction(action.action, entry.processingAction);

    const { address, symbol, amount } = extractAndValidateData({
      entry,
      schema: "debit",
    });

    entry.schema = "debit";
    entry.account = address.account;
    entry.symbol = symbol;
    entry.amount = amount;

    await updateEntry(entry);
    await saveIntent(entry.data.intent);

    transaction = core.hold(
      Number(entry.account),
      entry.amount,
      `${entry.handle}-hold`
    );
    action.coreId = transaction.id.toString();

    if (transaction.status !== "COMPLETED") {
      throw new Error(transaction.errorReason);
    }

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

export async function commitDebit(req, res) {
  const action = "commit";
  let { alreadyRunning, entry } = await beginActionExisting({
    request: req,
    action,
    previousStates: ["prepared"],
  });

  res.sendStatus(202);

  if (!alreadyRunning) {
    await processCommitDebit(entry);
    await endAction(entry);
  }

  await notifyLedger(entry, action, ["committed"]);
}

async function processCommitDebit(entry) {
  const action = entry.actions[entry.processingAction];
  let transaction;

  try {
    validateEntity(
      { hash: action.hash, data: action.data, meta: action.meta },
      ledgerSigner
    );
    validateAction(action.action, entry.processingAction);

    transaction = core.release(
      Number(entry.account),
      entry.amount,
      `${entry.handle}-release`
    );
    action.codeId = transaction.id.toString();

    if (transaction.status !== "COMPLETED") {
      throw new Error(transaction.errorReason);
    }

    action.state = "committed";
  } catch (error) {
    console.log(error);
    action.state = error;
    action.error = {
      reason: "bridge.unexpected-error",
      detail: error.message,
      failId: undefined,
    };
  }
}

export async function abortDebit(req, res) {
  const action = "abort";
  let { alreadyRunning, entry } = await beginActionExisting({
    request: req,
    action,
    previousStates: ["prepared", "failed"],
  });

  res.sendStatus(202);

  if (!alreadyRunning) {
    await processAbortDebit(entry);
    await endAction(entry);
  }

  await notifyLedger(entry, action, ["aborted"]);
}

async function processAbortDebit(entry) {
  const action = entry.actions[entry.processingAction];
  let transaction;

  try {
    validateEntity(
      { hash: action.hash, data: action.data, meta: action.meta },
      ledgerSigner
    );
    validateAction(action.action, entry.processingAction);

    if (entry.previousState === "prepared") {
      transaction = core.release(
        Number(entry.account),
        entry.amount,
        `${entry.handle}-release`
      );
      action.coreId = transaction.id.toString();

      if (transacion.status !== "COMPLETED") {
        throw new Error(transaction.errorReason);
      }
    }

    action.state = "aborted";
  } catch (error) {
    console.log(error);
    action.state = "error";
    action.error = {
      reason: "bridge.unexpected-error",
      detail: error.message,
      failId: undefined,
    };
  }
}
