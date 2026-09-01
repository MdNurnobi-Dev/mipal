# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## 🔒 Security Architecture & Practices

MicroJob Pro follows security principles suitable for client-side and hybrid full-stack applications:

1. **Client-Side Data Isolation**: Sensitive configuration, secret tokens, and API credentials must remain strictly in backend environment variables (`process.env`) and never be leaked into client bundles with `VITE_` prefixes unless intended for public consumption.
2. **File Upload Hardening**:
   - Avatar and payment receipt uploads are restricted to valid image MIME types (`image/jpeg`, `image/png`, `image/webp`, `image/gif`).
   - Uploaded assets are base64-encoded and size-constrained to prevent storage exhaustion.
3. **Transaction Immutability**: All balance adjustments (deposits, payouts, plan purchases) are tracked with unique transaction IDs (`txId`) and audit timestamps.
4. **Input Sanitization**: All user-generated text inputs (names, bio, community posts, comment threads) are escaped and safely rendered to prevent Cross-Site Scripting (XSS).

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability within **MicroJob Pro**, please do **NOT** create a public GitHub issue. Instead, report the vulnerability privately:

- **Email**: `security@microjobpro.com` or `victorsteele428@gmail.com`
- Please provide:
  - Description of the vulnerability.
  - Step-by-step reproduction instructions or proof-of-concept.
  - Assessment of potential security impact.

We strive to acknowledge receipt of security reports within 48 hours and provide remediation timelines accordingly.
