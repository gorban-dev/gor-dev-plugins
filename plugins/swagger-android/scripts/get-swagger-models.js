#!/usr/bin/env node
/**
 * get-swagger-models.js
 * Fetches Swagger/OpenAPI JSON, resolves $ref references, pre-processes models
 * into compact Kotlin-typed format for the swagger-android agent.
 *
 * Zero npm dependencies — only Node.js built-in modules.
 *
 * Usage:
 *   node get-swagger-models.js --list
 *   node get-swagger-models.js --endpoints="GET /products,POST /cart/add"
 *   node get-swagger-models.js --model=ProductDto
 *   node get-swagger-models.js --all
 *   node get-swagger-models.js --url="https://login:pass@host/path" --endpoints="GET /orders"
 *   node get-swagger-models.js --refresh --endpoints="GET /orders"   (force re-fetch)
 *
 * Caching:
 *   The script caches the full Swagger spec in .claude/swagger/spec.json.
 *   Cached spec is reused if less than 24 hours old.
 *   Use --refresh to force a fresh fetch from the server.
 */

'use strict';

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// ---------------------------------------------------------------------------
// .env loader — searches CWD, ../, ../../
// ---------------------------------------------------------------------------
function loadEnv() {
  const dirs = [
    process.cwd(),
    path.resolve(process.cwd(), '..'),
    path.resolve(process.cwd(), '..', '..'),
  ];
  for (const dir of dirs) {
    const envPath = path.join(dir, '.env');
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) process.env[key] = val;
      }
      return envPath;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Argument parser
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const args = {};
  for (const arg of argv.slice(2)) {
    if (arg.startsWith('--')) {
      const eqIdx = arg.indexOf('=');
      if (eqIdx !== -1) {
        const key = arg.slice(2, eqIdx);
        const val = arg.slice(eqIdx + 1);
        args[key] = val;
      } else {
        const key = arg.slice(2);
        args[key] = true;
      }
    }
  }
  return args;
}

