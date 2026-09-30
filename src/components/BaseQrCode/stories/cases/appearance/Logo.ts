import { QR_LOGO } from '../../shared'
import { expect } from 'storybook/test'
import type meta from '../../BaseQrCode.stories'
import BaseQrCode from '../../../ui/BaseQrCode.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const logoSizes = [0.16, 0.22, 0.3]

const template = `
	<div class="story-row" style="align-items: flex-end">
		<figure v-for="logoSize in logoSizes" :key="logoSize" style="margin: 0; text-align: center">
			<BaseQrCode v-bind="args" :logo-size="logoSize" />
			<figcaption class="story-label">logoSize {{ logoSize }}</figcaption>
		</figure>
	</div>
`

export const Logo: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Логотип в центре: под ним модули не рисуются, уровень коррекции по умолчанию — H. Версия кода растёт, пока вырез',
					'не займёт не больше 60% запаса коррекции каждого блока, — поэтому код с крупным логотипом плотнее.',
				].join(' '),
			},
			source: storySource({
				template,
				imports: ['BaseQrCode'],
				script: `const logoSizes = ${literal(logoSizes)}`,
				omit: ['logoSize'],
			}),
		},
		controls: { include: ['value', 'size', 'moduleShape', 'finderShape', 'errorCorrection'] },
	},
	args: { logo: QR_LOGO },
	render: args => ({
		components: { BaseQrCode },
		setup: useStorySetup(args, { data: { logoSizes } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const images = [...canvasElement.querySelectorAll('image')]
		await expect(images).toHaveLength(3)
		const widths = images.map(image => Number(image.getAttribute('width')))
		await expect(widths[0]).toBeLessThan(widths[1])
		await expect(widths[1]).toBeLessThan(widths[2])
	},
}
