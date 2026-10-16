/**
 * Точечная установка (PLAN, Н.2, вариант «б»): подпуть пакета на каждый публичный компонент — `@ramzes1385/rise-ui-kit/BaseButton`.
 * Здесь — единственный источник имён и путей и для сборки (build/plugins/subpaths.ts, vite.subpath-css.config.ts),
 * и для exports в package.json (scripts/generate-subpath-exports.mjs), и для проверок.
 *
 * Раскладка в dist:
 * - `components/<Имя>/index.js` — вход подпути: импорт CSS компонента и того, что он использует внутри, и реэкспорт из общих чанков
 *   основной сборки (тех же, что у `./` и `./components`: один экземпляр кода и ключей provide/inject на приложение);
 * - `components/<Имя>/style.css` — только собственные стили папки компонента, без токенов;
 * - `components/<Имя>/index.d.ts` — типы (их кладёт `build:lib:types`);
 * - `tokens.css` и `tokens.layer.css` — токены, тема, движение и база шрифта кита: подключаются один раз.
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const COMPONENTS_INDEX = 'src/components/index.ts'
const PUBLIC_EXPORT = /^export \* from '\.\/(Base\w+)'$/gm
const COMPONENT_DIR = /\/src\/components\/(Base\w+)\//

/** Публичные компоненты — ровно реэкспорты `src/components/index.ts` (вход `./components`) */
export function readPublicComponents(root: string = process.cwd()): string[] {
	const source = readFileSync(resolve(root, COMPONENTS_INDEX), 'utf8')
	return [...source.matchAll(PUBLIC_EXPORT)].map(([, name]) => name!).sort()
}

/** Папка компонента, которой принадлежит модуль (id — абсолютный путь, возможно с `?query`), или `null` */
export function componentOfModule(id: string): string | null {
	return COMPONENT_DIR.exec(id.split('?')[0]!.replaceAll('\\', '/'))?.[1] ?? null
}

/** Имя входа сборки и файла в dist без расширения: `components/BaseButton/index` */
export function subpathEntryName(component: string): string {
	return `components/${component}/index`
}

/** CSS папки компонента в dist */
export function componentCssFile(component: string): string {
	return `components/${component}/style.css`
}

export const TOKENS_CSS_FILE = 'tokens.css'
export const TOKENS_LAYER_CSS_FILE = 'tokens.layer.css'

/** Файл SCSS с токенами и базой кита: в `tokens.css` он попадает целиком, вместе с выводом prelude (build/config/css.ts) */
export const TOKENS_SOURCE = 'src/styles/kit.scss'
