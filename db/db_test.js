/*使用 mongoose 操作 mongodb 的测试文件
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
const md5 = require('blueimp-md5')  //md5加密的函数
//1. 连接数据库
//1.1. 引入 mongoose
const mongoose =  require('mongoose')
//1.2. 连接指定数据库(URL 只有数据库是变化的)
mongoose.connect('mongodb://localhost:27017/db_name');
// 1.3. 获取连接对象
const conn = mongoose.connection
// 1.4. 绑定连接完成的监听(用来提示连接成功)
conn.on('connected', function () {
    console.log('数据库连接成功')
})

//2. 得到对应特定集合的 Model
//2.1. 字义 Schema(描述文档结构)
const userSchema = mongoose.Schema({
    //指定文档的结构，属性名/属性值的类型
    username: {type: String, required: true}, // 用户名
   password: {type: String, required: true}, // 密码
   type: {type: String, required: true}, // 用户类型: dashen/laoban
    header:{type:String}
})
//2.2. 定义 Model(与集合对应, 可以操作集合)
const UserModel = mongoose.model('user',userSchema) //集合的名称为：users

//3. 通过 Model 或其实例对集合数据进行 CRUD 操作
//3.1. 通过 Model 实例的 save()添加数据
function testSave() {
    //创建UserModel 实例
   const userModel =  new UserModel({username: 'jerry',password: md5('3423423'),type:'dashen'});
   //调用 Sava()保存
    userModel.save(function (error,userDoc) {
        console.log( "save()",error, userDoc);
        /*

    save() null { _id: 5e5e599efb5fb91888e4576e,
  username: 'tom',
  password: '202cb962ac59075b964b07152d234b70', //md5加密，32位的字符串
  type: 'dashen',
  __v: 0 }

        * */
    })
}
testSave()
//3.2. 通过 Model 的 find()/findOne()查询多个或一个数据
function testFind() {
    //查询多个
    UserModel.find(function (error, users) {
        console.log( "find()",error, users);//得到的是包含所有匹配文档对象的数组，如果没有匹配的就是[]
    })
    //查询一个  ，如果没有匹配的 返回 null
    UserModel.findOne({_id:'5e5e599efb5fb91888e4576e'},function (error, user) {
        console.log( "findOne",error, user);
    })
}
testFind()
//3.3. 通过 Model 的 findByIdAndUpdate()更新某个数据
function testUpdate() {
    UserModel.findByIdAndUpdate({_id:'5e5e599efb5fb91888e4576e'},{username:'new name'},function (error,olduser) {
        console.log( "findByIdAndUpdate",error, olduser);//第一次返回的是一个老的，未更新
    })
}
testUpdate()
//3.4. 通过 Model 的 remove()删除匹配的数据

function testremove() {
    UserModel.remove({_id:'5e5e599efb5fb91888e4576e'},function (error, doc) {
        console.log( "remove",error, doc);
        //remove null { n: 1, ok: 1, deletedCount: 1 }
        // n 删除了几条，ok 1 成功数
    })
}

testremove()