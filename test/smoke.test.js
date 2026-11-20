// Smoke tests: start server.js (and float-server-test.js) against a stub API and
// check the main routes, the Node version and the server log.
// Run with `npm test` (needs `yarn build` first so dist/ exists).
import { test, before, after } from 'node:test';
import assert                  from 'node:assert/strict';
import { spawn }               from 'node:child_process';
import { readFileSync }        from 'node:fs';
import http                    from 'node:http';
import net                     from 'node:net';
import path                    from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const pkg  = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));

let api, server, apiUrl, baseUrl;

// Stub for the two api.cbd.int endpoints server.js calls itself
function startStubApi() {
    return new Promise(resolve => {
        const srv = http.createServer((req, res) => {
            const { pathname } = new URL(req.url, 'http://localhost');
            res.setHeader('Content-Type', 'application/json');

            if (pathname.startsWith('/api/v2016/cctv-streams/monitors/')) { res.statusCode = 404; return res.end('{}'); }
            if (pathname === '/api/v2016/conferences') return res.end(JSON.stringify({ conference: { streamId: 'stub-stream' } }));

            res.statusCode = 404;
            res.end('{}');
        });
        srv.listen(0, '127.0.0.1', () => resolve(srv));
    });
}

function freePort() {
    return new Promise((resolve, reject) => {
        const srv = net.createServer();
        srv.listen(0, '127.0.0.1', () => { const { port } = srv.address(); srv.close(() => resolve(port)); });
        srv.on('error', reject);
    });
}

// Spawn a node script and wait until it logs `ready`
async function startNode(args, env, ready) {
    const child = spawn(process.execPath, args, { cwd: root, env: { ...process.env, ...env } });
    child.log   = '';
    child.stdout.on('data', d => child.log += d);
    child.stderr.on('data', d => child.log += d);

    await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`${args[0]} did not start:\n${child.log}`)), 15000);
        child.stdout.on('data', () => { if (ready.test(child.log)) { clearTimeout(timer); resolve(); } });
        child.on('exit', code => { clearTimeout(timer); reject(new Error(`${args[0]} exited (${code}):\n${child.log}`)); });
    });
    child.removeAllListeners('exit');
    return child;
}

function stop(child) {
    if (!child || child.exitCode !== null) return;
    return new Promise(resolve => { child.on('exit', resolve); child.kill('SIGTERM'); });
}

before(async () => {
    api    = await startStubApi();
    apiUrl = `http://127.0.0.1:${api.address().port}`;

    const port = await freePort();
    server  = await startNode(['server.js'], { PORT: port, API_URL: apiUrl, BASE_PATH: '/cctv/' }, /Server listening/);
    baseUrl = `http://127.0.0.1:${port}/cctv/`;
});

after(async () => {
    await stop(server);
    api?.close();
});

// engines.node is a list of "^x.y.z" / ">=x.y.z" ranges joined by "||"
// (the CVE-2026-111497 fix landed in 22.23.4, 24.22.1 and 26.12.1)
test('Node version meets package.json engines.node', () => {
    const ranges = (pkg.engines?.node || '').split('||').map(r => /^\s*(\^|>=)\s*(\d+)\.(\d+)\.(\d+)\s*$/.exec(r));
    assert.ok(ranges.length && ranges.every(Boolean), `unsupported engines.node: ${pkg.engines?.node}`);

    const cmp = (a, b) => { for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; };
    const ver = process.versions.node.split('.').map(Number);
    const ok  = ranges.some(([, op, ...min]) => {
        min = min.map(Number);
        return cmp(ver, min) >= 0 && (op === '>=' || ver[0] === min[0]);
    });
    assert.ok(ok, `Node ${process.versions.node} does not satisfy ${pkg.engines.node}`);
});

for (const [route, type] of [
    ['',                                        'text/html'],
    ['some/client/route',                       'text/html'],
    ['app/boot.js',                             'javascript'],
    ['app/resources/style.css',                 'text/css'],
    ['app/libs/requirejs/require.js',           'javascript'],
    ['app/libs/bootswatch-dist/css/bootstrap.min.css', 'text/css'],
    ['monitor',                                 'application/json'],
]) {
    test(`GET /cctv/${route} -> 200 ${type}`, async () => {
        const res = await fetch(baseUrl + route);
        assert.equal(res.status, 200);
        assert.match(res.headers.get('content-type') || '', new RegExp(type));
        await res.arrayBuffer();
    });
}

// /api/* is proxied at the root, outside BASE_PATH
test('GET /api/v2016/conferences -> proxied to API_URL', async () => {
    const res = await fetch(new URL('/api/v2016/conferences', baseUrl));
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { conference: { streamId: 'stub-stream' } });
});

test('page has base href, title and initial monitor', async () => {
    const html = await (await fetch(baseUrl)).text();
    assert.match(html, /<base href="\/cctv\/">/);
    assert.match(html, /<title>CCTV - Convention on Biological Diversity<\/title>/);
    assert.match(html, /window\.cctvMonitor = \{"uid":"[A-Z0-9]{5}","bound":false,"streamId":"stub-stream"\}/);
});

test('monitor returns uid and default stream', async () => {
    const res  = await fetch(baseUrl + 'monitor');
    const body = await res.json();
    assert.equal(body.streamId, 'stub-stream');
    assert.equal(body.bound, false);
    assert.match(res.headers.get('set-cookie') || '', /monitorUid=/);
});

test('unknown /app/ file -> 404', async () => {
    const res = await fetch(baseUrl + 'app/does-not-exist.js');
    assert.equal(res.status, 404);
});

test('float-server-test.js proxies /<base>/ with base_url header', async () => {
    const appPort   = await freePort();
    const floatPort = await freePort();
    const app   = await startNode(['server.js'], { PORT: appPort, API_URL: apiUrl, BASE_PATH: '' }, /Server listening/);
    const float = await startNode(['float-server-test.js', 'float'], { PORT: floatPort, TARGET_URL: `http://127.0.0.1:${appPort}` }, /Server listening/);
    try {
        const res = await fetch(`http://127.0.0.1:${floatPort}/float/`);
        assert.equal(res.status, 200);
        assert.match(await res.text(), /<base href="\/float\/">/);
    }
    finally {
        await stop(float);
        await stop(app);
    }
});

test('server log has no errors or warnings', () => {
    // http-proxy 1.18.1 (latest, unmaintained) calls util._extend on the first /api/* request.
    // Known and harmless; removing it needs a dependency change.
    const log = server.log.replace(/^\(node:\d+\) \[DEP0060\] DeprecationWarning: The `util._extend` API is deprecated.*\n\(Use `node --trace-deprecation.*\n/m, '');

    assert.match(log, /Server listening/);
    assert.doesNotMatch(log, /error|warning|deprecat|\(node:\d+\)/i, log);
});
