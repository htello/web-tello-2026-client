#!/usr/bin/env bash
# Sube/actualiza en Vercel las variables de .env.production
# (entornos production, preview y development).
#
# Requisitos (una sola vez):
#   pnpm dlx vercel login
#   pnpm dlx vercel link      # crea .vercel/ (gitignored)
#
# Uso: bash scripts/vercel-env.sh
# Las claves viajan por stdin y nunca se commitean.
set -euo pipefail

if [[ ! -f .env.production ]]; then
  echo "Falta .env.production en la raíz del proyecto." >&2
  exit 1
fi

while IFS='=' read -r key value; do
  [[ -z "$key" || "$key" == \#* ]] && continue
  for env in production preview development; do
    pnpm dlx vercel env rm "$key" "$env" -y >/dev/null 2>&1 || true
    printf '%s' "$value" | pnpm dlx vercel env add "$key" "$env" >/dev/null
    echo "✔ $key → $env"
  done
done < .env.production

echo "Variables sincronizadas. Redespliega en Vercel para que se apliquen."
