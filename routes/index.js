var express = require('express');
var router = express.Router();
const {UserModle,ChatModel} = require('../db/models');
const md5 = require('blueimp-md5');

const filter = {password:0,__v:0} //查询时过滤出指定的属性

/* GET home page. */
router.get('/', function(req, res, next) {
    //渲染模板
    res.render('index.ejs', { title: 'Express' });

});
/*
*path 为 /register
* 请求方式为 post
* 接收username 和 password参数
* admin 是已注册的用户
* 注册成功返回 {code:0,data:{_id:'abc',username:'xxx',password:'123'}}
* 注册失败返回：{code:1,msg:'此用户已存在'}
* */
// 注册一个路由：用户注册
/*
router.post('/register',function (req, res) {
    //获取请求参数
    const {username, password} = req.body;
    //处理
    if(username === 'admin'){
        //注册会失败
        res.send({code:1,msg:'此用户已存在'})
    }else{
        //注册会成功
        res.send({code:0,data:{_id:'abc',username:'xxx',password:'123'}})
    }
    //返回响应数据
})

*/

// 注册的路由
router.post('/register',function (req,res) {
    console.log('/register',req, res)
    //读取请求参数
    const { username, password, type } =  req.body;
    //处理
        //判断用户是否已经存在
            //查询，（根据 UserMOdle 来从数据库 中查询) find findOne
    UserModle.findOne({username}, function (err, userDoc) {
        console.log( 'userDoc',userDoc );
        //如果userDoc有值（已存在）
        //如果存在，返回错误的信息
        if(username === 'admin') {
            //注册会失败
            res.send({code: 1, msg: '此用户已存在'})
            return;
        }
        if(userDoc){
            res.send({code:1,msg:'此用户已存在'})
        }else{
            //如果不存在，保存
            new UserModle({username, type,password:md5(password)}).save(function (error, userDoc) {
            //返回包含 user 的 json 数据
                //  res.send({code:0,data:userDoc}) 把密码也返回给前端不行
                const data = { username, type, _id:userDoc._id}

                // 生成一个cookie(userid:userDoc._id),并交给浏览器保存
                res.cookie('userid',userDoc._id,{maxAge:1000*60*60*24*7});
                res.send({code:0,data})
            })
        }
    })



    //返回响应
})


// 登录的路由
router.post('/login',function (req, res) {
    //读取请求参数
    const { username,password } = req.body;
    //处理
        //查询数据库中的数据(根据 username / password 查
        UserModle.findOne({username,password:md5(password)},
            filter,//过滤掉查询结果的密码值
            function (error, user) {
            if(user){
                //如果有，返回登录成功的信息 user的信息
                // 生成一个cookie(userid:userDoc._id),并交给浏览器保存
                res.cookie('userid',user._id,{maxAge:1000*60*60*24*7});
                res.send({code:0,data:user})
            }else{

                //如果没有，返回提示错误的信息
                res.send({code:1,msg:'用户名或密码错误'})
            }
        })

    //返回响应数据
})

//更新信息的路由
router.post('/update',function (req, res) {
    //发请求时获得cookie中的id
    const userid = req.cookies.userid;

    //如果不存在，返回一个提示信息的结果
    if(!userid){
        res.send({code:1,msg:'请先登录'})
        return;
    }
    //存在，根据 userid 更新对应的 user
    //得到提交的用户数据,
    const user = req.body;
    UserModle.findByIdAndUpdate({_id:userid},user, function (error, oldUser) {
        if(!oldUser){
            //通知 浏览器 删除 userid
            res.clearCookie('userid')
            //返回一个提示信息
            return res.send({code:1,msg:'请先登录'})
        }else{
            //准备一个返回的user数据对象
            const {_id,username,type} = oldUser;
            const data = Object.assign({_id, username, type},user)
            res.send({code:0,data})
        }
    })
})

//获取当前的user 根据cookie中的userid
router.get('/user',function (req, res) {
    console.log( "/usre已经运行" ,req.cookies.userid);
    //从请求的cookie中得到userid
    const userid = req.cookies.userid;
    //如果不存在，返回一个提示信息的结果
    if(!userid){

        return res.send({code:1,msg:'请先登录'})
    }
    //根据userid查询对应的user
    UserModle.findOne({_id:userid},filter,function (error, user) {
        res.send({code:0,data:user})
    })
})
//获取用户列表，根据类型
router.get('/userlist',function (req, res) {
    //req.body req.query req.params
    const { type } = req.query
    UserModle.find({type},filter,function (error, users) {
        res.send({code:0,data:users})
    })
})

/*获取当前用户所有相关聊天信息列表
*/
router.get('/msglist', function (req, res) {
// 获取 cookie 中的 userid
    const userid = req.cookies.userid
// 查询得到所有 user 文档数组
    UserModle.find(function (err, userDocs) {
// 用对象存储所有 user 信息: key 为 user 的_id, val 为 name 和 header 组成的 user 对象
        const users = {} // 对象容器
        userDocs.forEach(doc => {
            users[doc._id] = {username: doc.username, header: doc.header}
        })

        //使用reduce的方法
       /* const users = userDocs.reduce((users,user)=>{
            users[user._id] = {username: user.username, header: user.header}
            return users;
        },{})*/
        /*查询 userid 相关的所有聊天信息
        参数 1: 查询条件
        参数 2: 过滤条件
        参数 3: 回调函数
        */
        //或者，from的userid 或者 to 的 userid
        ChatModel.find({'$or': [{from: userid}, {to: userid}]}, filter, function (err, chatMsgs) {
// 返回包含所有用户和当前用户相关的所有聊天消息的数据

            res.send({code: 0, data: {users, chatMsgs}})
        })
    })
})

/*修改指定消息为已读
*/
router.post('/readmsg', function (req, res) {
// 得到请求中的 from 和 to
    const from = req.body.from
    const to = req.cookies.userid
    /*更新数据库中的 chat 数据
    参数 1: 查询条件
    参数 2: 更新为指定的数据对象
    参数 3: 是否 1 次更新多条, 默认只更新一条
    参数 4: 更新完成的回调函数
    */
    //multi:将所有匹配的都更新掉，多条
    ChatModel.update({from, to, read: false}, {read: true}, {multi: true}, function (err, doc) {
        console.log('/readmsg', doc)
        res.send({code: 0, data: doc.nModified}) // 更新的数量
    })
})




module.exports = router;
