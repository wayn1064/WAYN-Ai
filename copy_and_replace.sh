#!/bin/bash
set -e
cd "/Users/wain/Library/Mobile Documents/com~apple~CloudDocs/WAYN-Ai Program/WAYN-Ai/frontend/src/features"
cp -R denti-ai-app cafein-ai-app

cd cafein-ai-app

# Rename files
mv components/DentiLayout.tsx components/CafeinLayout.tsx
mv pages/DentiDashboardPage.tsx pages/CafeinDashboardPage.tsx

# Replace contents in all files
find . -type f -exec sed -i '' -e 's/DENTi-Ai/CAFEiN-Ai/g' {} +
find . -type f -exec sed -i '' -e 's/Denti/Cafein/g' {} +
find . -type f -exec sed -i '' -e 's/denti/cafein/g' {} +
find . -type f -exec sed -i '' -e 's/치과 병의원/프랜차이즈 카페/g' {} +
find . -type f -exec sed -i '' -e 's/치과/카페/g' {} +
find . -type f -exec sed -i '' -e 's/병원/카페/g' {} +
find . -type f -exec sed -i '' -e 's/원장/점주/g' {} +
find . -type f -exec sed -i '' -e 's/페이닥터/바리스타/g' {} +
find . -type f -exec sed -i '' -e 's/데스크 직원/매장 직원/g' {} +

echo "Done"
