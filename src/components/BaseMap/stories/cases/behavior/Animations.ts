import { OFFICES } from '../../shared'
import BaseMap from '../../../ui/BaseMap.vue'
import type meta from '../../BaseMap.stories'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { installDemoYandex } from '../../demoProvider'
import { motionPresetsStory } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<BaseMap :key="replay" v-bind="args" />
	`,
	components: { BaseMap, BaseButton },
	imports: ['BaseMap'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { apiKey: 'demo', height: '180px', zoom: 12, markers: OFFICES.slice(0, 2) },
	parameters: {
		a11y: { config: { rules: [{ id: 'landmark-unique', enabled: false }] } },
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Карта в четырёх пресетах движения: «Повторить» загружает её заново (демо-поставщик отвечает с задержкой).',
					'Индикатор загрузки уходит прозрачностью — `--rise-duration-fast` и `--rise-ease-in`; заглушка (нет ключа, ошибка)',
					'появляется прозрачностью — `--rise-duration` и `--rise-ease-out`. Подсказка метки при наведении и фокусе',
					'проявляется и приподнимается — `opacity` и `transform` за `--rise-duration-fast` с `--rise-ease-out`.',
					'Сама карта — дело поставщика: её панорамирование и масштаб кит не анимирует.',
					"Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`;",
					'системная настройка «уменьшить движение» действует всегда.',
					'Одинаковые экземпляры для сравнения — регионы с одним именем, поэтому правило axe `landmark-unique` у этой истории выключено.',
				].join('\n'),
			},
			source: motion.source,
			story: { inline: false, height: '520px' },
		},
	},
	beforeEach: () => installDemoYandex({ delay: 600 }),
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		const markers = () => canvas.queryAllByRole('button', { name: 'Красная площадь' })
		await waitFor(() => expect(markers()).toHaveLength(4), { timeout: 3000 })
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(markers()).toHaveLength(4), { timeout: 3000 })
		for (const map of canvas.getAllByRole('region')) await waitFor(() => expect(map).not.toHaveAttribute('aria-busy'))
	},
}
