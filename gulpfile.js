// Gulp.js configuration
var
  // modules
  gulp = require('gulp'),
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

  // development mode?
  devBuild = (process.env.NODE_ENV !== 'production'),

  // folders
  folder = {
    src: 'src/',
    build: 'build/'
  }
;

gulp.task('serve', function () {
  nodemon({
    script: 'server.js'
  , watch: 'server.js'
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

gulp.task('browser-sync', ['serve', 'css'], function() {

    var files = ['./src/**/*.js', './src/**/*.css', './src/index.html'];

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
gulp.task('js', function() {

  var jsbuild = gulp.src(folder.src + 'js/**/*')
    .pipe(deporder())
    .pipe(webpack())
    .pipe(concat('main.js'));

  if (!devBuild) {
    jsbuild = jsbuild
      .pipe(stripdebug())
      .pipe(uglify());
  }

  return jsbuild.pipe(gulp.dest(folder.build + 'js/'));

});

gulp.task('html', function() {

  var html = gulp.src(folder.src + '*.html');
  console.log(html);

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
  gulp.watch(folder.src + 'scss/**/*', ['css']);

  // html changes
  gulp.watch(folder.src + '*.html', ['html']);

  // image changes
  gulp.watch(folder.src + 'images/**/*', ['images']);

  // javascript changes
  gulp.watch(folder.src + 'js/**/*', ['js']);

});

gulp.task('default', ['css', 'js', 'html', 'watch', 'browser-sync']);