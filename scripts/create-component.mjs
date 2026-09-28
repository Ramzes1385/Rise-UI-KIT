/**
 * Создаёт заготовку нового компонента по структуре библиотеки и регистрирует его.
 *
 * Использование:
 *   npm run create:component -- <Имя> --group=<Раздел Storybook> [--kind=display|interactive|form]
 *     [--variants=default,soft,outline,ghost] [--loading] [--empty] [--long] [--no-lint] [--dry-run]
 *
 * Примеры:
 *   npm run create:component -- Kbd --group=Element
 *   npm run create:component -- InputNumber --group=Form --kind=form --long
 *
 * Виды:
 *   display     — отображение без взаимодействия: корень div, слот default или label.
 *   interactive — кнопкоподобный элемент: нативная <button>, событие click, isDisabled.
 *   form        — поле формы: подпись, нативное поле, v-model, isDisabled, error с aria-describedby.
 *
 * Что создаётся (src/components/Base<Имя>/): index.ts, model/*.types.ts, ui/*.vue, styles/*.style.scss,
 * stories/*.stories.ts, __tests__/*.spec.ts (+ integration для interactive и form) и *.visual.spec.ts.
 * Регистрация: src/components/index.ts, src/plugin.ts, наборы в scripts/check-a11y-coverage.mjs.
 *
 * Заготовка рабочая: проходит lint, типы, тесты и покрытие. Места, которые автор обязан заполнить
 * (назначение, варианты, размеры), помечены TODO(scaffold) — проверка stories не пройдёт, пока они остаются.
 */

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

const ROOT = resolve(process.cwd())
const COMPONENTS_DIR = join(ROOT, 'src/components')
const TODO = 'TODO(scaffold)'
const KINDS = ['display', 'interactive', 'form']
const KNOWN_VARIANTS = ['default', 'soft', 'outline', 'ghost', 'shadow']

// ─── Аргументы ────────────────────────────────────────────────────────────────

function fail(message) {
	console.error(`❌ ${message}`)
	process.exit(1)
}

function parseArgs(argv) {
	const options = { kind: 'display', variants: 'default,soft,outline,ghost', lint: true, dryRun: false }
	const positional = []
	for (const arg of argv) {
		if (!arg.startsWith('--')) {
			positional.push(arg)
			continue
		}
		const [key, value] = arg.slice(2).split('=')
		if (key === 'no-lint') options.lint = false
		else if (key === 'dry-run') options.dryRun = true
		else if (['loading', 'empty', 'long'].includes(key)) options[key] = true
		else if (['group', 'kind', 'variants'].includes(key) && value) options[key] = value
		else fail(`Неизвестный или пустой параметр: ${arg}`)
	}
	if (positional.length !== 1) fail('Укажите одно имя компонента, например: npm run create:component -- Kbd --group=Element')
	return { rawName: positional[0], ...options }
}

function readStoryGroups() {
	const preview = readFileSync(join(ROOT, 'build/storybook/preview.ts'), 'utf-8')
	const order = preview.match(/order:\s*\[([\s\S]*?)\n\t*\],/)
	if (!order) fail('Не найден storySort.order в build/storybook/preview.ts')
	return [...order[1].matchAll(/^\t*'([^']+)',/gm)].map(match => match[1])
}

// ─── Имена ────────────────────────────────────────────────────────────────────

function buildNames(rawName, group) {
	const short = rawName.replace(/^Base/, '')
	if (!/^[A-Z][A-Za-z0-9]*$/.test(short)) fail(`Имя должно быть в PascalCase без пробелов: ${rawName}`)
	const name = `Base${short}`
	const words = short.split(/(?=[A-Z])/)
	return {
		name,
		short,
		kebab: `base-${words.map(word => word.toLowerCase()).join('-')}`,
		constName: `${words.map(word => word.toUpperCase()).join('_')}_VARIANTS`,
		title: `${group}/${name}`,
		storyId: `${group.toLowerCase()}-${name.toLowerCase()}`,
	}
}

// ─── Шаблоны: модель ──────────────────────────────────────────────────────────

