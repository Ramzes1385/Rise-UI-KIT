import { SLOT_KEYS } from '../../shared'
import type meta from '../../BaseSideBar.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSideBar from '../../../ui/BaseSideBar.vue'
import { expect, screen, waitFor } from 'storybook/test'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { isMobileOpen: false }

const template = `
	<div class="story-col">
		<BaseButton variant="outline" @click="isMobileOpen = true">Открыть меню</BaseButton>
		<BaseSideBar v-bind="args" v-model:is-mobile-open="isMobileOpen" mobile-breakpoint="xxl" />
	</div>
`

export const Mobile: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Мобильный режим: на экране уже `mobileBreakpoint` панель не стоит в раскладке, а выезжает слева поверх страницы',
					'(BaseSlideover: затемнение, Escape, ловушка фокуса). Открывает её приложение — `v-model:isMobileOpen`, переход',
					'по ссылке закрывает панель. В примере брейкпоинт `xxl`, чтобы режим был виден на любом экране; обычно — `md`.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseButton', 'BaseSideBar'], state, omit: SLOT_KEYS }),
		},
	},
	render: args => ({
		components: { BaseSideBar, BaseButton },
		setup: useStorySetup(args, { state, slots: SLOT_KEYS }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.queryByRole('complementary')).toBeNull()
		await userEvent.click(canvas.getByRole('button', { name: 'Открыть меню' }))
		const dialog = await screen.findByRole('dialog', { name: 'Панель управления' })
		await waitFor(() => expect(dialog).toBeVisible())
		await userEvent.click(screen.getByRole('link', { name: 'Главная' }))
		await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Панель управления' })).toBeNull())
	},
}
