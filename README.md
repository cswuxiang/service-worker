# service-worker
service-worker通用框架_[mysw.js](https://github.com/cswuxiang/service-worker/)

> 背景由来
```
1、外部资源文件（点击流js，头像img）引入业务无缓存能力
2、项目统一使用localstorage只支持缓存JS能力，css,img,cgi缓存的补充
3、增加用户弱网络体验能力
```

> 相应能力

- [x] 页面提速，针对css,img,js 无法缓存
- [x] 针对活动，提前下载资源
- [x] 针对高流量，提前下载资源
- [x] 可做离线包

> 整体架构

![image](http://i4.buimg.com/1949/3cfcafda93daf826.png)

> 文件介绍   

- [x] sw-js.shtml  
```
作用为降级及注册sw文件。
```
- [x] sw/loader.js 
```
请求加载器.
主要在于拦截并发请求，并进行缓存相关策略方法。
```
- [x] sw/gc.js
```
垃圾回收器.
主要在于采用LRU淘汰机制，达到保鲜能力。
```
- [x] sw/tools.js
```
工具.
主要提供如日期对比，匹配能力。
```
> 使用方法   
 
- [x] 页面中引入sw-js.shtml文件，设置stopSw=fasle;
- [x] 配置mysw.js中相关策略

> 使用说明

- [x] pc端浏览器支持情况
```

支  持  ： Chrome40+,Firefox44+,opera27+  
不支持  ： IE&safari暂不支持

```


- [x] 移动端浏览器支持情况

```
支 持   ：  TBS,android4.4.4+
不支持  ： ios（[下个五年计划 2020](https://trac.webkit.org/wiki/FiveYearPlanFall2015)）

```
![image](http://i4.buimg.com/588926/d10f67e2a340bec6.png)


- [x] 页面需支持https


> 使用疑问解答

- [x] service worker与application manifest的不同？

```
1.灵活性不足;不能进行编程动态实现，灵活配置资源文件。
2.更新文件麻烦;预先下载mainfest文件，根据manfest更新文件
3.需要服务器的支持
```
![image](http://images2015.cnblogs.com/blog/344785/201601/344785-20160112210422069-492695603.png)

- [x] 是否影响主线程JS的运行？
```
不影响，独立其它线程
```
![image](http://i4.buimg.com/588926/d908aa48be9f2191.png)

- [x] 是否可访问DOM ？
```
不能，其运行在不同上下文中，可采用消息通知方式间接访问。
```
- [x] 在sw中是否可以修改原请求cookie及header相关值 ？

```
不能，安全考量，禁止获取及修改header相关值，可采用消息通知方式修改与访问。
```
- [x] 缓存容量大小 ？

```
在 Chrome 和 Opera 中，按照源（而不是 API）进行存储。这两个存储机制都将存储数据，直到达到浏览器配额。应用可以使用 Quota Management API 检查它们目前使用了多少配额。 在 Chrome 中，应用最多可使用 6% 的磁盘空间。在 Firefox 中，应用最多可使用 10% 的可用磁盘空间，但在存储 50MB 数据后将提示用户进行更多存储请求。 在 Mobile Safari 中，应用最多可使用 50MB 存储空间，而 Safari 桌面版不限制存储空间的使用（并在达到 5MB 后进行提示）。IE10+ 最多可存储 250MB，并在存储 10MB 后提示用户
```
- [x] 图片以及css或js有缓存为什么还需要？
```
1、外部资源时，无法控制。
2、提前下载相应资源。
3、无需太依赖后台服务器。
4、无需发出304请求。
```



> 参考文案

- [x] [chrome官方文档](https://developers.google.com/web/fundamentals/getting-started/primers/service-workers)
- [x] [mozilla](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)
- [x] [存储空间](https://developers.google.cn/web/fundamentals/instant-and-offline/web-storage/offline-for-pwa?hl=zh-cn)
- [x] [百度搜索](http://mp.weixin.qq.com/s?__biz=MzIwNjQwMzUwMQ==&mid=2247485045&idx=1&sn=84556a3cc21cf9eafaefa3efc0f62a20)
- [x] [Service Workers 与离线缓存](https://segmentfault.com/a/1190000008491458)
