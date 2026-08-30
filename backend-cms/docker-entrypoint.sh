#!/bin/sh

set -eu

npm run payload -- migrate
exec npm run start
