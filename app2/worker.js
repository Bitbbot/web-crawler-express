import puppeteer from "puppeteer";
import { parentPort } from "worker_threads";

parentPort.on("message", async (workerData) => {
  const { pageNumber, keyword, aggregator } = workerData;
  console.log(workerData);
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(keyword)}&start=${pageNumber}`);

    await page.screenshot({ path: `${pageNumber}full.png`, fullPage: true });
    const sponsoredLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll(`div[id="tads"]`))
        .map((div) => Array.from(div.querySelectorAll("a")))
        .flat()
        .map((link) => link.getAttribute("href"));
      const linksb = Array.from(document.querySelectorAll(`div[id="tadsb"]`))
        .map((div) => Array.from(div.querySelectorAll("a")))
        .flat()
        .map((link) => link.getAttribute("href"));
      return [...links, ...linksb];
    });

    await browser.close();

    aggregator.postMessage({ workerResults: sponsoredLinks });
    // parentPort.postMessage(sponsoredLinks);
  } catch (error) {
    console.error(`Error crawling sponsored links for keyword "${keyword}" and page ${pageNumber}:`, error);
    // parentPort.postMessage([]); // Return an empty array in case of an error
  }
});
