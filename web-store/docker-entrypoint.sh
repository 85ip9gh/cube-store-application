#!/bin/sh
set -e

: "${API_URL:?API_URL environment variable is required}"
: "${CHECKOUT_ENABLED:=false}"

envsubst '${API_URL} ${CHECKOUT_ENABLED}' < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js

exec "$@"
