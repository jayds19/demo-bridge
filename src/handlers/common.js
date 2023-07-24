import {
  createEntry,
  getEntry,
  updateEntry,
  upsertIntent,
} from "../../persistence";

export async function beginActionNew({ request, action }) {
  const handle = request.body?.data?.handle;

  if (!handle) {
    throw new Error("Invalid handle");
  }

  let entry = await getEntry(handle);

  // If the Entry does not exists already, create it.
  if (!entry) {
    entry = await createEntry({
      handle,
      hash: request.body.hash,
      data: request.body.data,
      meta: request.body.meta,
      schema: null,
      account: null,
      symbol: null,
      amount: null,
      state: null,
      previousState: null,
      actions: {},
      processingAction: null,
      processingStart: null,
    });
  }

  const alreadyRunning = !!entry.processingAction;

  if (alreadyRunning) {
    if (entry.processingAction !== request.body?.action) {
      throw new Error("Already processing another action.");
    } else {
      return { alreadyRunning: true, entry };
    }
  }

  const processingStart = new Date();

  entry.previusState = entry.state;
  entry.state = `processing-${action}`;
  entry.actions[action] = {
    hash: undefined,
    data: undefined,
    meta: undefined,
    action: action,
    state: "processing",
    coreId: undefined,
    error: {
      reason: undefined,
      detail: undefined,
      failId: undefined,
    },
    processingStart,
    processingEnd: null,
  };

  entry.processingAction = action;
  entry.processingStart = processingStart;

  // Save the result
  entry = await updateEntry(entry);
  return { alreadyRunning: false, entry };
}

export async function endAction(entry) {
  const currentAction = entry.actions[entry.processingAction];

  // Mark the Entry processing as completed and save the result.
  entry.previusState = entry.state;
  entry.state = currentAction.state;
  entry.processingAction = null;
  entry.processingStart = null;

  currentAction.processingEnd = new Date();

  entry = await updateEntry(entry);
  return entry;
}

export async function saveIntent(intent) {
  await upsertIntent({ handle: intent?.data?.handle, ...intent });
}
