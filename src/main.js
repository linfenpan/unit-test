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
    var ID = 10000;
    var ctx = this;
    var descript = function(desc, unitTestFn) {
      checkArgs('descript', arguments);

      ctx.descriptor = extend(ctx.getDescriptor(ID++), {
        index: 1,
        desc: desc
      });

      try {
        unitTestFn();
      } finally {
        ctx.descriptor = null;
      }
    };

    ctx.descript = forbiddenEmbed(descript, 'descript');
  },

  initIt: function() {
    var ctx = this;
    var it = function(text, run) {
      var descriptor = ctx.descriptor;

      if (!descriptor) {
        return;
      }

      checkArgs('it', arguments);
      descriptor.runs.push({ text: text, run: run });
    };

    ctx.it = forbiddenEmbed(it, 'it');
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
      var descriptor = ctx.descriptor || ctx.options;
      descriptor.timeout = time || DEFAULT_TIMEOUT;
    };

    ctx.timeout = timeout;
  },

  initBeforeAndAfter: function() {
    var ctx = this;
    var pushFnToList = function(listName, fn) {
      if (!isFunction(fn)) {
        return;
      }

      var descriptor = ctx.descriptor || ctx.options;
      descriptor[listName].push(fn);
    };
    var before = function(fn) {
      pushFnToList('befores', fn);
    };
    var after = function(fn) {
      pushFnToList('afters', fn);
    };

    ctx.after = after;
    ctx.before = before;
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
