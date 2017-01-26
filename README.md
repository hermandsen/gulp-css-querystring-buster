# gulp-css-buster

Gulp plugin for adding md5 hash for cache baster to local URL in css.

## Instalation

Install via npm:

```
npm install gulp-css-buster --save-dev
```

## Usage

```js
var buster = require('gulp-css-buster');

gulp.task('css-buster', function() {
  return gulp.src('src.css')
    .pipe(buster({
        // assets location used in css file
        assetsPath: './assets'
    }))
    .pipe(gulp.dest('style.css'));
});
```
