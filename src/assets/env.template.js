(function(window) {
  window.env = window.env || {};

  // Environment variables
  // The placeholders will be replaced by the entrypoint.sh script.

  // URL of the backend spring boot application
  window.env.apiUrl = "${API_URL}";

  // OIDC Issuer
  window.env.issuer = "${ISSUER}";

  // OIDC Client ID
  window.env.clientId = "${CLIENT_ID}";

})(this);
