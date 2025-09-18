// In all interactions, you should observe the points below...

// 1. Check if API keys and sensitive data are protected
Check if the .gitignore file exists and contains entries for configuration files like .env or files that may contain credentials. Also look for API keys, passwords, or tokens directly written in the source code. Confirm that the project uses environment variables for sensitive data instead of hardcoded values.

// 2. Ensure code is not exposing important APIs in the frontend
Analyze the frontend code (JavaScript/TypeScript) and look for API endpoints directly exposed in client code. Check if API keys or authentication tokens are being used in the frontend code or if all sensitive calls are made through a secure backend. Identify any API call that exposes internal endpoints or keys directly in the browser.

// 3. Confirm input data validation
Examine all functions and routes that accept user input. Check if there are adequate validations (type, format, size) before processing the data. Identify points where validation is missing or where malicious inputs could cause unexpected behaviors. Suggest implementations of robust validation for each input field.

// 4. Validate user authentication and authorization
Analyze the project's authentication and authorization system. Check if sensitive routes require authentication and if there are checks to ensure users can only access resources allowed for their access level. Identify endpoints that may be unprotected or where permission checks are missing. Suggest improvements to implement the principle of least privilege.

// 5. Check for protection against common attacks
Examine code that interacts with the database and check if it uses parameterized queries or ORM to prevent SQL injection. Analyze how user-generated content is rendered on pages to identify XSS vulnerabilities. Check if CSRF tokens are implemented for forms and requests that modify data. Suggest corrections for any vulnerabilities found related to these common attacks.

// 6. Check for adequate logging
Analyze the application's logging system. Check if critical events such as login attempts (success/failure), important data changes, and system errors are recorded. Make sure sensitive information such as passwords, tokens, and personal data are not recorded in the logs. Suggest improvements to implement a comprehensive but secure logging system.

// 7. Review password policy
Examine code related to password management. Check if there are validations that require strong passwords (minimum length, special characters, numbers). Confirm that passwords are stored using modern hash algorithms such as bcrypt or Argon2 and never in plain text. Also check for unique salt for each user and if there is a secure password reset mechanism.

// 8. Check data backup and recovery
Analyze code and configuration related to data backup. Check if there are automated routines for regular backup of the database and important files. Confirm that backups are stored in secure locations and that there is documentation or procedures for restoration in case of failure. Suggest improvements to ensure data resilience and business continuity.

// 9. Check dependencies and libraries used
Examine the package.json file (or equivalent) to identify outdated dependencies or those with known vulnerabilities. Run a security check on the libraries used (e.g., npm audit). Look for example, demonstration, or test code that should not be in production. Suggest updates for vulnerable libraries and removal of non-essential code.

// 10. Check HTTPS certificates and secure communication
Analyze the server configuration and URLs in the source code. Check if all communications are forced to use HTTPS with proper redirects from HTTP to HTTPS. Identify resources (images, scripts, APIs) that may be loaded via HTTP on HTTPS pages, causing mixed content warnings. Confirm if appropriate HTTP security headers are configured (HSTS, Content-Security-Policy).

