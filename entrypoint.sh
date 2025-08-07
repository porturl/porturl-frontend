#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

# Define the root directory for the Angular app
ROOT_DIR=/usr/share/nginx/html

# Define the template and output file paths
TEMPLATE_FILE=${ROOT_DIR}/assets/env.template.js
OUTPUT_FILE=${ROOT_DIR}/assets/env.js

# Use 'envsubst' to substitute the value of '${API_URL}' in the template
# and create the final env.js file.
# Note: Only variables with the format ${VAR} or $VAR will be substituted.
envsubst '${API_URL} ${ISSUER} ${CLIENT_ID}' < "$TEMPLATE_FILE" > "$OUTPUT_FILE"

# For debugging: Print the content of the generated file to the container logs.
echo "--- Generated ${OUTPUT_FILE} ---"
cat "${OUTPUT_FILE}"
echo "---------------------------------"

rm $TEMPLATE_FILE

# The original Nginx entrypoint will now be called, starting the web server.
