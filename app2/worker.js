import puppeteer from "puppeteer";
import { parentPort } from "worker_threads";

parentPort.on("message", async (workerData) => {
  const { pageNumber, keyword, searchEngine } = workerData;
  let sponsoredLinks;
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    if (searchEngine === "google") {
      await page.goto(`https://www.google.com/search?q=${encodeURIComponent(keyword)}&start=${pageNumber}`);
      sponsoredLinks = await getLinks(page, [`div[id="tads"]`, `div[id="tadsb"]`]);
    } else if (searchEngine === "yahoo") {
      await page.goto(`https://search.yahoo.com/search?p=${encodeURIComponent(keyword)}&b=${pageNumber * 7 + 1}&pz=7`);
      try {
        await page.evaluate(() => {
          const button = document.querySelector('button[class="btn secondary accept-all "]');
          if (button) {
            button.click();
          } else {
            console.error("Yahoo: button not found");
          }
        });
        await page.waitForNavigation();
      } catch (e) {}
      sponsoredLinks = await getLinks(page, ['ol[class*="searchCenterTopAds"]', 'ol[class*="searchCenterBottomAds"]']);
    } else {
      await page.goto(`https://www.bing.com/search?q=${encodeURIComponent(keyword)}&first=${pageNumber * 10 + 1}`);
      sponsoredLinks = await getLinks(page, ['li[class*="b_adTop"]', 'li[class*="b_adBottom"]']);
    }

    await browser.close();
    parentPort.postMessage({ keyword, sponsoredLinks });
  } catch (error) {
    console.error(`Error crawling sponsored links for keyword "${keyword}" and page ${pageNumber}:`, error);
    parentPort.postMessage({ keyword, sponsoredLinks: [] });
  }
});

async function getLinks(page, selectors) {
  return page.evaluate(function (selectors) {
    const linkst = Array.from(document.querySelectorAll(selectors[0]))
      .map((div) => Array.from(div.querySelectorAll("a")))
      .flat()
      .map((link) => link.getAttribute("href"));
    const linksb = Array.from(document.querySelectorAll(selectors[1]))
      .map((div) => Array.from(div.querySelectorAll("a")))
      .flat()
      .map((link) => link.getAttribute("href"));
    return [...linkst, ...linksb];
  }, selectors);
}
