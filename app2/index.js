// index.js
import express from "express";
import { Worker } from "worker_threads";

const searchEngines = ["google", "yahoo", "bing"];

const app = express();
app.use(express.json());

app.get("/api/v1/sponsored-links", async (req, res) => {
  try {
    const { pages, keywords } = req.query;
    const keywordList = keywords.split(",");
    const totalPages = parseInt(pages);

    const aggregator = new Worker("./aggregator.js", {
      workerData: { resultsCount: totalPages * keywordList.length * searchEngines.length },
    });
    aggregator.on("message", (data) => {
      res.json(data);
    });

    for (let i = 0; i < totalPages; i++) {
      for (const keyword of keywordList) {
        for (const engine of searchEngines) {
          const worker = new Worker("./worker.js", { keyword, pageNumber: i, searchEngine: engine });
          worker.postMessage({ keyword, pageNumber: i, searchEngine: engine });

          worker.on("message", (result) => {
            worker.terminate();
            aggregator.postMessage(result);
          });
        }
      }
    }
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

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
