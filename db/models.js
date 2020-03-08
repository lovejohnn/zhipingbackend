//包含n个操作数据库集合数据的 Model 模块
/*
1. 连接数据库
1.1. 引入 mongoose
1.2. 连接指定数据库(URL 只有数据库是变化的)
1.3. 获取连接对象
1.4. 绑定连接完成的监听(用来提示连接成功)
2. 得到对应特定集合的 Model
2.1. 字义 Schema(描述文档结构)
2.2. 定义 Model(与集合对应, 可以操作集合)
3. 通过 Model 或其实例对集合数据进行 CRUD 操作
3.1. 通过 Model 实例的 save()添加数据
3.2. 通过 Model 的 find()/findOne()查询多个或一个数据
3.3. 通过 Model 的 findByIdAndUpdate()更新某个数据
3.4. 通过 Model 的 remove()删除匹配的数据
*/


// 1. 连接数据库
// 1.1. 引入 mongoose
const mongoose = require('mongoose');
// 1.2. 连接指定数据库(URL 只有数据库是变化的)
//mongoose.connect('mongodb://localhost:27017/zhaoping')
//使用新的连接 https://blog.csdn.net/Ruffaim/article/details/82774816
mongoose.connect('mongodb://localhost:27017/zhaoping',{ useNewUrlParser: true });
// 1.3. 获取连接对象
const conn = mongoose.connection;
// 1.4. 绑定连接完成的监听(用来提示连接成功)
conn.on('connected',()=>{
    console.log( "db 已经连接" );
})

// 2. 得到对应特定集合的 Model
// 2.1. 字义 Schema(描述文档结构)
const UserSchema = mongoose.Schema({
    username:{type:String, required:true},//用户名
    password:{type:String, required: true},// 密码
    type:{type:String, required:true}, //dashen laoban
    header:{type:String}, //头像名称
    post:{type:String}, //职位
    info:{type:String}, //个人或职位简介
    company:{type:String}, //公司名称
    salary:{type:String}  //月薪
})
// 2.2. 定义 Model(与集合对应, 可以操作集合)
const UserModle = mongoose.model('user',UserSchema)

//向外暴露model
//  module.export = xxx
// exports.xxx = value
// exports.yyy = value


exports.UserModle = UserModle;


// 定义 chats 集合的文档结构
const chatSchema = mongoose.Schema({ from: {type: String, required: true}, // 发送用户的id
 to: {type: String, required: true}, // 接收用户的 id
 chat_id: {type: String, required: true}, // from 和 to 组成的字符串
 content: {type: String, required: true}, // 内容
 read: {type:Boolean, default: false}, // 标识是否已读
 create_time: {type: Number} // 创建时间
    })
//定义能操作 chats 集合数据的Model
 const ChatModel = mongoose.model('chat', chatSchema) // 向外暴露Model ,集合为  chat
 exports.ChatModel = ChatModel