// ---------------------------------------------------------------------------
// HTTP fetch with redirect support, Basic Auth from URL, 30s timeout
// ---------------------------------------------------------------------------
function fetchUrl(rawUrl) {
  return new Promise((resolve, reject) => {
    const parsed = new url.URL(rawUrl);

    // Extract basic auth from URL and remove from URL before request
    let authHeader = null;
    if (parsed.username || parsed.password) {
      const credentials = `${decodeURIComponent(parsed.username)}:${decodeURIComponent(parsed.password)}`;
      authHeader = 'Basic ' + Buffer.from(credentials).toString('base64');
      parsed.username = '';
      parsed.password = '';
    }

    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'swagger-android-plugin/1.0',
      },
      timeout: 30000,
      rejectUnauthorized: false,
    };

    if (authHeader) {
      options.headers['Authorization'] = authHeader;
    }

    const transport = parsed.protocol === 'https:' ? https : http;

    const req = transport.request(options, (res) => {
      // Follow redirects (up to 5)
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        const redirectUrl = res.headers.location.startsWith('http')
          ? res.headers.location
          : `${parsed.protocol}//${parsed.host}${res.headers.location}`;
        fetchUrl(redirectUrl).then(resolve).catch(reject);
        res.resume();
        return;
      }

      if (res.statusCode < 200 || res.statusCode >= 300) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage} — ${options.hostname}${options.path}`));
        res.resume();
        return;
      }

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        try {
          const body = Buffer.concat(chunks).toString('utf8');
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error('Failed to parse JSON response: ' + e.message));
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out after 30 seconds'));
    });

    req.on('error', reject);
    req.end();
  });
}

// ---------------------------------------------------------------------------
// $ref resolver — works for Swagger 2.0 and OpenAPI 3.x
// ---------------------------------------------------------------------------
function getDefinitions(spec) {
  // OpenAPI 3.x uses components/schemas; Swagger 2.0 uses definitions
  if (spec.components && spec.components.schemas) return spec.components.schemas;
  if (spec.definitions) return spec.definitions;
  return {};
}

function resolveRef(ref, spec) {
  // Only supports local JSON references: #/definitions/Foo or #/components/schemas/Foo
  const parts = ref.replace(/^#\//, '').split('/');
  let current = spec;
  for (const part of parts) {
    if (current == null) return null;
    current = current[part];
  }
  return current;
}

function resolveSchema(schema, spec, visited = new Set()) {
  if (!schema) return {};

  if (schema.$ref) {
    const refKey = schema.$ref;
    if (visited.has(refKey)) {
      // Circular reference: return a placeholder
      return { _circular: true, _refName: extractRefName(refKey) };
    }
    visited = new Set(visited);
    visited.add(refKey);
    const resolved = resolveRef(refKey, spec);
    if (!resolved) return {};
    return resolveSchema(resolved, spec, visited);
  }

  if (schema.allOf) {
    // Merge all schemas
    const merged = { type: 'object', properties: {}, required: [] };
    for (const sub of schema.allOf) {
      const resolved = resolveSchema(sub, spec, visited);
      if (resolved.properties) {
        Object.assign(merged.properties, resolved.properties);
      }
      if (resolved.required) {
        merged.required = [...new Set([...merged.required, ...resolved.required])];
      }
      if (resolved.description && !merged.description) {
        merged.description = resolved.description;
      }
    }
    return merged;
  }

  return schema;
}

function extractRefName(ref) {
  const parts = ref.split('/');
  return parts[parts.length - 1];
}

// ---------------------------------------------------------------------------
// Type conversion: JSON Schema → Kotlin type string
// ---------------------------------------------------------------------------
function toKotlinType(schema, spec, fieldName, parentName, collectedModels, visited = new Set()) {
  if (!schema) return 'Any';

  if (schema.$ref) {
    const refName = extractRefName(schema.$ref);
    // Schedule collection of referenced model
    if (!visited.has(refName)) {
      collectModel(refName, spec, collectedModels, visited);
    }
    // Return special marker so agent knows this is a reference
    return `ref:${refName}`;
  }

  if (schema.allOf) {
    const resolved = resolveSchema(schema, spec, new Set());
    return toKotlinType(resolved, spec, fieldName, parentName, collectedModels, visited);
  }

  if (schema.oneOf || schema.anyOf) {
    if (schema.discriminator) {
      // sealed class — agent handles this via edge-cases
      const candidateName = fieldName ? capitalize(toCamelCase(fieldName)) : 'Polymorphic';
      return `sealed:${candidateName}`;
    }
    return 'JsonElement';
  }

  const type = schema.type;
  const format = schema.format || '';

  // Inline enum
  if (schema.enum && type === 'string') {
    const enumName = parentName ? `${parentName}${capitalize(toCamelCase(fieldName || 'Value'))}` : capitalize(toCamelCase(fieldName || 'Enum'));
    // Register inline enum
    if (!collectedModels.has(enumName)) {
      collectedModels.set(enumName, {
        name: enumName,
        kind: 'enum',
        description: schema.description || null,
        values: schema.enum.map(v => ({
          jsonValue: v,
          kotlinName: toScreamingSnakeCase(String(v)),
        })),
      });
    }
    return `enum:${enumName}`;
  }

  if (type === 'integer') {
    return format === 'int64' ? 'Long' : 'Int';
  }

  if (type === 'number') {
    return format === 'float' ? 'Float' : 'Double';
  }

  if (type === 'boolean') {
    return 'Boolean';
  }

  if (type === 'string') {
    return 'String';
  }

  if (type === 'array') {
    if (schema.items) {
      const itemType = toKotlinType(schema.items, spec, fieldName ? fieldName + 'Item' : 'Item', parentName, collectedModels, visited);
      return `List<${itemType}>`;
    }
    return 'List<Any>';
  }

  if (type === 'object' || schema.properties) {
    if (schema.additionalProperties) {
      const addProps = schema.additionalProperties;
      if (addProps === true) {
        return 'Map<String, JsonElement>';
      }
      const valType = toKotlinType(addProps, spec, 'value', parentName, collectedModels, visited);
      return `Map<String, ${valType}>`;
    }
    // Inline object — extract as separate model
    if (schema.properties) {
      const inlineName = parentName ? `${parentName}${capitalize(toCamelCase(fieldName || 'Object'))}` : capitalize(toCamelCase(fieldName || 'InlineObject'));
      if (!collectedModels.has(inlineName)) {
        const inlineModel = buildModelFromSchema(inlineName, schema, spec, 'response', collectedModels, visited);
        collectedModels.set(inlineName, inlineModel);
      }
      return `ref:${inlineName}`;
    }
    return 'Any';
  }

  return 'Any';
}

// ---------------------------------------------------------------------------
// Name converters
// ---------------------------------------------------------------------------
function toCamelCase(str) {
  if (!str) return str;
  return str
    .replace(/[-_\s]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (_, c) => c.toLowerCase());
}

function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toScreamingSnakeCase(str) {
  if (!str) return str;
  // Replace non-alphanumeric chars with underscore, uppercase
  return str
    .replace(/[-\s]+/g, '_')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, '_')
    .replace(/^_+|_+$/g, '');
}

// ---------------------------------------------------------------------------
// Build a processed model object from a schema definition
// ---------------------------------------------------------------------------
function buildModelFromSchema(name, schema, spec, defaultKind, collectedModels, visited = new Set()) {
  // Detect enum
  if (schema.enum || (schema.type === 'string' && schema.enum)) {
    return {
      name,
      kind: 'enum',
      description: schema.description || null,
      values: (schema.enum || []).map(v => ({
        jsonValue: v,
        kotlinName: toScreamingSnakeCase(String(v)),
      })),
    };
  }

  // Resolve allOf
  let resolved = schema;
  if (schema.allOf) {
    resolved = resolveSchema(schema, spec, new Set());
  }

  const properties = resolved.properties || {};
  const required = new Set(resolved.required || []);

  const fields = [];

  for (const [jsonKey, propSchema] of Object.entries(properties)) {
    const isRequired = required.has(jsonKey);
    const isNullable = !isRequired || propSchema.nullable === true || propSchema['x-nullable'] === true;

    let kotlinType = toKotlinType(propSchema, spec, jsonKey, name, collectedModels, new Set(visited));

    fields.push({
      jsonKey,
      kotlinName: toCamelCase(jsonKey),
      kotlinType,
      nullable: isNullable,
      description: propSchema.description || null,
    });
  }

  return {
    name,
    kind: defaultKind,
    description: resolved.description || schema.description || null,
    fields,
  };
}

// ---------------------------------------------------------------------------
// Collect a model by definition name (and all its transitive dependencies)
// ---------------------------------------------------------------------------
function collectModel(name, spec, collectedModels, visited = new Set()) {
  if (collectedModels.has(name) || visited.has(name)) return;
  visited = new Set(visited);
  visited.add(name);

  const defs = getDefinitions(spec);
  const schema = defs[name];
  if (!schema) return;

  const model = buildModelFromSchema(name, schema, spec, 'response', collectedModels, visited);
  collectedModels.set(name, model);
}

// ---------------------------------------------------------------------------
// Classify model kind based on usage context
// ---------------------------------------------------------------------------
function classifyModels(models, requestModelNames, responseModelNames) {
  for (const [name, model] of models) {
    if (model.kind === 'enum') continue; // already classified
    if (requestModelNames.has(name) && !responseModelNames.has(name)) {
      model.kind = 'request';
    } else if (responseModelNames.has(name)) {
      model.kind = 'response';
    } else {
      // Default — used as nested type of response models
      model.kind = 'response';
    }
  }
}

// ---------------------------------------------------------------------------
// Extract model names from a schema recursively (used for classification)
// ---------------------------------------------------------------------------
function extractRefNames(schema, spec, out = new Set(), visited = new Set()) {
  if (!schema) return out;
  if (schema.$ref) {
    const name = extractRefName(schema.$ref);
    if (!out.has(name) && !visited.has(name)) {
      out.add(name);
      visited = new Set(visited);
      visited.add(name);
      const resolved = resolveRef(schema.$ref, spec);
      if (resolved) extractRefNames(resolved, spec, out, visited);
    }
    return out;
  }
  if (schema.allOf) schema.allOf.forEach(s => extractRefNames(s, spec, out, visited));
  if (schema.oneOf) schema.oneOf.forEach(s => extractRefNames(s, spec, out, visited));
  if (schema.anyOf) schema.anyOf.forEach(s => extractRefNames(s, spec, out, visited));
  if (schema.properties) Object.values(schema.properties).forEach(s => extractRefNames(s, spec, out, visited));
  if (schema.items) extractRefNames(schema.items, spec, out, visited);
  if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
    extractRefNames(schema.additionalProperties, spec, out, visited);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Get response/request schemas for an operation
// ---------------------------------------------------------------------------
function getOperationSchemas(operation, spec) {
  const requestSchemas = [];
  const responseSchemas = [];

  // Request body (OpenAPI 3.x)
  if (operation.requestBody) {
    const content = operation.requestBody.content || {};
    for (const mediaType of Object.values(content)) {
      if (mediaType.schema) requestSchemas.push(mediaType.schema);
    }
  }

  // Parameters with body (Swagger 2.0)
  if (operation.parameters) {
    for (const param of operation.parameters) {
      const resolved = param.$ref ? resolveRef(param.$ref, spec) : param;
      if (resolved && resolved.in === 'body' && resolved.schema) {
        requestSchemas.push(resolved.schema);
      }
    }
  }

  // Responses
  if (operation.responses) {
    for (const [statusCode, response] of Object.entries(operation.responses)) {
      if (parseInt(statusCode) >= 200 && parseInt(statusCode) < 300) {
        const resolvedResp = response.$ref ? resolveRef(response.$ref, spec) : response;
        if (!resolvedResp) continue;

        // OpenAPI 3.x
        if (resolvedResp.content) {
          for (const mediaType of Object.values(resolvedResp.content)) {
            if (mediaType.schema) responseSchemas.push(mediaType.schema);
          }
        }
        // Swagger 2.0
        if (resolvedResp.schema) {
          responseSchemas.push(resolvedResp.schema);
        }
      }
    }
  }

  return { requestSchemas, responseSchemas };
}

// ---------------------------------------------------------------------------
// --list mode
// ---------------------------------------------------------------------------
function buildEndpointList(spec) {
  const endpoints = [];
  const paths = spec.paths || {};

  for (const [pathStr, pathItem] of Object.entries(paths)) {
    const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];
    for (const method of methods) {
      if (pathItem[method]) {
        const op = pathItem[method];
        endpoints.push({
          method: method.toUpperCase(),
          path: pathStr,
          summary: op.summary || op.description || null,
        });
      }
    }
  }

  const defs = getDefinitions(spec);

  return {
    endpoints,
    totalDefinitions: Object.keys(defs).length,
  };
}

// ---------------------------------------------------------------------------
// Endpoint matching — flexible: "GET /products", "/products", "products"
// ---------------------------------------------------------------------------
function matchesEndpoint(method, pathStr, query) {
  const q = query.trim().toLowerCase();
  const m = method.toLowerCase();
  const p = pathStr.toLowerCase();

  // "GET /products/list"
  const methodPathMatch = q.match(/^([a-z]+)\s+(.+)$/);
  if (methodPathMatch) {
    const qMethod = methodPathMatch[1];
    const qPath = methodPathMatch[2];
    return m === qMethod && (p === qPath || p.includes(qPath) || qPath.includes(p));
  }

  // "/products" or "products"
  const pathOnly = q.startsWith('/') ? q : '/' + q;
  return p === pathOnly || p.startsWith(pathOnly) || pathOnly.startsWith(p);
}

// ---------------------------------------------------------------------------
// --endpoints mode: process specific endpoints
// ---------------------------------------------------------------------------
function buildEndpointModels(spec, endpointQueries) {
  const collectedModels = new Map();
  const requestModelNames = new Set();
  const responseModelNames = new Set();

  const paths = spec.paths || {};
  const matchedOps = [];

  for (const query of endpointQueries) {
    let found = false;
    for (const [pathStr, pathItem] of Object.entries(paths)) {
      const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];
      for (const method of methods) {
        if (pathItem[method] && matchesEndpoint(method, pathStr, query)) {
          matchedOps.push({ method: method.toUpperCase(), path: pathStr, op: pathItem[method] });
          found = true;
        }
      }
    }
    if (!found) {
      process.stderr.write(`Warning: no endpoint found matching "${query}"\n`);
    }
  }

  for (const { method, path: pathStr, op } of matchedOps) {
    const { requestSchemas, responseSchemas } = getOperationSchemas(op, spec);

    for (const schema of requestSchemas) {
      const names = extractRefNames(schema, spec);
      names.forEach(n => requestModelNames.add(n));
      // If root schema is direct ref
      if (schema.$ref) {
        const rootName = extractRefName(schema.$ref);
        requestModelNames.add(rootName);
        collectModel(rootName, spec, collectedModels, new Set());
      } else if (schema.type === 'object' || schema.properties || schema.allOf) {
        // Inline request body — create anonymous model
        const opId = op.operationId || `${method}${pathStr.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const modelName = capitalize(toCamelCase(opId)) + 'Request';
        if (!collectedModels.has(modelName)) {
          const m = buildModelFromSchema(modelName, schema, spec, 'request', collectedModels, new Set());
          collectedModels.set(modelName, m);
        }
        requestModelNames.add(modelName);
      }
      // Collect transitive deps
      names.forEach(n => collectModel(n, spec, collectedModels, new Set()));
    }

    for (const schema of responseSchemas) {
      const names = extractRefNames(schema, spec);
      names.forEach(n => responseModelNames.add(n));
      if (schema.$ref) {
        const rootName = extractRefName(schema.$ref);
        responseModelNames.add(rootName);
        collectModel(rootName, spec, collectedModels, new Set());
      } else if (schema.type === 'object' || schema.properties || schema.allOf) {
        const opId = op.operationId || `${method}${pathStr.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const modelName = capitalize(toCamelCase(opId)) + 'Response';
        if (!collectedModels.has(modelName)) {
          const m = buildModelFromSchema(modelName, schema, spec, 'response', collectedModels, new Set());
          collectedModels.set(modelName, m);
        }
        responseModelNames.add(modelName);
      }
      names.forEach(n => collectModel(n, spec, collectedModels, new Set()));
    }
  }

  classifyModels(collectedModels, requestModelNames, responseModelNames);

  return { models: Array.from(collectedModels.values()) };
}

// ---------------------------------------------------------------------------
// --model mode: one specific model + all its transitive dependencies
// ---------------------------------------------------------------------------
function buildSingleModel(spec, modelName) {
  const collectedModels = new Map();
  collectModel(modelName, spec, collectedModels, new Set());

  if (collectedModels.size === 0) {
    const defs = getDefinitions(spec);
    const available = Object.keys(defs).slice(0, 20).join(', ');
    throw new Error(`Model "${modelName}" not found in spec. Available definitions (first 20): ${available}`);
  }

  return { models: Array.from(collectedModels.values()) };
}

// ---------------------------------------------------------------------------
// --all mode: all definitions
// ---------------------------------------------------------------------------
function buildAllModels(spec) {
  const defs = getDefinitions(spec);
  const collectedModels = new Map();

  for (const name of Object.keys(defs)) {
    collectModel(name, spec, collectedModels, new Set());
  }

  return { models: Array.from(collectedModels.values()) };
}

// ---------------------------------------------------------------------------
// Spec caching — stores full spec in .claude/swagger/spec.json with TTL
// ---------------------------------------------------------------------------
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function findCacheDir() {
  // Search for .claude/ directory in CWD, parent, grandparent
  const dirs = [
    process.cwd(),
    path.resolve(process.cwd(), '..'),
    path.resolve(process.cwd(), '..', '..'),
  ];
  for (const dir of dirs) {
    const claudeDir = path.join(dir, '.claude');
    if (fs.existsSync(claudeDir)) {
      return path.join(claudeDir, 'swagger');
    }
  }
  // Default: create in CWD
  return path.join(process.cwd(), '.claude', 'swagger');
}

function getCachedSpec(cacheDir) {
  const specPath = path.join(cacheDir, 'spec.json');
  if (!fs.existsSync(specPath)) return null;

  const stat = fs.statSync(specPath);
  const ageMs = Date.now() - stat.mtimeMs;

  if (ageMs > CACHE_TTL_MS) {
    process.stderr.write(`Cache expired (${Math.round(ageMs / 3600000)}h old). Will re-fetch.\n`);
    return null;
  }

  try {
    const data = fs.readFileSync(specPath, 'utf8');
    const spec = JSON.parse(data);
    const ageHours = Math.round(ageMs / 3600000);
    process.stderr.write(`Using cached spec (${ageHours}h old): ${specPath}\n`);
    return spec;
  } catch (e) {
    process.stderr.write(`Cache corrupted, will re-fetch: ${e.message}\n`);
    return null;
  }
}

function saveSpecToCache(cacheDir, spec) {
  try {
    fs.mkdirSync(cacheDir, { recursive: true });
    const specPath = path.join(cacheDir, 'spec.json');
    fs.writeFileSync(specPath, JSON.stringify(spec), 'utf8');
    process.stderr.write(`Spec cached: ${specPath}\n`);
  } catch (e) {
    process.stderr.write(`Warning: could not cache spec: ${e.message}\n`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const envFile = loadEnv();
  const args = parseArgs(process.argv);

  // Validate mode
  const hasMode = args.list !== undefined || args.endpoints !== undefined ||
                  args.model !== undefined || args.all !== undefined;

  if (!hasMode) {
    process.stderr.write(
      'Usage:\n' +
      '  node get-swagger-models.js --list\n' +
      '  node get-swagger-models.js --endpoints="GET /products,POST /cart"\n' +
      '  node get-swagger-models.js --model=ProductDto\n' +
      '  node get-swagger-models.js --all\n' +
      '  node get-swagger-models.js --url="https://..." --endpoints="..."\n' +
      '  node get-swagger-models.js --refresh --endpoints="..."  (force re-fetch)\n'
    );
    process.exit(1);
  }

  // Determine Swagger URL
  let swaggerUrl = args.url || process.env.SWAGGER_URL;

  // Load spec: try cache first, then fetch
  const forceRefresh = args.refresh !== undefined;
  const cacheDir = findCacheDir();
  let spec = null;

  if (!forceRefresh) {
    spec = getCachedSpec(cacheDir);
  }

  if (!spec) {
    if (!swaggerUrl) {
      const searchedDirs = [
        process.cwd(),
        path.resolve(process.cwd(), '..'),
        path.resolve(process.cwd(), '..', '..'),
      ];
      process.stderr.write(
        '\nError: SWAGGER_URL is not configured and no cached spec found.\n\n' +
        'Please create a .env file in your Android project root with:\n\n' +
        '  SWAGGER_URL=https://login:password@your-host.example.com/swagger-json-path\n\n' +
        'The script searches for .env in:\n' +
        searchedDirs.map(d => `  - ${d}`).join('\n') + '\n\n' +
        'Alternatively, pass --url="https://..." as a command-line argument.\n'
      );
      process.exit(1);
    }

    try {
      process.stderr.write(`Fetching Swagger spec from ${swaggerUrl.replace(/:\/\/[^@]+@/, '://***@')}...\n`);
      spec = await fetchUrl(swaggerUrl);
    } catch (err) {
      process.stderr.write(`\nError fetching Swagger spec: ${err.message}\n`);
      process.exit(1);
    }

    // Cache the fetched spec
    saveSpecToCache(cacheDir, spec);
  }

  // Validate it looks like a swagger/openapi spec
  if (!spec.swagger && !spec.openapi) {
    process.stderr.write('\nWarning: response does not appear to be a Swagger/OpenAPI spec (missing "swagger" or "openapi" field)\n');
  }

  let result;

  try {
    if (args.list !== undefined) {
      result = buildEndpointList(spec);
    } else if (args.endpoints !== undefined) {
      const queries = String(args.endpoints).split(',').map(s => s.trim()).filter(Boolean);
      result = buildEndpointModels(spec, queries);
    } else if (args.model !== undefined) {
      result = buildSingleModel(spec, String(args.model));
    } else if (args.all !== undefined) {
      result = buildAllModels(spec);
    }
  } catch (err) {
    process.stderr.write(`\nError processing spec: ${err.message}\n`);
    process.exit(1);
  }

  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}

main().catch(err => {
  process.stderr.write(`\nUnexpected error: ${err.message}\n${err.stack}\n`);
  process.exit(1);
});
