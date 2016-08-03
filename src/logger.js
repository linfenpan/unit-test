'use strict';

var logger = {
  log: function(message) {
    console.log('%c' + message, 'color: orangered');
  },
  error: function(message) {
    console.error(message);
  },
  success: function(message) {
    console.log('%c' + message, 'color: green');
  }
};
