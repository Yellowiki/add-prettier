#!/usr/bin/env node

const fs = require('fs-extra')
const execa = require('execa')
const ora = require('ora')

async function addPrettier() {
  const packageJSON = await fs.readJSON('package.json')

  const spinner = ora('Adding prettier').start()
  await execa('yarn', ['add', '-D', 'prettier-eslint-cli@1'])

  spinner.start('Adding ESLint')
  await execa('yarn', [
    'add',
    '-D',
    'eslint',
    'eslint-config-airbnb',
    'eslint-plugin-jsx-a11y',
    'eslint-plugin-import',
    'eslint-plugin-react',
  ])
  spinner.succeed('Added prettier and ESLint')

  packageJSON.prettier = {
    singleQuote: true,
    trailingComma: 'all',
    semi: false,
  }
  packageJSON.eslintConfig = {
    extends: 'airbnb',
    rules: {
      semi: ['error', 'never'],
    },
  }
  packageJSON.scripts = packageJSON.scripts || {}
  packageJSON.scripts.test = "prettier-eslint '{src,test,app}/**/*.js'"
  packageJSON.scripts.format = 'npm run -s test -- --write'
  await fs.writeJSON('package.json', packageJSON, {
    spaces: 2,
  })
  spinner.succeed('Wrote new config')
}

addPrettier().catch(e => {
  throw e
})
