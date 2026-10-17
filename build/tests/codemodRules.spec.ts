/** Кодмод `rise-ui-kit migrate`: правила по одному — граничные случаи, ловушки, предупреждения. */

import { describe, expect, it } from 'vitest'

import { applyEdits, collectFacts, mergeFacts, segmentsOf, transformFile } from '../../bin/migrate/transform.mjs'

const KIT = '@ramzes1385/rise-ui-kit'

type Result = { text: string; edits: number; warnings: Array<{ line: number; id: string; text: string }> }

/** Прогон набора файлов как одного проекта; возвращает результат по каждому файлу. */
function migrate(files: Record<string, string>): Record<string, Result> {
	const names = Object.keys(files).sort()
	const ctx = mergeFacts(names.map(file => ({ file, facts: collectFacts(file, files[file]) })))
	return Object.fromEntries(names.map(file => [file, transformFile(file, files[file], ctx)]))
}

const one = (file: string, text: string, extra: Record<string, string> = {}): Result => migrate({ [file]: text, ...extra })[file]
const ids = (result: Result) => result.warnings.map(w => w.id)

describe('импорты кита', () => {
	it('plugins: с алиасом, без, namespace, динамический импорт, require и реэкспорт', () => {
		expect(one('a.ts', `import { plugins as p, utils } from '${KIT}'\np.createIconPlugin()\n`).text).toBe(
			`import { icons as p, utils } from '${KIT}'\np.createIconPlugin()\n`,
		)
		expect(one('a.ts', `import * as kit from '${KIT}'\nkit.plugins.createIconPlugin()\nconst plugins = 1\nmy.plugins\n`).text).toBe(
			`import * as kit from '${KIT}'\nkit.icons.createIconPlugin()\nconst plugins = 1\nmy.plugins\n`,
		)
		expect(one('a.ts', `import * as other from '${KIT}/utils'\nother.plugins\n`).text).toContain('other.plugins')
		const dynamic = `const a = await import('${KIT}/plugins')\nconst b = require("${KIT}/plugins")\nexport * from '${KIT}/plugins'\nexport { x } from "${KIT}/plugins"\n`
		expect(one('a.ts', dynamic).text).toBe(dynamic.replaceAll('/plugins', '/icons'))
		expect(one('a.ts', `import('${KIT}/pluginsX')\nimport '${KIT}/plugins/sub'\n`).edits).toBe(0)
	})

	it('BaseMediaPlayer: перенос в /media с точкой с запятой, CRLF, многострочным списком и существующим импортом', () => {
		expect(one('a.ts', `import { BaseMediaPlayer } from '${KIT}';\nconsole.log(1)\n`).text).toBe(
			`import { BaseMediaPlayer } from '${KIT}/media';\nconsole.log(1)\n`,
		)
		expect(one('a.ts', `import { BaseMediaPlayer } from "${KIT}/components"\r\nx()\r\n`).text).toBe(
			`import { BaseMediaPlayer } from "${KIT}/media"\r\nx()\r\n`,
		)
		expect(one('a.ts', `import {\n\tBaseButton,\n\tBaseMediaPlayer,\n\tBaseText,\n} from '${KIT}'\nx()\n`).text).toBe(
			`import {\n\tBaseButton,\n\tBaseText,\n} from '${KIT}'\nimport { BaseMediaPlayer } from '${KIT}/media'\nx()\n`,
		)
		expect(one('a.ts', `import { BaseButton, BaseMediaPlayer } from '${KIT}'\r\nx()\r\n`).text).toBe(
			`import { BaseButton } from '${KIT}'\r\nimport { BaseMediaPlayer } from '${KIT}/media'\r\nx()\r\n`,
		)
		expect(one('a.ts', `import { BaseMediaPlayer } from '${KIT}'\nimport type { MediaIcon } from '${KIT}/media'\n`).text).toBe(
			`import { BaseMediaPlayer } from '${KIT}/media'\nimport type { MediaIcon } from '${KIT}/media'\n`,
		)
		expect(one('a.ts', `import {\n\tBaseButton,\n\tBaseMediaPlayer\n} from '${KIT}'\n`).text).toBe(
			`import {\n\tBaseButton\n} from '${KIT}'\nimport { BaseMediaPlayer } from '${KIT}/media'\n`,
		)
		expect(one('a.ts', `import { BaseMediaPlayer } from './own'\nimport { BaseMediaPlayer as P } from '${KIT}/media'\n`).edits).toBe(0)
	})

	it('import с default и namespace: остаются на месте', () => {
		expect(one('a.ts', `import kit, { BaseMediaPlayer } from '${KIT}'\n`).text).toBe(
			`import kit from '${KIT}'\nimport { BaseMediaPlayer } from '${KIT}/media'\n`,
		)
		expect(one('a.ts', `import type { A, BaseMediaPlayer } from '${KIT}'\n`).text).toBe(
			`import type { A } from '${KIT}'\nimport { BaseMediaPlayer } from '${KIT}/media'\n`,
		)
		expect(one('a.ts', `import typeFoo from '${KIT}'\nimport type from './t'\n`).edits).toBe(0)
	})

	it('getTooltipTransition: импорт убирается, если значение больше не нужно; иначе остаётся с предупреждением', () => {
		expect(
			one('a.ts', `import { getTooltipTransition } from '${KIT}/utils'\r\nexport const x = getTooltipTransition("top")\r\n`).text,
		).toBe(`export const x = "tooltip-top"\r\n`)
		expect(
			one('a.ts', `import tooltip, { getTooltipTransition } from '${KIT}/utils'\nexport const x = getTooltipTransition(pos)\n`).text,
		).toBe(`import tooltip from '${KIT}/utils'\nexport const x = \`tooltip-\${pos}\`\n`)
		const kept = one(
			'a.ts',
			`import { getTooltipTransition } from '${KIT}/utils'\nconst f = getTooltipTransition\nconst g = getTooltipTransition(a, b)\nconst h = getTooltipTransition()\n`,
		)
		expect(kept.edits).toBe(0)
		expect(ids(kept)).toEqual(['tooltip-transition', 'tooltip-transition', 'tooltip-transition'].slice(0, ids(kept).length))
		expect(ids(kept).length).toBeGreaterThan(0)
	})
})

