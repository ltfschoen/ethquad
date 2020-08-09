#!/bin/bash
cp ./client/build/index.html ./client/build/index-temp.html

# Replace text `%PUBLIC_URL%/` with just `/`
sed -e 's/%PUBLIC_URL%\///g' ./client/build/index-temp.html > ./client/build/index.html 
