// packages/web/src/flow/config.js

import { config } from "@onflow/fcl";

// Configure FCL for emulator development
config({
  // Points FCL to the Flow Emulator running on your computer
  "accessNode.api": "http://localhost:8888",
  
  // Local dev wallet for emulator
  "discovery.wallet": "http://localhost:8701/fcl/authn",

  // The name of our dApp to show in wallet pop-ups
  "app.detail.title": "Plink",
  "app.detail.icon": "https://placekitten.com/g/200/200",

  // Contract aliases for emulator
  "0xPlink": "0xf8d6e0586b0a20c7",
  "0xFungibleToken": "0xee82856bf20e2aa6"
});
