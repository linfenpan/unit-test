'use strict';

// 内嵌运行函数，统一上下文
var sameContext = (function sameContext() {
  var ctxs = [];
  return function(fn, ctx) {
    return function() {
      var parentCtx = extend({}, ctxs[0] || {});;
      if (ctxs.length > 0) {
        ctxs[0] = parentCtx;
      } else {
        ctxs.unshift(parentCtx);
      }

      var currentCtx = extend({}, ctx);
      currentCtx = extend(currentCtx, parentCtx);

      ctxs.unshift(currentCtx);
      fn.apply(currentCtx, arguments);
      ctxs.shift();
    };
  };
})();

// 层次工厂
function layerFactory(fn) {
  var index = 1;

  var result = function() {
    var ctx = this;

    if (!ctx.index) {
      ctx.index = index;
    }

    index++;
    fn.apply(ctx, arguments);
    index--;
  }

  return result;
}

// id工厂，函数每次运行，都自带一个 id
function idFactory(fn) {
  var id = 10000;

  var result = function () {
    var ctx = this;

    if (!ctx.id) {
      ctx.id = id++;
    }

    fn.apply(ctx, arguments);
  }

  return result;
}
