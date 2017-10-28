#!/usr/bin/env node

const fs = require('fs-extra')
const execa = require('execa')
const Listr = require('listr')
const yargs = require('yargs')

const { argv } = yargs.boolean('eslint').default('eslint', true)

const tasks = new Listr([
  {
    title: 'Install Prettier',
    task: () => execa('yarn', ['add', 'prettier-eslint-cli']),
  },
  {
    title: 'Install ESLint',
    task: () =>
      execa('yarn', [
        'add',
        '-D',
        'eslint',
        'eslint-config-airbnb',
        'eslint-plugin-jsx-a11y',
        'eslint-plugin-import',
        'eslint-plugin-react',
      ]),
    skip: () => !argv.eslint && '--no-eslint option specified',
  },
  {
    title: 'Update package.json',
    task: async () => {
      const packageJSON = await fs.readJSON('package.json')
      packageJSON.prettier = {
        singleQuote: true,
        trailingComma: 'all',
        semi: false,
      }
      if (argv.eslint) {
        packageJSON.eslintConfig = {
          extends: 'airbnb',
          rules: {
            semi: ['error', 'never'],
          },
        }
      }
      packageJSON.scripts = packageJSON.scripts || {}
      packageJSON.scripts.lint = 'eslint .'
      const lintCommand = argv.eslint ? 'prettier-eslint' : 'prettier'
      packageJSON.scripts.format = `${lintCommand} '{src,test,app}/**/*.{js,ts,css}' --write`
      await fs.writeJSON('package.json', packageJSON, {
        spaces: 2,
      })
    },
  },
])

tasks.run().catch((err) => {
  throw err
})
