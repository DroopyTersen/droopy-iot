var gulp = require("gulp");
var minify = require('gulp-uglify');
var rename = require('gulp-rename');
var browserify = require('gulp-browserify');
var concat = require("gulp-concat");

var browserifyAndMinify = function(entry, minifiedName) {
	return gulp.src(entry)
		.pipe(browserify({
			debug: false
		}))
		.pipe(gulp.dest('./dist/'))
		.pipe(rename(minifiedName))
		.pipe(minify())
		.pipe(gulp.dest('./dist/'));
};

gulp.task('js', function(){
	browserifyAndMinify('./entries/iotEvents.js', 'iotEvents.min.js');
});

gulp.task('default', ['js']);