describe('вызовы с объектом вместо списка', () => {
	const head = `import { calcTotalColumns, calcTooltipShift, resolveTooltipPlacement } from '${KIT}/utils'\n`

	it('считает аргументы: старая форма меняется, новая и чужое число аргументов — нет', () => {
		const { text } = one(
			'a.ts',
			`${head}a(calcTotalColumns(1, x, y, z,))\nb(calcTotalColumns(1, { x }))\nc(calcTotalColumns())\nd(calcTotalColumns(1, x, y))\n`,
		)
		expect(text).toBe(
			`${head}a(calcTotalColumns(1, { isSelectable: x, hasRowNumber: y, hasExpandableRows: z }))\nb(calcTotalColumns(1, { x }))\nc(calcTotalColumns())\nd(calcTotalColumns(1, x, y))\n`,
		)
	})

	it('аргументы со скобками, строками, запятыми внутри и вызовами', () => {
		const { text } = one('a.ts', `${head}calcTooltipShift(pick('a,b'), at(1, 2), { w: [1, 2] }, vp())\n`)
		expect(text).toBe(`${head}calcTooltipShift(pick('a,b'), { coords: at(1, 2), size: { w: [1, 2] }, viewport: vp() })\n`)
	})

	it('вложенные вызовы переписываются за один запуск', () => {
		const { text } = one('a.ts', `${head}calcTotalColumns(n, a, b, calcTooltipShift(p, c, s, v) > 0)\n`)
		expect(text).toBe(
			`${head}calcTotalColumns(n, { isSelectable: a, hasRowNumber: b, hasExpandableRows: calcTooltipShift(p, { coords: c, size: s, viewport: v }) > 0 })\n`,
		)
	})

	it('spread и незакрытый вызов', () => {
		const spread = one('a.ts', `${head}calcTotalColumns(...args)\nresolveTooltipPlacement('top', ...rest)\n`)
		expect(spread.edits).toBe(0)
		expect(ids(spread)).toEqual(['call-spread', 'call-spread'])
		expect(one('a.ts', `${head}calcTotalColumns(1, a`).edits).toBe(0)
	})

	it('namespace: utils из корня, import * из корня и из /utils', () => {
		const text = one(
			'a.ts',
			`import * as kit from '${KIT}'\nimport * as u from '${KIT}/utils'\nimport { utils as helpers } from '${KIT}'\nkit.utils.calcTotalColumns(1, a, b, c)\nu.calcTooltipShift(p, c, s, v)\nhelpers.calcTotalColumns(2, a, b, c)\nother.calcTotalColumns(1, a, b, c)\n`,
		).text
		expect(text).toContain('kit.utils.calcTotalColumns(1, { isSelectable: a, hasRowNumber: b, hasExpandableRows: c })')
		expect(text).toContain('u.calcTooltipShift(p, { coords: c, size: s, viewport: v })')
		expect(text).toContain('helpers.calcTotalColumns(2, { isSelectable: a, hasRowNumber: b, hasExpandableRows: c })')
		expect(text).toContain('other.calcTotalColumns(1, a, b, c)')
	})

	it('импорт чужого модуля с тем же именем не трогается', () => {
		const source = `import { calcTotalColumns } from './mine'\ncalcTotalColumns(1, a, b, c)\n`
		expect(one('a.ts', source).text).toBe(source)
	})
})

