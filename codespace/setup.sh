#!/bin/sh
set -e

docker pull nubskr/compiler:1
# Create internal network if it doesn't already exist
if ! docker network ls --format '{{.Name}}' | grep -q '^mynetwork$'; then
  docker network create --internal mynetwork
fi

# Install Python dependencies required for scraping Codeforces problems
pip3 install -r "$(dirname "$0")/server/requirements.txt"
