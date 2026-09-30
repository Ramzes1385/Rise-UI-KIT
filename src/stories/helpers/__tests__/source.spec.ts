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
		expect(literal({ 'data-id': 1, ok: null })).toBe("{ 'data-id': 1, ok: null }")
		expect(literal(Array.from({ length: 12 }, (_, index) => ({ id: `item-${index}` })))).toMatch(/^\[\n\t\{ id: 'item-0' \},\n/)
	})
})