function typesTemplate(n, kind, variants) {
	const props = {
		display: ['\t/** Текст (заменяется слотом default) */', '\tlabel?: string'],
		interactive: [
			'\t/** Текст (заменяется слотом default) */',
			'\tlabel?: string',
			'\t/** Отключает элемент: он не получает фокус и не эмитит click */',
			'\tisDisabled?: boolean',
		],
		form: [
			'\t/** Значение поля (v-model) */',
			'\tmodelValue?: string',
			'\t/** Подпись поля, связанная с ним через for/id */',
			'\tlabel?: string',
			'\t/** Подсказка в пустом поле */',
			'\tplaceholder?: string',
			'\t/** Текст ошибки: показывается под полем и связывается через aria-describedby */',
			'\terror?: string',
			'\t/** Отключает поле */',
			'\tisDisabled?: boolean',
		],
	}[kind]
	const emits = {
		display: null,
		interactive: ['\t/** Клик или активация с клавиатуры (Enter, Space) */', "\t(event: 'click', e: MouseEvent): void"],
		form: ['\t/** Новое значение при вводе */', "\t(event: 'update:modelValue', value: string): void"],
	}[kind]
	const slotLine = kind === 'form' ? null : ['\t/** Содержимое вместо label */', '\tdefault?: () => unknown']
	const keys = kind === 'form' ? "'root' | 'label' | 'control' | 'error'" : "'root'"
	return [
		"import type { BaseComponentProps } from '@composables/useBaseComponent'",
		'',
		'/**',
		` * Варианты оформления ${n.name}. ${TODO}: опишите, чем отличаются варианты.`,
		' */',
		`export const ${n.constName} = [${variants.map(variant => `'${variant}'`).join(', ')}] as const`,
		'',
		'/**',
		` * Пропсы компонента ${n.name}`,
		' */',
		`export interface ${n.name}Props extends BaseComponentProps<(typeof ${n.constName})[number], ${keys}> {`,
		...props,
		'}',
		...(emits ? ['', '/**', ` * События компонента ${n.name}`, ' */', `export interface ${n.name}Emits {`, ...emits, '}'] : []),
		...(slotLine ? ['', '/**', ` * Слоты компонента ${n.name}`, ' */', `export interface ${n.name}Slots {`, ...slotLine, '}'] : []),
		'',
	].join('\n')
}

function indexTemplate(n, kind) {
	const types = [`${n.name}Props`]
	if (kind !== 'display') types.unshift(`${n.name}Emits`)
	if (kind !== 'form') types.push(`${n.name}Slots`)
	return [
		`export { ${n.constName} } from './model/${n.name}.types'`,
		`export type { ${types.join(', ')} } from './model/${n.name}.types'`,
		`export { default as ${n.name} } from './ui/${n.name}.vue'`,
		'',
	].join('\n')
}

// ─── Шаблоны: компонент ───────────────────────────────────────────────────────

function vueTemplate(n, kind) {
	const root = '[variantClass, classes.root]'
	const style = '[sizeScaleStyle, variantStyle, customColorStyle]'
	const imports = [
		...(kind === 'form' ? ["import { computed, useId } from 'vue'"] : []),
		"import { useStandardBaseComponent } from '@composables/useBaseComponent'",
		"import { SIZE_SCALE_DEFAULT } from '@constants'",
		`import '../styles/${n.name}.style.scss'`,
		`import type { ${[kind !== 'display' && `${n.name}Emits`, `${n.name}Props`, kind !== 'form' && `${n.name}Slots`].filter(Boolean).join(', ')} } from '../model/${n.name}.types'`,
	]
	const keys = kind === 'form' ? "['root', 'label', 'control', 'error']" : "['root']"
	const setup = [
		`const props = withDefaults(defineProps<${n.name}Props>(), {`,
		'\tsizeScale: SIZE_SCALE_DEFAULT,',
		'})',
		'',
		...(kind !== 'display' ? [`const emit = defineEmits<${n.name}Emits>()`] : []),
		...(kind !== 'form' ? [`defineSlots<${n.name}Slots>()`] : []),
		'',
		`const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('${n.kebab}', props, ${keys})`,
	]
	if (kind === 'display') {
		return [
			'<template>',
			`\t<div class="${n.kebab}" :class="${root}" :style="${style}">`,
			'\t\t<slot>{{ label }}</slot>',
			'\t</div>',
			'</template>',
			'',
			'<script setup lang="ts">',
			...imports,
			'',
			...setup,
			'</script>',
			'',
		].join('\n')
	}
	if (kind === 'interactive') {
		return [
			'<template>',
			'\t<button',
			'\t\ttype="button"',
			`\t\tclass="${n.kebab}"`,
			`\t\t:class="${root}"`,
			`\t\t:style="${style}"`,
			'\t\t:disabled="isDisabled"',
			'\t\t@click="handleClick">',
			'\t\t<slot>{{ label }}</slot>',
			'\t</button>',
			'</template>',
			'',
			'<script setup lang="ts">',
			...imports,
			'',
			...setup,
			'',
			'function handleClick(e: MouseEvent): void {',
			"\temit('click', e)",
			'}',
			'</script>',
			'',
		].join('\n')
	}
	return [
		'<template>',
		'\t<div',
		`\t\tclass="${n.kebab}"`,
		`\t\t:class="[variantClass, classes.root, { '${n.kebab}--error': Boolean(error), '${n.kebab}--disabled': isDisabled }]"`,
		`\t\t:style="${style}">`,
		`\t\t<label v-if="label" class="${n.kebab}__label" :class="classes.label" :for="controlId">{{ label }}</label>`,
		'\t\t<input',
		'\t\t\t:id="controlId"',
		`\t\t\tclass="${n.kebab}__control"`,
		'\t\t\t:class="classes.control"',
		'\t\t\t:value="modelValue"',
		'\t\t\t:placeholder="placeholder"',
		'\t\t\t:disabled="isDisabled"',
		'\t\t\t:aria-invalid="error ? true : undefined"',
		'\t\t\t:aria-describedby="describedBy"',
		'\t\t\t@input="handleInput" />',
		`\t\t<p v-if="error" :id="errorId" class="${n.kebab}__error" :class="classes.error">{{ error }}</p>`,
		'\t</div>',
		'</template>',
		'',
		'<script setup lang="ts">',
		...imports,
		'',
		...setup,
		'',
		'const controlId = useId()',
		'const errorId = `${controlId}-error`',
		'const describedBy = computed(() => (props.error ? errorId : undefined))',
		'',
		'function handleInput(event: Event): void {',
		"\temit('update:modelValue', (event.target as HTMLInputElement).value)",
		'}',
		'</script>',
		'',
	].join('\n')
}

