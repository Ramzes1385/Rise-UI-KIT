import { readFileSync } from 'node:fs'
import { STORY_STYLES } from '../render/storyStyles'
import { literal, staticStorySource, storySource, templateSource } from '../render/source'

const COMPONENT = {
	props: {
		variant: { type: String, default: () => 'default' },
		sizeScale: { type: Number, default: 100 },
		items: { type: Array, default: () => [] },
		label: { type: String },
		format: { type: Function, default: (value: number) => String(value) },
	},
}

const TEMPLATE = `
		<div style="max-width: 360px">
			<BasePhoneInput v-bind="args" v-model="phone" />
		</div>
	`

describe('код для «Show code»', () => {
	it('шаблон без общего отступа и пустой первой строки', () => {
		expect(templateSource('\n\t\t<a>\n\t\t\t<b />\n\t\t</a>\n\t')).toBe('<a>\n\t<b />\n</a>')
	})

	it('v-bind="args" — пропсы из Controls без значений по умолчанию, слотов и обработчиков; v-model — переменная', () => {
		const source = storySource({ template: TEMPLATE, imports: ['BasePhoneInput'], models: { phone: 'modelValue' } })
		const code = source.transform('', {
			args: {
				label: 'Телефон "дом"',
				variant: 'default',
				sizeScale: 125,
				items: [],
				isDisabled: true,
				isRequired: false,
				placeholder: undefined,
				onClick: () => undefined,
				default: 'Текст слота',
				modelValue: '+7916',
			},
			argTypes: { default: { table: { category: 'slots' } } },
			component: COMPONENT,
		})
		expect(code).toBe(
			[
				'<script setup lang="ts">',
				"import { ref } from 'vue'",
				"import { BasePhoneInput } from '@ramzes1385/rise-ui-kit'",
				'',
				"const phone = ref('+7916')",
				'</script>',
				'',
				'<template>',
				'\t<div style="max-width: 360px">',
				'\t\t<BasePhoneInput',
				'\t\t\tlabel="Телефон &quot;дом&quot;"',
				'\t\t\t:size-scale="125"',
				'\t\t\tis-disabled',
				'\t\t\t:is-required="false"',
				'\t\t\tv-model="phone" />',
				'\t</div>',
				'</template>',
			].join('\n'),
		)
	})

	it('длинные значения — константами, много пропсов — по одному на строку', () => {
		const source = storySource({ template: '<BaseTable v-bind="args" />', imports: ['BaseTable', 'TABLE_VARIANTS'], omit: ['rows'] })
		const code = source.transform('', {
			args: {
				columns: [
					{ key: 'name', title: 'Имя' },
					{ key: 'email', title: 'Почта' },
				],
				caption: 'Сотрудники отдела продаж и маркетинга',
				rows: [1],
				date: new Date('2025-05-15T10:30:00.000Z'),
			},
		})
		expect(code).toContain("import { BaseTable, TABLE_VARIANTS } from '@ramzes1385/rise-ui-kit'")
		expect(code).toContain("const columns = [{ key: 'name', title: 'Имя' }, { key: 'email', title: 'Почта' }]")
		expect(code).toContain(
			'\t<BaseTable\n\t\t:columns="columns"\n\t\tcaption="Сотрудники отдела продаж и маркетинга"\n\t\t:date="new Date(\'2025-05-15T10:30:00.000Z\')" />',
		)
		expect(code).not.toContain('rows')
	})

	it('классы-помощники историй — своим блоком <style scoped>, каждый один раз', () => {
		const source = storySource({
			template:
				'<div class="story-row" style="gap: 4px"><figure v-for="x in list" :key="x"><BaseBadge v-bind="args" /><figcaption class="story-label">{{ x }}</figcaption></figure><span class="story-label other" /></div>',
			imports: ['BaseBadge'],
		})
		const code = source.transform('', { args: {} })
		expect(code.slice(code.indexOf('</template>'))).toBe(
			[
				'</template>',
				'',
				'<style scoped>',
				'.story-row {',
				'\tdisplay: flex;',
				'\tflex-wrap: wrap;',
				'\talign-items: center;',
				'\tgap: 12px;',
				'}',
				'',
				'.story-label {',
				'\tmin-width: 88px;',
				'\tfont-size: 12px;',
				'\tline-height: 16px;',
				'\tcolor: var(--rise-text-muted);',
				'}',
				'</style>',
			].join('\n'),
		)
		expect(storySource({ template: '<BaseBadge v-bind="args" />', imports: ['BaseBadge'] }).transform('', { args: {} })).not.toContain(
			'<style',
		)
	})

	it('правила классов-помощников совпадают с build/storybook/preview.scss', () => {
		const scss = readFileSync('build/storybook/preview.scss', 'utf8')
		for (const [name, rules] of Object.entries(STORY_STYLES)) {
			const block = new RegExp(`\\.${name} \\{([^}]*)\\}`).exec(scss)?.[1] ?? ''
			expect(block.replace(/\s+/g, ' ').trim(), name).toBe(rules)
		}
	})

	it('{{ slots.default }} — текст слота из Controls прямо в теге, с экранированием', () => {
		const source = storySource({ template: '<BaseCard v-bind="args">{{ slots.default }}</BaseCard>', imports: ['BaseCard'] })
		expect(source.transform('', { args: { title: 'Отчёт', default: 'Выручка < план & рост' } })).toContain(
			'<BaseCard title="Отчёт">Выручка &lt; план &amp; рост</BaseCard>',
		)
		expect(source.transform('', { args: {} })).toContain('<BaseCard></BaseCard>')
	})

	it('vue — импорты из vue для строк script, вместе с ref для v-model', () => {
		const code = storySource({
			template: '<BaseInput v-bind="args" v-model="text" @focus="count++" />',
			imports: ['BaseInput'],
			models: { text: 'modelValue' },
			vue: ['ref', 'computed'],
			importsFrom: { '@ramzes1385/rise-ui-kit/composables': ['useToast', 'createColorMode'] },
			script: 'const count = ref(0)',
		}).transform('', { args: { modelValue: 'а' } })
		expect(code).toContain(
			[
				"import { computed, ref } from 'vue'",
				"import { BaseInput } from '@ramzes1385/rise-ui-kit'",
				"import { createColorMode, useToast } from '@ramzes1385/rise-ui-kit/composables'",
			].join('\n'),
		)
		expect(code).toContain("const text = ref('а')\n\nconst count = ref(0)")
	})

	it('картинки data URI — константами, даже если коротки', () => {
		const source = storySource({ template: '<BaseImageCompare v-bind="args" />', imports: ['BaseImageCompare'] })
		const code = source.transform('', {
			args: { before: 'data:image/png;base64,AAAA', after: `data:image/svg+xml,${'%3Csvg'.repeat(20)}` },
		})
		expect(code).toContain("const before = 'data:image/png;base64,AAAA'\nconst after = 'data:image/svg+xml,…'")
		expect(code).toContain('<BaseImageCompare :before="before" :after="after" />')
	})

	it('в длинном теге каждый атрибут — на своей строке, значения в кавычках не разрываются', () => {
		const source = storySource({
			template: '<BaseChip v-for="variant in CHIP_VARIANTS" :key="variant" v-bind="args" :variant="variant" style="margin: 0 4px" />',
			imports: ['BaseChip', 'CHIP_VARIANTS'],
		})
		expect(source.transform('', { args: { label: 'Метка для проверки переноса длинного тега' } })).toContain(
			[
				'\t<BaseChip',
				'\t\tv-for="variant in CHIP_VARIANTS"',
				'\t\t:key="variant"',
				'\t\tlabel="Метка для проверки переноса длинного тега"',
				'\t\t:variant="variant"',
				'\t\tstyle="margin: 0 4px" />',
			].join('\n'),
		)
	})

	it('история без Controls: код один, данные — строками script', () => {
		const { code } = staticStorySource({
			template: '<BaseQrCode :value="link" />',
			imports: ['BaseQrCode'],
			script: "\n\t\tconst link = 'https://example.com'\n\t",
		})
		expect(code).toBe(
			[
				'<script setup lang="ts">',
				"import { BaseQrCode } from '@ramzes1385/rise-ui-kit'",
				'',
				"const link = 'https://example.com'",
				'</script>',
				'',
				'<template>',
				'\t<BaseQrCode :value="link" />',
				'</template>',
			].join('\n'),
		)
	})

	it('литералы: кавычки, переносы, data URI, пустые и вложенные значения, длинные списки', () => {
		expect(literal("д'Артаньян\nи \\")).toBe("'д\\'Артаньян\\nи \\\\'")
		expect(literal(`data:image/svg+xml;charset=utf-8,${'%3Csvg'.repeat(20)}`)).toBe("'data:image/svg+xml;charset=utf-8,…'")
		expect(literal([])).toBe('[]')
		expect(literal({})).toBe('{}')
		expect(literal({ 'data-id': 1, ok: null, avatar: undefined })).toBe("{ 'data-id': 1, ok: null }")
		expect(literal(Array.from({ length: 12 }, (_, index) => ({ id: `item-${index}` })))).toMatch(/^\[\n\t\{ id: 'item-0' \},\n/)
	})

	it('v-bind="args" на своей строке — пропсы на своих строках; что тег задаёт сам, из Controls не повторяется', () => {
		const source = storySource({
			template: [
				'<div>',
				'\t<BaseAlert',
				'\t\tv-for="type in TYPES"',
				'\t\t:key="type"',
				'\t\tv-bind="args"',
				'\t\t:type="type"',
				'\t\ttitle="Заголовок"',
				'\t/>',
				'</div>',
			].join('\n'),
			imports: ['BaseAlert'],
		})
		const template = (args: Record<string, unknown>): string => {
			const code = source.transform('', { args })
			return code.slice(code.indexOf('<template>'))
		}
		expect(template({ title: 'Из Controls', type: 'info', isClosable: true, description: 'Текст' })).toBe(
			[
				'<template>',
				'\t<div>',
				'\t\t<BaseAlert',
				'\t\t\tv-for="type in TYPES"',
				'\t\t\t:key="type"',
				'\t\t\tis-closable',
				'\t\t\tdescription="Текст"',
				'\t\t\t:type="type"',
				'\t\t\ttitle="Заголовок"',
				'\t\t/>',
				'\t</div>',
				'</template>',
			].join('\n'),
		)
		expect(template({ title: 'Из Controls' })).toContain('\t\t\t:key="type"\n\t\t\t:type="type"')
		const model = storySource({ template: '<BaseInput v-bind="args" v-model="text" />', imports: ['BaseInput'] })
		expect(model.transform('', { args: { modelValue: 'а', label: 'Имя' } })).toContain('<BaseInput label="Имя" v-model="text" />')
	})

	it('несколько v-bind="args" в строке с текстом — пропсы в каждом теге, без переноса строки', () => {
		const source = storySource({
			template: '<p>Нажмите <BaseKbd v-bind="args" value="meta" /> + <BaseKbd v-bind="args" value="K" />, чтобы найти</p>',
			imports: ['BaseKbd'],
		})
		expect(source.transform('', { args: { value: 'Z', isMuted: true } })).toContain(
			'\t<p>Нажмите <BaseKbd is-muted value="meta" /> + <BaseKbd is-muted value="K" />, чтобы найти</p>',
		)
		expect(source.transform('', { args: { value: 'Z' } })).toContain('<BaseKbd value="meta" /> + <BaseKbd value="K" />')
	})

	it('тег с одним атрибутом не переносится, даже длинный; текст слота default — не атрибут', () => {
		const source = storySource({
			template:
				'<div style="padding: 12px 64px 12px 12px;"><BaseChip v-bind="args"><BaseButton variant="outline">Журнал изменений</BaseButton></BaseChip></div>',
			imports: ['BaseChip', 'BaseButton'],
		})
		expect(source.transform('', { args: { content: 'Новое обновление', default: 'Текст' } })).toContain(
			'\t<div style="padding: 12px 64px 12px 12px;"><BaseChip content="Новое обновление"><BaseButton variant="outline">Журнал изменений</BaseButton></BaseChip></div>',
		)
		const chip = storySource({ template: '<BaseChip v-bind="args">{{ label }}</BaseChip>', imports: ['BaseChip'] })
		expect(chip.transform('', { args: { content: 'Новое обновление для всех участников проекта сегодня' } })).toContain(
			'\t<BaseChip content="Новое обновление для всех участников проекта сегодня">{{ label }}</BaseChip>',
		)
	})

	it('sizeScale 100 — значение по умолчанию у всех компонентов, в код не попадает', () => {
		const source = storySource({ template: '<BaseRange v-bind="args" />', imports: ['BaseRange'] })
		expect(source.transform('', { args: { sizeScale: 100, hasLabel: true }, component: { props: {} } })).toContain(
			'<BaseRange has-label />',
		)
		expect(source.transform('', { args: { sizeScale: 125 }, component: { props: {} } })).toContain('<BaseRange :size-scale="125" />')
	})

	it('подпись варианта из mapping в Controls — значением, которое получает компонент', () => {
		const code = storySource({ template: '<BaseImage v-bind="args" />', imports: ['BaseImage'] }).transform('', {
			args: { src: 'Горы', alt: 'Горы' },
			argTypes: { src: { mapping: { Горы: '/mountains.jpg' } } },
		})
		expect(code).toContain('<BaseImage src="/mountains.jpg" alt="Горы" />')
	})

	it('state — переменные ref с начальными значениями; константа длинного пропса — только если он в коде', () => {
		const code = storySource({
			template: '<BaseTable v-if="isVisible" v-bind="args" :columns="shortColumns" @close="isVisible = false" />',
			imports: ['BaseTable'],
			state: { isVisible: true, items: ['а'], values: {} },
			types: { values: 'Record<string, string>' },
		}).transform('', { args: { columns: [{ key: 'name', title: 'Имя сотрудника отдела' }] } })
		expect(code).toContain("import { ref } from 'vue'")
		expect(code).toContain(
			"const isVisible = ref(true)\nconst items = ref(['а'])\nconst values = ref<Record<string, string>>({})\n</script>",
		)
		expect(code).toContain('<BaseTable v-if="isVisible" :columns="shortColumns" @close="isVisible = false" />')
	})

	it('типы для строк script — среди импортов пакета по имени', () => {
		const code = storySource({ template: '<BaseTable />', imports: ['type TableRow', 'BaseTable', 'type AutocompleteOption'] })
		expect(code.transform('', { args: {} })).toContain(
			"import { type AutocompleteOption, BaseTable, type TableRow } from '@ramzes1385/rise-ui-kit'",
		)
	})

	it('без импортов из корня пакета — строки импорта пакета нет; types — и для v-model', () => {
		const code = storySource({
			template: '<BaseMediaPlayer v-model="messages" />',
			imports: [],
			importsFrom: { '@ramzes1385/rise-ui-kit/media': ['BaseMediaPlayer'] },
			models: { messages: 'modelValue' },
			types: { messages: 'string[]' },
		}).transform('', { args: { modelValue: ['а'] } })
		expect(code).not.toContain("from '@ramzes1385/rise-ui-kit'\n")
		expect(code).toContain("import { BaseMediaPlayer } from '@ramzes1385/rise-ui-kit/media'")
		expect(code).toContain("const messages = ref<string[]>(['а'])")
	})

	it('свои компоненты — файлами после основного, вложенные тоже; основной файл их импортирует', () => {
		const { code } = staticStorySource({
			template: '<BaseApp><ToastButtons /></BaseApp>',
			imports: ['BaseApp'],
			components: {
				ToastButtons: {
					template: '<BaseButton @click="show">Показать</BaseButton><RenameModal />',
					imports: ['BaseButton', 'useToast'],
					script: "const toast = useToast()\nconst show = () => toast.add({ title: 'Готово' })",
					components: { RenameModal: { template: '<BaseModal />', imports: ['BaseModal'] } },
				},
			},
		})
		expect(code).toBe(
			[
				'<script setup lang="ts">',
				"import { BaseApp } from '@ramzes1385/rise-ui-kit'",
				"import ToastButtons from './ToastButtons.vue'",
				'</script>',
				'',
				'<template>',
				'\t<BaseApp><ToastButtons /></BaseApp>',
				'</template>',
				'',
				'<!-- ToastButtons.vue -->',
				'<script setup lang="ts">',
				"import { BaseButton, useToast } from '@ramzes1385/rise-ui-kit'",
				"import RenameModal from './RenameModal.vue'",
				'',
				'const toast = useToast()',
				"const show = () => toast.add({ title: 'Готово' })",
				'</script>',
				'',
				'<template>',
				'\t<BaseButton @click="show">Показать</BaseButton><RenameModal />',
				'</template>',
				'',
				'<!-- RenameModal.vue -->',
				'<script setup lang="ts">',
				"import { BaseModal } from '@ramzes1385/rise-ui-kit'",
				'</script>',
				'',
				'<template>',
				'\t<BaseModal />',
				'</template>',
			].join('\n'),
		)
	})

	it('константа длинного пропса — только для отдельного атрибута и не повторяет объявление из script', () => {
		const rows = [{ name: 'Анна Смирнова', email: 'anna@example.com' }]
		const columns = [{ key: 'name', title: 'Имя сотрудника' }]
		const declared = storySource({
			template: '<BaseTable v-bind="args" />',
			imports: ['BaseTable'],
			script: `const rows = ${JSON.stringify(rows)}`,
		}).transform('', { args: { rows, columns } })
		expect(declared.match(/const rows\b/g)).toHaveLength(1)
		expect(declared).toContain('const columns = ')
		expect(declared).toContain(':rows="rows"')
		const model = storySource({
			template: '<BaseTable v-model:rows="rows" />',
			imports: ['BaseTable'],
			models: { rows: 'rows' },
		}).transform('', { args: { rows } })
		expect(model.match(/const rows\b/g)).toHaveLength(1)
		expect(model).toContain('const rows = ref([')
		const kebabName = storySource({
			template: '<BaseTable v-bind="args" />',
			imports: ['BaseTable'],
			script: 'function rowActions() {}',
		}).transform('', { args: { rowActions: rows } })
		expect(kebabName).toContain(':row-actions="rowActions"')
		expect(kebabName).not.toContain('const rowActions')
	})

	it('переменная v-model без значения в Controls — значение по умолчанию или ref()', () => {
		const transform = (models: Record<string, string>) =>
			storySource({ template: '<BaseSelect />', imports: ['BaseSelect'], models }).transform('', { args: {}, component: COMPONENT })
		expect(transform({ selected: 'variant' })).toContain("const selected = ref('default')")
		expect(transform({ list: 'items' })).toContain('const list = ref([])')
		expect(transform({ date: 'modelValue' })).toContain('const date = ref()')
		expect(transform({ text: 'label' })).toContain('const text = ref()')
		expect(transform({ text: 'label' })).not.toContain("ref('')")
	})
})
