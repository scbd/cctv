process.on('SIGTERM', ()=>process.exit());

// CREATE HTTP SERVER AND PROXY
import ky        from 'ky';
import path      from 'path';
import crypto    from 'crypto';
import express   from 'express';
import morgan    from 'morgan';
import httpProxy from 'http-proxy';
const proxy     = httpProxy.createProxyServer({});
const app       = express();
const apiUrl    = process.env.API_URL || 'https://api.cbd.int:443';
const basePath  = process.env.BASE_PATH ? toBasePath(process.env.BASE_PATH) : null;
const __dirname = import.meta.dirname

if(!process.env.API_URL)   console.error(`WARNING: environment API_URL not set. USING default`);
if(!process.env.BASE_PATH) console.error(`WARNING: environment BASE_PATH not set. USING 'base_url' http header or '/' as default`);

console.log('API url: ', apiUrl);
console.log(`Base path: ${basePath||"'base_url' http header or '/'"}`);

app.set('views', __dirname + '/app');
app.set('view engine', 'ejs');

app.use(morgan('dev'));

// CONFIGURE ROUTES

app.all('/api/*', (req, res) => proxy.web(req, res, { target: apiUrl, changeOrigin: true } ));

const appRoutes = new express.Router();

appRoutes.use('/app',      express.static(__dirname + '/dist'));
appRoutes.use('/app',      express.static(__dirname + '/app'));
appRoutes.use('/app/libs', express.static(__dirname + '/node_modules/@bower_components' ));
appRoutes.all('/app/*',    (req, res) => res.status(404).send());
appRoutes.get('/current',        autoDectecCurrent);
appRoutes.get('/current/stream', currentStream);

appRoutes.get('/*',        (req, res) => { 

    res.setHeader('X-Frame-Options', 'ALLOW');

    const baseUrl    = toBasePath(basePath || req.headers.base_url);
    const monitorUid = renewMonitorUid(req, res);

    res.render('template', { baseUrl: urlSafe(baseUrl), monitorUid })
});

// START SERVER
app.use(toBasePath(basePath), appRoutes);

app.listen(process.env.PORT || 2000, function () {
	console.log(`Server listening on ${this.address().port}`);
});

// Handle proxy errors ignore

proxy.on('error', function (e,req, res) {
    console.error('proxy error:', e);
    res.status(502).send();
});

function toBasePath(dir) {
    return path.join('/', dir || '/', '/');
}

function urlSafe(dir) {
    var parts = dir.split('/').map(o=>encodeURIComponent(o));
    return path.join.apply(null, parts.map(o=>o||'/'));
}


//============================================================
// Monitor UID cookie: "<UID>.<expiresUnixSeconds>"
// expiry is kept in the value since browsers never send it back
//============================================================
const UID_COOKIE    = 'monitorUid';
const UID_ALPHABET  = 'ACEFHJKMNPRTUVWXY34679'; // no look-alikes (0/O/Q/D, 1/I/L, 2/Z, 5/S, 8/B, G/6)
const UID_LENGTH    = 5;
const UID_COOKIE_RE = new RegExp(`^([${UID_ALPHABET}]{${UID_LENGTH}})\\.(\\d+)$`);
const _2_DAYS       = 2*24*60*60;  // seconds
const _5_DAYS       = 5*24*60*60;
const _35_DAYS      = 35*24*60*60;

function getCookie(req, name) {

    for(const part of (req.headers.cookie||'').split(';')) {
        const [key, ...value] = part.trim().split('=');
        if(key==name) return decodeURIComponent(value.join('='));
    }
}

function getMonitorUid(req) {

    const [, uid, expires] = UID_COOKIE_RE.exec(getCookie(req, UID_COOKIE)||'') || [];

    return uid ? { uid, expires: parseInt(expires) } : null;
}

function setMonitorUid(req, res, uid, expires) {

    res.cookie(UID_COOKIE, `${uid}.${expires}`, {
        path     : toBasePath(basePath || req.headers.base_url),
        expires  : new Date(expires*1000),
        httpOnly : true,
        sameSite : 'lax',
    });
}

// push expiry by 5 days when less than 2 days left; returns uid or null
function renewMonitorUid(req, res) {

    const monitor = getMonitorUid(req);
    const now     = Date.now()/1000|0;

    if(!monitor) return null;

    if(monitor.expires - now < _2_DAYS)
        setMonitorUid(req, res, monitor.uid, Math.max(monitor.expires, now) + _5_DAYS);

    return monitor.uid;
}

function ensureMonitorUid(req, res) {

    const uid = renewMonitorUid(req, res);

    if(uid) return uid;

    const newUid = Array.from({ length: UID_LENGTH }, () => UID_ALPHABET[crypto.randomInt(UID_ALPHABET.length)]).join('');

    setMonitorUid(req, res, newUid, (Date.now()/1000|0) + _35_DAYS);

    return newUid;
}

//============================================================
// Current stream: monitor association first, then active conference
//============================================================
async function resolveCurrentStreamId(req, res) {

    const uid = ensureMonitorUid(req, res);

    try {
        const { streamId } = await ky.get(`${apiUrl}/api/v2016/cctv-streams/monitors/${encodeURIComponent(uid)}`).json();

        if(streamId) return streamId;
    }
    catch(e) {
        if(e.response?.status!=404) console.error(e);
    }

    const searchParams = new URLSearchParams();

    searchParams.append('q', JSON.stringify({
        active :true,
        $or: [ 
            { "conference.streamId"           :{ $exists: true } }, 
            { "conference.defaultCctvStreamId":{ $exists: true } }, 
        ],
    }))

    searchParams.append('f', JSON.stringify({ "conference.streamId" : 1, "conference.defaultCctvStreamId" : 1, "EndDate":1 }));
    searchParams.append('s', JSON.stringify({ "EndDate": -1 }));
    searchParams.append('fo', 1);

    const { conference } = await ky.get(`${apiUrl}/api/v2016/conferences`, { searchParams }).json();

    return conference.defaultCctvStreamId || conference.streamId || null;
}

async function currentStream(req, res) {

    res.set('Cache-Control', 'no-store');

    try {
        res.json({ streamId: await resolveCurrentStreamId(req, res) });
    }
    catch(e) {
        console.error(e)
        res.status(502).send();
    }
}

async function autoDectecCurrent(req, res, next) {

    const base    = toBasePath(basePath || req.headers.base_url);
    const baseUrl = `${base.replace(/\/+$/, '')}/`; // trimEnd(/)

    try {

        const streamId = await resolveCurrentStreamId(req, res);

        if(streamId) 
            res.redirect(302, `${baseUrl}?streamId=${encodeURIComponent(streamId)}&source=current`);        
        else                 
            res.redirect(302, path.join(baseUrl, 'help', 'not-configured'));
    }
    catch(e) {
        console.error(e)
        res.redirect(302, path.join(baseUrl, 'help', 'not-configured'));
    }
}
