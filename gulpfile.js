// including gulp
var gulp = require('gulp');

// Include Compilation libraries
var browserify = require('browserify');
var tsify = require('tsify');
var ts = require('gulp-typescript');
var source = require('vinyl-source-stream');

// Include helper libraries
var del = require('del');
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');
var bump = require('gulp-bump');
var util = require('gulp-util');
var header = require('gulp-header');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');

// create ts project
var tsproject = ts.createProject('tsconfig.json');
var pkg = require('./package.json');

var projectname = pkg.name;
var projectver = pkg.version;

// using data from pkg.json 
var banner = ['/**',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * @version v<%= pkg.version %>',
    ' * @link <%= pkg.homepage %>',
    ' * @license <%= pkg.license %>',
    ' */',
    ''
].join('\n');

var outFile = projectname + '-' + projectver + '.js';
var outMinFile = projectname + '-' + projectver + '.min.js';

// browserify task

gulp.task('browserify', function() {
    return browserify({
            entries: 'src/main.ts',
            standalone: "Library"
        })
        .plugin(tsify, {
            target: tsproject.target,
            module: 'commonjs'
        })
        .bundle()
        .pipe(plumber())
        .pipe(source('outFile.js'))
        .pipe(header(banner, { pkg: pkg }))
        .pipe(rename(outFile))
        .pipe(gulp.dest('lib/'));
});

//minify task

gulp.task('minify-sync', ['browserify'], function() {
    gulp.src(['lib/*.js', '!lib/*.min.js'])
        .pipe(plumber())
        .pipe(uglify())
        .pipe(header(banner, { pkg: pkg }))
        .pipe(rename(outMinFile))
        .pipe(gulp.dest('lib/'));
});

gulp.task('minify', function() {
    gulp.src(['lib/*.js', '!lib/*.min.js'])
        .pipe(plumber())
        .pipe(uglify())
        .pipe(header(banner, { pkg: pkg }))
        .pipe(rename(outMinFile))
        .pipe(gulp.dest('lib/'));
});

// watch task

gulp.task('watch', function() {
    gulp.watch('src/**/*.ts', ['default']);
});


gulp.task('watch-light', function() {
    gulp.watch('src/**/*.ts', ['browserify']);
});

// gulp clran task

gulp.task('clean', function() {
    del('lib/*');
});

// default gulp task.

gulp.task('default', ['browserify', 'minify-sync']);

// gulp tasks

gulp.task('onlycompile', ['browserify']);
