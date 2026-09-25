# Can Gumroad's native license keys remove the per-sale owner step from il-biz-tools Pro?

**Date:** 2026-09-25 · **Type:** research spike, read-only (no product file changed) · **Verdict:** yes, in the code.
Gumroad mints a unique key per sale, puts it in the receipt, and verifies it at an endpoint that
takes only `product_id` + `license_key`, with no seller token. Its CORS rule answers any origin on
`api.gumroad.com`. All of this is read from Gumroad's source. None of it was observed live, because
`api.gumroad.com` is egress-blocked here (`curl: (56) CONNECT tunnel failed, response 403`).

## Source and method

- Repository: `github.com/antiwork/gumroad`, branch `main`, pinned at commit
  **`af1ae267f019d601b802b8d0324fb20fc6704e72`** (2026-09-25; found with `git ls-remote`). Every line
  number below refers to that commit. Files came from `raw.githubusercontent.com/antiwork/gumroad/<sha>/…`
  plus a sparse `git clone --filter=blob:none` of the same commit, used for grep.
- 0 WebSearch calls, 0 WebFetch calls. `gumroad.com` and `api.gumroad.com` were not reachable.
- Grades: **CODE** means I read the quoted line at that path and line. **INFERENCE** means it is
  reasoned from CODE lines and not read directly. Help-centre text in the repo
  (`app/views/help_center/…`) is Gumroad's own documentation. It is cited as documentation and
  never counts as proof of runtime behaviour.

---

## Q1. Is a unique key generated per sale automatically and put in the receipt? — **YES** (CODE)

The chain from a successful sale to the receipt:

- `app/models/purchase.rb:248`: the state machine calls the artifact step on success:
  `after_transition any => %i[successful not_charged gift_receiver_purchase_successful test_successful], :do => :create_artifacts_and_send_receipt!, …`
- `app/models/purchase.rb:2144-2145`: inside `create_artifacts_and_send_receipt!`:
  `create_license!` then `send_receipt`
- `app/models/purchase.rb:2158`: `return unless uses_license_key?`, and `:1414`:
  `link.is_licensed? && variant_content_permits_license_key?`
- `app/models/purchase.rb:2171`: `license = holder.create_license`. At `:2163`, a subscription
  renewal reuses the original purchase's license (`holder = is_recurring_subscription_charge ? subscription.original_purchase : self`).
- `app/models/license.rb:27`: `before_validation :generate_serial, on: :create`, and `:38`:
  `self.serial = SecureRandom.uuid.upcase.delete("-").scan(/.{8}/).join("-")`. The key is a random
  UUID in the form `XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX`.
- Receipt: `app/presenters/receipt_presenter/item_info.rb:132-136` returns `purchase.license_key`
  unless it is a gift-sender purchase. `app/views/customer_mailer/receipt/_item.html.erb:27-30`:
  `<% if item_props[:license_key].present? %> <h4>License key</h4> … <code><%= item_props[:license_key] %></code>`

**The one precondition is set once per product, not per sale.** A product is "licensed" when its
content contains a license-key block. `app/models/link.rb:1582`: `self.is_licensed = has_embedded_license_key?`.
`:1574` scans the rich content for `has_license_key?`. `app/models/rich_content.rb:14`:
`LICENSE_KEY_NODE_TYPE = "licenseKey"`. The seller's API can set it:
`app/controllers/api/v2/links_controller.rb:197-207` (create) and `:554` (update) accept `rich_content`
and then call `@product.recompute_is_licensed!`. Both actions require
`doorkeeper_authorize! :edit_products` (`:43`). **UNKNOWN:** whether the access token the owner mints
at step 3 carries that scope (`base_controller.rb:8` also accepts `:account`). If it does not, the
fallback is one click in the dashboard: "click 'Insert', and select 'License key'" (help article
`_76-license-keys.html.erb:28`). That is still a one-time step.

The help article (documentation) agrees, at `_76-license-keys.html.erb:43`: "Customers can find their key
in the receipt emailed to them after checkout, on the product's download page, and on the product's page
on Gumroad."

## Q2. Does verification need only the product id and key, with no seller access token? — **YES** (CODE)

- Route: `config/routes.rb:75-78`, inside `api_routes`: `resources :licenses, only: [] do collection do post :verify`.
  `api_routes` is mounted on the API host (`routes.rb:315-317`, `constraints ApiDomainConstraint`) and under
  `gumroad.com/api` (`:1234`).
