const puppeteer = require('puppeteer');
const htmlToText = require('html-to-text');
const TurndownService = require('turndown');
const sanitizeHtml = require('sanitize-html');
const prettier = require('prettier');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 5000;

async function returnHTML(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(decodeURIComponent(url));
  await page.waitFor(1000);
  const html = await page.content();
  await browser.close();
  return html;
}

function cleanHTML(html) {
  const sanitized = sanitizeHtml(prettier.format(html, { parser: 'html', printWidth: 500 }), { allowedAttributes: { code: ['*'], pre: ['*'] } });
  return sanitized.replace(/(^[ \t]*\n)/gm, '');
}

function returnPlainText(html) {
  const cleaned = cleanHTML(html);
  const text = htmlToText.fromString(cleaned, {
    tables: true,
    wordwrap: false,
    ignoreHref: true,
    ignoreImage: true,
    unorderedListItemPrefix: '-',
  });
  return cleanUpBlankLines(text);
}

function cleanUpBlankLines(text) {
  const lineEnd = text.match(/\r\n/gm) ? '\r\n' : '\n';
  const regExp = new RegExp(`(${lineEnd}){3,}`, 'gm');
  return text.replace(regExp, `${lineEnd}${lineEnd}`).trim();
}

function returnMarkdown(html) {
  const cleaned = cleanHTML(html);
  const turndownService = new TurndownService({ codeBlockStyle: 'fenced', bulletListMarker: '-' });
  const markdown = turndownService.turndown(cleaned);
  return prettier.format(markdown, { parser: 'markdown' });
}

app.use(express.static('public'));

app.get('/api', async (req, res) => {
  console.log(req.query.url);
  if (req.query.url) {
    const url = encodeURIComponent(req.query.url);
    const raw = await returnHTML(url);
    const plain = returnPlainText(raw);
    const markdown = returnMarkdown(raw);
    const viewer = cleanHTML(raw);
    const output = { plain, markdown, viewer, raw };
    res.json(output);
  }
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}!`));