// ─── Шаблоны: стили ───────────────────────────────────────────────────────────

const VARIANT_STYLES = {
	soft: ['border-color: transparent;', '@include custom-bg(background-color, var(--rise-bg-elevated));'],
	outline: ['border-color: var(--rise-border-accented);', '@include custom-bg(background-color, transparent);'],
	ghost: ['border-color: transparent;', '@include custom-bg(background-color, transparent);'],
	shadow: ['border-color: var(--rise-border);', 'box-shadow: var(--rise-shadow-sm);'],
}

function variantBlocks(variants, selector, indent) {
	return variants
		.filter(variant => variant !== 'default')
		.flatMap(variant => {
			const body = VARIANT_STYLES[variant] ?? [`// ${TODO}: стили варианта ${variant}.`]
			return ['', `${indent}${selector(variant)} {`, ...body.map(line => `${indent}\t${line}`), `${indent}}`]
		})
}

function styleTemplate(n, kind, variants) {
	const header = [
		`// ${n.name}. ${TODO}: назначение и размеры при sizeScale = 100 (высота, отступы, текст, радиус).`,
		`// Варианты: ${variants.join(', ')}. ${TODO}: чем отличается каждый.`,
	]
	if (kind === 'form') {
		return [
			...header,
			`.${n.kebab} {`,
			'\tdisplay: flex;',
			'\tflex-direction: column;',
			'\tgap: sz(6px);',
			'\twidth: 100%;',
			'\t@include custom-text(color, var(--rise-text-highlighted));',
			'',
			'\t&__label {',
			'\t\t@include field-label;',
			'\t}',
			'',
			'\t// Поле высотой 32px при sizeScale = 100: рамка 1px + отступ 5px + строка 20px.',
			'\t&__control {',
			'\t\tbox-sizing: border-box;',
			'\t\twidth: 100%;',
			'\t\tpadding: sz(var(--rise-control-padding-y)) sz(var(--rise-control-padding-x));',
			'\t\tcolor: inherit;',
			'\t\tfont: inherit;',
			'\t\toutline: none;',
			'\t\t@include control-text;',
			'\t\t@include field-box;',
			'',
			'\t\t&::placeholder {',
			'\t\t\tcolor: var(--rise-text-dimmed);',
			'\t\t\topacity: 1;',
			'\t\t}',
			'\t}',
			...variantBlocks(variants, variant => `&--${variant} &__control`, '\t'),
			'',
			'\t&--error &__control {',
			'\t\tborder-color: var(--rise-error);',
			'\t\t@include field-focus(var(--rise-error));',
			'\t}',
			'',
			'\t&--disabled &__control {',
			'\t\t@include disabled-state;',
			'\t}',
			'',
			'\t&__error {',
			'\t\tmargin: 0;',
			'\t\t@include field-error;',
			'\t}',
			'}',
			'',
		].join('\n')
	}
	const interactive = kind === 'interactive'
	return [
		...header,
		`.${n.kebab} {`,
		'\tdisplay: inline-flex;',
		'\talign-items: center;',
		'\tgap: sz(6px);',
		'\tbox-sizing: border-box;',
		'\tmax-width: 100%;',
		'\tmin-width: 0;',
		'\tpadding: sz(var(--rise-control-padding-y)) sz(var(--rise-control-padding-x));',
		'\tborder: 1px solid var(--rise-border);',
		'\tborder-radius: sz(var(--rise-radius-md));',
		...(interactive ? ['\tfont: inherit;', '\tcursor: pointer;'] : []),
		'\t@include control-text;',
		'\t@include custom-bg(background-color, var(--rise-bg));',
		'\t@include custom-text(color, var(--rise-text));',
		...(interactive
			? [
					'\t@include interactive;',
					'\t@include focus-ring;',
					'',
					'\t@include hover {',
					'\t\t@include custom-bg(background-color, var(--rise-bg-elevated));',
					'\t}',
					'',
					'\t&:disabled {',
					'\t\t@include disabled-state;',
					'\t}',
				]
			: []),
		...variantBlocks(variants, variant => `&--${variant}`, '\t'),
		'}',
		'',
	].join('\n')
}

