#!/usr/bin/env node
// Чинит цифру на кнопке "Open coverage report" в Storybook: addon-vitest показывает
// процент только своего прогона, а патч берёт его из нашего общего отчёта coverage/.
// Идемпотентен, запускается из storybook-dev.mjs, переживает npm install.

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const REPORTER_FILE = resolve(SCRIPT_DIR, '../node_modules/@storybook/addon-vitest/dist/node/coverage-reporter.js')

// Маркер уже применённого патча.
const PATCH_MARKER = '/* metal-art:merged-percent */'

// Выражение в аддоне, которое заменяем.
const ORIGINAL_CODE = 'percentage = Math.round(rawCoverageSummary.data.statements.pct)'

// Замена: процент покрытых statements из coverage/coverage-final.json (иначе — исходное).
const PATCHED_CODE = `percentage = ${PATCH_MARKER} (() => {
	const fallback = Math.round(rawCoverageSummary.data.statements.pct)
	try {
		const fs = require('node:fs')
		const path = require('node:path')
		const reportPath = path.resolve(process.cwd(), 'coverage/coverage-final.json')
		if (!fs.existsSync(reportPath)) return fallback
		const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'))
		let covered = 0
		let total = 0
		for (const file of Object.values(report)) {
			for (const hits of Object.values(file.s || {})) {
				total += 1
				if (hits > 0) covered += 1
			}
		}
		return total > 0 ? Math.round((covered / total) * 100) : fallback
	} catch {
		return fallback
	}
})()`

function log(message) {
	process.stdout.write(`[patch-storybook-coverage-percentage] ${message}\n`)
}

function applyPatch() {
	if (!existsSync(REPORTER_FILE)) {
		log('файл аддона не найден, пропускаю')
		process.exitCode = 1
		return
	}

	const source = readFileSync(REPORTER_FILE, 'utf8')

	if (source.includes(PATCH_MARKER)) {
		log('уже применён')
		return
	}
	if (!source.includes(ORIGINAL_CODE)) {
		log('исходный код не найден — структура аддона изменилась, патч пропущен')
		process.exitCode = 1
		return
	}

	writeFileSync(REPORTER_FILE, source.replace(ORIGINAL_CODE, PATCHED_CODE))
	log('применён')
}

applyPatch()
