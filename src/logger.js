'use strict';

var logger = {
  log: function(message, spaceCount) {
    console.log(logger.buildSpace(message, spaceCount));
  },
  error: function(message, spaceCount) {
    console.error(logger.buildSpace(message, spaceCount));
  },
  success: function(message, spaceCount) {
    console.log('%c' + logger.buildSpace(message, spaceCount), 'color:green');
  },
  buildSpace: function(str, count) {
    return new Array(count || 0 + 1).join('  ') + str;
  }
};