// ─── Шаблоны: stories ─────────────────────────────────────────────────────────

function storiesTemplate(n, kind, variants, flags) {
	const helpers = ['ARG_GROUP', 'baseArgTypes', 'propGroup', 'SIZE_PRESETS', 'sizeLabel', 'useArgsWithoutSlots']
	if (kind !== 'form') helpers.push('slotArgType')
	if (kind === 'form') helpers.push('useModelArg')
	if (kind === 'interactive') helpers.push('tabTo')
	helpers.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))

	const argTypes = {
		display: ["\t\tlabel: { control: 'text', table: propGroup(ARG_GROUP.content) },", "\t\tdefault: slotArgType('Содержимое (заменяет label)'),"],
		interactive: [
			"\t\tlabel: { control: 'text', table: propGroup(ARG_GROUP.content) },",
			"\t\tisDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },",
			"\t\tdefault: slotArgType('Содержимое (заменяет label)'),",
		],
		form: [
			"\t\tmodelValue: { control: 'text', table: propGroup(ARG_GROUP.content) },",
			"\t\tlabel: { control: 'text', table: propGroup(ARG_GROUP.content) },",
			"\t\tplaceholder: { control: 'text', table: propGroup(ARG_GROUP.content) },",
			"\t\terror: { control: 'text', table: propGroup(ARG_GROUP.state) },",
			"\t\tisDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },",
		],
	}[kind]
	const args = {
		display: ["\t\tlabel: 'Пример',"],
		interactive: ["\t\tlabel: 'Пример',", '\t\tisDisabled: false,', '\t\tonClick: fn(),'],
		form: ["\t\tmodelValue: '',", "\t\tlabel: 'Название',", "\t\tplaceholder: 'Введите название',", '\t\tisDisabled: false,'],
	}[kind]
	const itemLabel = kind === 'form' ? ':label="variant"' : ':label="variant"'

	const lines = [
		'/**',
		` * ${n.name} — stories.`,
		' *',
		' * Разделы: Default (песочница) → внешний вид (варианты, размеры, кастомный цвет) → состояния → сценарии.',
		' */',
		'',
		`import { expect${kind === 'interactive' ? ', fn' : ''} } from 'storybook/test'`,
		`import { ${helpers.join(', ')} } from '@/stories/helpers'`,
		`import { ${n.constName} } from '../model/${n.name}.types'`,
		`import ${n.name} from '../ui/${n.name}.vue'`,
		"import type { Meta, StoryObj } from '@storybook/vue3-vite'",
		'',
		'const meta = {',
		`\ttitle: '${n.title}',`,
		`\tcomponent: ${n.name},`,
		'\tparameters: {',
		'\t\tdocs: {',
		'\t\t\tdescription: {',
		`\t\t\t\tcomponent: ['${TODO}: назначение компонента и когда его использовать.', '', '- Варианты, размеры при \`sizeScale\` = 100, доступность.'].join('\\n'),`,
		'\t\t\t},',
		'\t\t},',
		'\t},',
		'\targTypes: {',
		`\t\t...baseArgTypes({ variants: ${n.constName} }),`,
		...argTypes,
		'\t},',
		'\targs: {',
		...args,
		"\t\tvariant: 'default',",
		'\t\tsizeScale: 100,',
		'\t},',
		`} satisfies Meta<typeof ${n.name}>`,
		'',
		'export default meta',
		'type Story = StoryObj<typeof meta>',
		'',
		'// ─── Default ───────────────────────────────────────────────────────────────────',
		'',
	]

	if (kind === 'display') {
		lines.push(
			'/** Песочница: меняйте props в панели Controls. */',
			'export const Default: Story = {',
			'\tplay: async ({ canvas }) => {',
			"\t\tawait expect(canvas.getByText('Пример')).toBeVisible()",
			'\t},',
			'}',
		)
	} else if (kind === 'interactive') {
		lines.push(
			'/** Песочница: меняйте props в панели Controls. Элемент достижим клавишей Tab и срабатывает по Enter. */',
			'export const Default: Story = {',
			'\tplay: async ({ canvas, userEvent, args }) => {',
			"\t\tconst control = canvas.getByRole('button', { name: 'Пример' })",
			'\t\tawait tabTo(control, userEvent)',
			"\t\tawait userEvent.keyboard('{Enter}')",
			'\t\tawait expect(args.onClick).toHaveBeenCalledOnce()',
			'\t},',
			'}',
		)
	} else {
		lines.push(
			'/** Песочница: v-model связан с Controls — введённый текст появляется в панели. */',
			'export const Default: Story = {',
			'\trender: args => {',
			'\t\tconst onUpdate = useModelArg()',
			'\t\treturn {',
			`\t\t\tcomponents: { ${n.name} },`,
			'\t\t\tsetup: () => ({ args, onUpdate }),',
			`\t\t\ttemplate: '<${n.name} v-bind="args" @update:model-value="onUpdate" />',`,
			'\t\t}',
			'\t},',
			'\tplay: async ({ canvas, userEvent }) => {',
			"\t\tconst field = canvas.getByLabelText('Название')",
			'\t\tawait userEvent.tab()',
			'\t\tawait expect(field).toHaveFocus()',
			"\t\tawait userEvent.type(field, 'Отчёт')",
			"\t\tawait expect(field).toHaveValue('Отчёт')",
			'\t},',
			'}',
		)
	}

	lines.push(
		'',
		'// ─── Внешний вид ───────────────────────────────────────────────────────────────',
		'',
		'/** Все варианты оформления. Размер из Controls применяется ко всем. */',
		'export const Variants: Story = {',
		"\tparameters: { controls: { include: ['sizeScale'] } },",
		'\trender: args => ({',
		`\t\tcomponents: { ${n.name} },`,
		`\t\tsetup: () => ({ props: useArgsWithoutSlots(args), variants: ${n.constName} }),`,
		`\t\ttemplate: '<div class="story-row"><${n.name} v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" ${itemLabel} /></div>',`,
		'\t}),',
		'}',
		'',
		'/** Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125. */',
		'export const Sizes: Story = {',
		"\tparameters: { controls: { include: ['variant'] } },",
		'\trender: args => ({',
		`\t\tcomponents: { ${n.name} },`,
		'\t\tsetup: () => ({ props: useArgsWithoutSlots(args), presets: SIZE_PRESETS, sizeLabel }),',
		`\t\ttemplate: '<div class="story-row"><${n.name} v-for="preset in presets" :key="preset.name" v-bind="props" :size-scale="preset.sizeScale" :label="sizeLabel(preset)" /></div>',`,
		'\t}),',
		'}',
		'',
		'/** Кастомный цвет через `color`. Для статусов берите токены ролей: `var(--rise-success-soft)`. */',
		'export const CustomColor: Story = {',
		"\targs: { color: { bg: { base: '#6d28d9' }, text: { base: '#ffffff' } } },",
		'\tplay: async ({ canvasElement }) => {',
		`\t\tconst element = canvasElement.querySelector('${kind === 'form' ? `.${n.kebab}__control` : `.${n.kebab}`}') as HTMLElement`,
		"\t\tawait expect(getComputedStyle(element).backgroundColor).toBe('rgb(109, 40, 217)')",
		'\t},',
		'}',
	)

	if (kind !== 'display') {
		lines.push(
			'',
			'// ─── Состояния ─────────────────────────────────────────────────────────────────',
			'',
			`/** Отключённ${kind === 'form' ? 'ое поле' : 'ый элемент'}: не получает фокус и не реагирует на ввод. */`,
			'export const Disabled: Story = {',
			'\targs: { isDisabled: true },',
			'\tplay: async ({ canvas }) => {',
			kind === 'form' ? "\t\tawait expect(canvas.getByLabelText('Название')).toBeDisabled()" : "\t\tawait expect(canvas.getByRole('button', { name: 'Пример' })).toBeDisabled()",
			'\t},',
			'}',
		)
	}
	if (kind === 'form') {
		lines.push(
			'',
			'/** Ошибка: текст под полем связан с ним через `aria-describedby`, поле помечено `aria-invalid`. */',
			'export const WithError: Story = {',
			"\targs: { error: 'Заполните название' },",
			'\tplay: async ({ canvas }) => {',
			"\t\tconst field = canvas.getByLabelText('Название')",
			"\t\tawait expect(field).toHaveAccessibleDescription('Заполните название')",
			"\t\tawait expect(field).toHaveAttribute('aria-invalid', 'true')",
			'\t},',
			'}',
		)
	}
	const stubs = [
		flags.loading && ['Loading', 'состояние загрузки'],
		flags.empty && ['Empty', 'пустое состояние'],
		flags.long && ['LongContent', 'длинное содержимое: перенос или обрезка, ширина не больше контейнера'],
	].filter(Boolean)
	for (const [story, description] of stubs) {
		lines.push('', `/** ${TODO}: ${description}. */`, `export const ${story}: Story = {}`)
	}
	lines.push('')
	return lines.join('\n')
}

