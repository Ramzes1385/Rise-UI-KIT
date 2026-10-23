#!/usr/bin/env node
import { main } from './migrate/cli.mjs'

process.exitCode = main(process.argv.slice(2))
