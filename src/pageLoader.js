import axios from 'axios';
import cheerio from 'cheerio';
import debug from 'debug';

import buildState from './state.js';
import { extractAssetsFromHtml } from './assets.js';
import createFiles from './createFiles.js';

const log = debug('page-loader');

const pageLoader = async (u, outputDir = process.cwd()) => {
  const url = new URL(u);
  log('Fetch url', url);
  const response = await axios.get(url.href);
  const html = response.data;

  log('Load html');
  const $ = cheerio.load(html);

  log('Extract assets sources from html');
  const htmlAssets = extractAssetsFromHtml($);

  log('Build state');
  const state = buildState(url, htmlAssets, outputDir);
  log('State', state);

  log('Create files here:', outputDir);
  await createFiles(state, $);

  return { filepath: state.htmlFilepath };
};

export default pageLoader;