// ─── Шаблоны: тесты ───────────────────────────────────────────────────────────

function unitSpecTemplate(n, kind) {
	const variantToCheck = 'soft'
	const labelProps = kind === 'form' ? "{ label: 'Название' }" : "{ label: 'Пример' }"
	const rootSelector = `.${n.kebab}`
	const lines = [
		'/**',
		` * Unit-тесты ${n.name}: рендер, варианты, масштаб, классы${kind === 'form' ? ', связь подписи и ошибки с полем' : ''}.`,
		' */',
		'',
		"import '@testing-library/jest-dom/vitest'",
		`import { ${kind === 'display' ? '' : 'fireEvent, '}render, screen } from '@testing-library/vue'`,
		`import ${n.name} from '../ui/${n.name}.vue'`,
		'',
		`describe('${n.name} unit', () => {`,
	]
	if (kind === 'form') {
		lines.push(
			"\tit('связывает подпись с полем', () => {",
			`\t\trender(${n.name}, { props: ${labelProps} })`,
			"\t\texpect(screen.getByLabelText('Название')).toBeInTheDocument()",
			'\t})',
			'',
			"\tit('эмитит update:modelValue при вводе', async () => {",
			`\t\tconst { emitted } = render(${n.name}, { props: ${labelProps} })`,
			"\t\tawait fireEvent.update(screen.getByLabelText('Название'), 'Отчёт')",
			"\t\texpect(emitted()['update:modelValue']).toEqual([['Отчёт']])",
			'\t})',
			'',
			"\tit('связывает ошибку с полем и помечает его невалидным', () => {",
			`\t\trender(${n.name}, { props: { label: 'Название', error: 'Заполните название' } })`,
			"\t\tconst field = screen.getByLabelText('Название')",
			"\t\texpect(field).toHaveAccessibleDescription('Заполните название')",
			"\t\texpect(field).toHaveAttribute('aria-invalid', 'true')",
			'\t})',
			'',
			"\tit('без ошибки не ставит aria-invalid и aria-describedby', () => {",
			`\t\trender(${n.name}, { props: ${labelProps} })`,
			"\t\tconst field = screen.getByLabelText('Название')",
			"\t\texpect(field).not.toHaveAttribute('aria-invalid')",
			"\t\texpect(field).not.toHaveAttribute('aria-describedby')",
			'\t})',
			'',
			"\tit('отключает поле при isDisabled', () => {",
			`\t\trender(${n.name}, { props: { label: 'Название', isDisabled: true } })`,
			"\t\texpect(screen.getByLabelText('Название')).toBeDisabled()",
			'\t})',
		)
	} else {
		lines.push(
			"\tit('рендерит label', () => {",
			`\t\trender(${n.name}, { props: ${labelProps} })`,
			"\t\texpect(screen.getByText('Пример')).toBeInTheDocument()",
			'\t})',
			'',
			"\tit('слот default заменяет label', () => {",
			`\t\trender(${n.name}, { props: ${labelProps}, slots: { default: 'Из слота' } })`,
			"\t\texpect(screen.getByText('Из слота')).toBeInTheDocument()",
			"\t\texpect(screen.queryByText('Пример')).not.toBeInTheDocument()",
			'\t})',
		)
		if (kind === 'interactive') {
			lines.push(
				'',
				"\tit('эмитит click', async () => {",
				`\t\tconst { emitted } = render(${n.name}, { props: ${labelProps} })`,
				"\t\tawait fireEvent.click(screen.getByRole('button', { name: 'Пример' }))",
				"\t\texpect(emitted()).toHaveProperty('click')",
				'\t})',
				'',
				"\tit('отключает кнопку при isDisabled', () => {",
				`\t\trender(${n.name}, { props: { label: 'Пример', isDisabled: true } })`,
				"\t\texpect(screen.getByRole('button', { name: 'Пример' })).toBeDisabled()",
				'\t})',
			)
		}
	}
	lines.push(
		'',
		"\tit('добавляет модификатор варианта, кроме default', () => {",
		`\t\tconst { container } = render(${n.name}, { props: { variant: '${variantToCheck}' } })`,
		`\t\texpect(container.querySelector('${rootSelector}')).toHaveClass('${n.kebab}--${variantToCheck}')`,
		'\t})',
		'',
		"\tit('пишет --size-scale только при масштабе, отличном от 100', () => {",
		`\t\tconst { container } = render(${n.name}, { props: { sizeScale: 125 } })`,
		`\t\texpect((container.querySelector('${rootSelector}') as HTMLElement).style.getPropertyValue('--size-scale')).toBe('1.25')`,
		'\t})',
		'',
		"\tit('добавляет customClass к корню', () => {",
		`\t\tconst { container } = render(${n.name}, { props: { customClass: { root: 'my-root' } } })`,
		`\t\texpect(container.querySelector('${rootSelector}')).toHaveClass('my-root')`,
		'\t})',
		'})',
		'',
	)
	return lines.join('\n')
}

