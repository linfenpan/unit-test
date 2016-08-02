'use strict';

function type(o) {
  return Object.prototype.toString.call(o)
    .split(' ')[1]
    .slice(0, -1)
    .toLowerCase();
}

function isFunction(fn) {
  return type(fn) === 'function';
}

function isString(str) {
  return type(str) === 'string';
}

function keys(obj, fn) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      fn.call(obj, key, obj[key]);
    }
  }
}

function forEach(arr, fn) {
  for (var i = 0, len = arr.length; i < len; i++) {
    fn.call(arr, arr[i], i);
  }
}

function recurList(options) {
  options = options || {};
  var list = options.list;
  var next = options.next;
  var endCallback = options.end;

  function again() {
    var item = list.shift();

    if (item) {
      next(item, function() {
        again();
      });
    } else {
      endCallback && endCallback();
    }
  }

  again();
}

function getPureContext(ctx) {
  var key = '__pure_ctx_';

  if (!ctx || !ctx[key]) {
    ctx = {};
    ctx[key] = 1;
  }

  return ctx;
}
