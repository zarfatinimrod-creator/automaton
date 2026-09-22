#!/usr/bin/env bash
# Quick egress probe: prints HTTP status per URL (000 = blocked/unreachable).
# Usage: scripts/egress-check.sh [url ...]   (defaults to the platforms the revenue colony talks to)
set -u
urls=("$@")
if [ ${#urls[@]} -eq 0 ]; then
  urls=(
    https://registry.npmjs.org/apify/latest
    https://api.github.com
    https://data.gov.il/api/3/action/package_search?q=test
    https://api.apify.com/v2/store?limit=1
    https://api.telegram.org
    https://api.stripe.com
    https://api.lemonsqueezy.com/v1/orders
    https://api.gumroad.com/v2/sales
    https://x402.org
    https://api.netlify.com/api/v1/
  )
fi
for u in "${urls[@]}"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$u" 2>/dev/null || echo 000)
  printf "%s  %s\n" "$code" "$u"
done
