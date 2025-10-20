// packages/web/src/flow/config.js

import { config } from "@onflow/fcl";

// Configure FCL for emulator development
config({
  // Points FCL to the Flow Emulator running on your computer
  "accessNode.api":
    process.env.NEXT_PUBLIC_FCL_ACCESS_NODE || "http://localhost:8888",

  // Local dev wallet for emulator
  "discovery.wallet":
    process.env.NEXT_PUBLIC_FCL_DISCOVERY_WALLET ||
    "http://localhost:8701/fcl/authn",

  // The name of our dApp to show in wallet pop-ups
  "app.detail.title": "Plink",
  "app.detail.icon": "https://placekitten.com/g/200/200",

  // Contract aliases for emulator
  "0xPlink": process.env.NEXT_PUBLIC_CONTRACT_PLINK || "0xf8d6e0586b0a20c7",
  "0xFungibleToken": "0xee82856bf20e2aa6",
});
