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
          logger.log('START: ' + desc);

          runFnList(options.befores, function() {
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
        var fn = item.run;
        var text = item.text;

        logger.log(addSpace(text, textIndex));

        clearTimer();
        timer = setTimeout(function() {
          next = noop;
          logger.error(addSpace('timeout', textIndex));
        }, timeout);

        try {
          runFnList(descriptor.befores, function() {
            fn(function() {
              logger.success(addSpace('success', textIndex + 1));
              runFnList(descriptor.afters, function() {
                next();
              });
            });
          });
        } finally {
          clearTimer();
        }
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
