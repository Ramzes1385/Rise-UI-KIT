import { ru } from '@/locales'
import { BRAND } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../Localization.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useLocale } from '@composables/app/useLocale'
import { staticStorySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack story-medium">
		<div class="story-row">
			<BaseButton variant="outline" @click="setLocale(ru)">Стандартные строки</BaseButton>
			<BaseButton @click="setLocale(brand)">Свои строки</BaseButton>
		</div>
		<dl class="story-stack">
			<div><dt class="story-label">text.EMPTY</dt><dd>{{ messages.text.EMPTY }}</dd></div>
			<div><dt class="story-label">text.CANCEL</dt><dd>{{ messages.text.CANCEL }}</dd></div>
			<div><dt class="story-label">aria.CLOSE</dt><dd>{{ messages.aria.CLOSE }}</dd></div>
		</dl>
	</div>
`

const script = `
const { messages, setLocale } = useLocale()

const brand = defineLocale(ru, {
	text: { EMPTY: 'Пока ничего нет', CANCEL: 'Не сейчас' },
	aria: { CLOSE: 'Скрыть' },
})
`

export const Overrides: StoryObj<typeof meta> = {
	globals: { locale: 'ru' },
	parameters: {
		docs: {
			description: {
				story: [
					'`defineLocale(base, overrides)` — строки приложения поверх готового языка: переданные ключи заменяются, остальные берутся из `base`.',
					"Так же задают код, формат и первый день недели: `defineLocale(en, { code: 'en-GB', intl: 'en-GB', firstDayOfWeek: 1 })`.",
					'Результат принимают плагин, `<BaseApp>` и `setLocale()`:',
					'',
					'```ts',
					"app.use(createUiKitPlugin({ locale: defineLocale(ru, { text: { EMPTY: 'Пока ничего нет' } }) }))",
					'```',
				].join('\n'),
			},
			source: staticStorySource({ template, imports: ['BaseButton', 'defineLocale', 'ru', 'useLocale'], script }),
		},
	},
	render: args => ({
		components: { BaseButton },
		setup: useStorySetup(args, {
			setup: () => {
				const { messages, setLocale } = useLocale()
				return { messages, setLocale, brand: BRAND, ru }
			},
		}),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByText('Нет данных')).toBeVisible()
		await userEvent.click(canvas.getByRole('button', { name: 'Свои строки' }))
		await expect(canvas.getByText('Пока ничего нет')).toBeVisible()
		await expect(canvas.getByText('Скрыть')).toBeVisible()
		await userEvent.click(canvas.getByRole('button', { name: 'Стандартные строки' }))
		await expect(canvas.getByText('Нет данных')).toBeVisible()
	},
}
