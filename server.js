const express = require("express");
const bodyParser = require("body-parser");
const Queue = require("bull");
require("dotenv").config();

const app = express();
const PORT = 3001;

const queueConnectionOpts = {
  redis: {
    host: "localhost",
    port: 6379,
    connectTimeout: 30000,
  },
  prefix: "queue-pref",
  defaultJobOptions: {
    removeOnComplete: false,
  },
};

const myQueue = new Queue("my-queue", queueConnectionOpts);

myQueue.process(async (job) => {
  console.log(
    `Processing job with id ${job.id} and data ${JSON.stringify(job.data)}`
  );
  return Promise.resolve();
});

app.get("/create-queue", async (req, res) => {
  const queueJobPayload1 = { value: "10 Seconds Delay" };
  const queueJobPayload2 = { value: "20 Seconds Delay" };
  const queueJobPayload3 = { value: "30 Seconds Delay" };

  const job1 = await myQueue.add(queueJobPayload1, {
    delay: 10000, //10 Seconds
  });
  const job2 = await myQueue.add(queueJobPayload2, {
    delay: 20000, //20 Seconds
  });
  const job3 = await myQueue.add(queueJobPayload3, {
    delay: 30000, //30 Seconds
  });

  res.json({
    job1: job1.id,
    job2: job2.id,
    job3: job3.id,
  });
});

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.status(200).json({ health: true });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
