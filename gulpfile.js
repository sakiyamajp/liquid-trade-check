var gulp = require('gulp');
const babel = require('gulp-babel');
const plumber = require('gulp-plumber');
const browserSync = require('browser-sync').create();
const nodemon = require('gulp-nodemon');
const changed = require('gulp-changed');
const sass = require('gulp-sass');

var allJsSource = ['src/**/*.js'];

gulp.task('babel', function() {
	return gulp.src(allJsSource)
		.pipe(changed('dist'))
		.pipe(plumber())
		.pipe(babel())
		.pipe(gulp.dest('dist'));
});
gulp.task('babelAll', function() {
	return gulp.src(allJsSource)
		.pipe(plumber())
		.pipe(babel())
		.pipe(gulp.dest('dist'));
});
gulp.task('watch', function() {
	return gulp.watch(allJsSource,gulp.series('babel'));
});
gulp.task('sass', function () {
  return gulp.src('./src/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dist'));
});
gulp.task('sass:watch', function() {
	gulp.watch('./src/**/*.scss', gulp.series('sass'));
});
gulp.task('browser-sync', function() {
	return browserSync.init({
		proxy : "localhost:80",
		ws : true,
		watchTask : true,
		notify: false,
		files: ['dist/public/**/*', 'views/**/*']
	},function(){
	});
});
for(let option of [{
	name : "nodemon",
	exec : 'npm start'
}]){
	gulp.task(option.name, function (done) {
		var stream = nodemon({
			exec: option.exec,
			// exec: 'npm run observer',
			ext: 'html js css pug',
			ignore: ['src','dist/public'],
			tasks: [],
			watch : ['dist'],
			done: done
		});
		stream.on('restart', function() {
			console.log('restarted!')
		})
		.on('crash', function() {
			console.error('Application has crashed!\n')
			stream.emit('restart', 10) // restart the server in 10 seconds
		});
		return stream;
	});
}

gulp.task('default',gulp.series('babelAll','sass',gulp.parallel('nodemon','browser-sync','watch','sass:watch')));
