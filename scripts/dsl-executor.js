import fs from 'fs';
import yaml from 'js-yaml';
import puppeteer from 'puppeteer';

async function executeDSL(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const dsl = yaml.load(fileContent);

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://www.ruanyifeng.com/blog/');

  for (const step of dsl) {
    const selector = step.selector;

    // 确保元素存在
    await page.waitForSelector(selector);

    const element = await page.$(selector);

    if (step.action) {
      switch (step.action) {
        case 'click':
          await element.click();
          break;
        case 'type':
          await element.type(step.value);
          break;
        case 'select':
          await element.select(step.value);
          break;
        default:
          console.error(`Unknown action: ${step.action}`);
          break;
      }
    }

    if (step.assert) {
      const attributeValue = await element.evaluate(
        (el, attribute) => el[attribute],
        step.assert.attribute
      );

      if (attributeValue !== step.assert.value) {
        console.error(
          `Assertion failed for selector "${selector}": expected ${step.assert.attribute} to be "${step.assert.value}", but got "${attributeValue}"`
        );
      } else {
        console.log(`Assertion passed for selector "${selector}"`);
      }
    }
  }

  await new Promise(resolve => setTimeout(resolve, 5000))

  await browser.close();
}



export default function(url) {
  executeDSL('./operations/demo.yml');
};
