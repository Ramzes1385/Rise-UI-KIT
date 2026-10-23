import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseInplace.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseInplace from '../../../ui/BaseInplace.vue'
import { motionPresetsStory } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<BaseInplace :key="replay" v-bind="args" />
	`,
	components: { BaseInplace, BaseButton },
	imports: ['BaseInplace'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'modelValue'] },
		docs: {
			description: {
				story: [
					'Нажмите на текст: кнопка просмотра растворяется, поле правки проявляется на её месте (`opacity`), фокус сразу в поле;',
					'Enter или Escape возвращают просмотр и фокус на кнопку. «Повторить» возвращает все колонки к просмотру.',
					'Длительности — токены `--rise-duration` (появление) и `--rise-duration-fast` (уход), кривые — `--rise-ease-out`,',
					"`--rise-ease-in`. Выключить движение — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`;",
					'системная настройка «уменьшить движение» действует всегда — режим меняется сразу.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.tab()
		await userEvent.tab()
		const [first] = canvas.getAllByRole('button', { name: /^Название проекта/ })
		await expect(first).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await expect(canvas.getByRole('textbox', { name: 'Название проекта' })).toHaveFocus()
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(canvas.getAllByRole('button', { name: /^Название проекта/ })[0]).toHaveFocus())
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-inplace__field')).toHaveLength(0))
	},
}
