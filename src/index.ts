#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

// ── Config ────────────────────────────────────────────────────────────────────

const API_BASE = "https://www.publicsofttools.com/api/v1";
const API_KEY = process.env.PST_API_KEY;

if (!API_KEY) {
  console.error("Error: PST_API_KEY environment variable is required.");
  console.error("Get a free key at: https://www.publicsofttools.com/account/api-keys");
  process.exit(1);
}

// ── Helper ────────────────────────────────────────────────────────────────────

async function callApi(
  path: string,
  method: "GET" | "POST" = "GET",
  body?: Record<string, unknown>
): Promise<unknown> {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    "X-Api-Key": API_KEY as string,
    "Content-Type": "application/json",
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new McpError(
      ErrorCode.InternalError,
      `API error ${res.status}: ${text}`
    );
  }

  return res.json();
}

// ── Tool definitions ──────────────────────────────────────────────────────────

const TOOLS = [
  // --- Utility tools ---
  {
    name: "generate_qr_code",
    description:
      "Generate a QR code image for any text, URL, or data. Returns a base64 PNG or SVG image.",
    inputSchema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "Text, URL, or data to encode in the QR code",
        },
        size: {
          type: "number",
          description: "Output size in pixels (default: 256, max: 1024)",
        },
        format: {
          type: "string",
          enum: ["png", "svg"],
          description: "Output format — png or svg (default: png)",
        },
      },
      required: ["text"],
    },
  },
  {
    name: "generate_hash",
    description:
      "Generate cryptographic hashes for any text. Returns MD5, SHA-1, SHA-256, SHA-384, and SHA-512 in a single call.",
    inputSchema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "Text to hash",
        },
      },
      required: ["text"],
    },
  },
  {
    name: "generate_uuid",
    description: "Generate one or more UUID v4 values.",
    inputSchema: {
      type: "object",
      properties: {
        count: {
          type: "number",
          description: "Number of UUIDs to generate (1–100, default: 1)",
        },
      },
    },
  },
  {
    name: "encode_decode_base64",
    description: "Encode text to base64 or decode base64 back to plain text.",
    inputSchema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "Text to encode, or base64 string to decode",
        },
        action: {
          type: "string",
          enum: ["encode", "decode"],
          description: "Whether to encode or decode",
        },
        url_safe: {
          type: "boolean",
          description: "Use URL-safe base64 variant (default: false)",
        },
      },
      required: ["text", "action"],
    },
  },
  {
    name: "generate_password",
    description:
      "Generate a cryptographically secure random password with configurable rules.",
    inputSchema: {
      type: "object",
      properties: {
        length: {
          type: "number",
          description: "Password length (default: 16, max: 128)",
        },
        uppercase: {
          type: "boolean",
          description: "Include uppercase letters (default: true)",
        },
        numbers: {
          type: "boolean",
          description: "Include numbers (default: true)",
        },
        symbols: {
          type: "boolean",
          description: "Include symbols (default: true)",
        },
      },
    },
  },

  // --- Network & domain tools ---
  {
    name: "lookup_ip",
    description:
      "Get geolocation, ISP, ASN, and proxy/VPN detection for any IPv4 or IPv6 address.",
    inputSchema: {
      type: "object",
      properties: {
        ip: {
          type: "string",
          description: "IPv4 or IPv6 address to look up (e.g. 8.8.8.8)",
        },
      },
      required: ["ip"],
    },
  },
  {
    name: "check_ssl",
    description:
      "Check SSL/TLS certificate details for any domain: issuer, expiry date, SANs, and days remaining.",
    inputSchema: {
      type: "object",
      properties: {
        domain: {
          type: "string",
          description: "Domain name to check (e.g. example.com)",
        },
      },
      required: ["domain"],
    },
  },
  {
    name: "lookup_dns",
    description:
      "Query DNS records for a domain. Supports A, AAAA, MX, TXT, CNAME, NS, and SOA record types.",
    inputSchema: {
      type: "object",
      properties: {
        domain: {
          type: "string",
          description: "Domain name to query (e.g. example.com)",
        },
        type: {
          type: "string",
          enum: ["A", "AAAA", "MX", "TXT", "CNAME", "NS", "SOA"],
          description: "DNS record type to query (default: A)",
        },
      },
      required: ["domain"],
    },
  },
  {
    name: "whois_lookup",
    description:
      "Look up domain registration information: registrar, registrant, creation/expiry dates, and nameservers.",
    inputSchema: {
      type: "object",
      properties: {
        domain: {
          type: "string",
          description: "Domain name to look up (e.g. example.com)",
        },
      },
      required: ["domain"],
    },
  },

  // --- PDF tools ---
  {
    name: "compress_pdf",
    description:
      "Compress a PDF file to reduce its size. Accepts a base64-encoded PDF, returns a compressed base64 PDF.",
    inputSchema: {
      type: "object",
      properties: {
        file_base64: {
          type: "string",
          description: "Base64-encoded PDF file content",
        },
        quality: {
          type: "string",
          enum: ["screen", "ebook", "printer", "prepress"],
          description:
            "Compression quality: screen (lowest/smallest), ebook (balanced), printer (high quality), prepress (highest). Default: ebook",
        },
      },
      required: ["file_base64"],
    },
  },
  {
    name: "merge_pdfs",
    description:
      "Merge 2–20 PDF files into a single document. Accepts array of base64-encoded PDFs.",
    inputSchema: {
      type: "object",
      properties: {
        files_base64: {
          type: "array",
          items: { type: "string" },
          description: "Array of base64-encoded PDF files to merge in order",
          minItems: 2,
          maxItems: 20,
        },
      },
      required: ["files_base64"],
    },
  },
  {
    name: "split_pdf",
    description:
      "Split a PDF by page range or every N pages. Returns array of base64-encoded split PDFs.",
    inputSchema: {
      type: "object",
      properties: {
        file_base64: {
          type: "string",
          description: "Base64-encoded PDF file to split",
        },
        mode: {
          type: "string",
          enum: ["range", "every_n"],
          description:
            "Split mode: range (specific pages) or every_n (split every N pages)",
        },
        pages: {
          type: "string",
          description:
            "Page range string when mode is range, e.g. '1-3,5,7-9'",
        },
        every_n: {
          type: "number",
          description: "Split every N pages when mode is every_n",
        },
      },
      required: ["file_base64", "mode"],
    },
  },
  {
    name: "pdf_to_word",
    description:
      "Convert a PDF to an editable Word document (.docx). Returns a base64-encoded DOCX file.",
    inputSchema: {
      type: "object",
      properties: {
        file_base64: {
          type: "string",
          description: "Base64-encoded PDF file to convert",
        },
      },
      required: ["file_base64"],
    },
  },
  {
    name: "unlock_pdf",
    description:
      "Remove permission restrictions (owner password) from a PDF. Returns unlocked base64 PDF.",
    inputSchema: {
      type: "object",
      properties: {
        file_base64: {
          type: "string",
          description: "Base64-encoded password-protected PDF",
        },
        password: {
          type: "string",
          description: "PDF password if known (optional)",
        },
      },
      required: ["file_base64"],
    },
  },
] as const;

