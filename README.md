# PublicSoftTools MCP Server

Give any MCP-compatible AI agent (Claude, Cursor, Windsurf) access to 14 utility tools from [PublicSoftTools](https://www.publicsofttools.com):

- **QR Code generation** — any text or URL
- **PDF tools** — compress, merge, split, PDF→Word, unlock
- **Hashing** — MD5, SHA-1, SHA-256, SHA-512 in one call
- **UUID generation** — batch up to 100
- **Base64** — encode/decode, URL-safe variant
- **Password generation** — configurable rules
- **IP lookup** — geolocation, ISP, proxy detection
- **DNS records** — A, AAAA, MX, TXT, CNAME, NS, SOA
- **SSL checker** — certificate details, expiry countdown
- **WHOIS** — domain registration info

## Get an API Key

Free (1,500 calls/month) — no credit card required:
👉 https://www.publicsofttools.com/account/api-keys

## Configure Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "publicsofttools": {
      "command": "npx",
      "args": ["-y", "publicsofttools-mcp"],
      "env": {
        "PST_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

Restart Claude Desktop. The tools will appear in the tools panel.

## Configure Cursor / Windsurf

```json
{
  "publicsofttools": {
    "command": "npx",
    "args": ["-y", "publicsofttools-mcp"],
    "env": { "PST_API_KEY": "your_api_key_here" }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `generate_qr_code` | QR code as PNG or SVG |
| `generate_hash` | MD5/SHA-1/SHA-256/SHA-512 |
| `generate_uuid` | UUID v4 (up to 100 at once) |
| `encode_decode_base64` | Encode or decode base64 |
| `generate_password` | Secure random password |
| `lookup_ip` | IP geolocation + proxy detection |
| `check_ssl` | SSL certificate details |
| `lookup_dns` | DNS record query |
| `whois_lookup` | Domain registration info |
| `compress_pdf` | Reduce PDF file size |
| `merge_pdfs` | Combine multiple PDFs |
| `split_pdf` | Split PDF by pages |
| `pdf_to_word` | Convert PDF to .docx |
| `unlock_pdf` | Remove PDF restrictions |

## Pricing

| Plan | Price | Calls/month |
|------|-------|-------------|
| Free | $0 | 1,500 |
| Starter | $29/mo | 15,000 |
| Pro | $99/mo | 100,000 |
| Business | Custom | 1M+ |

## License

MIT