// @flow

import path from 'path';
import {Transformer} from '@parcel/plugin';
import nunjucks from 'nunjucks';

export default (new Transformer({
  async loadConfig({config}) {
    let configFile = await config.getConfig([
      '.nunjucksrc',
      '.nunjucksrc.js',
      'nunjucks.config.js',
    ]);

    if (configFile) {
      let isJavascript = path.extname(configFile.filePath) === '.js';
      if (isJavascript) {
        config.invalidateOnStartup();
      }

      return configFile.contents;
    }
  },

  async transform({asset, config}) {
    const nunjucksConfig = config ?? {};
    const content = await asset.getCode();

    const template = nunjucks.compile(content, {
      compileDebug: false,
      basedir: path.dirname(asset.filePath),
      filename: asset.filePath,
      ...nunjucksConfig,
      pretty: nunjucksConfig.pretty || false,
    });

    // TODO
    // for (let filePath of render.dependencies) {
    //   await asset.invalidateOnFileChange(filePath);
    // }

    asset.type = 'html';
    asset.setCode(template.render(nunjucksConfig.locals));

    return [asset];
  },
}): Transformer);
