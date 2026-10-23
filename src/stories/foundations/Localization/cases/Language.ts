import { expect } from 'storybook/test'
import type meta from '../Localization.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { CALENDAR_COMPONENTS, languageSetup } from '../shared'
import { staticStorySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack story-medium">
		<div class="story-row">
			<BaseButton v-for="code in locales" :key="code" :variant="code === locale ? 'default' : 'outline'" @click="setLocale(code)">{{ code }}</BaseButton>
		</div>
		<BaseCalendar :model-value="today" />
	</div>
`

const script = `
const { locale, locales, setLocale } = useLocale()
const today = new Date(2025, 4, 15)
`

export const Language: StoryObj<typeof meta> = {
	globals: { locale: 'ru' },
	parameters: {
		docs: {
			description: {
				story: [
					'Смена языка на лету: `setLocale(code)` (или проп `locale` у `<BaseApp>`) перерисовывает все компоненты — подписи, названия месяцев,',
					'первый день недели. Список кодов для переключателя даёт `useLocale().locales`: встроенные и добавленные `registerLocale()`.',
					'Нажмите «en»: календарь станет английским, неделя начнётся с воскресенья.',
				].join('\n'),
			},
			source: staticStorySource({ template, imports: ['BaseButton', 'BaseCalendar', 'useLocale'], script }),
		},
	},
	render: args => ({
		components: CALENDAR_COMPONENTS,
		setup: useStorySetup(args, { setup: languageSetup }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const firstWeekday = (): string | null | undefined => canvasElement.querySelector('.base-calendar__weekday')?.textContent
		await expect(canvas.getByRole('button', { name: /май 2025/i })).toBeVisible()
		await expect(firstWeekday()).toMatch(/^пн/i)
		await userEvent.click(canvas.getByRole('button', { name: 'en' }))
		await expect(canvas.getByRole('button', { name: /may 2025/i })).toBeVisible()
		await expect(firstWeekday()).toMatch(/^sun/i)
		await userEvent.click(canvas.getByRole('button', { name: 'ru' }))
		await expect(canvas.getByRole('button', { name: /май 2025/i })).toBeVisible()
	},
}
