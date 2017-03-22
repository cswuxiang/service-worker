/**
 * 适用场景：
 * 1、页面提速，针对css,img,js 无法缓存
 * 2、针对活动，提前下载资源
 * 3、针对高流量，提前下载资源
 * 4、可做离线包
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
            var url = "https://a.com/logjs.do";//错误上报接口
            url  = url + "?" + para.join("&");
            fetch(url,{mode:"no-cors"}).then(function(e){
            }).catch(function(){})
       }
//文件方法中的报错，会在此体现
self.addEventListener('error',function(event){
    errorReport(event.message,event.filename,"90010009");
});
self.addEventListener('unhandledrejection',function(event){
   console.log('unhandledrejection');
   //serrorReport(event.reason,event.filename,"90010009");
})
/**
 * 基本配置
 * @type 
 */
var Config = {
	CACHE_NAME_VERSION  : 1,//通过此控制版本的更新
	WHITE_REFERRER_URLS : [{domain:"a.com",pages:["test.do","xxx.do"]},
	                       {domain:"b.com",pages:[]}],//通过此控制版本的更新
	CACHE_NAME_PREFIX   : "sw-test-",
	CACHE_RULES         : ["https://wx.qlogo.cn/mmhead",/[^?]*\.(js|css|png|jpg|jpeg|gif|ico)(\?|$)/i],
    JS_CSS              : [/[^?]*\.(js|css)/],
    CLEAR_CACHE         : true,
    CACHE_NAME          : function(){
             return Config.CACHE_NAME_PREFIX + Config.CACHE_NAME_VERSION
    }
   
}

/**
 * 工具类
 * @type 
 */
var Tools = {
	//是否需要缓存，只要url不一样都做缓存
	matchRules : function(url,rules){
	  var match = false;
      for (var i = 0, reg;!match && (reg = rules[i]);++i) {
        match = match || (new RegExp(reg)).test(url);
      }
      return match;
	},
	//对于referre中的网址进行过滤
	isGoodReferrer:function(request){
		var referrer = request.referrer;
		var retFlag = false;
		Config.WHITE_REFERRER_URLS.map(function(k){
			if(referrer.match(k.domain)){
				if(k.pages.length == 0){
					retFlag = true;
                        return;
				}else{
    				k.pages.map(function(v){
    					if(!v || referrer.match(v)){
    						retFlag = true;
    						return;
    					}
    				});
				}
			}
		});
		return retFlag;
	},
	 /**
         * 日期比较(d1 - d2)
         *
         * @method dateDiff
         * @param {Date} d1
         * @param {Date} d2
         * @param {String} [cmpType:ms] 比较类型, 可选值: Y/M/d/h/m/s/ms -> 年/月/日/时/分/妙/毫秒
         * @return {Float}
         */
        dateDiff: function(d1, d2, cmpType) {
            var diff = 0;
            switch(cmpType) {
                case 'Y':
                    diff = d1.getFullYear() - d2.getFullYear();
                    break;
                case 'M':
                    diff = (d1.getFullYear() - d2.getFullYear()) * 12 + (d1.getMonth() - d2.getMonth());
                    break;
                case 'd':
                    diff = (d1 - d2) / 86400000;
                    break;
                case 'h':
                    diff = (d1 - d2) / 3600000;
                    break;
                case 'm':
                    diff = (d1 - d2) / 60000;
                    break;
                case 's':
                    diff = (d1 - d2) / 1000;
                    break;
                default:
                    diff = d1 - d2;
                    break;
            }
            return diff;
        }
	
	
}
 //waitUntil 方法，当 oninstall 或者 onactivate 时被调用， 接受一个 promise。 
 //在这个 promise 被成功地 resolve 前，这个 service worker 的 functional events 
 //并不会被触发。

//通过fetch一个接口处理。



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
          if (cacheName != Config.CACHE_NAME()) {// 清除旧版本缓存
            return caches["delete"](cacheName);
          }
        }));
      }));
  }
  
  
  
  return self.clients.claim()
  
});

