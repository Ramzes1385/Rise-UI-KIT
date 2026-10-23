/** Утилиты: пресет движения ближайшего предка, признак «движение выключено» и токены длительностей и кривых из CSS */

import { MOTION_PRESETS } from './types/useMotion.types'
import type { MotionDurationName, MotionEasingName, MotionPreset } from './types/useMotion.types'

/** Атрибут пресета: на `<html>` или любом контейнере */
export const MOTION_ATTRIBUTE = 'data-rise-motion'

/** Атрибут на `<html>` от опции плагина `reducedMotion: 'always'` */
export const REDUCED_MOTION_ATTRIBUTE = 'data-rise-reduced-motion'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const DEFAULT_PRESET: MotionPreset = 'standard'

/** Длительность короче этой — выключенное движение (токены пресета `none` и reduce — 0.01ms) */
const MIN_DURATION_MS = 1

const DURATION_TOKENS: Record<MotionDurationName, string> = {
	fast: '--rise-duration-fast',
	base: '--rise-duration',
	slow: '--rise-duration-slow',
	xslow: '--rise-duration-xslow',
}

const EASING_TOKENS: Record<MotionEasingName, string> = {
	base: '--rise-ease',
	out: '--rise-ease-out',
	in: '--rise-ease-in',
	emphasized: '--rise-ease-emphasized',
	spring: '--rise-ease-spring',
}

/** Значения `src/styles/_motion.scss` на случай, когда стили кита не подключены (SSR, тесты) */
const MOTION_DURATION_FALLBACK: Record<MotionPreset, Record<MotionDurationName, number>> = {
	none: { fast: 0, base: 0, slow: 0, xslow: 0 },
	subtle: { fast: 100, base: 140, slow: 200, xslow: 300 },
	standard: { fast: 140, base: 200, slow: 320, xslow: 500 },
	expressive: { fast: 180, base: 260, slow: 420, xslow: 700 },
}

const EASING_FALLBACK: Record<MotionEasingName, string> = {
	base: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
	out: 'cubic-bezier(0.16, 1, 0.3, 1)',
	in: 'cubic-bezier(0.7, 0, 0.84, 0)',
	emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
	spring: 'cubic-bezier(0.2, 0, 0, 1)',
}

function rootElement(): Element | null {
	return typeof document === 'undefined' ? null : document.documentElement
}

function isMotionPreset(value: string | null | undefined): value is MotionPreset {
	return MOTION_PRESETS.includes(value as MotionPreset)
}

/** `'200ms'` → 200, `'0.3s'` → 300; пусто или не длительность — `null` */
function parseDuration(value: string): number | null {
	const match = /^\s*(-?\d*\.?\d+)(ms|s)\s*$/.exec(value)
	if (!match) return null
	const amount = Number(match[1])
	return match[2] === 's' ? amount * 1000 : amount
}

/** Пресет самого элемента или ближайшего предка с `data-rise-motion`; без атрибута — `standard` */
export function readMotionPreset(el?: Element | null): MotionPreset {
	const value = (el ?? rootElement())?.closest(`[${MOTION_ATTRIBUTE}]`)?.getAttribute(MOTION_ATTRIBUTE)
	return isMotionPreset(value) ? value : DEFAULT_PRESET
}

function isSystemReducedMotion(): boolean {
	return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(REDUCED_MOTION_QUERY).matches
}

/** Опция плагина `reducedMotion: 'always'` — атрибут на `<html>` */
export function isMotionAlwaysReduced(): boolean {
	return rootElement()?.getAttribute(REDUCED_MOTION_ATTRIBUTE) === 'always'
}

/** Движение для элемента выключено: системное «уменьшить движение», `reducedMotion: 'always'` или пресет `none` */
export function isMotionReduced(el?: Element | null): boolean {
	return isSystemReducedMotion() || isMotionAlwaysReduced() || readMotionPreset(el) === 'none'
}

function readToken(el: Element | null, token: string): string {
	if (!el || typeof getComputedStyle !== 'function') return ''
	return getComputedStyle(el).getPropertyValue(token).trim()
}

/** Длительность токена без проверки reduce: из CSS элемента, без стилей — значение пресета */
function readDurationToken(el: Element | null, name: MotionDurationName): number {
	const parsed = parseDuration(readToken(el, DURATION_TOKENS[name]))
	if (parsed === null) return MOTION_DURATION_FALLBACK[readMotionPreset(el)][name]
	return parsed < MIN_DURATION_MS ? 0 : parsed
}

/**
 * Длительность токена движения в миллисекундах для элемента (по умолчанию `<html>`); выключенное движение — `0`.
 * Для обработчиков вне `setup` (хуки `<Transition>`, таймеры); в компоненте — `useMotion().duration`
 */
export function readMotionDuration(el?: Element | null, name: MotionDurationName = 'base'): number {
	const host = el ?? rootElement()
	return isMotionReduced(host) ? 0 : readDurationToken(host, name)
}

/** Кривая из токена движения (`cubic-bezier(…)`, `linear(…)`); без стилей — значение пресета `standard` */
export function readMotionEasing(el?: Element | null, name: MotionEasingName = 'base'): string {
	return readToken(el ?? rootElement(), EASING_TOKENS[name]) || EASING_FALLBACK[name]
}
