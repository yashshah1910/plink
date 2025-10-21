#!/bin/bash

# Update Contract Addresses Script
# This script updates all Plink contract addresses in your frontend code

if [ -z "$1" ]; then
  echo "Usage: ./update-addresses.sh <new-contract-address>"
  echo "Example: ./update-addresses.sh 0xabcdef1234567890"
  exit 1
fi

NEW_ADDRESS=$1
OLD_ADDRESS="0x360397b746e4c184"

echo "🔄 Updating contract addresses from $OLD_ADDRESS to $NEW_ADDRESS"

# Update all TypeScript/JavaScript files in web package
find ../web/src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) -exec sed -i '' "s/$OLD_ADDRESS/$NEW_ADDRESS/g" {} +

echo "✅ Updated all files in web/src"

# Update Cadence scripts and transactions
find ./cadence -type f -name "*.cdc" -exec sed -i '' "s/$OLD_ADDRESS/$NEW_ADDRESS/g" {} +

echo "✅ Updated all Cadence files"

echo ""
echo "📝 Summary:"
echo "  - Old address: $OLD_ADDRESS"
echo "  - New address: $NEW_ADDRESS"
echo "  - Files updated in: ../web/src and ./cadence"
echo ""
echo "🚀 Next steps:"
echo "  1. Review the changes: git diff"
echo "  2. Deploy contract: flow deploy --network=testnet"
echo "  3. Test your application"