- `app/controllers/api/v2/licenses_controller.rb:5`:
  `before_action(only: [:enable, :disable, :decrement_uses_count, :rotate]) { doorkeeper_authorize! :edit_products }`.
  **`verify` is not in that list.**
- `:8`: `skip_before_action :verify_authenticity_token, only: [:verify]` (no CSRF token needed).
- `:62-64`: `product = Link.find_by_external_id(params[:product_id])` and then
  `@license = product.licenses.find_by(serial: params[:license_key])`.
- Gumroad's own spec calls verify with no token: `spec/controllers/api/v2/licenses_controller_spec.rb:280`:
  `post :verify, params: { license_key: @purchase.license.serial }.merge(@product_identifier)` → 200.
- For a new product, `product_id` is mandatory in practice. Omitting it on a product created after the
  Redis cutoff returns HTTP 500 with "The 'product_id' parameter is required…" (`:71-80`). The help
  article dates that cutoff to Jan 9, 2023. `product_id` is the product's public external id and is safe
  to ship in page source.

## Q3. Does the endpoint answer a cross-origin browser request? — **YES in the code** (CODE; not observed live)

- `config/initializers/cors.rb:23-29`:
  ```ruby
  allow do
    origins "*"
    resource "*",
             headers: :any,
             methods: [:get, :post, :put, :delete],
             if: proc { |env| VALID_API_REQUEST_HOSTS.include?(env["HTTP_HOST"]) }
  end
  ```
- `config/domain.rb:21` (production): `valid_api_request_hosts: ["api.gumroad.com"],`
- `Gemfile:178`: `gem "rack-cors", "~> 2.0"`. The middleware is inserted first (`cors.rb:4`, `insert_before 0, Rack::Cors`).
- Gumroad's request spec asserts this for another endpoint on the same host:
  `spec/requests/cors_headers_spec.rb:16-21` expects `Access-Control-Allow-Origin` `"*"` and
  `Access-Control-Allow-Methods` `"GET, POST, PUT, DELETE"` for Host `api.gumroad.com`.
- Documentation: `_76-license-keys.html.erb:73`: "Can I make API calls from the browser? Yes, you can
  send API requests to `api.gumroad.com` from the browser."
- **Use `https://api.gumroad.com/v2/licenses/verify`, not `gumroad.com/api/v2/...`.** The CORS rule keys
  on Host `api.gumroad.com` exactly (INFERENCE from `cors.rb:28` + `domain.rb:21`). A form-encoded POST
  with no custom headers is a CORS "simple request" and needs no preflight.
- **Caveat:** this is how the code reads. Whether an edge proxy in front (`rack_attack.rb:17` reads
  `HTTP_CF_CONNECTING_IP`, which suggests Cloudflare) preserves or strips the headers is **UNKNOWN**
  until someone runs one live request from a browser.

## Q4a. What does verify return? — **answered** (CODE)

- Success body: `licenses_controller.rb:95`: `json = { success: true }.merge(@license.as_json(only: [:uses]))`,
  followed by `:98`: `json[:purchase] = purchase.payload_for_ping_notification.merge(purchase_as_json(purchase))`.
- **`uses`**: it increments on every verify **by default**. `:117`:
  `params[:increment_uses_count] = ["false", false].exclude?(params[:increment_uses_count])`, then
  `:58`: `@license.increment!(:uses) if params[:increment_uses_count]`. Send `increment_uses_count=false`
  on re-checks.
- **Disabled key**: HTTP 404, per `:38`:
  `return render json: { success: false, message: "This license key has been disabled." }, status: :not_found if @license.disabled?`
- **Seller revoked access**: 404, per `:88-90` (`@license.purchase&.is_access_revoked?`). That flag is set
  by the seller's `revoke_access` action (`api/v2/sales_controller.rb:221`), not by a refund.
- **Refund or chargeback does NOT fail verification.** The call still returns 200 with flags, so our code
  must check them. For non-subscription products, `purchase.rb:1202-1203`:
  `json[:chargebacked] = chargedback_not_reversed?` and `json[:refunded] = stripe_refunded == true`.
  Also `ping_notification.rb:78-79`: `disputed` and `dispute_won`. Gumroad's spec
  (`licenses_controller_spec.rb:337-348`) asserts HTTP 200 with `refunded == true` and
  `chargebacked == true`.
- **Subscription state**: `purchase.rb:1197-1198`. For recurring products the response carries
  `subscription_ended_at`, `subscription_cancelled_at` and `subscription_failed_at`, and the key stays
  enabled until the seller disables it (help article, "Managing licenses and subscriptions").
