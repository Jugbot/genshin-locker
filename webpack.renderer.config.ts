import type { Configuration } from 'webpack'

import { rules } from './webpack.rules'
import { plugins } from './webpack.plugins'

rules.push(
  {
    test: /\.css$/,
    use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
  },
  {
    test: /\.svg$/,
    type: 'asset/source',
  }
)

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
  externals: {
    'win32-api': 'require("win32-api")',
    'ffi-napi': 'require("ffi-napi")',
    'ref-napi': 'require("ref-napi")',
  },
}
