const TurndownService = require('turndown');
const sanitizeHtml = require('sanitize-html');
const minifyHtml = require('html-minifier');
const removeMarkdown = require('remove-markdown');
const puppeteer = require('puppeteer');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 5000;

async function returnHTML(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.goto(decodeURIComponent(url));
  await page.waitFor(1000);
  const html = await page.content();
  await browser.close();
  return html;
}

function cleanHTML(html) {
  const sanitized = sanitizeHtml(html, {
    allowedAttributes: { code: ['*'], pre: ['*'] },
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'title', 'sup']),
    exclusiveFilter: frame => frame.tag === 'title' || frame.tag === 'sup' || frame.tag === 'iframe' || !frame.text.trim()
  });
  return minifyHtml.minify(sanitized, { collapseWhitespace: true });
}


function returnMarkdown(html) {
  const turndownService = new TurndownService({ codeBlockStyle: 'fenced', bulletListMarker: '-' });
  return turndownService.turndown(html);
}

app.use(express.static('public'));

app.get('/api', async (req, res) => {
  console.log(req.query.url);
  if (req.query.url) {
    const url = encodeURIComponent(req.query.url);
    const raw = await returnHTML(url);
    const simplified = cleanHTML(raw);
    const markdown = returnMarkdown(simplified);
    const plain = removeMarkdown(markdown);
    const output = { plain, markdown, simplified, raw };
    res.json(output);
  }
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}!`));
