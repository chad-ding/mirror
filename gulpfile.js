const path = require('path');
const gulp = require('gulp');
const less = require('gulp-less');
const gulpPostcss = require('gulp-postcss');
const gulpRename = require('gulp-rename');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

const src = path.resolve(__dirname, './src');
const dist = path.resolve(__dirname, './dist');

async function compile() {
    await new Promise((resolve) => {
        gulp.src(`${src}/css/index.less`)
            .pipe(
                less({
                    paths: [path.join(__dirname, 'less', 'includes')]
                })
            )
            .pipe(
                gulpPostcss([
                    autoprefixer(),
                    cssnano({
                        preset: [
                            'default',
                            {
                                normalizeWhitespace: false
                            }
                        ]
                    })
                ])
            )
            .pipe(gulp.dest(dist))
            .on('end', resolve);
    });
    await new Promise((resolve) => {
        gulp.src(`${dist}/index.css`)
            .pipe(
                gulpPostcss([
                    cssnano({
                        preset: 'default'
                    })
                ])
            )
            .pipe(
                gulpRename(({ dirname, basename, extname }) => {
                    return {
                        dirname,
                        basename: 'index.min',
                        extname
                    };
                })
            )
            .pipe(gulp.dest(dist))
            .on('end', resolve);
    });
}

exports.default = compile;
