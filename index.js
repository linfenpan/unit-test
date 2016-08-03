/*! unitTest.js-0.0.4 by da宗熊 MIT https://github.com/linfenpan/unit-test#readme*/
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
'use strict';

function noop() {}

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

function extend(obj, source) {
  keys(source, function(key, value) {
    obj[key] = value;
  });
  return obj;
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

function addSpace(str, spaceCount) {
  return new Array(spaceCount || 0 + 1).join('  ') + str;
}

'use strict';

var logger = {
  log: function(message) {
    console.log(message);
  },
  error: function(message) {
    console.error(message);
  },
  success: function(message) {
    console.log(message);
  }
};

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
      try {
        fn.apply(currentCtx, arguments);
      } finally {
        ctxs.shift();
      }
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
    try {
      fn.apply(ctx, arguments);
    } finally {
      index--;
    }
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

'use strict';

var DEFAULT_TIMEOUT = 5000;

function UnitTest(options) {
  if (!(this instanceof UnitTest)) {
    return new UnitTest(options);
  }
  this.init(options);
}

extend(UnitTest.prototype, {
  init: function(options) {
    var ctx = this;

    ctx.descriptMap = {};
    ctx.options = {
      timeout: DEFAULT_TIMEOUT,
      // 每个 descript 运行前后，需要执行的函数
      afters: [],
      befores: []
    };
    extend(ctx.options, options || {});
    ctx.logger = logger;

    ctx.initDescript();
    ctx.initIt();
    ctx.initRun();
    ctx.initTimeout();
    ctx.initBeforeAndAfter();
  },

  initDescript: function() {
    var ctx = this;
    var descript = function(desc, unitTestFn) {
      var self = this;
      var ctx = self.ctx;

      checkArgs('descript', arguments);

      self.descriptor = extend(ctx.getDescriptor(self.id), {
        index: self.index,
        desc: desc
      });

      unitTestFn();
    };

    ctx.descript = sameContext(
      idFactory(layerFactory(forbiddenEmbed(descript, 'descript'))), { ctx: ctx }
    );
  },

  initIt: function() {
    var ctx = this;
    var it = function(text, run) {
      var self = this;
      var ctx = self.ctx;
      var descriptor = self.descriptor;

      if (!descriptor) {
        return;
      }

      checkArgs('it', arguments);
      descriptor.runs.push({ text: text, run: run });
    };

    ctx.it = sameContext(forbiddenEmbed(it, 'it'));
  },

  initRun: function() {
    var ctx = this;
    var options = ctx.options;

    ctx.run = function() {
      var logger = ctx.logger;
      var list = [];

      keys(ctx.descriptMap, function(key, item) {
        list.push(item);
      });

      recurList({
        list: list,
        next: function(item, next) {
          // item -> { index, desc, runs, id }
          var desc = item.desc;

          runFnList(options.befores, function() {
            logger.log('START: ' + desc);
            ctx.sequentTest(item, function() {
              logger.log('END: '+ desc);
              logger.log('  ');
              runFnList(options.afters, next);
            });
          });
        },
        end: function() {
          logger.success('all pass (●\'◡\'●)');
        }
      });
    };
  },

  sequentTest: function(descriptor, callback) {
    var ctx = this;
    var textIndex = descriptor.index + 1;
    var timeout = descriptor.timeout;
    var logger = ctx.logger;
    var runs = descriptor.runs;

    var timer;
    function clearTimer() {
      clearTimeout(timer);
    }

    recurList({
      list: runs.slice(0),
      next: function(item, next) {
        // item -> { text, run }
        var run = item.run;
        var text = item.text;

        clearTimer();
        timer = setTimeout(function() {
          throw 'timeout';
        }, timeout);

        runFnList(descriptor.befores, function() {
          logger.log(addSpace(text, textIndex));
          try {
            run(function() {
              clearTimer();
              logger.success(addSpace('success', textIndex + 1));
              runFnList(descriptor.afters, function() {
                next();
              });
            });
          } catch (e) {
            clearTimer();
            throw e;
          }
        });
      },
      end: function() {
        clearTimer();
        callback();
      }
    });
  },

  initTimeout: function() {
    var ctx = this;
    var timeout = function(time) {
      var descriptor = this.descriptor;

      if (!descriptor) {
        descriptor = ctx.options;
      }

      descriptor.timeout = time || DEFAULT_TIMEOUT;
    };

    ctx.timeout = sameContext(timeout);
  },

  initBeforeAndAfter: function() {
    var ctx = this;
    var pushFnToList = function(listName, fn) {
      if (!isFunction(fn)) {
        return;
      }

      var descriptor = this.descriptor;

      if (!descriptor) {
        descriptor = ctx.options;
      }

      descriptor[listName].push(fn);
    };
    var before = function(fn) {
      pushFnToList.call(this, 'befores', fn);
    };
    var after = function(fn) {
      pushFnToList.call(this, 'afters', fn);
    };

    ctx.after = sameContext(after);
    ctx.before = sameContext(before);
  },

  getDescriptor: function(id) {
    var options = this.options;
    var defaultItem = {
      id: id,
      desc: '',
      runs: [],
      index: 0,
      // 每次运行后
      afters: [],
      // 每次运行前
      befores: [],
      timeout: options.timeout
    };
    var map = this.descriptMap;

    return map[id] ? map[id] : (map[id] = defaultItem);
  },

  setLogger: function(logger) {
    extend(this.logger, logger);
  }
});

function checkArgs(desc, args) {
  if (isString(args[0]) === false) {
    throw desc + ' first argument should be String';
  }
  if (isFunction(args[1]) === false) {
    throw desc + ' second argument should be Function';
  }
}

function runFnList(list, callback) {
  recurList({
    list: list.slice(0),
    next: function(fn, next) {
      fn(next);
    },
    end: function() {
      callback();
    }
  });
}

  return UnitTest;
}));
