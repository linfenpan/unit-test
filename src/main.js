'use strict';

var descriptMap = {
  '10000': {
    desc: '开始测试',
    index: 1,
    runs: []  // { text: String, run: Function }
  }
};

function getDescriptItemById(descriptId) {
  var map = descriptMap;
  var defaultItem = { id: descriptId, desc: '', index: 0, runs: [] };

  return map[descriptId]
    || (map[descriptId] = defaultItem);
}

var descript = layerFactory.process(function (text, fn) {
  if (isString(text) === false) {
    throw 'descript第一个参数，必须是 String';
  }
  if (isFunction(fn) === false) {
    throw 'descript第二个参数，必须是 Function';
  }

  var item = getDescriptItemById(this.id);
  item.index = this.index;
  item.desc = text;
  fn.call(item);
});

descript = idFactory.process(descript);

var it = function (text, fn) {
  if (isString(text) === false) {
    throw 'descript第一个参数，必须是 String';
  }
  if (isFunction(fn) === false) {
    throw 'descript第二个参数，必须是 Function';
  }
  
  var runs = getDescriptItemById(descript.currentId).runs;
  var item = { text: text, run: fn };
  runs.push(item);
};

function run() {
  var list = [];
  keys(descriptMap, function(key, item) {
    list.push(item);
  });

  try {
    var index = 0;
    recurList({
      list: list,
      next: function(item, next) {
        // item -> { index, desc, runs, id }
        index++;
        logger.log(index + '.' + item.desc, item.index);
        sequentTest(item, index + 1, next);
      }
    });
  } catch (e) {
    logger.error(e);
  }
}

function sequentTest(options, index, next) {
  var textIndex = options.index;
  var runs = options.runs;

  recurList({
    list: runs.slice(0),
    next: function(item, next) {
      // item -> { text, run }
      var fn = item.run;
      var text = item.text;
      logger.log(text, index);

      fn(next);
    },
    end: function() {
      next();
    }
  });
}
