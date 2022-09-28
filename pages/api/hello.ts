// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import pupeteer from "puppeteer";

type Data = {
  name: string;
  status: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const result = await scrap();
  res.status(200).json(result);
}

const scrap = async () => {
  const browser = await pupeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://www.playlostark.com/en-gb/support/server-status");

  await page.click(
    "body > main > section > div > div.ags-ServerStatus-content-tabs > a:nth-child(3) > div"
  );

  const names = await page.evaluate(() => {
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

  await browser.close();

  return names;
};
