/**
 * 适用场景：
 * 1、页面提速，针对css,img,js 无法缓存
 * 2、针对活动，提前下载资源
 * 3、针对高流量，提前下载资源
 * 4、可做离线包
 */
 
/**
 *错误上报
 */
var errorReport = function(msg,cgi,retcode,action){
            var attach = encodeURIComponent(msg);
            var para = [
                //"ua=" + encodeURIComponent(window.navigator.userAgent.replace(/\s/g, "_")),
                "action=" + (action||"global/js/report"),
                "op=logicerror",
                "time=0",
                "cost=0",
                "attach=" + cgi,
                "retcode=" + (retcode||"90010001"),
                "retmsg=" + msg,
                "line=0",
                "errmsg=",
                "url=0"
            ];
            var url = "https://aa.bb.com/logger4js.cgi";
            url  = url + "?" + para.join("&");
            fetch(url,{mode:"no-cors"}).then(function(e){
            }).catch(function(){})
}
/**
 * 基本配置
 * @type 
 */
var Config = {
    CACHE_NAME_VERSION  : 33,//通过此控制版本的更新
    WHITE_REFERRER_URLS : [{domain:"aa.com",pages:["test.do"]},//白名单域名及相关页面
                           {domain:"bb.com",pages:[]}],
    CACHE_NAME_PREFIX   : "sw-test-",//缓存名
    CACHE_NAME_TIME_PREFIX : "sw-test-time-",//缓存时间名
    CACHE_RULES         : ["https://wx.qlogo.cn/mmhead",/[^?]*\.(js|css|png|jpg|jpeg|gif|ico)(\?|$)/i],//缓存类型控制
    JS_CSS              : [/[^?]*\.(js|css)/],
    CLEAR_CACHE         : true,//缓存版本变更后，是否需要清理之前缓存
    EXPIRED_DAY         : 30,//30天过期
    CACHE_NAME          : function(namePrefix){//获取缓存名
             return (namePrefix || Config.CACHE_NAME_PREFIX) + Config.CACHE_NAME_VERSION
    }
}
//文件方法中的报错，会在此体现
self.addEventListener("error",function(event){
    errorReport(event.message,event.filename,"90010009");
});
self.addEventListener("unhandledrejection",function(event){
   console.log("unhandledrejection");
   //serrorReport(event.reason,event.filename,"90010009");
})

//self.importScripts("/sw/tools.js","/sw/loader.js","/sw/gc.js");


//install
self.addEventListener("install", function(event) {
   console.info("---on service worker install---"+Config.CACHE_NAME());
   //新的sw即使生效
   self.skipWaiting();
   
});

//activate激活时才删除旧有的缓存，不能在其它地方调用，防止报错
self.addEventListener("activate", function(event) {
  console.info("on service worker activate---"+Config.CACHE_NAME());
 //self.clients.claim();
  //清理所有缓存
  if(Config.CLEAR_CACHE){
      event.waitUntil(caches.keys().then(function(cacheNames) {
        return Promise.all(cacheNames.map(function(cacheName) {
          if (cacheName != Config.CACHE_NAME() &&  cacheName != Config.CACHE_NAME(Config.CACHE_NAME_TIME_PREFIX)) {// 清除旧版本缓存
               return caches["delete"](cacheName);
          }
        }));
      }));
  }
  
  //过5s开始清理缓存内容
  setTimeout(function(){
  	GC.run(Config.EXPIRED_DAY);
  },5000)
  
  
  return self.clients.claim()
  
});

//核心逻辑
self.addEventListener("fetch", function(event) {
   console.info("on service worker fetch---"+event.request.url);
   //不存匹配项中，直接跳过
   var matchResult = Tools.matchRules(event.request.url, Config.CACHE_RULES);
   var isGoodReferrer =  Tools.isGoodReferrer(Config.WHITE_REFERRER_URLS,event.request);
     
   if (matchResult && isGoodReferrer) {
   	  //存在匹配项
   	   var response = Loader.get(event.request,1);
       event.respondWith(response);
   }
   
});
