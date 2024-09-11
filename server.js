process.on('SIGTERM', ()=>process.exit());

// CREATE HTTP SERVER AND PROXY
import ky        from 'ky';
import path      from 'path';
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
appRoutes.get('/current', autoDectecCurrent);

appRoutes.get('/*',        (req, res) => { 

    res.setHeader('X-Frame-Options', 'ALLOW');

    const baseUrl = toBasePath(basePath || req.headers.base_url);
    res.render('template', { baseUrl: urlSafe(baseUrl) })
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


async function autoDectecCurrent(req, res, next) {

    const base    = toBasePath(basePath || req.headers.base_url);
    const baseUrl = `${base.replace(/\/+$/, '')}/`; // trimEnd(/)

    try {


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

        const streamId = conference.defaultCctvStreamId || conference.streamId;

        if(streamId) 
            res.redirect(302, `${baseUrl}?streamId=${streamId}`);        
        else                 
            res.redirect(302, path.join(baseUrl, 'help', 'not-configured'));
    }
    catch(e) {
        console.error(e)
        res.redirect(302, path.join(baseUrl, 'help', 'not-configured'));
    }
}