function integrationSpecTemplate(n, kind) {
	if (kind === 'display') return null
	const lines = [
		'/**',
		` * Integration-тесты ${n.name}: работа с клавиатуры через user-event.`,
		' */',
		'',
		"import '@testing-library/jest-dom/vitest'",
		"import userEvent from '@testing-library/user-event'",
		"import { render, screen } from '@testing-library/vue'",
		`import ${n.name} from '../ui/${n.name}.vue'`,
		'',
		`describe('${n.name} integration', () => {`,
	]
	if (kind === 'interactive') {
		lines.push(
			"\tit('срабатывает по Tab и Enter', async () => {",
			'\t\tconst user = userEvent.setup()',
			`\t\tconst { emitted } = render(${n.name}, { props: { label: 'Пример' } })`,
			'\t\tawait user.tab()',
			"\t\texpect(screen.getByRole('button', { name: 'Пример' })).toHaveFocus()",
			"\t\tawait user.keyboard('{Enter}')",
			"\t\texpect(emitted()).toHaveProperty('click')",
			'\t})',
		)
	} else {
		lines.push(
			"\tit('эмитит текущее значение поля при каждом введённом символе', async () => {",
			'\t\tconst user = userEvent.setup()',
			`\t\tconst { emitted } = render(${n.name}, { props: { label: 'Название' } })`,
			"\t\tawait user.type(screen.getByLabelText('Название'), 'ab')",
			"\t\texpect(emitted()['update:modelValue']).toEqual([['a'], ['ab']])",
			'\t})',
		)
	}
	lines.push('})', '')
	return lines.join('\n')
}

