const path = require("path");

module.exports = {
    api: "http://localhost:3002",
    omp_api: "http://172.16.1.215:8888",
    ts_url: "http://www.google.com",
    sql_limit: 10,
    source: {
        image: {
            png: path.resolve(__dirname, "../source/picture.png")
        },
        video: {
            mp4: path.resolve(__dirname, "../source/sample.mp4")
        }
    }
};

//用于打印脚本行数
Object.defineProperty(global, '__stack', {
    get: function(){
      var orig = Error.prepareStackTrace;
      Error.prepareStackTrace = function(_, stack){ return stack; };
      var err = new Error;
      Error.captureStackTrace(err, arguments.callee);
      var stack = err.stack;
      Error.prepareStackTrace = orig;
      return stack;
    }
  });
  
Object.defineProperty(global, '__line', {
    get: function(){
      return __stack[1].getLineNumber();
    }
  });
