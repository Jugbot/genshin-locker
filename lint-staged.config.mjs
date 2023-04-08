export default {
  // Pass as function to process entire repo instead of only staged.
  '*': () => [
    'npx lerna run format:write,lint:write,check-types',
  ],
}