function visualSpecTemplate(n, kind) {
	const stories = ['variants', 'sizes', ...(kind === 'form' ? ['disabled', 'with-error'] : [])]
	return [
		'/**',
		` * Visual regression ${n.name}: ключевые stories в светлой и тёмной теме.`,
		' */',
		'',
		"import { test } from '@playwright/test'",
		"import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'",
		'',
		`const STORIES = [${stories.map(story => `'${story}'`).join(', ')}] as const`,
		'',
		'for (const theme of VISUAL_THEMES) {',
		`\ttest.describe(\`${n.name} · \${theme}\`, () => {`,
		'\t\tfor (const story of STORIES) {',
		'\t\t\ttest(story, async ({ page }) => {',
		`\t\t\t\tawait openStory(page, \`${n.storyId}--\${story}\`, { theme, height: 200 })`,
		`\t\t\t\tawait expectStoryScreenshot(page, \`${n.kebab}-\${story}-\${theme}.png\`)`,
		'\t\t\t})',
		'\t\t}',
		'\t})',
		'}',
		'',
	].join('\n')
}

// ─── Регистрация ──────────────────────────────────────────────────────────────

function registerInBarrel(n, changes) {
	const path = join(COMPONENTS_DIR, 'index.ts')
	const lines = readFileSync(path, 'utf-8').split('\n').filter(Boolean)
	lines.push(`export * from './${n.name}'`)
	lines.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
	changes.set(path, `${lines.join('\n')}\n`)
}

function registerInPlugin(n, changes) {
	const path = join(ROOT, 'src/plugin.ts')
	let source = readFileSync(path, 'utf-8')
	const importPattern = /^import \{ Base\w+ \} from '\.\/components\/Base\w+'$/gm
	const imports = source.match(importPattern) ?? []
	const lastImport = imports.at(-1)
	if (!lastImport) fail('В src/plugin.ts не найдены импорты компонентов')
	const sortedImports = [...imports, `import { ${n.name} } from './components/${n.name}'`].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
	const start = source.indexOf(imports[0])
	const end = source.indexOf(lastImport) + lastImport.length
	source = source.slice(0, start) + sortedImports.join('\n') + source.slice(end)

	const block = source.match(/const UI_COMPONENTS: Record<string, Component> = \{\n([\s\S]*?)\n\}/)
	if (!block) fail('В src/plugin.ts не найден объект UI_COMPONENTS')
	const entries = block[1].split('\n').concat(`\t${n.name},`).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
	source = source.replace(block[0], `const UI_COMPONENTS: Record<string, Component> = {\n${entries.join('\n')}\n}`)
	changes.set(path, source)
}

