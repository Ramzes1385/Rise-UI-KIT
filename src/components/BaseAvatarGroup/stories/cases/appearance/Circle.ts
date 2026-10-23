import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseAvatarGroup.stories'

export const Circle: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Круглые аватары (`shape="circle"`) — форма не по умолчанию: по умолчанию аватары и «+N» — скруглённые квадраты.',
			},
		},
	},
	args: { shape: 'circle' },
}
