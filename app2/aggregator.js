// aggregator.js
import { parentPort } from "worker_threads";

const results = [];

// Function to aggregate results from multiple workers
function aggregateResults(workerResults) {
  let aggregatedResults = [];
  for (const result of workerResults) {
    aggregatedResults = aggregatedResults.concat(result);
  }
  return aggregatedResults;
}

// Listen for messages from worker threads
parentPort.on("message", (message) => {
  console.log("AGGREGATOR");
  results.push(message.links);
  if (message.pages === results.length) parentPort.postMessage(results);

  // const { workerResults } = message;
  // const aggregatedResults = aggregateResults(workerResults);
  // // Send aggregated results back to the main thread
  // parentPort.postMessage(aggregatedResults);
});
