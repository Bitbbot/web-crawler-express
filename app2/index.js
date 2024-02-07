// index.js
import express from "express";
import { Worker } from "worker_threads";

const app = express();
app.use(express.json());

app.get("/api/v1/sponsored-links", async (req, res) => {
  console.log("index");
  try {
    const { pages, keywords } = req.query;
    const keywordList = keywords.split(",");
    const totalPages = parseInt(pages);

    const aggregator = new Worker("./aggregator.js");

    for (let i = 0; i <= totalPages; i++) {
      for (const keyword of keywordList) {
        console.log("new worker");
        const worker = new Worker("./worker.js", { keyword, pageNumber: i });

        worker.postMessage({ keyword, pageNumber: i });

        worker.on("message", (links) => {
          console.log("links", links);
          aggregator.postMessage({ links, pages: (totalPages + 1) * keywordList.length });
        });
      }
    }
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Function to aggregate results from worker threads
// function aggregateResults(workerResults, res) {
//   const aggregator = new Worker("./aggregator.js");

//   aggregator.on("message", (aggregatedResults) => {
//     res.json(aggregatedResults);
//   });

//   // Send results to the aggregator
//   aggregator.postMessage({ workerResults });
// }

const start = async () => {
  try {
    await app.listen(3000, () => {
      console.log("Application has started on port 3000");
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

start();
