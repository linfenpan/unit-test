# 单元测试

## 背景

每次编写玩脚本后，想做一个简单的单元测试，但是每每想到，需要引入一堆莫名的玩意，
就隐隐觉得很脚痛，而且还不能用在浏览器，到底是什么鬼啊...


## 功能简介

看例子:
``` javascript
const { descript, it, run } = UnitTest();
const name = 'da宗熊';

// 定义一个测试用例
descript('名字校验', () => {
  // 用例中的一个测试单元
  it('名字必须以"da"开头', done => {
    if (name.indexOf('da') === 0) {
      // 通过测试，调用 done 方法
      done();
    } else {
      // 测试不通过，抛出异常
      throw new Error('error');
    }
  });
});

run();
```

上述例子，定义了一个测试用例"名字校验"，此用例，拥有测试单元"名字必须以"da"开头"，
如果用例中，所有测试单元都通过，则用例测试通过，否则，抛出异常，测试不通过。

-------------------------

## 常用 API 介绍

### unitTest.descript(desc: String, testFn: Function)

定义一个测试用例，``` desc ``` 是用例的描述，``` testFn ``` 是用例执行的内容

``` javascript
var unitTest = new UnitTest();
var descript = unitTest.descript;

descript('测试用例1', function() {
  // do something...
});

unitTest.run();
```
注意，descript 中，不能再包含 descript


### unitTest.it(desc: String, unitFn: Function)

定义一个测试单元，仅运行在 descript 中

``` javascript
var unitTest = new UnitTest();
var descript = unitTest.descript;
var it = unitTest.it;

descript('测试用例1', function() {
  it('test something', function(done) {
    // 验证通过，执行 done();
    // 验证不通过，抛出异常
    // 一定时间内，没执行 done 或 抛异常，则会触发超时，默认超时时间为 5s
  });
});

unitTest.run();
```

## unitTest.timeout(time: Number)

重置当前测试单元[it的执行]的超时时间，同一个 descript 中，仅最后一个 timeout 生效

``` javascript
const unitTest = new UnitTest();
const { descript, it, run, timeout } = unitTest;

// timeout(10000); // 将 unitTest 实例的默认超时，更改为 10s

descript('测试用例1', function() {
  timeout(6000);

  it('test something', function(done) {
    // 6s 后，才超时
  });
});

run();
```

## unitTest.before(fn: Function) 和 unitTest.after(fn: Function)

分别用于指定在 descript 或 it 执行之前和之后，需要做的处理，
当在 descript 中执行，则用于指定每一个 it 前和后的处理。
否则，则用于指定每个 descript 前和后的处理。

``` javascript
const unitTest = new UnitTest();
const { descript, it, run, before, after } = unitTest;

// 在执行“测试用例1”前，先执行此处
before(function(next) {
  console.log('before');
  next(); // 必须调用 next，通知外部已执行完成
});

descript('测试用例1', function() {
  // 在执行 "test something" 后，执行此处
  after(function(next) {
    console.log('after');
    next();
  });

  it('test something', function(done) {
    done();
  });
});

run();
```
