var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var uglifycss = require('gulp-uglifycss');
var autoprefixer = require('gulp-autoprefixer');
var devip = require('dev-ip');
var sprite = require('gulp.spritesmith');
var beep = require('beepbeep');

gulp.task('sass', function(){
    return gulp.src(['sass/styles.scss', 'sass/profile.scss'])
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError).on('error', function () { beep(); })) // Converts Sass to CSS with gulp-sass
        .pipe(autoprefixer({
        browsers: ['last 3 versions'],
        cascade: false
    }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('css'))
        .pipe(browserSync.reload({
        stream: true
    }))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglifycss({}))
        .pipe(gulp.dest('css'))
});




gulp.task('watch', ['browserSync', 'sass'], function(){
    gulp.watch('sass/**/*.scss', ['sass']);
    gulp.watch('*.html', browserSync.reload);
    gulp.watch('*.php', browserSync.reload);
    gulp.watch('**/*.php', browserSync.reload);
    gulp.watch('js/**/*.js', browserSync.reload);	
    // Other watchers
})

gulp.task('browserSync', function() {
    browserSync.init( {
        //browsersync with a php server
        proxy: "localhost/*replaceme*",
        notify: false,
		host: "192.168.2.108"
    });
})

gulp.task('scripts', function() {
    return gulp.src(['js/build/**/*.js'])
        .pipe(concat('complete.js'))
        .pipe(gulp.dest('js/'));
});

gulp.task('compress', function() {
    return gulp.src('js/build/*.js')
        .pipe(uglify())
        .pipe(rename({
        extname: '.min.js'
    }))
        .pipe(gulp.dest('js/'));
});

devip(); // [ "192.168.1.76", "192.168.1.80" ] or false if nothing found (ie, offline user)


var penthouse = require('penthouse');

var criticalPages = [{
    url: 'http://localhost/',
    name: 'front'
}];

gulp.task('criticalCSS', function() {
    criticalPages.map(function(page) {
        penthouse({
            url: page.url,
            css: 'css/styles.css',
            width: 1280,
            height: 900
        }, function(err, data) {
            require('fs').writeFile('css/' + page.name + '.css', data);
        });
    });
});

gulp.task('sprite', function() {
    var spriteData = 
        gulp.src('images/logos/komm/*.*') // source path of the sprite images
    .pipe(sprite({
        imgName: 'sprite.png',
        cssName: '_sprites.scss',
        padding: 1, // Due to rounding, needs some space between images
        cssTemplate: "images/sprites.scss.handlebars"
    }));

    spriteData.img.pipe(gulp.dest('images/built/')); // output path for the sprite
    spriteData.css.pipe(gulp.dest('images/built/')); // output path for the CSS
});