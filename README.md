# PublicSoftTools MCP Server

Give any MCP-compatible AI agent (Claude, Cursor, Windsurf) access to 14 utility tools from [PublicSoftTools](https://www.publicsofttools.com).

**npm:** `npx publicsofttools-mcp`  
**API docs:** https://www.publicsofttools.com/docs  
**Get a key:** https://www.publicsofttools.com/account/api-keys

---

## Tools included

| Tool | Endpoint | Description |
|------|----------|-------------|
| `generate_qr_code` | `POST /api/v1/util/qr` | QR code as base64 PNG or raw SVG |
| `generate_hash` | `POST /api/v1/util/hash` | MD5, SHA-1, SHA-256, SHA-384, SHA-512 |
| `generate_uuid` | `GET /api/v1/util/uuid` | UUID v4 — up to 100 at once |
| `encode_decode_base64` | `POST /api/v1/util/base64` | Encode or decode, with URL-safe variant |
| `generate_password` | `POST /api/v1/util/password` | Cryptographically secure password |
| `lookup_ip` | `GET /api/v1/ip/lookup` | Geolocation, ISP, ASN, proxy/VPN detection |
| `check_ssl` | `GET /api/v1/domain/ssl` | SSL certificate details + days remaining |
| `lookup_dns` | `GET /api/v1/domain/dns` | A, AAAA, MX, TXT, CNAME, NS, SOA records |
| `whois_lookup` | `GET /api/v1/domain/whois` | Domain registrar, dates, nameservers |
| `compress_pdf` | `POST /api/v1/pdf/compress` | Reduce PDF file size (max 4 MB) |
| `merge_pdfs` | `POST /api/v1/pdf/merge` | Combine 2–20 PDFs into one |
| `split_pdf` | `POST /api/v1/pdf/split` | Split by page range or every N pages |
| `pdf_to_word` | `POST /api/v1/pdf/to-word` | Convert PDF to editable .docx |
| `unlock_pdf` | `POST /api/v1/pdf/unlock` | Remove permission restrictions |

---

## Prerequisites

- **Node.js 18+** (required for native `fetch` support)
- A PublicSoftTools API key — [get one free](https://www.publicsofttools.com/account/api-keys) (1,500 calls/month, no credit card)

---

## Install & configure

### Claude Desktop

Add to your Claude Desktop config file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`  
**Linux:** `~/.config/claude/claude_desktop_config.json`

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

### Cursor

Open **Settings → MCP** and add:

```json
{
  "publicsofttools": {
    "command": "npx",
    "args": ["-y", "publicsofttools-mcp"],
    "env": { "PST_API_KEY": "your_api_key_here" }
  }
}
```

### Windsurf

Open **Settings → MCP Servers** and add the same JSON block as Cursor above.

---

## Tool reference

All tools require the `PST_API_KEY` environment variable. All file inputs/outputs use **base64-encoded** content.

---

### `generate_qr_code`

Generate a QR code image for any text, URL, or data.

**Parameters**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `text` | string | yes | — | Text, URL, or data to encode |
| `size` | number | no | 256 | Output size in pixels (64–1024) |
| `format` | `"png"` \| `"svg"` | no | `"png"` | Output image format |
| `dark` | string | no | `"#000000"` | Dark module color (hex) |
| `light` | string | no | `"#ffffff"` | Light module color (hex) |
| `error_correction` | `"L"` \| `"M"` \| `"Q"` \| `"H"` | no | `"M"` | Error correction level |

**Response**

```json
{
  "image": "data:image/png;base64,iVBORw0...",
  "format": "png",
  "size": 256
}
```

For `format: "svg"`, `image` is a raw SVG string instead of a data URL.

---

### `generate_hash`

Hash any text. Omit `algorithm` to get all five hashes in one call.

**Parameters**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `text` | string | yes | — | Text to hash (max 100,000 chars) |
| `algorithm` | `"md5"` \| `"sha1"` \| `"sha256"` \| `"sha384"` \| `"sha512"` | no | all | Hash algorithm |
| `encoding` | `"hex"` \| `"base64"` | no | `"hex"` | Output encoding |

**Response (all algorithms)**

```json
{
  "hashes": {
    "md5":    "5f4dcc3b5aa765d61d8327deb882cf99",
    "sha1":   "5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8",
    "sha256": "5e884898da28047151d0e56f8dc629277...",
    "sha384": "a8b64babd0aca91a59bdbb7761b421d4...",
    "sha512": "b109f3bbbc244eb82441917ed06d618b..."
  },
  "encoding": "hex",
  "input_length": 8
}
```

---

### `generate_uuid`

Generate UUID v4 values in batch.

**Parameters**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `count` | number | no | 1 | Number of UUIDs to generate (1–100) |

**Response**

```json
{
  "uuids": [
    "550e8400-e29b-41d4-a716-446655440000",
    "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
  ],
  "count": 2
}
```

---

### `encode_decode_base64`

Encode text to base64 or decode base64 back to plain text.

**Parameters**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `text` | string | yes | — | Input text (max 500,000 chars) |
| `action` | `"encode"` \| `"decode"` | yes | — | Operation to perform |
| `url_safe` | boolean | no | false | Use URL-safe variant (`-` and `_` instead of `+` and `/`) |

**Response**

```json
{
  "result": "aGVsbG8gd29ybGQ=",
  "action": "encode",
  "url_safe": false,
  "input_length": 11,
  "output_length": 16
}
```

---

### `generate_password`

Generate a cryptographically secure random password.

**Parameters**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `length` | number | no | 16 | Password length (8–128) |
| `uppercase` | boolean | no | true | Include uppercase letters (A–Z) |
| `numbers` | boolean | no | true | Include digits (0–9) |
| `symbols` | boolean | no | true | Include symbols (!@#$…) |

**Response**

```json
{
  "password": "kR7#mQ2@xZ9!wP4$",
  "length": 16,
  "entropy_bits": 98.6
}
```

---

### `lookup_ip`

Look up geolocation and network info for any IPv4 or IPv6 address.

**Parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `ip` | string | yes | IPv4 or IPv6 address (e.g. `8.8.8.8`) |

**Response**

```json
{
  "ip": "8.8.8.8",
  "country": "United States",
  "country_code": "US",
  "region": "California",
  "city": "Mountain View",
  "zip": "94043",
  "lat": 37.4056,
  "lon": -122.0775,
  "timezone": "America/Los_Angeles",
  "isp": "Google LLC",
  "org": "Google LLC",
  "asn": "AS15169 Google LLC",
  "is_mobile": false,
  "is_proxy": false,
  "is_hosting": true
}
```

---

### `check_ssl`

Check SSL/TLS certificate details for any domain.

**Parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `domain` | string | yes | Domain name (e.g. `example.com`) |

**Response**

```json
{
  "domain": "example.com",
  "valid": true,
  "issuer": "Let's Encrypt",
  "subject": "example.com",
  "san": ["example.com", "www.example.com"],
  "valid_from": "2026-01-01T00:00:00Z",
  "valid_to": "2026-04-01T00:00:00Z",
  "days_remaining": 22,
  "protocol": "TLSv1.3"
}
```

---

### `lookup_dns`

Query DNS records for a domain. Omit `type` to get all available record types at once.

**Parameters**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `domain` | string | yes | — | Domain to query (e.g. `example.com`) |
| `type` | `"A"` \| `"AAAA"` \| `"MX"` \| `"TXT"` \| `"CNAME"` \| `"NS"` \| `"SOA"` | no | all | Record type |

**Response**

```json
{
  "domain": "example.com",
  "records": {
    "A": ["93.184.216.34"],
    "MX": [{ "exchange": "mail.example.com", "priority": 10 }],
    "NS": ["ns1.example.com", "ns2.example.com"],
    "TXT": ["v=spf1 include:_spf.example.com ~all"]
  },
  "queried_at": "2026-06-09T12:00:00Z"
}
```

---

### `whois_lookup`

Get domain registration information.

**Parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `domain` | string | yes | Domain to look up (e.g. `example.com`) |

**Response**

```json
{
  "domain": "example.com",
  "registrar": "Example Registrar, Inc.",
  "registered_at": "1995-08-14T00:00:00Z",
  "expires_at": "2027-08-13T00:00:00Z",
  "updated_at": "2024-08-13T00:00:00Z",
  "nameservers": ["a.iana-servers.net", "b.iana-servers.net"],
  "status": ["clientDeleteProhibited", "clientTransferProhibited"]
}
```

---

### `compress_pdf`

Reduce PDF file size using Ghostscript compression. Max file size: 4 MB.

**Parameters**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `file_base64` | string | yes | — | Base64-encoded PDF content |
| `level` | `"screen"` \| `"ebook"` \| `"printer"` \| `"prepress"` | no | `"ebook"` | Compression level. `screen` = smallest, `prepress` = highest quality |

**Response**

```json
{
  "pdf": "<base64-encoded compressed PDF>",
  "original_size": 2048000,
  "compressed_size": 819200,
  "reduction_percent": 60
}
```

---

### `merge_pdfs`

Merge 2–20 PDF files into a single document. Max 4 MB per file.

**Parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `files_base64` | string[] | yes | Array of base64-encoded PDFs to merge in order (2–20 files) |

**Response**

```json
{
  "pdf": "<base64-encoded merged PDF>",
  "page_count": 12,
  "files_merged": 3
}
```

---

### `split_pdf`

Split a PDF into multiple documents. Max file size: 4 MB.

**Parameters**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `file_base64` | string | yes | — | Base64-encoded PDF to split |
| `mode` | `"range"` \| `"every_n"` \| `"every_page"` | yes | — | Split mode |
| `pages` | string | no | — | Page range when `mode=range`, e.g. `"1-3,5,7-9"` |
| `every_n` | number | no | — | Split every N pages when `mode=every_n` |

**Response**

```json
{
  "files": [
    "<base64-encoded PDF part 1>",
    "<base64-encoded PDF part 2>"
  ],
  "count": 2
}
```

---

### `pdf_to_word`

Convert a PDF to an editable Word document (.docx). Max file size: 4 MB.

**Parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `file_base64` | string | yes | Base64-encoded PDF to convert |

**Response**

```json
{
  "docx": "<base64-encoded .docx file>",
  "page_count": 5
}
```

---

### `unlock_pdf`

Remove owner-password permission restrictions from a PDF (print lock, copy lock, etc.). Does not require the password if only owner restrictions are set.

**Parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `file_base64` | string | yes | Base64-encoded PDF |
| `password` | string | no | PDF password, if the file requires one to open |

**Response**

```json
{
  "pdf": "<base64-encoded unlocked PDF>",
  "was_encrypted": true
}
```

---

## Authentication

Set your API key as an environment variable:

```bash
export PST_API_KEY=pst_live_your_key_here
```

Or pass it inline for a one-off test:

```bash
PST_API_KEY=pst_live_your_key_here node dist/index.js
```

The key is sent as `X-Api-Key: pst_live_...` on every request.

---

## Rate limits & plans

| Plan | Price | Calls/month |
|------|-------|-------------|
| Free | $0 | 1,500 |
| Starter | $29/mo | 15,000 |
| Pro | $99/mo | 100,000 |
| Business | Custom | 1,000,000+ |

When you exceed your limit the API returns `429 Too Many Requests`. Limits reset on the 1st of each month (UTC).

Get or upgrade your key: https://www.publicsofttools.com/account/api-keys

---

## Troubleshooting

**"PST_API_KEY environment variable is required"**  
The server exits immediately if no key is set. Make sure the `env` block in your MCP config has `PST_API_KEY` set.

**Tools don't appear in Claude Desktop**  
Verify the JSON config is valid (no trailing commas), then fully quit and reopen Claude Desktop — a window close isn't enough.

**`401 Unauthorized`**  
Your API key is invalid or has been revoked. Look it up again at https://www.publicsofttools.com/account/api-keys.

**`429 Too Many Requests`**  
You've hit your monthly limit. Upgrade your plan or wait for the 1st-of-month reset.

**`413 File Too Large`**  
PDF endpoints have a 4 MB binary limit. Compress or split the file before sending.

**Node version error**  
Run `node --version`. You need Node 18 or later for native `fetch`. Update via https://nodejs.org.

---

## License

MIT — see [LICENSE](LICENSE)