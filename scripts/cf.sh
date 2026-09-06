#!/usr/bin/env bash
# 自动载入当前项目的 .env 并执行 wrangler，实现账号隔离
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [ -f "$ROOT_DIR/.env" ]; then
  set -a
  source "$ROOT_DIR/.env"
  set +a
fi
exec npx wrangler "$@"
