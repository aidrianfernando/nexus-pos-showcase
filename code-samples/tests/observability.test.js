const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const fs = require('node:fs');
const path = require('node:path');

const {
  normalizeRequestId,
  requestContext,
} = require('../src/middleware/requestContext');
const logger = require('../src/observability/logger');
const requestLogger = require('../src/middleware/requestLogger');

const backendRoot = path.resolve(__dirname, '..');
const projectRoot = path.resolve(backendRoot, '..');

function read(relativePath) {
  return fs.readFileSync(
    path.join(projectRoot, relativePath),
    'utf8'
  );
}

class MockResponse extends EventEmitter {
  constructor() {
    super();
    this.headers = new Map();
    this.statusCode = 200;
    this.body = null;
  }

  setHeader(name, value) {
    this.headers.set(String(name).toLowerCase(), String(value));
  }

  getHeader(name) {
    return this.headers.get(String(name).toLowerCase());
  }

  status(code) {
    this.statusCode = code;
    return this;
  }

  json(body) {
    this.body = body;
    return this;
  }
}

function captureConsole(methodName, callback) {
  const original = console[methodName];
  const lines = [];
  console[methodName] = (line) => lines.push(String(line));

  try {
    callback(lines);
  } finally {
    console[methodName] = original;
  }

  return lines;
}

test('request context propagates a safe caller request ID and always returns X-Request-ID', () => {
  const response = new MockResponse();
  const request = {
    headers: { 'x-request-id': 'client-request-12345' },
    get(name) {
      return this.headers[String(name).toLowerCase()];
    },
  };
  let nextCalled = false;

  requestContext(request, response, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(request.requestId, 'client-request-12345');
  assert.equal(response.getHeader('x-request-id'), 'client-request-12345');
});

test('unsafe request IDs are rejected and replaced by a server-generated UUID', () => {
  assert.equal(normalizeRequestId('bad id with spaces'), null);
  assert.equal(normalizeRequestId('short'), null);

  const response = new MockResponse();
  const request = {
    headers: { 'x-request-id': 'bad id with spaces' },
    get() { return this.headers['x-request-id']; },
  };

  requestContext(request, response, () => {});

  assert.match(
    request.requestId,
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  );
});

test('structured logger redacts secrets before writing JSON', () => {
  const lines = captureConsole('log', () => {
    logger.info('test.observability', {
      requestId: 'req-observability-123',
      authorization: 'Bearer should-not-appear',
      nested: {
        password: 'should-not-appear',
        safe: 'visible',
      },
    });
  });

  assert.equal(lines.length, 1);
  const record = JSON.parse(lines[0]);
  assert.equal(record.event, 'test.observability');
  assert.equal(record.authorization, '[redacted]');
  assert.equal(record.nested.password, '[redacted]');
  assert.equal(record.nested.safe, 'visible');
  assert.doesNotMatch(lines[0], /should-not-appear/);
});

test('request logger emits a structured completion record without query-string data', () => {
  const request = {
    requestId: 'req-complete-12345',
    method: 'GET',
    originalUrl: '/api/v1/sales?secret=do-not-log',
    user: { sub: '7', role: 'manager' },
  };
  const response = new MockResponse();
  response.statusCode = 200;

  const lines = captureConsole('log', () => {
    requestLogger(request, response, () => {});
    response.emit('finish');
  });

  assert.equal(lines.length, 1);
  const record = JSON.parse(lines[0]);
  assert.equal(record.event, 'http.request.completed');
  assert.equal(record.requestId, 'req-complete-12345');
  assert.equal(record.path, '/api/v1/sales');
  assert.equal(record.userId, '7');
  assert.equal(record.role, 'manager');
  assert.doesNotMatch(lines[0], /do-not-log/);
});

test('error handler exposes request ID and avoids query-string logging by contract', () => {
  const source = read('backend/src/middleware/errorHandler.js');

  assert.match(source, /requestId: req\.requestId \|\| null/);
  assert.match(source, /split\('\?'\)\[0\]/);
  assert.match(source, /http\.request\.error/);
  assert.match(source, /Internal server error/);
});
