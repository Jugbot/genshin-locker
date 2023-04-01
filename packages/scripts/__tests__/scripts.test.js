'use strict';

const scripts = require('..');
const assert = require('assert').strict;

assert.strictEqual(scripts(), 'Hello from scripts');
console.info('scripts tests passed');
