#!/usr/bin/env node
// Сливает отчёты покрытия всех тест-прогонов в общий отчёт coverage/index.html.

import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import libCoverage from 'istanbul-lib-coverage'
import libReport from 'istanbul-lib-report'
import reports from 'istanbul-reports'

import { COVERAGE_SOURCES } from './coverage-sources.mjs'

const ROOT = process.cwd()
const OUTPUT_DIR = resolve(ROOT, 'coverage')
const REPORTERS = ['html', 'lcov', 'text', 'text-summary', 'json']

function log(message) {
	process.stdout.write(`[merge-coverage] ${message}\n`)
}

function mergeSources() {
	const coverage = libCoverage.createCoverageMap({})
	let found = 0

	for (const source of COVERAGE_SOURCES) {
		const file = resolve(ROOT, source)
		if (!existsSync(file)) {
			log(`пропущен (нет файла): ${source}`)
			continue
		}
		coverage.merge(JSON.parse(readFileSync(file, 'utf-8')))
		log(`добавлен: ${source}`)
		found += 1
	}

	if (found === 0) {
		log('не найдено ни одного coverage-final.json')
		process.exit(1)
	}
	return coverage
}

function generateReport(coverageMap) {
	mkdirSync(OUTPUT_DIR, { recursive: true })
	const context = libReport.createContext({ dir: OUTPUT_DIR, coverageMap })
	for (const reporter of REPORTERS) reports.create(reporter).execute(context)
}

generateReport(mergeSources())
log('готово, отчёт: coverage/index.html')
