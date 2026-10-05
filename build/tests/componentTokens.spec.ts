/** Токены компонентов: scripts/check-component-tokens.mjs на временном репозитории. */

import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'

const SCRIPT = resolve(import.meta.dirname, '../../scripts/check-component-tokens.mjs')
const DOC = 'docs/design/COMPONENT_TOKENS.md'

let root = ''

const write = (file: string, content: string) => {
	mkdirSync(dirname(join(root, file)), { recursive: true })
	writeFileSync(join(root, file), content)
}

function run(...flags: string[]) {
	const result = spawnSync(process.execPath, [SCRIPT, `--root=${root}`, ...flags], { encoding: 'utf8' })
	return { status: result.status, output: `${result.stdout}${result.stderr}` }
}

const BUTTON = `.base-button {
	background: var(--custom-bg, #{ct(button, bg, var(--rise-primary))});
	color: ct('button', text-hover, var(--rise-on-primary));
	border-radius: var(--rise-button-radius, var(--rise-control-radius));
	padding: var(--rise-control-padding-y);
	&__label { font-weight: ct(button, label-font-weight, var(--rise-font-weight-medium)); }
}
`

beforeEach(() => {
	root = mkdtempSync(join(tmpdir(), 'component-tokens-'))
	write('src/styles/_tokens.scss', ':root { --rise-code-keyword: #000; --rise-primary: red; }\n')
	write('src/components/BaseButton/styles/BaseButton.style.scss', BUTTON)
	write(
		'src/components/BaseCode/styles/BaseCode.style.scss',
		'.c { color: var(--rise-code-keyword); fill: var(--rise-code-#{$type}); }\n',
	)
	write('src/components/BaseDropdownMenu/styles/parts/Menu.scss', '.m { gap: ct(dropdown-menu, item-gap, 4px); }\n')
	write('src/components/BaseDropdown/styles/BaseDropdown.style.scss', '.d { gap: ct(dropdown, gap, 4px); }\n')
})

afterEach(() => {
	rmSync(root, { recursive: true, force: true })
})

describe('check-component-tokens', () => {
	it('--write пишет таблицу по компонентам: часть, свойство, состояние, запасное значение; затем проверка зелёная', () => {
		expect(run('--write').status).toBe(0)
		const doc = readFileSync(join(root, DOC), 'utf8')

		expect(doc).toContain('## BaseButton')
		expect(doc).toContain('| `--rise-button-bg` | корень | bg | — | `var(--rise-primary)` |')
		expect(doc).toContain('| `--rise-button-text-hover` | корень | text | hover | `var(--rise-on-primary)` |')
		expect(doc).toContain('| `--rise-button-label-font-weight` | label | font-weight | — |')
		expect(doc).toContain('| `--rise-button-radius` | корень | radius | — | `var(--rise-control-radius)` |')
		expect(doc).toContain('## BaseDropdownMenu')
		expect(doc).toContain('`--rise-dropdown-menu-item-gap` | item | gap')
		expect(doc).not.toContain('BaseCode')
		expect(doc).not.toContain('--rise-primary` |')

		const { status, output } = run()
		expect(status).toBe(0)
		expect(output).toContain('6 в 3 компонентах')
	})

	it('без таблицы или с устаревшей — ошибка с подсказкой', () => {
		expect(run().output).toContain(`${DOC} устарел`)
		run('--write')
		write('src/components/BaseDropdown/styles/BaseDropdown.style.scss', '.d { gap: ct(dropdown, height, 4px); }\n')
		const { status, output } = run()
		expect(status).toBe(1)
		expect(output).toContain('--write')
	})

	it('токен другого компонента, свойство вне словаря, нет запасного значения, объявление токена — ошибки с местом', () => {
		write(
			'src/components/BaseDropdown/styles/BaseDropdown.style.scss',
			[
				'.d {',
				'	color: var(--rise-button-text, red);',
				'	color: ct(dropdown, colour, red);',
				'	color: var(--rise-dropdown-bg);',
				'	--rise-dropdown-bg: red;',
				'}',
			].join('\n'),
		)
		const { status, output } = run('--write')

		expect(status).toBe(1)
		expect(output).toContain('BaseDropdown.style.scss:2: --rise-button-text — не токен BaseDropdown (ожидается --rise-dropdown-…)')
		expect(output).toContain('BaseDropdown.style.scss:3: --rise-dropdown-colour — свойство не из словаря')
		expect(output).toContain('BaseDropdown.style.scss:4: --rise-dropdown-bg — нет запасного значения')
		expect(output).toContain('BaseDropdown.style.scss:5: токен компонента объявлен — --rise-dropdown-bg')
	})

	it('ct() с переменной Sass в имени и var() с интерполяцией не разбираются', () => {
		write(
			'src/components/BaseDropdown/styles/BaseDropdown.style.scss',
			'.d { color: ct($component, bg, red); fill: var(--rise-dropdown-#{$x}); }\n',
		)
		expect(run('--write').status).toBe(0)
		expect(readFileSync(join(root, DOC), 'utf8')).not.toContain('BaseDropdown\n')
	})

	it('пустой кит — таблица с пояснением', () => {
		rmSync(join(root, 'src/components'), { recursive: true })
		expect(run('--write').status).toBe(0)
		expect(readFileSync(join(root, DOC), 'utf8')).toContain('Пока ни один компонент не читает токены уровня 3.')
	})
})