describe('createTheme', () => {
	it("motion: 'default' → 'standard' в файлах, где используется тема кита", () => {
		expect(
			one(
				'a.ts',
				`import { createTheme } from '${KIT}'\nconst a = { motion: 'default' }\nconst b = { motion: "default", other: 'default' }\n`,
			).text,
		).toBe(
			`import { createTheme } from '${KIT}'\nconst a = { motion: 'standard' }\nconst b = { motion: "standard", other: 'default' }\n`,
		)
		expect(one('a.ts', `import * as kit from '${KIT}'\nkit.createTheme({ motion: 'default' })\n`).text).toContain("motion: 'standard'")
		expect(one('a.ts', `import { THEME_MOTIONS } from '${KIT}/utils'\nconst a = { motion: 'default' }\n`).text).toContain(
			"motion: 'standard'",
		)
		expect(one('a.ts', `import { createTheme } from './mine'\nconst a = { motion: 'default' }\n`).edits).toBe(0)
		expect(one('a.ts', `import { useToast } from '${KIT}'\nconst a = { motion: 'default' }\n`).edits).toBe(0)
	})
})

describe('предупреждения в скриптах', () => {
	it('значок вкладки строкой HTML и статус pending только в нужном контексте', () => {
		expect(ids(one('a.ts', `const a = { icon: '<svg/>' }\nconst b = { icon: 'home' }\nconst c = { label: '<b>' }\n`))).toEqual([
			'tabs-icon-html',
		])
		const upload = `const kind = 'BaseFileUpload'\nconst a = { status: 'pending' }\nif (f.status === 'pending') {}\nif (f.status !== "pending") {}\nstatus = 'pending'\nconst b = { state: 'pending' }\n`
		expect(ids(one('a.ts', upload))).toEqual(['upload-pending', 'upload-pending', 'upload-pending', 'upload-pending'])
		expect(ids(one('a.ts', `const a = { status: 'pending' }\n`))).toEqual([])
	})

	it('ключи словаря — только в файлах с defineLocale', () => {
		const withLocale = `defineLocale('ru', { chat: { 'INSERT_EMOJI': 'x', CLOSE_PANEL: 'y' }, other: { PARTICIPANTS_SUFFIX : 1 }, note: 'VIOLATION', ok: 'TITLE' })\nconst key = ATTACH_ERRORS\n`
		expect(one('a.ts', withLocale).warnings.map(w => w.text.split(' ')[2])).toEqual([
			'INSERT_EMOJI',
			'VIOLATION',
			'CLOSE_PANEL',
			'PARTICIPANTS_SUFFIX',
		])
		expect(ids(one('a.ts', `const a = { INSERT_EMOJI: 1 }\n`))).toEqual([])
	})

	it('previewUrl — только рядом с BaseFileUpload', () => {
		expect(ids(one('a.ts', `// BaseFileUpload\nconst u = file.previewUrl\n`))).toEqual(['upload-preview'])
		expect(ids(one('a.ts', `const u = file.previewUrl\n`))).toEqual([])
	})
})

