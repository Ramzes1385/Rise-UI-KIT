/** Разбиение CSS пакета: помощники плагина build/plugins/cssSplit.ts и проверка scripts/check-css-split.mjs на временном репозитории. */

import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { MEDIA_STYLE_DIRS } from '../config/cssSplit'
import { addMarker, isMediaStyle, stripBeforeMarker } from '../plugins/cssSplit'

const SCRIPT = resolve(import.meta.dirname, '../../scripts/check-css-split.mjs')

const FONTS =
	'@font-face{font-family:Rise Grotesk;font-display:block;src:url(./fonts/rise-grotesk.woff2)format("woff2")}' +
	'@font-face{font-family:Rise Mono;font-display:block;src:url(./fonts/rise-mono-400.woff2)format("woff2")}'
const TOKENS = `:root{--rise-color-primary-500:#f97316}[data-theme=dark]{--rise-bg:#000}${FONTS}`
const CJK_CSS = (family: string, dir: string, from = '.') =>
	`@font-face{font-family:'${family}';font-display:block;src:url('${from}/${dir}/rise-cjk-${dir}-00.woff2') format('woff2');unicode-range:U+4E00}`
const PLAYER = '.base-media-player{position:relative}.base-presentation-player{display:block}'

describe('isMediaStyle', () => {
	it('узнаёт стили плеера по папкам, с query и обратными слэшами Windows', () => {
		expect(isMediaStyle('/repo/src/components/BaseMediaPlayer/styles/MediaShare.style.scss')).toBe(true)
		expect(isMediaStyle('/repo/src/components/BasePresentationPlayer/styles/BasePresentationPlayer.style.scss?used')).toBe(true)
		expect(isMediaStyle('C:\\repo\\src\\components\\BaseMediaPlayer\\styles\\MediaError.style.scss')).toBe(true)
	})

	it('не трогает стили других компонентов, код плеера и истории', () => {
		expect(isMediaStyle('/repo/src/components/BaseButton/styles/BaseButton.style.scss')).toBe(false)
		expect(isMediaStyle('/repo/src/components/BaseMediaPlayer/ui/BaseMediaPlayer.vue')).toBe(false)
		expect(isMediaStyle('/repo/src/components/BaseMediaPlayer/stories/preview.scss')).toBe(false)
	})
})

describe('метка токенов', () => {
	it('после метки остаются стили файла, до неё — токены prelude', () => {
		const compiled = `${TOKENS}.rise-css-split-marker {\n  --rise-css-split-marker: 0;\n}\n${PLAYER}`

		expect(stripBeforeMarker(compiled)).toBe(PLAYER)
	})

	it('без метки возвращает null', () => {
		expect(stripBeforeMarker(`${TOKENS}${PLAYER}`)).toBeNull()
	})

	it('метка встаёт после ведущих @use и @forward, а не перед ними', () => {
		const marked = addMarker("@use 'sass:math';\n@forward './x';\n.base-media-player { top: 0 }")

		expect(marked.indexOf('.rise-css-split-marker')).toBeGreaterThan(marked.indexOf("@forward './x';"))
		expect(marked.indexOf('.rise-css-split-marker')).toBeLessThan(marked.indexOf('.base-media-player'))
	})

	it('файл без @use получает метку в самом начале', () => {
		expect(addMarker('.a { top: 0 }').startsWith('\n.rise-css-split-marker')).toBe(true)
	})
})

