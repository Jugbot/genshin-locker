export default {
  // Pass as function to process entire repo instead of only staged.
  '*': () => [
    'yarn format:write',
    'yarn lint:write',
    'yarn check-types',
    'yarn test',
  ],
}