describe('языки, которые в 2.0 не встроены', () => {
	const setup = `import { createUiKitConfig, setLocale } from '${KIT}'\n`

	it('setLocale и locale: готовый словарь без registerLocale и плагина — предупреждение со ссылкой на w16-lazy-locale', () => {
		const result = one('main.ts', `${setup}setLocale('en')\napp.use(createUiKitConfig({ locale: "zh" }))\n`)
		expect(result.edits).toBe(0)
		expect(result.warnings.filter(w => w.id === 'locale-register').map(w => w.line)).toEqual([2, 3])
		expect(result.warnings[0].text).toContain('registerLocale(en)')
		expect(ids(one('main.ts', `${setup}setLocale('ru')\nsetLocale(code)\nconst x = { lang: 'en' }\nlog('en')\n`))).not.toContain(
			'locale-register',
		)
	})

	it('BaseApp locale="en" в шаблоне; :locale и ru — без предупреждения', () => {
		const vue = (attrs: string) => `<template>\n\t<BaseApp ${attrs}><RouterView /></BaseApp>\n</template>\n`
		expect(ids(one('App.vue', vue('locale="ja"')))).toEqual(['locale-register'])
		expect(ids(one('App.vue', vue(':locale="en"')))).toEqual([])
		expect(ids(one('App.vue', vue('locale="ru"')))).toEqual([])
	})

	it('проект подключает словари сам (registerLocale или createUiKitPlugin в любом файле) — молчит', () => {
		const files = { 'App.vue': `<template>\n\t<BaseApp locale="en" />\n</template>\n`, 'main.ts': `${setup}setLocale('en')\n` }
		expect(
			ids(
				one('main.ts', files['main.ts'], {
					'App.vue': files['App.vue'],
					'boot.ts': `import { registerLocale, en } from '${KIT}'\nregisterLocale(en)\n`,
				}),
			),
		).toEqual([])
		expect(
			ids(
				one('App.vue', files['App.vue'], {
					'plugin.ts': `import { createUiKitPlugin } from '${KIT}'\napp.use(createUiKitPlugin())\n`,
				}),
			),
		).toEqual([])
	})
})

