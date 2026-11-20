// Dev helper: serves the app under /<baseUrl>/ by proxying to a running server.js
// with the base_url header. Usage: node float-server-test.js [baseUrl]

process.on('SIGTERM', ()=>process.exit());

// CREATE HTTP SERVER AND PROXY
import express   from 'express';
import morgan    from 'morgan';
import httpProxy from 'http-proxy';

var baseUrl = process.argv[2] || 'xyz';
var baseUrlRe = new RegExp('^\\/'+baseUrl+'(\\/|$)');

var app   = express();
var proxy = httpProxy.createProxyServer({
    target: process.env.TARGET_URL || 'http://localhost:2000',
    secure: false,
    headers : {
        base_url : '/'+baseUrl+'/'
    },
});

app.use(morgan('dev'));
app.all('/'+baseUrl,      reRoot, function(req, res) {  proxy.web(req, res); } );
app.all('/'+baseUrl+'/*', reRoot, function(req, res) {  proxy.web(req, res); } );

function reRoot(req, res, next) {
    req.url = '/'+req.url.replace(baseUrlRe, '');
    next();
}

// START SERVER

app.listen(process.env.PORT || 2050, function () {
	console.log('Server listening on %j', this.address());
	console.log('Path: /%s/* => /*', baseUrl);
});
