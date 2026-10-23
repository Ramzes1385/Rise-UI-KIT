import { expect } from 'storybook/test'
import type meta from '../../BaseQrCode.stories'
import BaseQrCode from '../../../ui/BaseQrCode.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const styles = [
	{ moduleShape: 'square', finderShape: 'square', caption: 'square · square' },
	{ moduleShape: 'rounded', finderShape: 'rounded', caption: 'rounded · rounded' },
	{ moduleShape: 'dots', finderShape: 'circle', caption: 'dots · circle' },
]

const template = `
	<div class="story-row">
		<figure v-for="style in styles" :key="style.caption" style="margin: 0; text-align: center">
			<BaseQrCode v-bind="args" :module-shape="style.moduleShape" :finder-shape="style.finderShape" />
			<figcaption class="story-label">{{ style.caption }}</figcaption>
		</figure>
	</div>
`

export const Shapes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Формы модулей (`moduleShape`) и «глазков» (`finderShape`). Квадратные «глазки» читают и ZXing, и OpenCV;',
					'rounded и circle — ZXing, но не детектор OpenCV: перед печатью проверьте код своими сканерами.',
				].join(' '),
			},
			source: storySource({
				template,
				imports: ['BaseQrCode'],
				script: `const styles = ${literal(styles)}`,
				omit: ['moduleShape', 'finderShape'],
			}),
		},
		controls: { include: ['value', 'size', 'logo'] },
	},
	render: args => ({
		components: { BaseQrCode },
		setup: useStorySetup(args, { data: { styles } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const finders = [...canvasElement.querySelectorAll('.base-qr-code__finder')]
		await expect(finders.map(path => path.getAttribute('shape-rendering'))).toEqual(['crispEdges', null, null])
		await expect(finders[2].getAttribute('d')).toMatch(/^M4 7\.5a3\.5 3\.5 0 1 0 7 0/)
	},
}
