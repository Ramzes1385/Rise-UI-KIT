import { setup } from './Animations.setup'
import type meta from '../../BaseAvatar.stories'
import { expect, waitFor } from 'storybook/test'
import { CONTENT_ARGS, anna } from '../../shared'
import BaseAvatar from '../../../ui/BaseAvatar.vue'
import setupSource from './Animations.setup.ts?raw'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, scriptSource, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-col">
		<div class="story-row">
			<div v-for="preset in presets" :key="preset" :data-rise-motion="preset" class="story-col">
				<BaseAvatar ref="avatars" v-bind="args" alt="Росток" />
				<BaseAvatar :key="photoKey" v-bind="args" mascot="none" :src="anna.avatar" :name="anna.name" :is-online="isOnline" />
				<span class="story-label">{{ preset }}</span>
			</div>
		</div>
		<div class="story-row">
			<BaseButton @click="replay">Повторить</BaseButton>
			<BaseButton variant="outline" @click="isOnline = !isOnline">В сети</BaseButton>
		</div>
	</div>
`

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['mascot', 'mood', 'sizeScale'] },
		docs: {
			description: {
				story: [
					"Движение персонажа в пресетах `data-rise-motion`. «Повторить» вызывает у каждого `react('surprised')`:",
					'удивление на 1,2 с, затем возврат к `mood`. Поводите курсором — зрачки и голова догоняют его на пружине.',
					'В `none` (и при `prefers-reduced-motion`) персонаж неподвижен: зрачки в центре, без наклона, дыхания и моргания,',
					'выражение меняется сразу.',
					'Ниже — фото: «Повторить» монтирует его заново, и загруженное изображение проявляется за `--rise-duration`',
					'(`--rise-ease-out`). «В сети» переключает точку статуса — она появляется с «pop» (`--rise-motion-scale-from`,',
					'`--rise-ease-spring`) и гаснет за `--rise-duration-fast`. В `none` фото и точка меняются сразу.',
					"Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseAvatar', 'BaseButton', 'type BaseAvatarExpose'],
				vue: ['ref'],
				script: [`const anna = ${literal(anna)}`, scriptSource(setupSource)].join('\n'),
				omit: [...CONTENT_ARGS],
			}),
		},
	},
	args: { mascot: 'sprout', sizeScale: 200 },
	render: args => ({
		components: { BaseAvatar, BaseButton },
		setup: useStorySetup(args, { slots: [...CONTENT_ARGS], data: { anna }, setup }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.tab()
		await expect(canvas.getByRole('button', { name: 'Повторить' })).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await expect(canvasElement.querySelectorAll('.base-avatar__mascot--mood-surprised')).toHaveLength(4)
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-avatar__mascot--mood-idle')).toHaveLength(4), { timeout: 3000 })
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-avatar__img--loaded')).toHaveLength(4))
		await expect(canvas.getAllByRole('img', { name: 'в сети' })).toHaveLength(4)
		await userEvent.click(canvas.getByRole('button', { name: 'В сети' }))
		await waitFor(() => expect(canvas.queryAllByRole('img', { name: 'в сети' })).toHaveLength(0))
	},
}
