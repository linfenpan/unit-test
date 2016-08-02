'use strict';

// 层次工厂
var layerFactory = {
  process: function(fn) {
    var index = 1;

    var result = function() {
      var ctx = getPureContext(this);

      if (!ctx.index) {
        ctx.index = index;
      }

      index++;
      fn.apply(ctx, arguments);
      index--;
    }

    return result;
  }
};

// id工厂，函数每次运行，都自带一个 id
var idFactory = {
  process: function(fn) {
    var id = 10000;
    var newIdCounter = 0;
    var stackCounter = 0;

    var result = function () {
      var ctx = getPureContext(this);

      if (stackCounter === 0) {
        id += newIdCounter;
        newIdCounter = 0;
      }

      if (!ctx.id) {
        ctx.id = id++;
        newIdCounter++;
      }

      result.currentId = ctx.id;

      stackCounter++;
      fn.apply(ctx, arguments);
      stackCounter--;

      if (stackCounter === 0) {
        result.currentId = id = id - newIdCounter;
      } else {
        result.currentId = ctx.id - 1;
      }
    }

    return result;
  }
};
