export default {
  '*': () => ['yarn format:write', 'yarn lint:write', 'yarn check-types'],
}