//核心逻辑
self.addEventListener("fetch", function(event) {
   console.info("on service worker fetch---"+event.request.url);
   //不存匹配项中，直接跳过
   var matchResult = Tools.matchRules(event.request.url, Config.CACHE_RULES);
   var isGoodReferrer =  Tools.isGoodReferrer(event.request);
     
   if (matchResult && isGoodReferrer) {
   	  //存在匹配项
   	   var response = Loader.get(event.request,1);
       event.respondWith(response);
   }
   
   //GC();
 
});



/**
 * 加载器
 */
var Loader = {
	/***
	 * 加载资源文件
	 * @param {} request 请求体
	 * @param {} type 类型，1为缓存优先，2为网络优先
	 * @return {} response
	 */
	get : function(request,type){
		if(type == 1){
			return this._FCacheSNet(request)
		}else{
			return this._FNetSCache(request)
		}
		
	},
    /**
     * 应用于：各种静态资源，对于文件名不同的资源。
     * 优先缓存，获取不到再从网络，
     * @param {} request
     */
    _FCacheSNet : function(request){
        return caches.match(request).then(function(r){
              if(!r){//从线上获取
              	  console.log("缓存优限：从线上获取：" + request.url);
                  return Loader._netcache(request);
              }else{//从缓存中获取
                  console.log("缓存优限：从缓存中获取：" + request.url);
                  if((!r || r.status !== 200 ) && !Tools.matchRules(request.url,Config.JS_CSS)){//再次获取一次，更新缓存
                  	console.log("缓存优限：再次从线上中获取：" + request.url);
                  	 Loader._netcache(request);
                  }
                  return r;
              }
          }).catch(function(e) {
                throw new Error(e);
          })
    },

    /**
     * 应用于：适用于实现性较高资源，如估计id的图片资源
     * 网络优化，以及是否再缓存，
     * @param {} request
     * @param {} isCache
     */
    _FNetSCache : function(request,isCache){
        return fetch(request).then(function(rep){//网络优先
             console.log("网络优先：从线上获取：" + request.url);
             //防止cdn中报错
             if(!rep || rep.status !== 200 || rep.type !== 'basic') {
                 return rep;
             }
            
            var cprep = rep.clone();
            if(isCache){
                Loader._cacheRequest(request,rep);
            }
            return cprep;
        }).catch(function(e){//加载失败
            console.log("网络优先：从线上获取失败，缓存获取：" + request.url);
           return caches.match(request).then(function(res){
                if(!res){//从线上获取
                    var msg = "cache miss for : " + request.url;
                    throw new Error(msg);
                }
                return res;
           })
        });
    },
    /**
     * 网络加载并缓存
     * @param {} request
     * @return {}
     */
    _netcache : function(request){
        return fetch(request).then(function(rep){
                 //cache为异步执行
        	    //An opaque  什么都是空，body,head都为空
        	    //basic forbidden response
        	    //cors  head中包含 cors相关字段
        	     var cprep = rep.clone();
        	    if(rep.status !== 200){
        	    }
                
                Loader._cacheRequest(request,cprep);
                return rep;
             });
    },
    /**
     * request请求存入
     * @param {} request
     * @param {} rep 
     */
    _cacheRequest : function(request,rep){
          caches.open(Config.CACHE_NAME()).then(function(cache) {
                          cache.put(request, rep).catch(function(err) {
                              console.log(err); //this is where the error is thrown
                            })
          });
    }
}

/**
 * 采用定时，偶数天
 */
var GC = function(){
	var curDate = new Date();
	
	//每周二
	if(curDate.getDay() != 2 && curDate.getHours() != 13){
		return ;
	}
	var date = null;
	console.log("-------------GC---------------")
	caches.open(Config.CACHE_NAME()).then(function(cache) {
        cache.keys().then(function(keys){
        	keys.map(function(request){
        		caches.match(request).then(function(reponse){
        			date =  reponse && reponse.headers.get("date");
        			var difday = Tools.dateDiff(new Date(),new Date(date),"d");
        			if(difday > 30){//30天没有使用
        				 cache.delete(request);
        			}
        		});
        	})
            
        });
})
}


