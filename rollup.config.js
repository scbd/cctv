// rollup.config.js (building more than one bundle)
import path                     from 'path'
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import alias                    from '@rollup/plugin-alias';
import nodeResolve              from '@rollup/plugin-node-resolve'
import json                     from '@rollup/plugin-json';
import commonjs                 from '@rollup/plugin-commonjs';
import dynamicImportVariables   from 'rollup-plugin-dynamic-import-variables';
import { string }               from "rollup-plugin-string";
import bootWebApp, { cdnUrl }   from './app/boot.js';

const isWatchOn = process.argv.includes('--watch');
const outputDir = 'dist';

let externals = [
  'require', 
];

export default async function(){
  
  externals = [...externals, ...await loadExternals()];

  return [
    bundle('boot.js') 
  ];
}

function bundle(relativePath, baseDir='app') {

  const ext = path.extname(relativePath);

  return {
    input : path.join(baseDir||'', relativePath),
    output: [{
      format   : 'amd',
      sourcemap: true,
      dir : path.join(outputDir, path.dirname(relativePath)),
      name : relativePath.replace(/[^a-z0-9]/ig, "_"),
      exports: 'named'
    }],
    external: externals,
    plugins : [
      alias({ entries : [
        { find: /^~\/(.*)/,   replacement:`${process.cwd()}/app/$1` },
        { find: /^text!(.*)/, replacement:`$1` },
        { find: /^cdn!(.*)/,  replacement:`${cdnUrl}$1` },
      ]}),
      stripBom(),
      string({ include: "**/*.html" }),
      json({ namedExports: true }),
      dynamicImportVariables({ }),
      commonjs({ include: 'node_modules/**/*.js'}),
      nodeResolve({ browser: true, mainFields: [ 'browser', 'module', 'main' ] }),
      getBabelOutputPlugin({
        presets: [['@babel/preset-env', { targets: "> 0.25% and IE 10, not dead"}]],
        allowAllFormats: true
      }),
   //   isWatchOn ? null : terser({ mangle: false }) // DISABLE IN DEV
    ]
  }
}


async function loadExternals() {

  const externals = [];

  //Define requireJS configuration (define() + config.paths ) as externals

  // Shim dependencies 
  const window     = { location : { pathname: '/' } }; 
  const defineJs   = (module) => { if(typeof(module)==='string') externals.push(module) };
  const requireJs  = ( )      => { };
  requireJs.config = (config) => { 
    const modules = [
      ...Object.keys(config.paths),
      ...(config.packages||[]).map(p=>p.name)
    ]
    modules.forEach(defineJs)
  }

  bootWebApp(window, requireJs, defineJs);

  return externals;
}

function stripBom(options = {}) {

  return {
    name: 'stripBom',

    transform(code) {

      if (typeof (code) == "string")
        code = code.replace(/^\uFEFF/gm, "").replace(/^\u00BB\u00BF/gm,"");

      return { code, map: this.getCombinedSourcemap() };
    }
  };
}
