var gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish');

gulp.task('lint', function() {
  gulp.src('./server.js')
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
});

gulp.task('watch', function() {
  nodemon({ script: 'server.js' })
    .on('change', ['lint'])
});

gulp.task('default', ['lint', 'watch']);
