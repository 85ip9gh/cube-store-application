#!/bin/bash
set -euo pipefail

REGION="us-east-2"
MONGODB_URL=$(aws ssm get-parameter --name /cube-store/mongodb-url --with-decryption --region "$REGION" --query Parameter.Value --output text)

cat > .env <<EOF
MONGODB_URL=${MONGODB_URL}
API_URL=http://3.144.128.221:4242
EOF

sudo docker compose pull
sudo docker compose up -d
