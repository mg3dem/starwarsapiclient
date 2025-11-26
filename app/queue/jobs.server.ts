import { Queue, Worker } from "bullmq"
import { getServerEnv } from "~/env.server"
import { computeStatistics } from "~/services/statistics.server"

let statisticsQueue: Queue
let statisticsWorker: Worker

export async function initializeQueue() {
	const env = getServerEnv()

	statisticsQueue = new Queue("statistics", {
		connection: {
			url: env.REDIS_URL,
		},
	})

	statisticsWorker = new Worker(
		"statistics",
		async (job) => {
			console.log(`Processing job ${job.id}: ${job.name}`)

			if (job.name === "compute-statistics") {
				await computeStatistics()
			}
		},
		{
			connection: {
				url: env.REDIS_URL,
			},
		}
	)

	statisticsWorker.on("failed", (job, err) => {
		console.error(`Job ${job?.id} failed:`, err)
	})

	statisticsWorker.on("completed", (job) => {
		console.log(`Job ${job.id} completed successfully`)
	})

	const intervalMs = Number.parseInt(env.STATS_COMPUTATION_INTERVAL_MS, 10)
	await statisticsQueue.add(
		"compute-statistics",
		{},
		{
			repeat: {
				every: intervalMs,
			},
			removeOnComplete: true,
			removeOnFail: false,
		}
	)

	console.log(`Statistics queue initialized (interval: ${intervalMs}ms / ${intervalMs / 1000}s)`)
}

export async function closeQueue() {
	if (statisticsWorker) {
		await statisticsWorker.close()
		console.log("Statistics worker closed")
	}
	if (statisticsQueue) {
		await statisticsQueue.close()
		console.log("Statistics queue closed")
	}
}
