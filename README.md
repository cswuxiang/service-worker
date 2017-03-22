# service-worker
service-worker通用框架

> 相应能力

- 页面提速，针对css,img,js 无法缓存
- 针对活动，提前下载资源
- 针对高流量，提前下载资源
- 可做离线包

> 使用前提

-  pc端浏览器支持情况

  支持    ： Chrome40+,Firefox44+,opera27+  
  不支持  ： IE&safari暂不支持

-  移动端浏览器支持情况

 支持    ： TBS,android4.44+,
 不支持  ： ios（[下个五年计划 2020](https://trac.webkit.org/wiki/FiveYearPlanFall2015)）





> 使用方法   
 
- 引入sw.js文件到相应项目目录。
- 配置需要拦截请求及策略

> API介绍   

- Loader.get(request,type)  [加载器，可选择缓存优先/网络优先]