describe('шаблоны Vue', () => {
	const sfc = (template: string, script = '') =>
		`${script ? `<script setup lang="ts">\n${script}\n</script>\n\n` : ''}<template>\n${template}\n</template>\n`

	it('мёртвые пропсы: все формы записи, одиночный атрибут, многострочный тег', () => {
		const input = sfc(
			[
				'<BaseAnimation variant="x"></BaseAnimation>',
				'<base-animation :size-scale="2" sizeScale="1" v-bind:color="c" v-bind="rest" name="fade" />',
				'<BaseSlider',
				'\tvariant="soft"',
				'\t:items="i"',
				'\tcolor="red"',
				'/>',
				'<BaseImage variant="x" color="red" />',
			].join('\n'),
		)
		const { text } = one('A.vue', input)
		expect(text).toBe(
			sfc(
				[
					'<BaseAnimation></BaseAnimation>',
					'<base-animation v-bind="rest" name="fade" />',
					'<BaseSlider',
					'\t:items="i"',
					'/>',
					'<BaseImage color="red" />',
				].join('\n'),
			),
		)
	})

	it('чужой компонент с тем же именем и другие теги не трогаются', () => {
		const input = sfc(
			'<BaseAnimation variant="x" />\n<BaseButton variant="soft" color="red" />',
			`import BaseAnimation from './BaseAnimation.vue'`,
		)
		expect(one('A.vue', input).edits).toBe(0)
	})

	it('слот default: явный, неявный, пустой компонент и слоты по имени', () => {
		const warn = (template: string) => ids(one('A.vue', sfc(template)))
		expect(warn('<BaseSelect :options="o">текст</BaseSelect>')).toEqual(['default-slot'])
		expect(warn('<BaseTable><template #default>x</template></BaseTable>')).toEqual(['default-slot'])
		expect(warn('<BaseTable v-slot="p">x</BaseTable>')).toEqual(['default-slot'])
		expect(warn('<BaseSelect><template #option="{ o }">{{ o }}</template></BaseSelect>')).toEqual([])
		expect(warn('<BaseSelect><!-- комментарий --></BaseSelect>')).toEqual([])
		expect(warn('<BaseSelect />')).toEqual([])
		expect(warn('<BaseLoader>подпись</BaseLoader>')).toEqual([])
	})

	it('events, router.push и prop events у календаря', () => {
		const warn = (template: string) => ids(one('A.vue', sfc(template)))
		expect(warn('<BaseBreadcrumbs @navigate="onNavigate" />')).toEqual([])
		expect(warn('<BaseBreadcrumbs @navigate />')).toEqual([])
		expect(warn('<BaseSideBar @select="(i) => router.push(i.to)" />')).toEqual(['router-push'])
		expect(warn('<BaseMegaMenu v-on:select="push(i)" />')).toEqual(['router-push'])
		expect(warn('<BaseCalendar :events="e" events="x" v-bind:highlights="h" />')).toEqual(['calendar-events'])
		expect(warn('<BaseCalendar><template v-slot:navigation>x</template></BaseCalendar>')).toEqual(['calendar-slots'])
		expect(warn('<BaseMegaMenu @item-click="a" @column-click="b" @navigate="c" :hover-delay="1" hoverDelay="2" />')).toEqual([
			'mega-props',
			'mega-events',
		])
	})

	it('BaseText: теги с жирным весом без weight', () => {
		const warn = (template: string) => ids(one('A.vue', sfc(template)))
		expect(warn('<BaseText tag="strong">a</BaseText><BaseText tag="b">b</BaseText>')).toEqual(['text-weight', 'text-weight'])
		expect(warn('<BaseText tag="h1" :weight="600" /><BaseText tag="p" /><BaseText :tag="x" /><BaseText tag /><BaseText />')).toEqual([])
		expect(warn('<BaseText tag="h2" weight="500" />')).toEqual([])
	})

	it('aria-label вместе с role="group"', () => {
		const warn = (template: string) => ids(one('A.vue', sfc(template)))
		expect(warn('<BaseSwitch role="group" aria-label="Имя" />')).toEqual(['aria-group'])
		expect(warn('<BaseSwitch role="group" :aria-label="n" />')).toEqual(['aria-group'])
		expect(warn('<BaseSwitch role="group" /><BaseSwitch role="button" aria-label="x" /><BaseSwitch aria-label="x" />')).toEqual([])
	})

	it('плеер без импорта в файле — предупреждение, с импортом — нет', () => {
		expect(ids(one('A.vue', sfc('<base-media-player />')))).toContain('player-global')
		expect(ids(one('A.vue', sfc('<BasePresentationPlayer />')))).toContain('player-global')
		const imported = sfc('<BaseMediaPlayer />', `import { BaseMediaPlayer } from '${KIT}/media'`)
		expect(ids(one('A.vue', imported))).not.toContain('player-global')
	})
})

