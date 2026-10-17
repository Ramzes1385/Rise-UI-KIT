/// <reference types="node" />

/** Прогон фаззинга: итерации с зерном от (запуск, цель, номер), сбор нарушений, сокращение входа до минимального, сводка */

import { appendFileSync } from 'node:fs'
import { expect, vi } from 'vitest'
import { createRng, seedFor } from './rng'
import type { Rng } from './rng'

export interface FuzzConfig {
	seed: number
	iterations: number
	only: { target: string; index: number } | null
	targetFilter: string | null
}

interface Finding {
	target: string
	index: number
	input: string
	violations: string[]
}

export interface TargetResult {
	target: string
	iterations: number
	checked: number
	findings: Finding[]
	violationCount: number
	skipped: number
	milliseconds: number
}

const DEFAULT_SEED = 20261017
const MAX_FINDINGS = 5
const MAX_SHRINK_STEPS = 400

function readNumber(name: string, fallback: number): number {
	const value = Number(process.env[name])
	return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback
}

/** Параметры из окружения: FUZZ_ITERATIONS, FUZZ_SEED, FUZZ_ONLY=<цель>:<номер> (повтор одной итерации), FUZZ_TARGET (подстрока имени цели) */
export function readFuzzConfig(defaultIterations: number): FuzzConfig {
	const only = /^(.+):(\d+)$/.exec(process.env.FUZZ_ONLY ?? '')
	return {
		seed: readNumber('FUZZ_SEED', DEFAULT_SEED),
		iterations: readNumber('FUZZ_ITERATIONS', defaultIterations),
		only: only ? { target: only[1], index: Number(only[2]) } : null,
		targetFilter: process.env.FUZZ_TARGET ?? null,
	}
}

export interface TargetOptions<T> {
	name: string
	weight?: number
	generate: (rng: Rng) => T
	check: (input: T) => readonly string[] | void | Promise<readonly string[] | void>
	describe?: (input: T) => string
}

/**
 * Ошибки самого jsdom, не кита: разбор CSS (css-tree/cssstyle на кривом `style`) и разбор HTML (parse5 на одиночном суррогате
 * `RangeError: Invalid code point`). Браузеры на таких входах не падают.
 */
function isEnvironmentError(error: unknown): boolean {
	return error instanceof Error && /css-tree|cssstyle|parse5/.test(error.stack ?? '')
}

/** Нарушения входа; null — прогон не засчитан из-за ошибки среды (jsdom) */
async function violationsOf<T>(options: TargetOptions<T>, input: T): Promise<string[] | null> {
	try {
		return [...((await options.check(input)) ?? [])]
	} catch (error) {
		if (isEnvironmentError(error)) return null
		return [`исключение: ${error instanceof Error ? `${error.name}: ${error.message}`.slice(0, 120) : String(error)}`]
	}
}

/** Сокращает строку, пока проверка продолжает находить то же нарушение: сначала крупные куски, затем символы */
async function shrinkString(source: string, stillFails: (candidate: string) => boolean | Promise<boolean>): Promise<string> {
	let current = source
	let steps = 0
	for (let size = Math.ceil(current.length / 2); size >= 1 && steps < MAX_SHRINK_STEPS; size = Math.floor(size / 2)) {
		for (let at = 0; at + size <= current.length && steps < MAX_SHRINK_STEPS;) {
			steps += 1
			const candidate = `${current.slice(0, at)}${current.slice(at + size)}`
			if (candidate && (await stillFails(candidate))) current = candidate
			else at += size
		}
	}
	return current
}

async function shrinkInput<T>(options: TargetOptions<T>, input: T, signature: string): Promise<string> {
	if (typeof input !== 'string') return options.describe ? options.describe(input) : JSON.stringify(input)
	return shrinkString(input, async candidate =>
		((await violationsOf(options, candidate as T)) ?? []).some(item => item.startsWith(signature)),
	)
}

