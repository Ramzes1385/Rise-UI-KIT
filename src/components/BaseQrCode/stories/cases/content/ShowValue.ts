import { expect } from 'storybook/test'
import type meta from '../../BaseQrCode.stories'
import BaseQrCode from '../../../ui/BaseQrCode.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const modes = ['host', true] as const

const template = `
	<div class="story-row" style="align-items: flex-start">
		<BaseQrCode v-for="mode in modes" :key="String(mode)" v-bind="args" :show-value="mode" />
	</div>
`

export const ShowValue: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`showValue="host"` — под кодом только хост ссылки: человек видит, куда ведёт код, до сканирования (защита от подмены',
					'QR — квишинга). `true` — весь текст, не длиннее двух строк. Для не-ссылки `host` подписи не даёт.',
				].join(' '),
			},
			source: storySource({ template, imports: ['BaseQrCode'], script: `const modes = ${literal(modes)}`, omit: ['showValue'] }),
		},
		controls: { include: ['value', 'size'] },
	},
	args: { value: 'https://ramzes1385.github.io/Rise-UI-KIT/?path=/docs/element-baseqrcode--docs' },
	render: args => ({
		components: { BaseQrCode },
		setup: useStorySetup(args, { data: { modes } }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('ramzes1385.github.io')).toBeVisible()
		await expect(canvas.getAllByRole('img', { name: 'QR-код: ссылка на ramzes1385.github.io' })).toHaveLength(2)
	},
}