describe('CSS и SCSS', () => {
	const withAnimation = { 'Use.vue': `<template><BaseAnimation name="fade" /></template>\n` }

	it('переименование классов переходов, только когда проект использует BaseAnimation', () => {
		const css = '.fade-enter-active, .a.slide-up-leave-to { top: 0 }\n.list-move { top: 1px }\n'
		expect(one('a.css', css).edits).toBe(0)
		expect(ids(one('a.css', css))).toEqual([])
		expect(migrate({ 'a.css': css, ...withAnimation })['a.css'].text).toBe(
			'.rise-fade-enter-active, .a.rise-slide-up-leave-to { top: 0 }\n.rise-list-move { top: 1px }\n',
		)
	})

	it('суффиксы не пересекаются: -move только у list, длинные имена и вложенные селекторы', () => {
		const css = '.fade-move {}\n.fade-enter-active-x {}\n.my-fade-enter-active {}\n&.scale-leave-from {}\n:deep(.zoom-enter-to) {}\n'
		expect(migrate({ 'a.scss': css, ...withAnimation })['a.scss'].text).toBe(
			'.fade-move {}\n.fade-enter-active-x {}\n.my-fade-enter-active {}\n&.rise-scale-leave-from {}\n:deep(.rise-zoom-enter-to) {}\n',
		)
	})

	it('классы оверлеев переименовываются без BaseAnimation', () => {
		const css = '.modal-fade-leave-to {}\n.slideover-enter-from {}\n.dropdown-leave-active {}\n.dropdown-menu {}\n'
		expect(one('a.css', css).text).toBe(
			'.base-modal-leave-to {}\n.base-slideover-enter-from {}\n.base-dropdown-leave-active {}\n.dropdown-menu {}\n',
		)
	})

	it('свой Transition с таким именем: класс остаётся, предупреждение вместо правки', () => {
		const own = { 'Own.vue': `<template><Transition name="dropdown" /><transition-group name="fade" /></template>\n` }
		const result = migrate({
			'a.css': '.dropdown-enter-from {}\n.fade-enter-from {}\n.slideover-enter-from {}\n',
			'Use.vue': withAnimation['Use.vue'],
			...own,
		})['a.css']
		expect(result.text).toBe('.dropdown-enter-from {}\n.fade-enter-from {}\n.base-slideover-enter-from {}\n')
		expect(ids(result)).toEqual(['class-conflict', 'class-conflict'])
	})

	it('динамическое имя у собственного Transition — все совпадения только предупреждения', () => {
		const files = {
			'a.css': '.dropdown-enter-from {}\n',
			'Own.vue': `<template><Transition :name="n" /><Transition appear /></template>\n`,
		}
		expect(migrate(files)['a.css'].text).toBe('.dropdown-enter-from {}\n')
		expect(ids(migrate(files)['a.css'])).toEqual(['class-conflict'])
		const jsx = {
			'a.css': '.dropdown-enter-from {}\n',
			'Own.tsx': `export const A = () => <><Transition name={n} /><TransitionGroup name="x" /><Transition appear /></>\n`,
		}
		expect(ids(migrate(jsx)['a.css'])).toEqual(['class-conflict'])
		const named = { 'a.css': '.dropdown-enter-from {}\n', 'Own.tsx': `export const A = () => <Transition name='dropdown' />\n` }
		expect(ids(migrate(named)['a.css'])).toEqual(['class-conflict'])
	})

	it('классы подсказки: предупреждение, пока нет своего Transition с таким именем', () => {
		const css = '.tooltip-left-leave-to {}\n.tooltip-bottom-enter-active {}\n.tooltip-center-enter-from {}\n'
		expect(ids(one('a.css', css))).toEqual(['tooltip-class', 'tooltip-class'])
		expect(ids(migrate({ 'a.css': css, 'Own.vue': `<template><Transition name="tooltip-left" /></template>\n` })['a.css'])).toEqual([
			'tooltip-class',
		])
	})

	it('.base-editor с рамкой — предупреждение, без неё — нет; токены и алиасы только в объявлениях', () => {
		expect(ids(one('a.css', '.base-editor { border: 0 }\n.base-editor { color: red }\n.base-editor__frame { border: 0 }\n'))).toEqual([
			'css-selector',
		])
		expect(
			ids(
				one(
					'a.css',
					':root { --color-accent: red; --color-brand: blue; width: var(--color-accent); --rise-anchor-gap: 1px; --rise-unknown: 1 }\n',
				),
			),
		).toEqual(['alias-token', 'css-token'])
		expect(ids(one('a.css', '/* --kanban-ease: 1 */ .a::before { content: "--kanban-ease" }\n'))).toEqual([])
	})

	it('media.css после импорта styles с точкой с запятой в скрипте; уже подключённый media.css в CSS', () => {
		const player = { 'P.ts': `import { BaseMediaPlayer } from '${KIT}/media'\n` }
		expect(migrate({ 'a.ts': `import '${KIT}/styles.layer.css';\n`, ...player })['a.ts'].text).toBe(
			`import '${KIT}/styles.layer.css';\nimport '${KIT}/media.layer.css';\n`,
		)
		expect(migrate({ 'a.css': `@import '${KIT}/styles.css';\n@import '${KIT}/media.css';\n`, ...player })['a.css'].edits).toBe(0)
	})

	it('media.css в CSS без точки с запятой в конце и в SCSS с @use', () => {
		const player = { 'P.ts': `import { BaseMediaPlayer } from '${KIT}/media'\n` }
		expect(migrate({ 'a.scss': `@use "${KIT}/styles"`, ...player })['a.scss'].text).toBe(
			`@use "${KIT}/styles"\n@import "${KIT}/media.css";`,
		)
		expect(migrate({ 'a.css': `@import '${KIT}/styles.css';\r\n.a {}\r\n`, ...player })['a.css'].text).toBe(
			`@import '${KIT}/styles.css';\r\n@import '${KIT}/media.css';\r\n.a {}\r\n`,
		)
	})
})

