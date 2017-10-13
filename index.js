#!/usr/bin/env node

const fs = require('fs-extra')
const execa = require('execa')
const Listr = require('listr')

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
    },
  },
])

tasks.run().catch((err) => {
  console.error(err)
})
