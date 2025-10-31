import Redis from "ioredis";
import {processResumeCore} from "./controllers/processResume.js";
import { createJobPostingCore, updateJobPostingCore } from "./controllers/createJobPosting.js";
import dotenv from 'dotenv';
dotenv.config();

const redis = new Redis(process.env.REDIS_URL, {
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

console.log('Redis Connected!');

redis.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

class SimpleQueue {
  constructor() {
    this.processing = false;
    this.removeStuckJobs();
    this.startProcessing();
  }

  async addJob(jobData) {
    const jobId = `job:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    await redis.hset(jobId, {
      status: "queued",
      jobData: JSON.stringify(jobData),
      createdAt: Date.now(),
    });
    await redis.lpush("queue", jobId);
    return jobId;
  }

  async removeStuckJobs() {
    try {
      console.log("Removing stuck jobs...");
      const jobKeys = await redis.keys("job:*");
      for (const key of jobKeys) {
        const job = await redis.hgetall(key);
        if (job.status === "processing") {
          console.log(`Removing stuck job: ${key}`);
          await redis.del(key);
        }
      }
      console.log("Stuck job removal completed");
    } catch (error) {
      console.error("Error removing stuck jobs:", error);
    }
  }

  async startProcessing() {
    setInterval(async () => {
      if (this.processing) return;
      this.processing = true;

      try {
        const jobId = await redis.rpop("queue");
        if (!jobId) {
          this.processing = false;
          return;
        }

        await redis.hset(jobId, { status: "processing", startedAt: Date.now() });
        const job = await redis.hgetall(jobId);
        const jobData = JSON.parse(job.jobData || '{}');

        try {
          console.log(`Processing job ${jobId} with data`, jobData);
          const result = await processResumeCore(jobData);
        // const fakeReq = { body: jobData };
        // const result = await processResume(fakeReq);

          console.log(`Finished processing job ${jobId}`);
          await redis.hset(jobId, {
            status: "completed",
            result: JSON.stringify(result),
            completedAt: Date.now(),
          });
        } catch (error) {
            console.log(`Error processing job ${jobId}:`, error);
          await redis.hset(jobId, {
            status: "failed",
            error: error.message,
            completedAt: Date.now(),
          });
        }
      } catch (error) {
        console.error("Processing error:", error);
      } finally {
        this.processing = false;
      }
    }, 1000);
  }

  async getJobStatus(jobId) {
    const job = await redis.hgetall(jobId);
    if (!job) return null;

    return {
      id: jobId,
      status: job.status,
      jobData: job.jobData ? JSON.parse(job.jobData) : null,
      result: job.result ? JSON.parse(job.result) : null,
      error: job.error || null,
      createdAt: parseInt(job.createdAt),
    };
  }
}

export default new SimpleQueue();
