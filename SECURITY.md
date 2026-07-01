# Security Policy

## Supported versions

| Version | Supported |
|---|---|
| 1.x | Yes |

## Reporting a vulnerability

If you discover a security issue in **pretium-mcp**, please **[open a GitHub issue](https://github.com/derrickbundi/pretium-mcp/issues/new)** in this repository.

Include:

- Description of the issue and potential impact
- Steps to reproduce
- Affected version or commit
- Any suggested fix (optional)

**Do not** paste live `PRETIUM_API_KEY` values, agent `secret_key`s, partner credentials, or production payout details in the issue. Use placeholders instead.

We aim to acknowledge reports within **3 business days**.

For sensitive findings you prefer not to discuss publicly, email [hello@pretium.africa](mailto:hello@pretium.africa) instead.

## Scope

**In scope**

- This repository (`pretium-mcp`): MCP transport exposure, credential handling, tool input validation, error responses leaking secrets

**Out of scope**

- Vulnerabilities in the Pretium payment API itself (report to Pretium separately)
- Issues requiring a valid partner API key obtained through legitimate partner onboarding
- Social engineering or phishing against Pretium staff or partners

## Security guidance for self-hosters

`pretium-mcp` acts as a **privileged proxy** to your Pretium partner account. Anyone who can reach the MCP server can invoke tools using your `PRETIUM_API_KEY`.

- **Never commit** `.env` or share `PRETIUM_API_KEY` / agent `secret_key` values
- **Bind to localhost** for development; do not expose `/mcp` or `/sse` to the public internet without authentication
- **Rotate keys** if you suspect exposure via logs, chat, or a shared deployment
- **One deployment per partner key** — do not share a single instance across untrusted users
- Treat `register_agent` `secret_key` like a password; never log tool arguments containing secrets

## Safe disclosure

We appreciate responsible disclosure. Reporters who follow this policy will be credited in release notes when fixes ship, unless they prefer to remain anonymous.