describe('файлы и блоки .vue', () => {
	it('media.css: стили кита в первом из двух <script> и в <style>; другие файлы без правок', () => {
		const vue = `<script>\nexport default {}\n</script>\n<script setup>\nimport '${KIT}/styles'\nimport { BaseMediaPlayer } from '${KIT}/media'\n</script>\n<style lang="scss">\n@use '${KIT}/styles';\n</style>\n`
		const result = migrate({ 'A.vue': vue })['A.vue'].text
		expect(result).toContain(`import '${KIT}/styles'\nimport '${KIT}/media.css'\n`)
		expect(result).not.toContain('@import')
		const onlyStyle = `<template><BaseMediaPlayer /></template>\n<style lang="scss">\n@use '${KIT}/styles';\n</style>\n<style lang="less">\n.a { .b; }\n</style>\n<style>\n.fade-enter-active {}\n</style>\n`
		expect(migrate({ 'B.vue': onlyStyle })['B.vue'].text).toContain(`@use '${KIT}/styles';\n@import '${KIT}/media.css';`)
	})

	it('части файлов: расширения, .d.ts и файлы, которые кодмод не читает', () => {
		expect(
			segmentsOf('a.vue', '<template><a /></template>\n<style lang="stylus">\n</style>').map((s: { kind: string }) => s.kind),
		).toEqual(['template'])
		expect(segmentsOf('a.d.ts', 'x')).toEqual([])
		expect(segmentsOf('a.json', '{}')).toEqual([])
		expect(segmentsOf('a.tsx', 'x')).toHaveLength(1)
		expect(segmentsOf('a.mjs', 'x')).toHaveLength(1)
		expect(one('a.json', '{ "motion": "default" }').edits).toBe(0)
	})

	it('applyEdits применяет правки с конца', () => {
		expect(
			applyEdits('abcdef', [
				{ start: 0, end: 1, text: 'X' },
				{ start: 4, end: 6, text: '' },
				{ start: 2, end: 2, text: '--' },
			]),
		).toBe('Xb--cd')
	})

	it('повторный прогон по результату ничего не меняет', () => {
		const files = {
			'a.ts': `import { BaseMediaPlayer, plugins } from '${KIT}'\nimport '${KIT}/styles'\nplugins.x()\ncalcTotalColumns(1, 2, 3, 4)\n`,
			'b.css': '.dropdown-enter-from {}\n',
		}
		const first = migrate(files)
		const second = migrate({ 'a.ts': first['a.ts'].text, 'b.css': first['b.css'].text })
		expect(second['a.ts'].edits).toBe(0)
		expect(second['b.css'].edits).toBe(0)
	})
})
