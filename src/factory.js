'use strict';

// 内嵌运行函数，统一上下文
// var magiContext = (function sameContext() {
//   var ctxs = [];
//   return function(fn, ctx) {
//     return function() {
//       var parentCtx = extend({}, ctxs[0] || {});;
//       if (ctxs.length > 0) {
//         ctxs[0] = parentCtx;
//       } else {
//         ctxs.unshift(parentCtx);
//       }
//
//       var currentCtx = extend({}, ctx);
//       currentCtx = extend(currentCtx, parentCtx);
//
//       ctxs.unshift(currentCtx);
//       try {
//         fn.apply(currentCtx, arguments);
//       } finally {
//         ctxs.shift();
//       }
//     };
//   };
// })();

// 函数不允许内嵌
var forbiddenEmbed = (function() {
  var frbMap = {};
  return function(fn, key) {
    return function() {
      if (frbMap[key]) {
        throw '"'+ key +'" can not be embedded';
      }

      frbMap[key] = 1;
      try {
        fn.apply(this, arguments);
      } finally {
        frbMap[key] = 0;
      }
    };
  }
})();
