/**
 * 采用LRU原则，
 */
var GC = {
       _difDays : 10,//20天未使用，将清除
       run : function(expireDay){
            this._difDays =  expireDay || this._difDays ;
            GC.check(GC.isRemove,GC.remove)
       },
       isRemove : function(time){
           var old_time = new Date(time);
           var dateDiff = Tools.dateDiff(new Date(),old_time,"d");
           if(dateDiff >= GC._difDays){
               return true;
           }
           return false;
       },
       check : function(){
             var cacheName = Config.CACHE_NAME(Config.CACHE_NAME_TIME_PREFIX);
             caches.open(cacheName).then(function(cache) {
                cache.keys().then(function(reqes){
                    for(var i=0;i<reqes.length;i++){
                        cache.match(reqes[i]).then(GC.preRemove);
                    }
                }).catch(function(err) {console.log("-----GC.check----"+err);});
             })
       },
       analysisBody:function(body){
           var urltime = body && body.split("_time:");
           if(Object.prototype.toString.call(urltime) === '[object Array]'){
              if(urltime.length = 2){
                return {
                   url  : urltime[0],
                   time : urltime[1]
                }
              }
           }
           throw new Error("----------analysisBody--wrong--:"+body)
           
       },
       preRemove: function(res){
            res.text().then(function(body){
                 var obj = GC.analysisBody(body);
                 if(GC.isRemove(obj.time)){
                      GC.remove(Config.CACHE_NAME(),obj.url);
                      GC.remove(Config.CACHE_NAME(Config.CACHE_NAME_TIME_PREFIX),obj.url+"_time");
                 }
            });
       },
       remove : function(cacheName,url){
           caches.open(cacheName).then(function(cache) {
                var req = new Request(url)
                console.log("-----GC.remove" + cacheName + ":" + req.url);
                cache["delete"](req);
            }).catch(function(err) {console.log("-----GC.remove----"+err);});
       }
}
