# 使用猜想

当前版本，总体上，模拟 mocha 的设计。
不求超越，只求完成功能

# 当前版本的功能设想

[OK] #1 descript('文本', exec: Function);

 描述需要测试的内容，exec 是需要执行的一系列单元测试用例

[OK] #2 it('测试单元', unitFn: Function);

 测试的单元，unitFn 是需要执行的测试内容
 当 it 的运行中，捕获到异常，则该单元测试不通过

[OK] #3 timeout(3000);

 当前测试单元的超时策略，针对于 descript 中的所有 it

#4 不同浏览器都必须正常输出
  -> 通过配置不同 logger 去实现
#5 保证低版本浏览器的异常对象输出
  -> FAIL，抛出异常即可


# 之后的设想

#1 需要有全局配置
  -> 采用实例方式

#2 每一项执行，最好可以配置
  -> OK，每一项都有 before / after / timeout

#3 执行完单元测试，最好能销毁掉 descript/it/timeout 这几个对象
  -> 采用实例方式，不用销毁了

#4 beforeEach 和 afterEach 功能
  -> OK
