async function publish(server,queue,msg) {
    var amqp = require('amqplib/callback_api')

    amqp.connect('amqp://' + server, function(error0, connection) {
        if (error0) { throw error0;}
        
        connection.createChannel(function(error1, channel) {
            if (error1) { throw error1; }

            channel.assertQueue(queue, {
                durable: false
            });

            channel.sendToQueue(queue, Buffer.from(msg))
            setTimeout(function(){
                connection.close()
            },500)
            
        });
    });
}

function consume(server,queue,callback) {
    var amqp = require('amqplib/callback_api');

    amqp.connect('amqp://' + server, function(error0, connection) {
      if (error0) { throw error0; }
      
      connection.createChannel(function(error1, channel) {
        if (error1) { throw error1; }
        
        channel.assertQueue(queue, {
          durable: false
        });
    
        channel.consume(queue, function(msg){ 
            process(callback,msg,channel)
        }, { noAck: true });    
       
      });
    });    
}

function process(callback,msg) {
    callback(msg.content.toString())
}

module.exports = { publish, consume }
