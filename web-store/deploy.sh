#!/bin/bash
set -euo pipefail

REGION="us-east-2"
get_secret() {
    aws ssm get-parameter --name "$1" --with-decryption --region "$REGION" --query Parameter.Value --output text
}

MONGODB_URL=$(get_secret /cube-store/mongodb-url)
ADMIN_PASSWORD_HASH=$(get_secret /cube-store/admin-password-hash | sed 's/\$/$$/g')
JWT_SECRET=$(get_secret /cube-store/jwt-secret)

cat > .env <<EOF
API_URL=http://3.144.128.221:4242
EOF

cat > backend.env <<EOF
MONGODB_URL=${MONGODB_URL}
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=${ADMIN_PASSWORD_HASH}
JWT_SECRET=${JWT_SECRET}
FRONTEND_URL=http://3.144.128.221:4200
EOF

sudo docker compose pull
sudo docker compose up -d
