#!/usr/bin/env node
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    last: { type: 'string' },
    from: { type: 'string' },
    to: { type: 'string' },
    'dry-run': { type: 'boolean', default: false },
  },
});

console.log('postgame: args ok', values);
