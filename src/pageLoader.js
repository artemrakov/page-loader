import axios from 'axios';
import cheerio from 'cheerio';
import debug from 'debug';

import buildState from './state.js';
import { extractAssetsFromHtml, updateHtmlAssets } from './assets.js';
import { checkAccess, createFiles } from './files.js';

const log = debug('page-loader');

const getPageData = async (url) => {
  log('Fetch url', url);
  try {
    const response = await axios.get(url.href);
    return response.data;
  } catch (e) {
    throw new Error(`Unable to load html: ${e.config.url} with error code: ${e.code}`);
  }
};

const pageLoader = async (u, outputDir = process.cwd()) => {
  checkAccess(outputDir);

  const url = new URL(u);
  const html = await getPageData(url);
  const $ = cheerio.load(html);

  const htmlAssets = extractAssetsFromHtml($);
  log('Extract assets sources from html', htmlAssets);

  const state = buildState(url, htmlAssets, outputDir);
  log('State', state);

  const resultHtml = updateHtmlAssets(state, $);

  log('Create files inside:', outputDir);
  await createFiles(state, resultHtml);

  return { filepath: state.htmlFilepath };
};

export default pageLoader;
