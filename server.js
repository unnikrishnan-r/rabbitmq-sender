const express = require("express");
const amqp = require("amqplib");

var channel, connection; //global variables
async function connectQueue() {
  try {
    connection = await amqp.connect("amqp://127.0.0.1:5672");
    channel = await connection.createChannel();

    await channel.assertQueue("test-queue");
  } catch (error) {
    console.log(error);
  }
}

async function sendData(data) {
  await connectQueue();
  // send data to queue
  await channel.sendToQueue("test-queue", Buffer.from(JSON.stringify(data)));

  // close the channel and connection
  await channel.close();
  await connection.close();
}
const app = express();
const PORT = process.env.PORT || 4001;
app.use(express.json());
app.post("/send-msg", (req, res) => {
  // data to be sent
  const data = req.body;
  sendData(data); // pass the data to the function we defined
  console.log(" messages sent to queue");
  res.send("Message Sent"); //response to the API request
});
app.listen(PORT, () => console.log("Server running at port " + PORT));
