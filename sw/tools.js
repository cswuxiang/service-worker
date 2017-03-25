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
    isGoodReferrer:function(urls,request){
        var referrer = request.referrer;
        var retFlag = false;
        urls.map(function(k){
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