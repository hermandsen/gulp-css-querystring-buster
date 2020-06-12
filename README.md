# gulp-css-querystring-buster

Gulp plugin for adding file modification time to query string of local URL in css.

Forked from https://github.com/agence-webup/gulp-css-buster

## Instalation

Install via npm:

```
npm install gulp-css-querystring-buster --save-dev
```

## Usage

```js
var buster = require('gulp-css-querystring-buster');

gulp.task('css-buster', function() {
  return gulp.src('src.css')
    .pipe(buster({
        // assets location used in css file
        assetsPath: './assets'
    }))
    .pipe(gulp.dest('style.css'));
});
```
