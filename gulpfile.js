// including gulp
var gulp = require('gulp');

// Include helper libraries
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');
var bump = require('gulp-bump');
var del = require('del');
var merge = require('merge2');
var concat = require('gulp-concat');
var util = require('gulp-util');
var browserify = require('browserify');
var header = require('gulp-header');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var tsify = require('tsify');
var ts = require('gulp-typescript');
var typescript = require('typescript');
var source = require('vinyl-source-stream');

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

gulp.task('browserify-sync', function() {
    browserify({
            entries: 'src/Interpreter.ts',
            standalone: "BFILib"

        })
        .plugin(tsify, {
            target: 'es5',
            module: 'commonjs'
        })
        .bundle()
        .pipe(plumber())
        .pipe(source('outFile.js'))
        .pipe(header(banner, { pkg: pkg }))
        .pipe(rename(outFile))
        .pipe(gulp.dest('lib/'));
});

gulp.task('browserify', function() {
    browserify({
            entries: './build/js/main.js',
            standalone: "BFILib"
        })
        .bundle()
        .pipe(plumber())
        .pipe(source('output.js'))
        .pipe(header(banner, { pkg: pkg }))
        .pipe(gulp.dest('lib/'));
});

//minify task

gulp.task('minify-sync', ['browserify-sync'], function() {
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

gulp.task('watch-heavy', function() {
    gulp.watch('src/**/*.ts', ['browserify-sync']);
});

gulp.task('watch-light', function() {
    gulp.watch('src/**/*.ts', ['browserify']);
});

gulp.task('watch', function() {
    gulp.watch('src/**/*.ts', ['default']);
});
// gulp delete task

gulp.task('clean-sync', ['minify-sync'], function() {
    del('build/*');
});

gulp.task('clean', function() {
    del('build/*');
});

// default gulp task.

gulp.task('default', ['browserify-sync', 'minify-sync']);

// gulp tasks

gulp.task('onlycompile', ['browserify-sync']);