describe('check-css-split', () => {
	let root = ''

	const write = (file: string, content: string) => writeFileSync(join(root, file), content)
	const run = () => {
		const result = spawnSync(process.execPath, [SCRIPT, `--root=${root}`], { encoding: 'utf8' })
		return { status: result.status, output: `${result.stdout}${result.stderr}` }
	}

	beforeEach(() => {
		root = mkdtempSync(join(tmpdir(), 'css-split-'))
		for (const dir of MEDIA_STYLE_DIRS) mkdirSync(join(root, dir), { recursive: true })
		mkdirSync(join(root, 'dist/fonts/cjk/sc'), { recursive: true })
		mkdirSync(join(root, 'dist/fonts/cjk/jp'), { recursive: true })
		mkdirSync(join(root, 'dist/chunks'), { recursive: true })
		write('dist/fonts/rise-grotesk.woff2', 'wOF2')
		write('dist/fonts/rise-mono-400.woff2', 'wOF2')
		write('dist/fonts/cjk/sc/rise-cjk-sc-00.woff2', 'wOF2')
		write('dist/fonts/cjk/jp/rise-cjk-jp-00.woff2', 'wOF2')
		write('dist/fonts/cjk/zh.css', CJK_CSS('Rise CJK SC', 'sc'))
		write('dist/fonts/cjk/ja.css', CJK_CSS('Rise CJK JP', 'jp'))
		mkdirSync(join(root, 'dist/locales'), { recursive: true })
		write('dist/locales/zh.js', 'import"../fonts/cjk/zh.css";export{t as zh}from"../chunks/locale-zh-a1.js"')
		write('dist/locales/ja.js', 'import"../fonts/cjk/ja.css";export{t as ja}from"../chunks/locale-ja-b2.js"')
		write('dist/chunks/locale-zh-a1.js', 'export const t={}')
		write('dist/chunks/locale-ja-b2.js', 'export const t={}')
		write(`${MEDIA_STYLE_DIRS[0]}Player.style.scss`, '.base-media-player {\n\tposition: relative;\n}\n')
		write(`${MEDIA_STYLE_DIRS[1]}Presentation.style.scss`, '.base-presentation-player {\n\tdisplay: block;\n}\n')
		write('dist/styles.css', `${TOKENS}.base-button{color:red}`)
		write('dist/media.css', PLAYER)
		write('dist/media.layer.css', "@import url('./media.css') layer(rise);\n")
		mkdirSync(join(root, 'src/components/BaseButton/styles'), { recursive: true })
		mkdirSync(join(root, 'dist/components/BaseButton'), { recursive: true })
		write('src/components/index.ts', "export * from './BaseButton'\n")
		write('dist/tokens.css', TOKENS)
		write('dist/components/BaseButton/index.js', 'import"./style.css";export{}')
		write('dist/components/BaseButton/style.css', '.base-button{color:red}')
	})

	afterEach(() => {
		rmSync(root, { recursive: true, force: true })
	})

	it('зелёный: styles.css без плеера, media.css с плеером и без токенов', () => {
		const { status, output } = run()

		expect(status).toBe(0)
		expect(output).toContain('base-media-player, base-presentation-player')
	})

	it('стили плеера в styles.css роняют проверку', () => {
		write('dist/styles.css', `${TOKENS}${PLAYER}`)

		const { status, output } = run()

		expect(status).toBe(1)
		expect(output).toContain('styles.css содержит стили плеера: .base-media-player')
	})

	it('media.css без класса плеера роняет проверку', () => {
		write('dist/media.css', '.base-media-player{position:relative}')

		const { status, output } = run()

		expect(status).toBe(1)
		expect(output).toContain('media.css не содержит .base-presentation-player')
	})

	it('токены кита в media.css роняют проверку', () => {
		write('dist/media.css', `${TOKENS}${PLAYER}`)

		const { status, output } = run()

		expect(status).toBe(1)
		expect(output).toContain('токены кита (:root)')
		expect(output).toContain('токены кита ([data-theme=)')
	})

	it('атрибутный селектор [data-theme] плеера не считается токенами', () => {
		write('dist/media.css', `${PLAYER}.base-media-player[data-theme]{--rise-focus-ring:red}`)

		expect(run().status).toBe(0)
	})

	it('media.layer.css без слоя rise и отсутствие файлов роняют проверку', () => {
		write('dist/media.layer.css', "@import url('./media.css');\n")

		expect(run().output).toContain('media.layer.css не подключает ./media.css в слой rise')

		rmSync(join(root, 'dist/media.css'))
		const { status, output } = run()

		expect(status).toBe(1)
		expect(output).toContain('нет dist/media.css')
	})

	it('подпути: токены в style.css компонента роняют проверку', () => {
		write('dist/components/BaseButton/style.css', `${TOKENS}.base-button{color:red}`)

		const { status, output } = run()

		expect(status).toBe(1)
		expect(output).toContain('components/BaseButton/style.css содержит токены кита (:root)')
	})

	it('подпути: правило styles.css, которого нет в CSS подпутей, и лишнее правило роняют проверку', () => {
		write('dist/styles.css', `${TOKENS}.base-button{color:red;padding:0}`)
		expect(run().output).toContain('в CSS подпутей нет 1 правил styles.css, например: .base-button | padding:0')

		write('dist/styles.css', TOKENS)
		expect(run().output).toContain('в CSS подпутей 1 правил, которых нет в styles.css')
	})

	it('подпути: склейка селекторов минификатором и комментарии на сравнение не влияют', () => {
		mkdirSync(join(root, 'dist/components/BaseIcon'), { recursive: true })
		write('src/components/index.ts', "export * from './BaseButton'\nexport * from './BaseIcon'\n")
		write('dist/components/BaseIcon/index.js', 'export{}')
		write('dist/components/BaseIcon/style.css', '.base-icon{color:red}')
		write('dist/styles.css', `/*$vite$:1*/${TOKENS}.base-button,.base-icon{color:red}`)

		expect(run().status).toBe(0)
	})

	it('шрифты: без @font-face семейства кита в tokens.css проверка падает', () => {
		write('dist/tokens.css', TOKENS.replace(/@font-face\{font-family:Rise Mono[^}]*\}/, ''))
		write('dist/styles.css', `${TOKENS.replace(/@font-face\{font-family:Rise Mono[^}]*\}/, '')}.base-button{color:red}`)

		const { status, output } = run()

		expect(status).toBe(1)
		expect(output).toContain('tokens.css: нет @font-face «Rise Mono»')
		expect(output).toContain('styles.css: нет @font-face «Rise Mono»')
	})

	it('шрифты: url() без файла и font-display не block роняют проверку', () => {
		rmSync(join(root, 'dist/fonts/rise-mono-400.woff2'))
		write(
			'dist/tokens.css',
			TOKENS.replace('font-family:Rise Grotesk;font-display:block', 'font-family:Rise Grotesk;font-display:swap'),
		)
		write('dist/styles.css', `${TOKENS}.base-button{color:red}`)

		const { output } = run()

		expect(output).toContain('styles.css: url(./fonts/rise-mono-400.woff2) — файла нет в dist')
		expect(output).toContain('tokens.css: @font-face «Rise Grotesk» с font-display: swap — нужен block')
	})

	it('шрифты: @font-face в CSS компонента роняет проверку, url() внутри data: URI — нет', () => {
		const svg = `url("data:image/svg+xml,%3Csvg filter='url(%23n)'/%3E")`
		write('dist/components/BaseButton/style.css', `.base-button{color:red;background:${svg}}${FONTS}`)
		write('dist/styles.css', `${TOKENS}.base-button{color:red;background:${svg}}`)

		const { status, output } = run()

		expect(status).toBe(1)
		expect(output).toContain('components/BaseButton/style.css: @font-face — шрифты кита объявляют только styles.css и tokens.css')
		expect(output).not.toContain('%23n')
	})

	it('шрифты иероглифов: CSS языка импортирует только вход словаря, не общий чанк; @font-face Rise CJK — не в styles.css', () => {
		write('dist/chunks/locale-zh-a1.js', 'import"../fonts/cjk/zh.css";export const t={}')
		write('dist/styles.css', `${TOKENS}.base-button{color:red}${CJK_CSS('Rise CJK SC', 'sc', './fonts/cjk')}`)
		rmSync(join(root, 'dist/locales/ja.js'))

		const { status, output } = run()

		expect(status).toBe(1)
		expect(output).toContain(
			'fonts/cjk/zh.css: его импортирует только вход словаря locales/zh.js, а импортирует: chunks/locale-zh-a1.js, locales/zh.js',
		)
		expect(output).toContain('fonts/cjk/ja.css: его импортирует только вход словаря locales/ja.js, а импортирует: никто')
		expect(output).toContain('styles.css: @font-face «Rise CJK SC» — шрифты иероглифов подключает только словарь языка')
	})

	it('шрифты иероглифов: нет CSS языка или в нём нет семейства — проверка падает', () => {
		rmSync(join(root, 'dist/fonts/cjk/ja.css'))
		write('dist/fonts/cjk/zh.css', CJK_CSS('Rise CJK JP', 'sc'))

		const { output } = run()

		expect(output).toContain('нет dist/fonts/cjk/ja.css — шрифт Rise CJK JP не собран')
		expect(output).toContain('fonts/cjk/zh.css: нет @font-face «Rise CJK SC»')
	})

	it('подпути: нет входа подпути или CSS, который он импортирует, — проверка падает', () => {
		write('dist/components/BaseButton/index.js', 'import"../BaseIcon/style.css";export{}')
		expect(run().output).toContain('./BaseButton импортирует ../BaseIcon/style.css, а файла нет')

		rmSync(join(root, 'dist/components/BaseButton/index.js'))
		expect(run().output).toContain('нет dist/components/BaseButton/index.js')
	})
})
