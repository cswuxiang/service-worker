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
             if(!rep || rep.status !== 200 || rep.type !== "basic") {
                 return rep;
             }
            
            var cprep = rep.clone();
            if(isCache){
                Loader._cacheRequest(Config.CACHE_NAME(),request,rep);
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
                var cprep = rep.clone();
                Loader._storeRequest(request,cprep);
                return rep;
             });
    },
    _storeRequest : function(request,rep){
        Loader._cacheRequest(Config.CACHE_NAME(),request,rep);
        //构造第二个
        var cacheName = Config.CACHE_NAME(Config.CACHE_NAME_TIME_PREFIX);
        
        var url = request.url+"_time";
        Loader._cacheRequest(cacheName,
               new Request(url),
               new Response(url + ":" + new Date().toString() )
           );
    },
    /**
     * request请求存入
     * @param {} request
     * @param {} rep
     */
    _cacheRequest : function(cacheName,request,rep){
          caches.open(cacheName).then(function(cache) {
                          cache.put(request, rep).catch(function(err) {
                              console.log("---Loader._cacheRequest----"+err); //this is where the error is thrown
                   })
          });
    }
}
