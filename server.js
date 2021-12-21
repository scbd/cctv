process.on('SIGTERM', ()=>process.exit());

// CREATE HTTP SERVER AND PROXY
const path    = require('path');
const express = require('express');
const app     = express();
const proxy   = require('http-proxy').createProxyServer({});
const apiUrl  = process.env.API_URL || 'https://api.cbd.int:443';
const basePath = path.join('/', process.env.BASE_PATH||'/', '/');

if(!process.env.API_URL)   console.error(`WARNING: environment API_URL not set. USING default`);
if(!process.env.BASE_PATH) console.error(`WARNING: environment BASE_PATH not set. USING default`);

console.log('API url: ', apiUrl);
console.log(`Base path: ${basePath}`);

app.set('views', __dirname + '/app');
app.set('view engine', 'ejs');

app.use(require('morgan')('dev'));

// CONFIGURE ROUTES

app.all('/api/*', (req, res) => proxy.web(req, res, { target: apiUrl, changeOrigin: true } ));

const appRoutes = new express.Router();

appRoutes.use('/app',      express.static(__dirname + '/app'));
appRoutes.use('/app/libs', express.static(__dirname + '/node_modules/@bower_components' ));
appRoutes.all('/app/*',    (req, res) => res.status(404).send());
appRoutes.get('/*',        (req, res) => res.render('template', { baseUrl: basePath }));

// START SERVER

app.use(basePath, appRoutes);

if(basePath!='/') app.use('/', appRoutes); // temps support for transition to Traefik 2 / AWS ALB

app.listen(process.env.PORT || 2000, function () {
	console.log(`Server listening on ${this.address().port}`);
});

// Handle proxy errors ignore

proxy.on('error', function (e,req, res) {
    console.error('proxy error:', e);
    res.status(502).send();
});
