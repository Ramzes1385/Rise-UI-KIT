import { emulateSteps } from '../../shared'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCryptoProSign.stories'
import { expect, userEvent, waitFor } from 'storybook/test'
import BaseCryptoProSign from '../../../ui/BaseCryptoProSign.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const presets = ['none', 'subtle', 'standard', 'expressive'] as const

const VERSIONS = 'КриптоПро ЭЦП Browser plug-in 2.0.15400 · КриптоПро CSP 5.0.12000'

const template = `
	<div class="story-motion">
		<BaseButton variant="outline" @click="replay++">Проверить заново</BaseButton>
		<div class="story-motion__presets" style="--story-motion-min: 280px">
			<div v-for="preset in presets" :key="preset" class="story-motion__preset" :data-rise-motion="preset">
				<span class="story-label">{{ preset }}</span>
				<BaseCryptoProSign :key="replay" v-bind="args" :aria-label="'Электронная подпись, ' + preset" />
			</div>
		</div>
	</div>
`

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	beforeEach: emulateSteps(),
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Диагностика плагина в четырёх пресетах движения. Каждый шаг здесь отвечает через полсекунды (эмуляция окружения),',
					'«Проверить заново» монтирует подписи заново. Значок шага сменяется прозрачностью, список шагов уступает строке',
					'версий переходом out-in (`--rise-duration`, `--rise-ease-out`; уход — `--rise-duration-fast`, `--rise-ease-in`),',
					'итог подписи въезжает снизу на `--rise-motion-distance`, блок ошибки раскрывается по высоте (`--rise-duration-slow`,',
					'`--rise-ease-emphasized`). Live-регион `role="status"` озвучивает ход и итог как раньше.',
					"Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`;",
					'системная настройка «уменьшить движение» действует всегда.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseButton', 'BaseCryptoProSign'],
				state: { replay: 0 },
				script: `const presets = ${literal(presets)}`,
			}),
			story: { inline: false, height: '720px' },
		},
	},
	render: args => ({
		components: { BaseButton, BaseCryptoProSign },
		setup: useStorySetup(args, { state: { replay: 0 }, data: { presets } }),
		template,
	}),
	play: async ({ canvas }) => {
		await waitFor(() => expect(canvas.getAllByText(VERSIONS)).toHaveLength(4), { timeout: 10000 })
		canvas.getByRole('button', { name: 'Проверить заново' }).focus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(canvas.getAllByRole('list', { name: 'Проверяем КриптоПро' })).toHaveLength(4))
		await waitFor(() => expect(canvas.getAllByText(VERSIONS)).toHaveLength(4), { timeout: 10000 })
		await waitFor(() => expect(canvas.getAllByRole('button', { name: 'Подписать' })).toHaveLength(4), { timeout: 10000 })
	},
}
