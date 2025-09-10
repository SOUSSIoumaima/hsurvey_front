#!/bin/sh
# Generate config.json from environment variables
cat <<EOF > /usr/share/nginx/html/config.json
{
  "API_URL": "${REACT_APP_API_URL}"
}
EOF

# Start nginx
nginx -g 'daemon off;' 