- **What else comes back (privacy-relevant):** `app/modules/purchase/ping_notification.rb`. The buyer's
  `email:` (`:14`), `full_name` (`:36`), `price`, `gumroad_fee`, `card: { visual:, type: }` (`:22-24`),
  `ip_country` (`:57`), custom fields (`:48-54`), `sale_id`, `order_number`, and the `license_key` itself
  (`:55`). Anyone who holds a key plus the public `product_id` can read these. That is a property of
  Gumroad's licensing, not something we can turn off.
- Gumroad keeps keys out of its application log: spec `licenses_controller_spec.rb:256-262`,
  "does not write license keys to the application log".

## Q4b. Is there a rate limit? — **UNKNOWN** (no limit in the app code; the edge is unknown)

- `config/initializers/rack_attack.rb` has **no rule for `/v2/licenses/verify`**. `grep -n -i licens`
  hits only `:199` and `:214`, which cover `/license_key_lookup_data`, a different endpoint.
- The catch-all-looking `throttle_by_ip path: "/"` (`:157`) is an exact path match
  (`matches_path?`, `:41-47`: `request.path == path`), so it does not cover verify.
- The generic `invalid_params` throttle (`:121-132`, name at `:122`) applies only to malformed parameter bodies.
- Cloudflare or other edge limits live outside this repo and are **UNKNOWN**. An earlier scout's note of
  "429s in practice" (`research/colony-sweep/scouts/storefronts--gumroad.md:119`) came from a third-party
  page, not from Gumroad. Design for occasional 429s regardless: verify once, then cache.

---

## Q5. Our code: what the owner does today, and what would change

### Today (read from our files)

**Once:**
- `node scripts/make-license.js init` (`scripts/make-license.js:5,28-45`). This needs a local clone and
  Node. It writes the private key to the gitignored `.license-key.json` and the public key into
  `src/config/site.json` `pro.publicKey` (currently `null`, `site.json:20`), and tells him "commit that
  one" (`:43`).
- Paste the product URL into `gumroad.productUrl` (currently `""`, `site.json:6`), per README
  "One-time steps", item 1.

**Per sale:** `node scripts/make-license.js issue <buyer email or Gumroad sale id>` (`make-license.js:6,47-68`;
README "Setting it up (owner, once)" block: `issue buyer@example.com   # per sale: print the key to send`).
He then has to get that key to the buyer. README "How the buyer gets the key" places it in "the product's
content / licence field" and flags the placement 🔍 **Unverified**. The earlier audit already showed the
path does not hold (`research/owner-docs-audit/il-biz-tools.md`, F4): the key's subject is minted after
the sale (`make-license.js:59`), but product content is fixed before the sale and identical for every
buyer. **So today Pro needs a recurring owner action and a delivery channel that does not exist.** The
mandate forbids both.

The button enforces this too. `src/lib/gumroad.js:66-74` keeps Pro disabled (`no_public_key`) until
`pro.publicKey` is set.

### What a Gumroad-native key would change (INFERENCE from our files + the CODE above)

| Area | Today | With a Gumroad-native key |
|---|---|---|
| Key format | `ILBIZ1.<payload>.<sig>`; `license.js:41` rejects anything else | Gumroad's `XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX`. Needs a new verifier; `license.js` ECDSA path retired |
| Verification | fully offline, Web Crypto (`license.js:61-86`) | network call to `https://api.gumroad.com/v2/licenses/verify`, at least on first activation |
| Config | `pro.publicKey` (JWK) | `gumroad.productId` (public external id), with no secret anywhere |
| CSP | `connect-src 'self' https://plausible.io https://*.posthog.com` (`netlify.toml:19`) | must add `https://api.gumroad.com` to `connect-src` |
| Button gate | `proButtonState` requires URL + `publicKey` (`gumroad.js:49-81`) | requires URL + `productId` |
| Owner per sale | run `issue`, deliver the key (impossible as specified) | **nothing**: Gumroad mints and emails the key (Q1) |
| Owner once | `init`, commit `site.json`, paste URL | nothing beyond step 3, if the agent can create the product with a `licenseKey` block via API (token scope UNKNOWN). Otherwise one click to insert the License key block |
| Key leaves the browser? | never | yes: key + `product_id` go to Gumroad, which also sees the buyer's IP, User-Agent, time and our Origin |
| Buyer PII in the browser | none | the verify response carries the buyer's own email, name, price, card display, `ip_country` (Q4a). Keep only `success`, `uses` and the flags; never store or log the rest |
| Refunds / chargebacks | cannot be detected (a signed key is valid forever) | detectable via `refunded` / `chargebacked` / `disputed` on re-check |
| Revocation | none short of rotating the whole keypair | seller can `disable` one key (404 on verify) |
| Losing a secret | losing `.license-key.json` stops new issuance | no secret to lose |
| README claims to rewrite | "Nothing from Gumroad is loaded into this site" and "No server-side secret…"; the first no longer covers a `fetch` to Gumroad | — |

