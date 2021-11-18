#!/bin/sh

yarn install && yarn build
git add .
git commit -m "test"
git push
