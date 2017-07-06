// Gulp.js configuration
var
  // modules
  gulp = require('gulp'),
  webpack = require('webpack-stream'),
  newer = require('gulp-newer'),
  imagemin = require('gulp-imagemin'),
  htmlclean = require('gulp-htmlclean'),
  concat = require('gulp-concat'),
  deporder = require('gulp-deporder'),
  stripdebug = require('gulp-strip-debug'),
  uglify = require('gulp-uglify'),
  sass = require('gulp-sass'),
  postcss = require('gulp-postcss'),
  assets = require('postcss-assets'),
  autoprefixer = require('autoprefixer'),
  mqpacker = require('css-mqpacker'),
  cssnano = require('cssnano'),
  livereload = require('gulp-livereload'),
  webpack = require('webpack-stream'),
	nodemon = require('gulp-nodemon'),
	notify = require('gulp-notify'),
  browserSync = require('browser-sync').create(),
  babel = require('gulp-babel')

  // development mode?
  devBuild = (process.env.NODE_ENV !== 'production'),

  // folders
  folder = {
    src: 'src/',
    build: 'build/'
  }
;

gulp.task('serverjs', ['serve'], () => {

  console.log('jsserver');

  var jsbuild = gulp.src(folder.src + 'server/index.js')
    .pipe(webpack( require('./webpack.config.server.js') ));
    
  if (!devBuild) {
    jsbuild = jsbuild
      .pipe(stripdebug())
      .pipe(uglify());
  }

  return jsbuild.pipe(gulp.dest(folder.build + 'server'));
});

gulp.task('serve', function () {
  nodemon({
    script: folder.build + 'server/index.js'
  , watch: folder.build + 'server/index.js'
  })
    .on('restart', function onRestart() {
        // Also reload the browsers after a slight delay
        setTimeout(function reload() {
            browserSync.reload({
                stream: false
            });
        }, 500);
    });
});

gulp.task('browser-sync', ['css'], function() {

    var files = ['./src/client/index.js', './src/**/*.css', './src/index.html'];

    browserSync.init(files, {
        proxy: "localhost:8080"
    });
});


gulp.task('images', function() {
  var out = folder.build + 'images/';
  return gulp.src(folder.src + 'images/**/*')
    .pipe(newer(out))
    .pipe(imagemin({ optimizationLevel: 5 }))
    .pipe(gulp.dest(out));
});

// JavaScript processing
gulp.task('jsclient', function() {

  console.log('jslicent');

  var jsbuild = gulp.src(folder.src + 'client/index.js')
    .pipe(deporder())
    .pipe(concat('main.js'))
    .pipe(webpack( require('./webpack.config.client.js') ));
    

  if (!devBuild) {
    jsbuild = jsbuild
      .pipe(stripdebug())
      .pipe(uglify());
  }

  return jsbuild.pipe(gulp.dest(folder.build + 'client/'));

});

gulp.task('html', function() {

  var html = gulp.src(folder.src + '*.html');
  return html.pipe(gulp.dest(folder.build));

});

// CSS processing
gulp.task('css', ['images'], function() {

  var postCssOpts = [
  assets({ loadPaths: ['images/'] }),
  autoprefixer({ browsers: ['last 2 versions', '> 2%'] }),
  mqpacker
  ];

  if (!devBuild) {
    postCssOpts.push(cssnano);
  }

  return gulp.src(folder.src + 'scss/main.scss')
    .pipe(sass({
      outputStyle: 'nested',
      imagePath: 'images/',
      precision: 3,
      errLogToConsole: true
    }))
    .pipe(postcss(postCssOpts))
    .pipe(gulp.dest(folder.build + 'css/'));
});

gulp.task('watch', function() {

  // css changes
  gulp.watch(folder.src + 'client/scss/**/*', ['css']);

  // html changes
  gulp.watch(folder.src + '*.html', ['html']);

  // image changes
  gulp.watch(folder.src + 'client/images/**/*', ['images']);

  // javascript changes
  gulp.watch(folder.src + 'client/*.js', [ 'jsclient']);

  // javascript changes
  // gulp.watch(folder.src + 'server/*.js', [ 'jsclient']);

  // javascript changes
  gulp.watch(folder.src + 'shared/**/*', [ 'jsclient']);

});

gulp.task('default', ['css', 'jsclient', 'serverjs', 'html', 'watch', 'browser-sync']);