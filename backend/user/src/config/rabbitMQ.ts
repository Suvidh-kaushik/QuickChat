import amqp from "amqplib";


let channel: amqp.Channel;

export const connectToRabbitMQ = async()=>{
   try{

   const connection = await amqp.connect({
    protocol:"amqp",
    hostname:process.env.RABBIT_MQ_HOST,
    port:5672,
    username: process.env.RABBIT_MQ_USER_NAME,
    password: process.env.RABBIT_MQ_PASS
   });

   channel = await connection.createChannel();

   console.log("✅ connected to rabbitMQ");

   }catch(error){
    console.log("Failed to connect to rabbitmq", error);
   }
}

export const publishToQueue = async(queueName:string, message: any)=>{
    if(!channel){
        console.log("RabbitMq channel is not intialized");
        return;
    }

    await channel.assertQueue(queueName,{durable:true});

    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)),{
        persistent:true
    });
};