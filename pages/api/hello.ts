// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import chromium from "chrome-aws-lambda";

async function getBrowserInstance() {
  const executablePath = await chromium.executablePath;

  if (!executablePath) {
    const puppeteer = require("puppeteer");
    return puppeteer.launch({
      args: chromium.args,
      headless: true,
      ignoreHTTPSErrors: true,
    });
  } else {
    const puppeteer = require("puppeteer-core");
    return puppeteer.launch({
      args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chromium.defaultViewport,
      executablePath: executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let result = null;
  let browser = null;

  try {
    browser = await getBrowserInstance();

    let page = await browser.newPage();

    await page.goto("https://www.playlostark.com/en-gb/support/server-status");

    await page.click(
      "body > main > section > div > div.ags-ServerStatus-content-tabs > a:nth-child(3) > div"
    );

    result = await page.evaluate(() => {
      var listNames = Array.from(
        document.querySelectorAll(
          ".ags-ServerStatus-content-responses-response-server"
        )
      ).map((element) => ({
        name: element
          .querySelector(
            ".ags-ServerStatus-content-responses-response-server-name"
          )
          ?.textContent?.replace("\n", "")
          .replace("+", "")
          .trim(),
        status: element.querySelector(
          ".ags-ServerStatus-content-responses-response-server-status.ags-ServerStatus-content-responses-response-server-status--good"
        )
          ? "good"
          : "bad",
      }));
      return listNames;
    });
  } catch (error) {
    console.log(error);
  } finally {
    if (browser !== null) {
      await browser.close();
    }

    res.status(200).json(result);
  }
}
