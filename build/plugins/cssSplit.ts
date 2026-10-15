/**
 * Стили плеера отдельным файлом. Основная сборка (`vite.lib.config.ts`) собирает все стили в один `dist/styles.css`;
 * без разбиения в нём лежит и CSS плеера (`BaseMediaPlayer`, `BasePresentationPlayer`), хотя код плеера — отдельный вход `./media`.
 *
 * Роли плагина:
 * - `exclude` — основная сборка: стили из `MEDIA_STYLE_DIRS` не попадают в `styles.css`; если такой файл подключает
 *   не только вход `./media`, сборка падает (иначе его правила пропали бы у приложений без `media.css`);
 * - `only` — сборка `vite.media-css.config.ts` (вход `./media`): в CSS остаются только стили из `MEDIA_STYLE_DIRS`,
 *   без токенов — их Sass-prelude (build/config/css.ts) кладёт в начало каждого файла, а токены кита уже в `styles.css`.
 *   Остальное делает Vite, как для styles.css: те же цели браузеров, минификация и порядок правил.
 */

import { resolve } from 'node:path'
import type { Plugin, Rollup } from 'vite'
import { MEDIA_ENTRY_FILE, MEDIA_STYLE_DIRS } from '../config/cssSplit'

export type CssSplitRole = 'exclude' | 'only'

const CSS_FILE = /\.(?:css|scss|sass|less|styl|stylus|pcss|postcss|sss)$/
const MARKER_SELECTOR = '.rise-css-split-marker'
const MARKER_RULE = `${MARKER_SELECTOR}{--rise-css-split-marker:0}\n`
const MARKER_BLOCK = /\.rise-css-split-marker\s*\{[^}]*\}\s*/
const LEADING_MODULE_RULES = /^(?:\s*@(?:use|forward)\b[^;]*;)*/

function cleanId(id: string): string {
	return id.split('?')[0]!.replaceAll('\\', '/')
}

function isStyleFile(id: string): boolean {
	return CSS_FILE.test(cleanId(id))
}

/** Файл стилей из `MEDIA_STYLE_DIRS` (id — абсолютный путь модуля, возможно с `?query`) */
export function isMediaStyle(id: string): boolean {
	const path = cleanId(id)
	return CSS_FILE.test(path) && MEDIA_STYLE_DIRS.some(dir => path.includes(`/${dir}`))
}

/** Ставит метку после ведущих `@use`/`@forward` исходного SCSS: до неё в скомпилированном CSS — токены prelude, после — стили файла */
export function addMarker(source: string): string {
	const head = LEADING_MODULE_RULES.exec(source)?.[0] ?? ''
	return `${head}\n${MARKER_RULE}${source.slice(head.length)}`
}

/** Оставляет в скомпилированном CSS только стили после метки; `null` — метки нет */
export function stripBeforeMarker(css: string): string | null {
	const match = MARKER_BLOCK.exec(css)
	return match ? css.slice(match.index + match[0].length) : null
}

function findEntryImporters(plugin: Rollup.PluginContext, id: string): Set<string> {
	const entries = new Set<string>()
	const seen = new Set<string>()
	const queue = [id]
	for (let current = queue.pop(); current !== undefined; current = queue.pop()) {
		if (seen.has(current)) continue
		seen.add(current)
		const info = plugin.getModuleInfo(current)
		if (!info) continue
		if (info.isEntry) entries.add(cleanId(current))
		queue.push(...info.importers, ...info.dynamicImporters)
	}
	return entries
}

function createMarkerPlugin(): Plugin {
	return {
		name: 'rise:css-split-marker',
		apply: 'build',
		enforce: 'pre',
		transform(code, id) {
			if (!isMediaStyle(id)) return null
			return { code: addMarker(code), map: null }
		},
	}
}

/** Без `enforce`: после `vite:css` (компиляция Sass), но до `vite:css-post`, который превращает CSS-модуль в JS и собирает стили в файл */
function createFilterPlugin(role: CssSplitRole): Plugin {
	const mediaStyles = new Set<string>()
	return {
		name: `rise:css-split-${role}`,
		apply: 'build',
		transform(code, id) {
			if (!isStyleFile(id)) return null
			if (isMediaStyle(id)) mediaStyles.add(cleanId(id))
			if (role === 'exclude') return isMediaStyle(id) ? { code: '', map: null } : null
			if (!isMediaStyle(id)) return { code: '', map: null }
			const own = stripBeforeMarker(code)
			if (own === null) this.error(`css-split: в ${cleanId(id)} нет метки токенов — стили плеера не отделить от токенов`)
			return { code: own, map: null }
		},
		buildEnd() {
			if (role !== 'exclude') return
			const entry = resolve(process.cwd(), MEDIA_ENTRY_FILE).replaceAll('\\', '/')
			for (const id of mediaStyles) {
				const foreign = [...findEntryImporters(this, id)].filter(file => file !== entry)
				if (foreign.length > 0) {
					this.error(`css-split: ${id} нужен не только входу ./media (${foreign.join(', ')}) — уберите его из MEDIA_STYLE_DIRS`)
				}
			}
			if (mediaStyles.size === 0) this.error('css-split: стили плеера не найдены — проверьте MEDIA_STYLE_DIRS')
		},
	}
}

/** Сборка `media.css` (`only`) оставляет в бандле только его: остальное (JS, спрайт) уже лежит в dist от основной сборки */
function createKeepCssPlugin(): Plugin {
	return {
		name: 'rise:css-split-keep-css',
		apply: 'build',
		enforce: 'post',
		generateBundle(_, bundle) {
			for (const [name, file] of Object.entries(bundle)) {
				if (name !== 'media.css') delete bundle[name]
				else if (file.type !== 'asset') this.error('css-split: media.css должен быть файлом стилей')
			}
			if (!bundle['media.css']) this.error('css-split: media.css не собран — у плеера нет стилей')
		},
	}
}

export function createCssSplitPlugins(role: CssSplitRole): Plugin[] {
	return role === 'exclude' ? [createFilterPlugin(role)] : [createMarkerPlugin(), createFilterPlugin(role), createKeepCssPlugin()]
}