const signatureOf = (violation: string): string => violation.replace(/[:(].*$/s, '')

function isSelected<T>(config: FuzzConfig, options: TargetOptions<T>): boolean {
	if (config.only) return config.only.target === options.name
	return !config.targetFilter || options.name.includes(config.targetFilter)
}

/** Строка о завершённой цели в файл FUZZ_REPORT сразу: если процесс упадёт посреди прогона, видно, какая цель была последней */
function reportProgress(result: TargetResult): void {
	if (!process.env.FUZZ_REPORT || result.iterations === 0) return
	appendFileSync(
		process.env.FUZZ_REPORT,
		`${new Date().toISOString()} ${result.target}: входов ${result.iterations}, нарушений ${result.violationCount}, ${result.milliseconds} мс\n`,
	)
}

/** Прогоняет цель: `iterations × weight` входов; каждая итерация воспроизводится по зерну, номеру и имени цели */
export async function runTarget<T>(config: FuzzConfig, options: TargetOptions<T>): Promise<TargetResult> {
	const started = performance.now()
	const result: TargetResult = {
		target: options.name,
		iterations: 0,
		checked: 0,
		findings: [],
		violationCount: 0,
		skipped: 0,
		milliseconds: 0,
	}
	if (!isSelected(config, options)) return result
	const total = config.only ? 1 : Math.max(1, Math.round(config.iterations * (options.weight ?? 1)))
	const seen = new Set<string>()
	for (let step = 0; step < total; step += 1) {
		const index = config.only ? config.only.index : step
		const input = options.generate(createRng(seedFor(config.seed, options.name, index)))
		result.iterations += 1
		const violations = await violationsOf(options, input)
		if (violations === null) result.skipped += 1
		if (!violations?.length) continue
		result.violationCount += 1
		const signature = signatureOf(violations[0])
		if (seen.has(signature) || result.findings.length >= MAX_FINDINGS) continue
		seen.add(signature)
		result.findings.push({
			target: options.name,
			index,
			input: await shrinkInput(options, input, signature),
			violations: violations.slice(0, 4),
		})
	}
	result.checked = result.iterations
	result.milliseconds = Math.round(performance.now() - started)
	reportProgress(result)
	return result
}

export function formatFindings(results: readonly TargetResult[]): string {
	return results
		.flatMap(result => result.findings)
		.map(finding => `[${finding.target} #${finding.index}] ${finding.violations.join(' | ')}\n  вход: ${JSON.stringify(finding.input)}`)
		.join('\n')
}

function formatSummary(results: readonly TargetResult[], seed: number): string {
	const lines = results
		.filter(result => result.iterations > 0)
		.map(
			result =>
				`  ${result.target.padEnd(34)} входов ${String(result.iterations).padStart(7)}  нарушений ${String(result.violationCount).padStart(5)}  пропущено ${String(result.skipped).padStart(4)}  ${String(result.milliseconds).padStart(7)} мс`,
		)
	const total = results.reduce((sum, result) => sum + result.iterations, 0)
	const violations = results.reduce((sum, result) => sum + result.violationCount, 0)
	return [`Фаззинг XSS, зерно ${seed}`, ...lines, `  итого входов ${total}, нарушений ${violations}`].join('\n')
}

/**
 * Сводка по целям: в stdout — только в долгом прогоне (`npm run test:fuzz` задаёт FUZZ_ITERATIONS), чтобы вывод
 * `npm run test:unit` оставался чистым; в файл FUZZ_REPORT — если он задан
 */
export function reportSummary(results: readonly TargetResult[], seed: number): void {
	const text = `\n${formatSummary(results, seed)}\n`
	if (process.env.FUZZ_ITERATIONS) process.stdout.write(text)
	if (process.env.FUZZ_REPORT) appendFileSync(process.env.FUZZ_REPORT, text)
}

const KIT_WARNING = /^\[rise-ui-kit\] /
const JSDOM_CSS_ERROR = 'jsdom: Could not parse CSS stylesheet'

/**
 * Консоль цели фаззинга. Враждебные данные ожидаемо вызывают предупреждения кита `warn()` (небезопасная ссылка без
 * адреса, неполная SEO-разметка) и ошибку разбора CSS jsdom (`<style>` из данных в `innerHTML`). Шпионы их перехватывают;
 * возвращённая проверка (до `vi.restoreAllMocks()`) валит тест на любом другом сообщении.
 */
export function trapFuzzConsole(): () => void {
	const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
	const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
	return () => {
		const unexpected = [
			...warn.mock.calls.map(args => String(args[0])).filter(text => !KIT_WARNING.test(text)),
			...error.mock.calls.map(args => String(args[0])).filter(text => text !== JSDOM_CSS_ERROR),
		]
		expect(unexpected, 'фаззинг: неожиданные сообщения в консоли').toEqual([])
	}
}
