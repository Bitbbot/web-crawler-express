import { parentPort, workerData } from "worker_threads";

const { resultsCount } = workerData;
let aggregatedNumber = 0;
const results = [];

function mergeArray(array) {
  return array.reduce((acc, curr) => {
    const existingObjectIndex = acc.findIndex((obj) => obj.keyword === curr.keyword);

    if (existingObjectIndex !== -1) {
      acc[existingObjectIndex].sponsoredLinks.push(...curr.sponsoredLinks);
    } else {
      acc.push({
        keyword: curr.keyword,
        sponsoredLinks: [...curr.sponsoredLinks.filter((str) => str.startsWith("http"))],
      });
    }

    return acc;
  }, []);
}

parentPort.on("message", (result) => {
  aggregatedNumber++;
  results.push(result);
  if (aggregatedNumber === resultsCount) {
    const newResults = mergeArray(results);
    parentPort.postMessage(newResults);
  }
});
