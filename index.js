#!/usr/bin/env node

const fs = require('fs-extra')
const execa = require('execa')
const ora = require('ora')

async function addPrettier() {
  const spinner = ora('Adding prettier').start()
  await execa('yarn', ['add', '-D', 'prettier-eslint-cli'])

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

  spinner.start('Updating config')
  const packageJSON = await fs.readJSON('package.json')
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
  packageJSON.scripts.lint = "prettier-eslint '{src,test,app}/**/*.js'"
  packageJSON.scripts.format = 'npm run lint --write'
  await fs.writeJSON('package.json', packageJSON, {
    spaces: 2,
  })
  spinner.succeed('Updated config')
}

addPrettier().catch((e) => {
  throw e
})
