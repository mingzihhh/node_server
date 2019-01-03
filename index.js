// 引入相关模块
var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');

var routes = {
    '/a': function(req,res){
        res.end(JSON.stringify(req.query));
    },
    '/b': function(req,res){
        res.end('match /b');
    },
    '/a/c' : function(req,res){
        res.end('match /a/c');
    },
    'search' : function(req,res){
        res.end('username=' + req.body.username + ',password=' + req.body.password);
    }
}

function routePath(req,res){
    // 获取请求 URL, 根据 URL 中的 pathname 来匹配对应的处理方法.
    var pathObj = url.parse(req.url,true);
    var handleFn = routes[pathObj.pathname];

    if(handleFn){
        //获取请求 URL 的查询字符串解析成的对象
        req.query = pathObj.query;

        // 用于保存拼接后的请求体
        var body = '';

        // 'data' 事件触发, 将接受的数据块 chunk 拼接到 body 变量上
        req.on('data',function(chunk){
            body += chunk;
        }).on('end',function(){
            req.body = parseBody(body);
            handleFn(req,res);
        })

    }else{
        //处理静态文件
        staticRoot(path.join(__dirname,'sample'),req,res);
    }
}

function staticRoot(staticPath,req,res){
    var pathObj = url.parse(req.url, true);
    console.log(pathObj);
    if (pathObj.pathname==='/'){
         pathObj.pathname += 'test.html';
     }

    var filePath = path.join(staticPath,pathObj.pathname);

    fs.readFile(filePath,'binary',function(err,content){
        if(err){
            res.writeHead('404','Not Found');
            return res.end();
        }
        res.writeHead('200','OK');
        res.write(content,'binary');
        res.end();
    })
   
}

function parseBody(body){
    console.log(body);
    var obj = {};
    body.split('&').forEach(str => {
        obj[str.split('=')[0]] = str.split('=')[1];
    });
    return obj;
}

// 搭建 HTTP 服务器
var server = http.createServer(function(req,res){
    routePath(req,res);
})
server.listen(8080);
console.log('visit http://localhost:8080');