// ── Server setup ──────────────────────────────────────────────────────────────

const server = new Server(
  {
    name: "publicsofttools",
    version: "1.0.0",
  },
  {
    capabilities: { tools: {} },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    let result: unknown;

    switch (name) {
      case "generate_qr_code":
        result = await callApi("/util/qr", "POST", {
          text: args.text,
          size: args.size ?? 256,
          format: args.format ?? "png",
        });
        break;

      case "generate_hash":
        result = await callApi("/util/hash", "POST", { text: args.text });
        break;

      case "generate_uuid":
        result = await callApi(`/util/uuid?count=${args.count ?? 1}`);
        break;

      case "encode_decode_base64":
        result = await callApi("/util/base64", "POST", {
          text: args.text,
          action: args.action,
          url_safe: args.url_safe ?? false,
        });
        break;

      case "generate_password":
        result = await callApi("/util/password", "POST", {
          length: args.length ?? 16,
          uppercase: args.uppercase ?? true,
          numbers: args.numbers ?? true,
          symbols: args.symbols ?? true,
        });
        break;

      case "lookup_ip":
        result = await callApi(`/ip/lookup?ip=${encodeURIComponent(String(args.ip))}`);
        break;

      case "check_ssl":
        result = await callApi(`/domain/ssl?domain=${encodeURIComponent(String(args.domain))}`);
        break;

      case "lookup_dns":
        result = await callApi(
          `/domain/dns?domain=${encodeURIComponent(String(args.domain))}&type=${args.type ?? "A"}`
        );
        break;

      case "whois_lookup":
        result = await callApi(`/domain/whois?domain=${encodeURIComponent(String(args.domain))}`);
        break;

      case "compress_pdf":
        result = await callApi("/pdf/compress", "POST", {
          file: args.file_base64,
          quality: args.quality ?? "ebook",
        });
        break;

      case "merge_pdfs":
        result = await callApi("/pdf/merge", "POST", {
          files: args.files_base64,
        });
        break;

      case "split_pdf":
        result = await callApi("/pdf/split", "POST", {
          file: args.file_base64,
          mode: args.mode,
          pages: args.pages,
          every_n: args.every_n,
        });
        break;

      case "pdf_to_word":
        result = await callApi("/pdf/to-word", "POST", {
          file: args.file_base64,
        });
        break;

      case "unlock_pdf":
        result = await callApi("/pdf/unlock", "POST", {
          file: args.file_base64,
          password: args.password,
        });
        break;

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof McpError) throw error;
    throw new McpError(
      ErrorCode.InternalError,
      `Tool execution failed: ${String(error)}`
    );
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("PublicSoftTools MCP server running");