export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const script = SETUP_SCRIPT_TEMPLATE.split("__APP_URL__").join(appUrl);

  return new Response(script, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

// NOTE: In JS template literals, only `${` triggers interpolation.
// Bare `$VAR` is emitted literally. We escape `${...}` with `\${...}`.
const SETUP_SCRIPT_TEMPLATE = `#!/bin/bash
set -e

APP_URL="__APP_URL__"
TOKEN="\${1:-}"
CONFIG_DIR="$HOME/.config/ai-camp"
CODEX_HOOKS="$HOME/.codex/hooks.json"

echo ""
echo "  AI Native Camp - Codex CLI Setup"
echo "  ================================="
echo ""

# --------------------------------------------------
# 1. Validate token
# --------------------------------------------------
if [ -z "$TOKEN" ]; then
  echo "  ERROR: Token is required."
  echo "  Usage: curl -sL \\"$APP_URL/api/setup-codex\\" | bash -s -- <your_token>"
  exit 1
fi

if [[ "$TOKEN" != aicamp_* ]]; then
  echo "  ERROR: Invalid token format. Token must start with 'aicamp_'."
  exit 1
fi

echo "  [1/6] Token validated"

# --------------------------------------------------
# 2. Save config files
# --------------------------------------------------
mkdir -p "$CONFIG_DIR"

echo -n "$TOKEN" > "$CONFIG_DIR/token"
chmod 600 "$CONFIG_DIR/token"

echo -n "$APP_URL" > "$CONFIG_DIR/api_url"

echo "  [2/6] Config saved to $CONFIG_DIR"

# --------------------------------------------------
# 3. Download hook script
# --------------------------------------------------
curl -sL "$APP_URL/api/hook-script-codex" -o "$CONFIG_DIR/report-usage-codex.js"
chmod 644 "$CONFIG_DIR/report-usage-codex.js"

echo "  [3/6] Hook script downloaded"

# --------------------------------------------------
# 4. Enable Codex hooks feature flag
# --------------------------------------------------
codex -c features.codex_hooks=true 2>/dev/null || true

echo "  [4/6] Codex hooks feature flag enabled"

# --------------------------------------------------
# 5. Register Stop + SessionStart hooks in hooks.json
# --------------------------------------------------
mkdir -p "$HOME/.codex"

if [ ! -f "$CODEX_HOOKS" ]; then
  echo '{}' > "$CODEX_HOOKS"
fi

node -e "
const fs = require('fs');
const f = process.env.HOME + '/.codex/hooks.json';
const s = JSON.parse(fs.readFileSync(f, 'utf8'));
if (!s.hooks) s.hooks = {};
var hookPath = process.env.HOME + '/.config/ai-camp/report-usage-codex.js';
var cmd = 'node ' + hookPath;

// Stop hook
if (!s.hooks.Stop) s.hooks.Stop = [];
var stopIdx = s.hooks.Stop.findIndex(function(h) {
  return h.hooks && h.hooks.some(function(hh) {
    return hh.command && hh.command.includes('ai-camp/report-usage-codex');
  });
});
var stopEntry = { matcher: null, hooks: [{ type: 'command', command: cmd }] };
if (stopIdx >= 0) {
  s.hooks.Stop[stopIdx] = stopEntry;
} else {
  s.hooks.Stop.push(stopEntry);
}

// SessionStart hook
if (!s.hooks.SessionStart) s.hooks.SessionStart = [];
var ssIdx = s.hooks.SessionStart.findIndex(function(h) {
  return h.hooks && h.hooks.some(function(hh) {
    return hh.command && hh.command.includes('ai-camp/report-usage-codex');
  });
});
var ssEntry = { matcher: null, hooks: [{ type: 'command', command: cmd, timeout: 5 }] };
if (ssIdx >= 0) {
  s.hooks.SessionStart[ssIdx] = ssEntry;
} else {
  s.hooks.SessionStart.push(ssEntry);
}

// PostToolUse hook (30분 간격 중간 전송)
if (!s.hooks.PostToolUse) s.hooks.PostToolUse = [];
var ptuIdx = s.hooks.PostToolUse.findIndex(function(h) {
  return h.hooks && h.hooks.some(function(hh) {
    return hh.command && hh.command.includes('ai-camp/report-usage-codex');
  });
});
var ptuEntry = { matcher: null, hooks: [{ type: 'command', command: cmd, timeout: 5 }] };
if (ptuIdx >= 0) {
  s.hooks.PostToolUse[ptuIdx] = ptuEntry;
} else {
  s.hooks.PostToolUse.push(ptuEntry);
}

fs.writeFileSync(f, JSON.stringify(s, null, 2) + '\\n');
"

echo "  [5/6] Codex hooks registered (Stop + SessionStart + PostToolUse)"

# --------------------------------------------------
# 6. Call onboard API
# --------------------------------------------------
ONBOARD_STATUS=\$(curl -s -o /dev/null -w "%\{http_code}" \\
  -X POST "$APP_URL/api/usage/onboard" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $TOKEN" \\
  -d '{"cli_type":"codex"}')

if [ "$ONBOARD_STATUS" = "200" ] || [ "$ONBOARD_STATUS" = "201" ]; then
  echo "  [6/6] Registered on leaderboard"
else
  echo "  [6/6] Onboard API returned status $ONBOARD_STATUS (non-fatal)"
fi

echo ""
echo "  Setup complete!"
echo "  Your Codex usage will now be tracked on the leaderboard."
echo ""
`;
