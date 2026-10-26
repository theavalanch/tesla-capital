const esbuild = require('esbuild');

esbuild.buildSync({
  entryPoints: ['src_frontend/index.jsx'],
  bundle: true,
  minify: true,
  format: 'iife',
  outfile: 'static/bundle.js',
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});

console.log('React frontend bundled successfully to static/bundle.js');
