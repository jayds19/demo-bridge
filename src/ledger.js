import ledgerSdk from "@minka/ledger-sdk";

const { LedgerSdk } = ledgerSdk;

// Populate this object with bank keys you have created previously.
const bankKeyPair = {
  format: "ed25519-raw",
  public: "c+FFbeXgBA3OdRK0QfuXnSochdXHFZL91peUquocV/8=",
  secret: "7hPsFB//C9/bStiKqzwcGJMpHBe0zyCa+3XZMZTVr90=",
};

// Populate with Ledger public key data.
export const ledgerSigner = {
  format: "ed25519-raw",
  public: "9+anQm7Kv7SKF7ga5jOaTOqhOcH3ZH+ZUBh99X1JqNs=",
};

// Configure the Ledger SDK.
const ledger = new LedgerSdk({
  // This is the ledger instance we are going to connect to.
  ledger: "cardnet",
  server: "https://ldg-stg.one/api/v2",
  secure: {
    aud: "demo",
    iss: "acap",
    keyPair: bankKeyPair,
    sub: bankKeyPair.public,
    exp: 3600,
  },
});

// This function is used to notify Ledger of Entry processing final statuses.
export async function notifyLedger(entry, action, notifyStates) {
  const notifyAction = entry.actions[action];

  if (!notifyStates.includes(notifyAction.state)) {
    return;
  }

  const custom = {
    handle: entry.handle,
    status: notifyAction.state,
    coreId: notifyAction.coreId,
    reason: notifyAction.error.reason,
    detail: notifyAction.error.detail,
    failId: notifyAction.error.failId,
  };
  console.log(`>>> ENTRY TO SEND: ${JSON.stringify(entry, null, 2)}`);
  const ledgerResponse = await ledger.intent
    .from(entry.data.intent)
    .hash()
    .sign([
      {
        keyPair: bankKeyPair,
        custom,
      },
    ])
    .send();
  console.log(`SENT signature to Ledger\n${JSON.stringify(custom, null, 2)}`);
}
