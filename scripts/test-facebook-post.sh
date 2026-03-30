#!/bin/bash
# Test script: Post an image to Facebook Page
#
# Prerequisites:
# 1. Go to https://developers.facebook.com/tools/explorer/
# 2. Select your app "Ahanas World" from the dropdown
# 3. Click "Generate Access Token"
# 4. Select permissions: pages_manage_posts, pages_read_engagement
# 5. Click "Generate Access Token" and approve
# 6. Then get your PAGE access token:
#    - In the Explorer, run: GET /me/accounts
#    - Copy the "access_token" from the response for your page
# 7. Paste that token below

PAGE_ACCESS_TOKEN="${1:?Usage: ./test-facebook-post.sh <PAGE_ACCESS_TOKEN>}"
PAGE_ID="61576444955473"
IMAGE_PATH="/Users/atanudey/Documents/Personal/GITHUB/ahanas-world/theme/smw1_fieldsvillage.jpg"
MESSAGE="🎨 Test post from Ahana's World! This is a Minecraft village scene from our creative studio."

echo "============================================"
echo "  Facebook Page Image Post Test"
echo "============================================"
echo ""
echo "Page ID:    $PAGE_ID"
echo "Image:      $IMAGE_PATH"
echo ""

# Check image exists
if [ ! -f "$IMAGE_PATH" ]; then
  echo "❌ Image not found: $IMAGE_PATH"
  exit 1
fi

echo "📤 Uploading image to Facebook Page..."
echo ""

RESPONSE=$(curl -s -X POST \
  "https://graph.facebook.com/v19.0/${PAGE_ID}/photos" \
  -F "source=@${IMAGE_PATH}" \
  -F "message=${MESSAGE}" \
  -F "access_token=${PAGE_ACCESS_TOKEN}")

echo "Response from Facebook:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

# Check for success
if echo "$RESPONSE" | grep -q '"id"'; then
  POST_ID=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('post_id', json.load(sys.stdin).get('id','')))" 2>/dev/null || echo "")
  echo "✅ SUCCESS! Image posted to Facebook Page."
  echo "🔗 View at: https://facebook.com/${PAGE_ID}"
  echo ""
else
  ERROR_MSG=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',{}).get('message','Unknown error'))" 2>/dev/null || echo "Check response above")
  echo "❌ FAILED: $ERROR_MSG"
  echo ""
  echo "Common fixes:"
  echo "  1. Token expired → Generate a new one from Graph API Explorer"
  echo "  2. Missing permissions → Ensure pages_manage_posts is granted"
  echo "  3. App not in Live mode → Go to App Dashboard > toggle Live mode ON"
fi
