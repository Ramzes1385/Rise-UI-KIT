import { expect } from 'storybook/test'
import type meta from '../Localization.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useLocale } from '@composables/app/useLocale'
import { staticStorySource, useStorySetup } from '@/stories/helpers'
import { CALENDAR_COMPONENTS, ensureGerman, GERMAN, TODAY } from '../shared'

const template = `
	<div class="story-stack story-medium">
		<div class="story-row">
			<BaseButton v-for="code in locales" :key="code" :variant="code === locale ? 'default' : 'outline'" @click="setLocale(code)">{{ code }}</BaseButton>
		</div>
		<dl class="story-stack">
			<div><dt class="story-label">locale.code · locale.intl</dt><dd>{{ messages.code }} · {{ messages.intl }}</dd></div>
			<div><dt class="story-label">text.EMPTY</dt><dd>{{ messages.text.EMPTY }}</dd></div>
			<div><dt class="story-label">aria.CLOSE</dt><dd>{{ messages.aria.CLOSE }}</dd></div>
		</dl>
		<BaseCalendar :model-value="today" />
	</div>
`

const script = `
const german = defineLocale(en, {
	code: 'de',
	intl: 'de-DE',
	firstDayOfWeek: 1,
	text: { EMPTY: 'Keine Daten', CANCEL: 'Abbrechen' },
	aria: { CLOSE: 'Schließen' },
})
registerLocale(german)

const { locale, locales, messages, setLocale } = useLocale()
const today = new Date(2025, 4, 15)
`

export const OwnLocale: StoryObj<typeof meta> = {
	globals: { locale: 'ru' },
	parameters: {
		docs: {
			description: {
				story: [
					'Свой язык: словарь типа `UiKitLocale` (проще всего — `defineLocale(en, { … })` поверх готового языка; TypeScript подскажет все ключи)',
					"и `registerLocale(locale)`. Регистрация идёт по `locale.code`: после неё код принимают `setLocale('de')`,",
					'`<BaseApp locale="de">` и `createUiKitPlugin({ locale: \'de\' })`, а `useLocale().locales` содержит код для переключателя.',
					'Регистрация не включает язык сама; повторная регистрация того же кода заменяет словарь (в том числе встроенных `ru` и `en`).',
					'',
					'`intl` — языковой тег для `Intl` (даты, числа, множественное число, сортировка), `firstDayOfWeek` — первый день недели календарей.',
					'Строки, которых нет в `overrides`, остаются из базового языка. Нажмите «de»: названия месяцев и неделя с понедельника — по `de-DE`, строки — из словаря.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: ['BaseButton', 'BaseCalendar', 'defineLocale', 'en', 'registerLocale', 'useLocale'],
				script,
			}),
		},
	},
	render: args => ({
		components: CALENDAR_COMPONENTS,
		setup: useStorySetup(args, {
			setup: () => {
				ensureGerman()
				const { locale, locales, messages, setLocale } = useLocale()
				return { locale, locales, messages, setLocale, today: TODAY }
			},
		}),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await expect(GERMAN.code).toBe('de')
		await expect(canvas.getByText('Нет данных')).toBeVisible()
		await userEvent.click(canvas.getByRole('button', { name: 'de' }))
		await expect(canvas.getByText('Keine Daten')).toBeVisible()
		await expect(canvas.getByRole('button', { name: /^mai 2025$/i })).toBeVisible()
		await expect(canvasElement.querySelector('.base-calendar__weekday')).toHaveTextContent(/^mo/i)
		await userEvent.click(canvas.getByRole('button', { name: 'ru' }))
		await expect(canvas.getByText('Нет данных')).toBeVisible()
	},
}
