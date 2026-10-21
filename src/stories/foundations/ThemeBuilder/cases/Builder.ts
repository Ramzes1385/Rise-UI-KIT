import { setup } from './Builder.setup'
import type meta from '../ThemeBuilder.stories'
import { BaseCard } from '@components/BaseCard'
import { BaseTabs } from '@components/BaseTabs'
import setupSource from './Builder.setup.ts?raw'
import { BaseBadge } from '@components/BaseBadge'
import { BaseInput } from '@components/BaseInput'
import { BaseModal } from '@components/BaseModal'
import { BaseTable } from '@components/BaseTable'
import { BaseButton } from '@components/BaseButton'
import { BaseSelect } from '@components/BaseSelect'
import { watchCustomBrand } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'
import { BaseCheckbox } from '@components/BaseCheckbox'
import { THEME_PRESETS } from '@utils/theme/themeUtils'
import { expect, waitFor, within } from 'storybook/test'
import { BaseSegmented } from '@components/BaseSegmented'
import { BaseColorPicker } from '@components/BaseColorPicker'
import { BaseNotification } from '@components/BaseNotification'
import { resolveColor, scriptSource, staticStorySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="fnd-builder">
		<section class="fnd-builder__inputs" aria-label="Входы темы">
			<div class="story-row">
				<BaseButton v-for="preset in presetOptions" :key="preset.value" variant="tonal" @click="loadPreset(preset.value)">
					{{ preset.label }}
				</BaseButton>
			</div>
			<BaseInput v-model="input.name" label="Имя темы" />
			<BaseColorPicker v-model="input.primary" label="Цвет бренда" />
			<BaseCheckbox v-model="hasPrimaryDark" label="Свой цвет бренда в тёмной" />
			<BaseColorPicker v-if="hasPrimaryDark" v-model="input.primaryDark" label="Цвет бренда в тёмной" />
			<BaseSelect v-model="input.neutral" :options="neutralOptions" label="Нейтраль" />
			<BaseSegmented v-model="input.radius" :options="radiusOptions" label="Скругление" />
			<BaseSegmented v-model="input.density" :options="densityOptions" label="Плотность" />
			<BaseSegmented v-model="input.shadows" :options="shadowOptions" label="Тени" />
			<BaseSegmented v-model="input.motion" :options="motionOptions" label="Движение" />
			<BaseSelect v-model="fontSans" :options="fontOptions" label="Шрифт" />
		</section>
		<div class="fnd-builder__previews">
			<div ref="lightPanel" class="fnd-builder__preview" data-theme="light">
				<span class="story-label">Светлая</span>
				<div class="story-row">
					<BaseButton>Сохранить</BaseButton>
					<BaseButton variant="soft">Черновик</BaseButton>
					<BaseButton variant="tonal">Отмена</BaseButton>
				</div>
				<BaseInput v-model="search" label="Поиск проекта" />
				<BaseSelect v-model="role" :options="roleOptions" label="Роль" />
				<BaseTabs v-model="tab" :items="tabs" />
				<BaseCard title="Тариф «Команда»">До 20 участников и 100 ГБ на проект.</BaseCard>
				<BaseTable :columns="columns" :rows="rows" />
				<div class="fnd-builder__overlay">
					<BaseModal :is-open="true" is-contained :has-overlay="false" title="Удалить проект?">Проект «Сайт студии» удалится вместе с файлами.</BaseModal>
				</div>
				<BaseNotification is-contained is-persistent type="success" title="Тема применена" description="Новые цвета уже на всех экранах." />
			</div>
			<div ref="darkPanel" class="fnd-builder__preview" data-theme="dark">
				<span class="story-label">Тёмная</span>
				<div class="story-row">
					<BaseButton>Сохранить</BaseButton>
					<BaseButton variant="soft">Черновик</BaseButton>
					<BaseButton variant="tonal">Отмена</BaseButton>
				</div>
				<BaseInput v-model="search" label="Поиск проекта" />
				<BaseSelect v-model="role" :options="roleOptions" label="Роль" />
				<BaseTabs v-model="tab" :items="tabs" />
				<BaseCard title="Тариф «Команда»">До 20 участников и 100 ГБ на проект.</BaseCard>
				<BaseTable :columns="columns" :rows="rows" />
				<div class="fnd-builder__overlay">
					<BaseModal :is-open="true" is-contained :has-overlay="false" title="Удалить проект?">Проект «Сайт студии» удалится вместе с файлами.</BaseModal>
				</div>
				<BaseNotification is-contained is-persistent type="success" title="Тема применена" description="Новые цвета уже на всех экранах." />
			</div>
		</div>
		<section class="fnd-builder__contrast" aria-label="Контраст">
			<p class="story-label">
				Контраст WCAG 2.2 AA — пары из scripts/check-contrast.mjs.
				<BaseBadge :label="failures ? 'Ниже порога: ' + failures : 'Все пары проходят'" :variant="failures ? 'default' : 'soft'" />
				<BaseBadge v-if="theme.adjusted" label="Бренд затемнён до 4.5:1" variant="outline" />
			</p>
			<div class="fnd-builder__scroll" tabindex="0" aria-label="Таблица контраста">
				<table class="fnd-builder__table">
					<thead>
						<tr><th scope="col">Пара</th><th scope="col">Порог</th><th scope="col">Светлая</th><th scope="col">Тёмная</th></tr>
					</thead>
					<tbody>
						<tr v-for="line in contrast" :key="line.key">
							<td><code>{{ line.pair }}</code>{{ line.informational ? ' — справочная' : '' }}</td>
							<td>{{ line.min }}:1</td>
							<td :class="{ 'fnd-builder__fail': !line.light.ok && !line.light.informational }">{{ line.light.ratio }}:1</td>
							<td :class="{ 'fnd-builder__fail': !line.dark.ok && !line.dark.informational }">{{ line.dark.ratio }}:1</td>
						</tr>
					</tbody>
				</table>
			</div>
		</section>
		<section class="fnd-builder__code" aria-label="Код темы">
			<div class="story-row">
				<BaseButton @click="copy('js')">Скопировать JS</BaseButton>
				<BaseButton variant="tonal" @click="copy('css')">Скопировать CSS</BaseButton>
				<span role="status" class="story-label">{{ copied }}</span>
			</div>
			<pre class="fnd-builder__pre" data-code="js" tabindex="0" aria-label="Код JS">{{ jsCode }}</pre>
			<pre class="fnd-builder__pre" data-code="css" tabindex="0" aria-label="CSS темы">{{ cssCode }}</pre>
		</section>
	</div>
`

const components = {
	BaseBadge,
	BaseButton,
	BaseCard,
	BaseCheckbox,
	BaseColorPicker,
	BaseInput,
	BaseModal,
	BaseNotification,
	BaseSegmented,
	BaseSelect,
	BaseTable,
	BaseTabs,
}

/** Токены, по которым сравнивается вид превью и «чистой страницы» с вставленным CSS */
const COMPARED_TOKENS = [
	'--rise-primary',
	'--rise-bg',
	'--rise-text',
	'--rise-border',
	'--rise-radius',
	'--rise-font-sans',
	'--rise-density',
]

/** Код JS из конструктора → вход `createTheme`: ключи в кавычки, строки — в JSON */
function parseJsCode(code: string): Record<string, unknown> {
	const literal = code.slice(code.indexOf('createTheme(') + 'createTheme('.length, code.lastIndexOf('))'))
	const json = literal
		.replace(/^(\s*)([A-Za-z_$][\w$]*):/gm, '$1"$2":')
		.replace(/'((?:\\.|[^'\\])*)'/g, (_, text: string) => JSON.stringify(text.replace(/\\'/g, "'").replace(/\\\\/g, '\\')))
		.replace(/,(\s*})/g, '$1')
	return JSON.parse(json) as Record<string, unknown>
}

/** «Чистая страница»: элемент вне превью с той же темой из скопированного CSS — токены как у панели превью */
function cleanArea(css: string, name: string, mode: string): { area: HTMLElement; dispose: () => void } {
	const style = document.createElement('style')
	style.textContent = css
	const area = document.createElement('div')
	area.setAttribute('data-rise-theme', name)
	area.setAttribute('data-theme', mode)
	document.head.append(style)
	document.body.append(area)
	return {
		area,
		dispose: () => {
			style.remove()
			area.remove()
		},
	}
}

export const Builder: StoryObj<typeof meta> = {
	name: 'Конструктор',
	parameters: {
		a11y: { config: { rules: [{ id: 'landmark-unique', enabled: false }] } },
		docs: {
			description: {
				story: [
					'Входы `ThemeInput` слева, превью набора компонентов в светлой и тёмной — справа: тема подключена к каждой панели',
					'`applyTheme(theme, { target })`, поэтому панели не зависят от переключателей «Тема» и «Бренд». Ниже — контраст всех',
					'пар `scripts/check-contrast.mjs` в обоих режимах и код: «Скопировать JS» — вызов `createTheme({...})` для приложения,',
					'«Скопировать CSS» — готовый селектор `[data-rise-theme]` для подключения без JS. Последняя тема конструктора',
					'становится брендом **Custom** в панели Storybook — так её можно примерить на любую историю.',
					'',
					'Кнопки пресетов загружают их входы; `rise` здесь — генератор от цвета кита (точные палитры кита — бренд **Rise**).',
					'В превью два списка уведомлений с одним именем региона, поэтому правило axe `landmark-unique` у этой истории',
					'выключено: в приложении регион уведомлений один.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: [
					'applyTheme',
					'BaseBadge',
					'BaseButton',
					'BaseCard',
					'BaseCheckbox',
					'BaseColorPicker',
					'BaseInput',
					'BaseModal',
					'BaseNotification',
					'BaseSegmented',
					'BaseSelect',
					'BaseTable',
					'BaseTabs',
					'createTheme',
					'THEME_DENSITIES',
					'THEME_MOTIONS',
					'THEME_PRESET_NAMES',
					'THEME_PRESETS',
					'THEME_RADII',
					'THEME_SHADOWS',
					'type ThemeContrastRow',
					'type ThemeInput',
					'type ThemePresetName',
				],
				vue: ['computed', 'ref', 'watchEffect'],
				script: scriptSource(setupSource),
			}),
		},
	},
	render: args => ({
		components,
		setup: useStorySetup(args, {
			setup: () => {
				const state = setup()
				watchCustomBrand(state.themeInput)
				return state
			},
		}),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const [light, dark] = [...canvasElement.querySelectorAll<HTMLElement>('.fnd-builder__preview')]
		await waitFor(() => expect(light).toHaveAttribute('data-rise-theme', 'brand'))
		await expect(dark).toHaveAttribute('data-rise-theme', 'brand')

		const save = within(light).getByRole('button', { name: 'Сохранить' })
		canvas.getByRole('button', { name: 'playful' }).focus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(canvasElement.querySelector('[data-code="js"]')).toHaveTextContent("primary: '#7c3aed'"))

		const jsCode = canvasElement.querySelector('[data-code="js"]')!.textContent!
		const cssCode = canvasElement.querySelector('[data-code="css"]')!.textContent!
		const input = parseJsCode(jsCode)
		await expect(input).toMatchObject({ name: 'brand', primary: '#7c3aed', radius: 'lg' })
		for (const [panel, mode] of [
			[light, 'light'],
			[dark, 'dark'],
		] as const) {
			const clean = cleanArea(cssCode, String(input.name), mode)
			const shown = getComputedStyle(panel)
			const pasted = getComputedStyle(clean.area)
			for (const token of COMPARED_TOKENS) await expect(pasted.getPropertyValue(token)).toBe(shown.getPropertyValue(token))
			clean.dispose()
		}

		await waitFor(() => expect(getComputedStyle(save).backgroundColor).toBe(resolveColor(THEME_PRESETS.playful.primary)))
	},
}
