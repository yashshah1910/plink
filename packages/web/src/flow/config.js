// packages/web/src/flow/config.js

import { config } from "@onflow/fcl";

// Configure FCL for Flow Testnet
config({
  // Points FCL to the Flow Testnet
  "accessNode.api":
    process.env.NEXT_PUBLIC_FCL_ACCESS_NODE || "https://rest-testnet.onflow.org",

  // Testnet wallet discovery
  "discovery.wallet":
    process.env.NEXT_PUBLIC_FCL_DISCOVERY_WALLET ||
    "https://fcl-discovery.onflow.org/testnet/authn",

  // The name of our dApp to show in wallet pop-ups
  "app.detail.title": "Plink",
  "app.detail.icon": "https://placekitten.com/g/200/200",

  // Contract aliases for testnet
  "0xPlink": process.env.NEXT_PUBLIC_CONTRACT_PLINK || "0x35ac5d420c563f8e",
  "0xFungibleToken": "0x9a0766d93b6608b7",
});
