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

const getOwnerAccessRules = (publicKey) => {
  return [
    {
      action: "any",
      signer: {
        public: publicKey,
      },
    },
    {
      action: "read",
      bearer: {
        $signer: {
          public: publicKey,
        },
      },
    },
  ];
};

export async function sendIntentTransfer() {
  const claim = {
    action: "transfer",
    source: "account:1234@tesla",
    target: "account:000000000001@acap",
    symbol: "usd",
    amount: 1000, // 100.00
  };

  await ledger.intent
    .init()
    .data({
      handle: ledger.handle.unique(),
      claims: [claim],
      access: getOwnerAccessRules(bankKeyPair.public),
    })
    .hash()
    .sign([{ keyPair: bankKeyPair }])
    .send();
}

// Reading wallet informatión
export async function addWalletRoute(
  phoneWalletHandle = "tel:8299330001",
  accountHandle = "account:1234@tesla"
) {
  const { wallet, response } = await ledger.wallet.read(phoneWalletHandle);

  console.log(`>>> WALLET: ${JSON.stringify(wallet, null, 2)}`);
  console.log(`>>> RESPONSE: ${JSON.stringify(response.data, null, 2)}`);

  const routes = wallet.routes ?? [];
  let route = routes.find((route) => route.target === accountHandle);
  if (!route) {
    route = {
      action: "forward",
      target: accountHandle,
    };

    routes.push(route);
  }

  await ledger.wallet
    .from(response.data)
    .data({ routes })
    .hash()
    .sign([{ keyPair: bankKeyPair }])
    .send();
}