function registerInA11yGate(n, kind, flags, changes) {
	const path = join(ROOT, 'scripts/check-a11y-coverage.mjs')
	let source = readFileSync(path, 'utf-8')
	const sets = [
		kind !== 'display' && 'INTERACTIVE_COMPONENTS',
		kind !== 'display' && 'INTERACTIVE_WITH_DISABLED',
		kind === 'form' && 'FORM_COMPONENTS',
		flags.loading && 'LOADING_COMPONENTS',
		flags.empty && 'EMPTY_COMPONENTS',
		flags.long && 'LONG_CONTENT_COMPONENTS',
	].filter(Boolean)
	for (const set of sets) {
		const pattern = new RegExp(`(const ${set} = new Set\\(\\[\\n[\\s\\S]*?)(\\n\\]\\))`)
		if (!pattern.test(source)) fail(`В scripts/check-a11y-coverage.mjs не найден набор ${set}`)
		source = source.replace(pattern, `$1\n  '${n.name}',$2`)
	}
	if (sets.length) changes.set(path, source)
	return sets
}

// ─── Запуск ───────────────────────────────────────────────────────────────────

function main() {
	const options = parseArgs(process.argv.slice(2))
	if (!KINDS.includes(options.kind)) fail(`--kind: одно из ${KINDS.join(', ')}`)
	const groups = readStoryGroups()
	if (!options.group) fail(`Укажите --group: ${groups.join(', ')}`)
	if (!groups.includes(options.group)) {
		fail(`Раздела «${options.group}» нет в storySort (build/storybook/preview.ts): ${groups.join(', ')}. Добавьте его туда.`)
	}
	const variants = options.variants.split(',').map(variant => variant.trim()).filter(Boolean)
	if (!variants.includes('default')) variants.unshift('default')
	for (const variant of variants) {
		if (!/^[a-z][a-z0-9-]*$/.test(variant)) fail(`Недопустимое имя варианта: ${variant}`)
	}

	const n = buildNames(options.rawName, options.group)
	const dir = join(COMPONENTS_DIR, n.name)
	if (existsSync(dir)) fail(`Компонент уже существует: src/components/${n.name}`)

	const flags = { loading: options.loading, empty: options.empty, long: options.long }
	const files = new Map([
		[join(dir, 'index.ts'), indexTemplate(n, options.kind)],
		[join(dir, `model/${n.name}.types.ts`), typesTemplate(n, options.kind, variants)],
		[join(dir, `ui/${n.name}.vue`), vueTemplate(n, options.kind)],
		[join(dir, `styles/${n.name}.style.scss`), styleTemplate(n, options.kind, variants)],
		[join(dir, `stories/${n.name}.stories.ts`), storiesTemplate(n, options.kind, variants, flags)],
		[join(dir, `__tests__/${n.name}.spec.ts`), unitSpecTemplate(n, options.kind)],
		[join(dir, `__tests__/${n.name}.integration.spec.ts`), integrationSpecTemplate(n, options.kind)],
		[join(dir, `__tests__/${n.name}.visual.spec.ts`), visualSpecTemplate(n, options.kind)],
	])
	const changes = new Map()
	registerInBarrel(n, changes)
	registerInPlugin(n, changes)
	const sets = registerInA11yGate(n, options.kind, flags, changes)

	const created = [...files].filter(([, content]) => content !== null)
	if (options.dryRun) {
		console.log(`[dry-run] ${n.name} (${options.kind}, ${n.title})`)
		created.forEach(([path]) => console.log(`  + ${path.replace(`${ROOT}/`, '')}`))
		changes.forEach((_, path) => console.log(`  ~ ${path.replace(`${ROOT}/`, '')}`))
		return
	}

	for (const [path, content] of created) {
		mkdirSync(dirname(path), { recursive: true })
		writeFileSync(path, content)
	}
	for (const [path, content] of changes) writeFileSync(path, content)

	if (options.lint) {
		const lintable = [...created.map(([path]) => path).filter(path => /\.(ts|vue)$/.test(path)), join(ROOT, 'src/plugin.ts'), join(COMPONENTS_DIR, 'index.ts')]
		try {
			execFileSync('npx', ['eslint', '--fix', ...lintable], { stdio: 'inherit', cwd: ROOT })
		} catch {
			console.warn('⚠️  eslint --fix нашёл замечания, которые нельзя исправить автоматически — посмотрите вывод выше.')
		}
	}

	console.log(`\n✅ Создан ${n.name} (${options.kind}) в разделе Storybook «${options.group}».`)
	console.log(`   Регистрация: src/components/index.ts, src/plugin.ts${sets.length ? `, check-a11y-coverage (${sets.join(', ')})` : ''}.`)
	console.log(`\nДальше:`)
	console.log(`  1. Заполните места с пометкой ${TODO} — без этого проверка stories не пройдёт.`)
	console.log('  2. Реализуйте компонент, дополните stories (состояния, сценарии) и тесты.')
	console.log(`  3. npm run lint && npm run typecheck && npx vitest run --config build/tests/vitest.config.ts --project unit-integration src/components/${n.name}`)
}

main()