`assets/page-invoice.js:181-199` (`activate`) becomes an async fetch plus flag checks. The existing
`?purchased=1` hint (`:258-262`) keeps working unchanged.

---

## Options

Each option lists what the owner does **once**, what he does **per sale**, and what it costs.

**Option A — Keep our signed offline key; the owner issues per sale (status quo).**
- Once: `make-license.js init`, commit `site.json`, paste the product URL.
- Per sale: run `issue` and deliver the key by a channel that does not exist.
- Cost: none in privacy (the key never leaves the browser); fully offline. **Violates the mandate**
  (a recurring owner task) and cannot work as specified. Reject.

**Option B — Gumroad-native key, verified from the browser on every use.**
- Once: nothing beyond owner step 3 (store, payout, token) *if* the agent can create the product with a
  `licenseKey` rich-content node via `POST/PUT /v2/products` (token scope UNKNOWN). Otherwise one
  dashboard click: Insert → License key.
- Per sale: **nothing** (Q1, CODE).
- Cost: **offline lost**. No network means no Pro. Every use sends the key, IP and timing to Gumroad,
  and brings the buyer's own PII back into the page. Each use increments `uses` unless we send
  `increment_uses_count=false`. It depends on Gumroad's CORS continuing to hold (documented, not
  observed) and on unknown edge rate limits.

**Option C — Gumroad-native key, verify once and then cache (recommended).**
- Once: same as B.
- Per sale: **nothing**.
- Flow: on activation, POST `product_id` + `license_key` (default increment, so `uses` counts
  activations). Accept only `success && !refunded && !chargebacked && !disputed`. Store the key plus the
  verification time in `localStorage` and discard the rest of the response. Pro then works offline.
  Re-check in the background at most every N days with `increment_uses_count=false`, and switch Pro off
  only on a definitive 404 or refund flag, never on a network error or 429.
- Cost: offline after first activation, lost only on the first one. Gumroad sees one request per
  activation or re-check, not per use. PII still transits the buyer's own browser once per check. A
  refund is caught at the next re-check, not instantly. Client-side gating stays bypassable by editing
  JS (true today as well, per `license.js:8-11`).

**Option D — Exchange server: a Netlify Function verifies the Gumroad key and returns our ECDSA-signed key.**
- Once: the signing private key must live as a server env var. The agent can set it if it holds a
  Netlify token with that permission (not checked here); otherwise the owner pastes one env var once.
  Product setup is the same as B.
- Per sale: **nothing**.
- Cost: keeps `license.js` offline verification after exchange. Gumroad sees our function's IP instead
  of the buyer's, and the buyer's PII never reaches the browser (the function drops it). It adds a server
  component and a secret to a site the README sells as static and secret-free, plus function limits and
  code to maintain. Adopt it only if C's CORS assumption fails on the live test.

**Option E — One static signed key in the product content (shared by all buyers).**
- Once: generate the keypair and one key; put the key in the product content.
- Per sale: **nothing**.
- Cost: full offline and zero privacy exposure. But it is a shared password: one leak unlocks Pro for
  everyone, with no per-buyer revocation and no refund detection. Honest only if sold as exactly that.
  It is dominated by C.

**Rejected variant — the colony signs per sale in CI (the F4 proposal).** The colony can read sales
hourly with `GUMROAD_ACCESS_TOKEN`. But I found no channel in what I read by which the agent could hand
a per-sale key to the buyer, and it adds up to an hour of delay. Gumroad's own key already solves
delivery.

## What must happen before any option is called working

1. **One live browser request** (from a machine with egress to `api.gumroad.com`) to
   `POST https://api.gumroad.com/v2/licenses/verify` from a foreign origin, checking that the response
   carries `Access-Control-Allow-Origin: *`. This turns Q3 from CODE into RENDERED. Until then C rests
   on source reading alone.
2. Confirm the owner-minted token's scopes, to decide whether "insert the License key block" is agent
   work or a one-time owner click.
3. Write tests for the new verifier (flag handling, 404, 429, network error → keep cached Pro) before
   touching `license.js` / `page-invoice.js`.
