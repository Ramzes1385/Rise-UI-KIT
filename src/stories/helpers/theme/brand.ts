/**
 * Бренд историй — глобал Storybook `brand` (панель «Бренд»). Он не заменяет глобал `theme` (режим: светлая или тёмная),
 * а сочетается с ним: `brand` × `theme` — это `data-rise-theme` × `data-theme` на одном элементе, как в приложении.
 * Режим задаёт `data-theme` на `<html>`, бренд — тема `createTheme()` на том же `<html>` через `applyTheme`: сиды темы
 * (палитры, радиус, плотность, шрифты, тени, движение), семантику из них кит пересчитывает на `[data-theme]`.
 * `rise` — вид кита как есть: атрибута и `<style>` темы нет, поэтому снимки и вид по умолчанию не меняются.
 * `custom` — последняя тема из «Foundations/Конструктор темы» (хранится в `localStorage` превью), до первой правки —
 * пресет `corporate`. Для URL и скриншотов: `?globals=brand:corporate;theme:dark`.
 */

import { watch } from 'vue'
import type { Ref } from 'vue'
import { applyTheme } from '@composables/app/useTheme'
import type { StoryBrand } from '../types/helpers.types'
import type { Theme, ThemeInput } from '@utils/theme/themeUtils'
import { createTheme, THEME_PRESET_NAMES, THEME_PRESETS } from '@utils/theme/themeUtils'

/** Бренды панели: пресеты и `custom` */
const STORY_BRANDS: readonly StoryBrand[] = [...THEME_PRESET_NAMES, 'custom']

/** Бренд по умолчанию — кит без темы */
export const STORY_BRAND_DEFAULT: StoryBrand = 'rise'

/** Имя темы бренда `custom` → `data-rise-theme="custom"` */
const CUSTOM_BRAND = 'custom'

/** Ключ `localStorage` превью, где конструктор оставляет входы темы `custom` */
const CUSTOM_THEME_KEY = 'rise-storybook:custom-theme'

/** Входы темы `custom`, пока конструктор их не менял: пресет `corporate` */
const CUSTOM_THEME_DEFAULT: ThemeInput = { ...THEME_PRESETS.corporate, name: CUSTOM_BRAND }

const isBrand = (value: unknown): value is StoryBrand => STORY_BRANDS.includes(value as StoryBrand)

function savedCustomTheme(): Partial<ThemeInput> | null {
	try {
		return JSON.parse(window.localStorage.getItem(CUSTOM_THEME_KEY) ?? 'null') as Partial<ThemeInput> | null
	} catch {
		return null
	}
}

/** Входы темы `custom`: из конструктора, иначе `CUSTOM_THEME_DEFAULT`. Хранилище может быть закрыто — тогда умолчание */
function readCustomTheme(): ThemeInput {
	const input = savedCustomTheme()
	return input?.primary ? { ...input, primary: input.primary, name: CUSTOM_BRAND } : CUSTOM_THEME_DEFAULT
}

const presetThemes = new Map<string, Theme>()

/** Тема бренда; пресеты считаются один раз */
function brandTheme(brand: Exclude<StoryBrand, 'rise'>): Theme {
	if (brand === 'custom') return createTheme(readCustomTheme())
	let theme = presetThemes.get(brand)
	if (!theme) {
		theme = createTheme(THEME_PRESETS[brand])
		presetThemes.set(brand, theme)
	}
	return theme
}

/**
 * Ставит бренд на корень историй и страницы Docs (`<html>` превью): `rise` и неизвестное значение — атрибут снимается.
 * `data-theme` ставит декоратор режима до этого вызова, `applyTheme` его не трогает.
 */
export function applyStoryBrand(brand: unknown, root: HTMLElement = document.documentElement): void {
	if (!isBrand(brand) || brand === 'rise') {
		root.removeAttribute('data-rise-theme')
		return
	}
	applyTheme(brandTheme(brand), { target: root })
}

/** Сохраняет входы конструктора для бренда `custom`; имя темы всегда `custom` */
function saveCustomTheme(input: ThemeInput): void {
	try {
		window.localStorage.setItem(CUSTOM_THEME_KEY, JSON.stringify({ ...input, name: CUSTOM_BRAND }))
	} catch {
		// хранилище закрыто (приватный режим) — бренд `custom` останется умолчанием
	}
}

/**
 * Конструктор темы → бренд `custom`: входы сохраняются при каждом изменении, а если бренд `custom` уже выбран —
 * тема на `<html>` обновляется сразу. Только для превью: в «Show code» не попадает.
 */
export function watchCustomBrand(input: Ref<ThemeInput>): void {
	watch(
		input,
		value => {
			saveCustomTheme(value)
			const root = document.documentElement
			if (root.getAttribute('data-rise-theme') === CUSTOM_BRAND) applyStoryBrand(CUSTOM_BRAND, root)
		},
		{ immediate: true },
	)
}
