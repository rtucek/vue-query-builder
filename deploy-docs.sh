#!/usr/bin/env sh

set -e

yarn run docs:build

(
  cd docs/.vuepress/dist
  git init
  git add -A
  git commit -m 'deploy docs'
  git push -f git@github.com:rtucek/vue-query-builder.git master:gh-pages
)
