#!/usr/bin/env node
// Удаляет устаревший общий отчёт перед частичным прогоном, чтобы он не показывал
// старые цифры. Отчёты отдельных прогонов (coverage/<zone>/) не трогает.

import { existsSync, readdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

import { COVERAGE_ZONES } from './coverage-sources.mjs'

const COVERAGE_DIR = resolve(process.cwd(), 'coverage')
const ZONE_DIRS = new Set(COVERAGE_ZONES)
const KEEP_FILES = new Set(['.gitkeep'])

function removeMergedReport() {
	if (!existsSync(COVERAGE_DIR)) return

	for (const entry of readdirSync(COVERAGE_DIR)) {
		if (ZONE_DIRS.has(entry)) continue
		if (KEEP_FILES.has(entry)) continue
		rmSync(resolve(COVERAGE_DIR, entry), { recursive: true, force: true })
	}
}

removeMergedReport()
