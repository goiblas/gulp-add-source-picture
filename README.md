# gulp-add-source-picture
## Options

you must to indicate the folder which you save the images

## Install

`npm install gulp-add-source-picture`

## Usage

``` js
var gulp = require('gulp');
var addSource = require('gulp-add-source-picture');

gulp.task('replace', function () {
    return gulp.src('files/*.html')
        .pipe(addSource('images'))
        .pipe(gulp.dest('dist'));
});

```

You put html in:
``` html
<picture>
    <img src="../images/image.jpg" alt="example">
</picture>
```

And get html out:
``` html
<picture>
    <source srcset="../images/image.jpg 583w, ../images/image@0,5x.jpg 292w, ../images/image@1,5x.jpg 875w, ../images/image@2x.jpg 1167w, ../images/image@3x.jpg 1750w">
    <img src="../images/image.jpg" alt="example">
</picture>
```
