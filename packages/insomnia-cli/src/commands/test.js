// @flow

import type { GlobalOptions } from '../util';
import { runTests, generate } from 'insomnia-testing';
import path from 'path';
import os from 'os';
import fs from 'fs';

export const TestReporterEnum = {
  dot: 'dot',
  list: 'list',
  spec: 'spec',
  min: 'min',
  progress: 'progress',
};

export type RunTestsOptions = GlobalOptions<{|
  reporter?: $Keys<typeof TestReporterEnum>,
  bail?: boolean,
|}>;

function validateOptions({ reporter }: RunTestsOptions): boolean {
  if (reporter && !TestReporterEnum[reporter]) {
    const reporterTypes = Object.keys(TestReporterEnum).join(', ');
    console.log(`Reporter "${reporter}" not unrecognized. Options are [${reporterTypes}].`);
    return false;
  }

  return true;
}

export async function runInsomniaTests(options: RunTestsOptions): Promise<void> {
  if (!validateOptions(options)) {
    return;
  }

  const { reporter, bail } = options;

  const suites = [
    {
      name: 'Parent Suite',
      suites: [
        {
          name: 'Nested Suite',
          tests: [
            {
              name: 'should return -1 when the value is not present',
              code: 'expect([1, 2, 3].indexOf(4)).toBe(-1);\nexpect(true).toBe(true);',
            },
          ],
        },
      ],
    },
  ];

  const testFileContents = generate(suites);

  const tmpPath = path.join(os.tmpdir(), `${Math.random()}.test.js`);
  fs.writeFileSync(tmpPath, testFileContents);

  try {
    await runTests(tmpPath, { reporter, bail });
  } finally {
    fs.unlinkSync(tmpPath);
  }
}
