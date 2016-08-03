/*! unitTest.js-0.0.2 by da宗熊 MIT https://github.com/linfenpan/unit-test#readme*/
!function(t,n){"function"==typeof define?define.amd?define(n):define(function(t,i,e){e.exports=n()}):"object"==typeof exports?module.exports=n():t.UnitTest=n()}(this,function(t){"use strict";function n(){}function i(t){return Object.prototype.toString.call(t).split(" ")[1].slice(0,-1).toLowerCase()}function e(t){return"function"===i(t)}function o(t){return"string"===i(t)}function r(t,n){for(var i in t)t.hasOwnProperty(i)&&n.call(t,i,t[i])}function u(t,n){return r(n,function(n,i){t[n]=i}),t}function s(t){function n(){var t=i.shift();t?e(t,function(){n()}):o&&o()}t=t||{};var i=t.list,e=t.next,o=t.end;n()}function c(t,n){return new Array(n||1).join("  ")+t}function f(t){var n=1,i=function(){var i=this;i.index||(i.index=n),n++,t.apply(i,arguments),n--};return i}function a(t){var n=1e4,i=function(){var i=this;i.id||(i.id=n++),t.apply(i,arguments)};return i}function p(t){return this instanceof p?void this.init(t):new p(t)}function l(t,n){if(o(n[0])===!1)throw t+" first argument should be String";if(e(n[1])===!1)throw t+" second argument should be Function"}function d(t,n){s({list:t.slice(0),next:function(t,n){t(n)},end:function(){n()}})}var h={log:function(t){console.log(t)},error:function(t){console.error(t)},success:function(t){console.log(t)}},v=function(){var t=[];return function(n,i){return function(){var e=u({},t[0]||{});t.length>0?t[0]=e:t.unshift(e);var o=u({},i);o=u(o,e),t.unshift(o),n.apply(o,arguments),t.shift()}}}(),g=function(){var t={};return function(n,i){return function(){if(t[i])throw'"'+i+'" can not be embedded';t[i]=1,n.apply(this,arguments),t[i]=0}}}(),x=5e3;return u(p.prototype,{init:function(t){var n=this;n.descriptMap={},n.options={timeout:x,afters:[],befores:[]},u(n.options,t||{}),n.logger=h,n.initDescript(),n.initIt(),n.initRun(),n.initTimeout(),n.initBeforeAndAfter()},initDescript:function(){var t=this,n=function(t,n){var i=this,e=i.ctx;l("descript",arguments),i.descriptor=u(e.getDescriptor(i.id),{index:i.index,desc:t}),n()};t.descript=v(a(f(g(n,"descript"))),{ctx:t})},initIt:function(){var t=this,n=function(t,n){var i=this,e=(i.ctx,i.descriptor);e&&(l("it",arguments),e.runs.push({text:t,run:n}))};t.it=v(g(n,"it"))},initRun:function(){var t=this,n=t.options;t.run=function(){var i=t.logger,e=[];r(t.descriptMap,function(t,n){e.push(n)}),s({list:e,next:function(e,o){var r=e.desc;i.log("START: "+r),d(n.befores,function(){t.sequentTest(e,function(){i.log("END: "+r),i.log("  "),d(n.afters,o)})})},end:function(){i.success("all pass (●'◡'●)")}})}},sequentTest:function(t,i){function e(){clearTimeout(o)}var o,r=this,u=t.index+1,f=t.timeout,a=r.logger,p=t.runs;s({list:p.slice(0),next:function(i,r){var s=i.run,p=i.text;a.log(c(p,u)),e(),o=setTimeout(function(){r=n,a.error(c("timeout",u))},f);try{d(t.befores,function(){s(function(){a.success(c("success",u+1)),d(t.afters,function(){r()})})})}finally{e()}},end:function(){e(),i()}})},initTimeout:function(){var t=this,n=function(n){var i=this.descriptor;i||(i=t.options),i.timeout=n||x};t.timeout=v(n)},initBeforeAndAfter:function(){var t=this,n=function(n,i){if(e(i)){var o=this.descriptor;o||(o=t.options),o[n].push(i)}},i=function(t){n.call(this,"befores",t)},o=function(t){n.call(this,"afters",t)};t.after=v(o),t.before=v(i)},getDescriptor:function(t){var n=this.options,i={id:t,desc:"",runs:[],index:0,afters:[],befores:[],timeout:n.timeout},e=this.descriptMap;return e[t]?e[t]:e[t]=i},setLogger:function(t){u(this.logger,t)}}),p});