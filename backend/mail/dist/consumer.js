import amqp from "amqplib";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
export const startSendOtpConsumer = async () => {
    try {
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: process.env.RABBIT_MQ_HOST,
            port: 5672,
            username: process.env.RABBIT_MQ_USER_NAME,
            password: process.env.RABBIT_MQ_PASS
        });
        const channel = await connection.createChannel();
        const queueName = "send-otp";
        await channel.assertQueue(queueName, { durable: true });
        console.log("✅ mail service consumer started successfully and listening for OTP's");
        channel.consume(queueName, async (message) => {
            if (message) {
                try {
                    const { to, subject, body } = JSON.parse(message.content.toString());
                    const transporter = nodemailer.createTransport({
                        host: "smtp.gmail.com",
                        port: 465,
                        auth: {
                            user: process.env.NODEMAILER_USER,
                            pass: process.env.NODEMAILER_PASS
                        }
                    });
                    await transporter.sendMail({
                        from: "Chat app",
                        to,
                        subject,
                        text: body
                    });
                    console.log(`OTP sent to ${to}`);
                    channel.ack(message);
                }
                catch (error) {
                }
            }
        });
    }
    catch (error) {
        console.log("Failed to start rabbitMQ consumer", error);
    }
};
