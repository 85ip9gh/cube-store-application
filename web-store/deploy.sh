#!/bin/bash
set -euo pipefail

REGION="${AWS_REGION:-us-east-2}"
: "${API_URL:?Set API_URL to the public backend URL}"
: "${FRONTEND_URL:?Set FRONTEND_URL to the public storefront URL}"
get_secret() {
    aws ssm get-parameter --name "$1" --with-decryption --region "$REGION" --query Parameter.Value --output text
}

MONGODB_URL=$(get_secret /cube-store/mongodb-url)
ADMIN_PASSWORD_HASH=$(get_secret /cube-store/admin-password-hash | sed 's/\$/$$/g')
JWT_SECRET=$(get_secret /cube-store/jwt-secret)
STRIPE_SECRET_KEY=$(get_secret /cube-store/stripe-secret-key | sed 's/\$/$$/g')

cat > .env <<EOF
API_URL=${API_URL}
EOF

cat > backend.env <<EOF
MONGODB_URL=${MONGODB_URL}
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=${ADMIN_PASSWORD_HASH}
JWT_SECRET=${JWT_SECRET}
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
FRONTEND_URL=${FRONTEND_URL}
EOF

sudo docker compose pull
sudo docker compose up -d
