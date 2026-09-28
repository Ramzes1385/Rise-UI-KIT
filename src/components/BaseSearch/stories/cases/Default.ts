import type { SearchArgs } from '../shared'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<SearchArgs> = {
	parameters: {
		docs: { description: { story: 'Песочница: введите «лис» или «запись» — появятся подсказки; props меняются в Controls.' } },
	},
}
