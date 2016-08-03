'use strict';

const pkg = require('./package.json');
const gulp = require('gulp');
const concat = require('gulp-concat');
const header = require('gulp-header');
const footer = require('gulp-footer');
const minify = require('gulp-minify');

// 进行 umd 打包
const headerText = `/*! unitTest.js-${pkg.version} by ${pkg.author} ${pkg.license} ${pkg.homepage}*/
(function (root, factory) {
  if (typeof define === 'function') {
    if (define.amd) {
      // AMD
      define(factory);
    } else {
      // CMD
      define(function(require, exports, module) {
        module.exports = factory();
      });
    }
  } else if (typeof exports === 'object') {
    // Node, CommonJS之类的
    module.exports = factory();
  } else {
    // 浏览器全局变量(root 即 window)
    root.UnitTest = factory();
  }
}(this, function ($) {
`;
const footerText = `
  return UnitTest;
}));
`;

const files = [
  './src/util.js',
  './src/logger.js',
  './src/factory.js',
  './src/main.js'
];
const targetName = 'index.js';
const targetDir = './';

gulp.task('concat', () => {
  return gulp.src(files)
    .pipe(concat(targetName))
    .pipe(header(headerText))
    .pipe(footer(footerText))
    .pipe(
      minify({
        preserveComments: 'some'
      })
    )
    .pipe(
      gulp.dest(targetDir)
    );
});

gulp.task('default', ['concat']);
