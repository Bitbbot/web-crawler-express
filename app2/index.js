// index.js
import express from "express";
import { Worker } from "worker_threads";

const app = express();
app.use(express.json());

app.get("/api/v1/sponsored-links", async (req, res) => {
  try {
    const { pages, keywords } = req.query;
    const keywordList = keywords.split(",");
    const totalPages = parseInt(pages);

    const aggregator = new Worker("./aggregator.js", {
      workerData: { resultsCount: totalPages * keywordList.length * 3 },
    });
    aggregator.on("message", (data) => {
      res.json(data);
    });

    for (let i = 0; i < totalPages; i++) {
      for (const keyword of keywordList) {
        const workerGoogle = new Worker("./worker.js", { keyword, pageNumber: i, searchEngine: "google" });
        workerGoogle.postMessage({ keyword, pageNumber: i, searchEngine: "google" });

        workerGoogle.on("message", (result) => {
          workerGoogle.terminate();
          aggregator.postMessage(result);
        });

        const workerYahoo = new Worker("./worker.js", { keyword, pageNumber: i, searchEngine: "yahoo" });
        workerYahoo.postMessage({ keyword, pageNumber: i, searchEngine: "yahoo" });

        workerYahoo.on("message", (result) => {
          workerYahoo.terminate();
          aggregator.postMessage(result);
        });

        const workerBing = new Worker("./worker.js", { keyword, pageNumber: i, searchEngine: "bing" });
        workerBing.postMessage({ keyword, pageNumber: i, searchEngine: "bing" });

        workerBing.on("message", (result) => {
          workerBing.terminate();
          aggregator.postMessage(result);
        });
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
