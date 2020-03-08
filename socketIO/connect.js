const { ChatModel } =  require('../db/models')

module.exports = function(server){
    const io = require('socket.io')(server)
    //监视客户端与服务器的连接
    io.on('connection',function (socket) {
        console.log('有一个客户端连接上了服务器',new Date())
    try {
        //服务器接收消息
        socket.on('browserMessage',function ({from,to,content}) {
            console.log('服务器接收到消息了',{from,to,content})
            //保存消息
            //准备ChatMsg对象的相关数组
            const chat_id =[from, to].sort().join('_') //from_to 或者 to_from
            const create_time = Date.now()
            new ChatModel({from,to,content,chat_id,create_time}).save(function (error, chatMsg) {

                //服务器发送消息(这里还有判断对方是否在线）有可能不发的
                //io.emit 向所有连接用户发信息
                if(chatMsg){
                    io.emit(`server${chatMsg.to}`,chatMsg)
                    console.log(`服务器发送消息 server${chatMsg.to}`)

                }

            })
        })
    }catch (e) {
        console.log(e)
    }


    })
}