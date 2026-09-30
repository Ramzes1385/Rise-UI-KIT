import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDadataInput.stories'
import { demoSource, DEMO_DELAY } from '../../shared'
import BaseDadataInput from '../../../ui/BaseDadataInput.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import BaseRequisiteInput from '@components/BaseRequisiteInput/ui/BaseRequisiteInput.vue'

const sources = { party: demoSource('party'), bank: demoSource('bank') }

const state = { company: '', bank: '', requisites: {} }

const types = { requisites: 'DadataRequisites' }

const template = `
	<div class="story-stack" style="max-width: 560px; min-height: 420px">
		<BaseDadataInput v-bind="args" v-model="company" kind="party" label="Организация" :source="sources.party" @select="(_, found) => Object.assign(requisites, found)" />
		<div class="story-grid" style="--story-grid-min: 160px">
			<BaseRequisiteInput v-model="requisites.inn" kind="inn" />
			<BaseRequisiteInput v-model="requisites.kpp" kind="kpp" />
			<BaseRequisiteInput v-model="requisites.ogrn" kind="ogrn" />
		</div>
		<BaseDadataInput v-bind="args" v-model="bank" kind="bank" label="Банк" placeholder="Название или БИК" :source="sources.bank" @select="(_, found) => Object.assign(requisites, found)" />
		<div class="story-grid" style="--story-grid-min: 160px">
			<BaseRequisiteInput v-model="requisites.bik" kind="bik" />
			<BaseRequisiteInput v-model="requisites.correspondentAccount" kind="correspondentAccount" :bik="requisites.bik" />
		</div>
	</div>
`

export const WithRequisites: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Реквизиты из подсказки: событие `select` передаёт вторым аргументом `inn`, `kpp`, `ogrn` организации или `bik` и `correspondentAccount` банка — поля BaseRequisiteInput заполняются и проверяют контрольные числа. В превью источники — демо-списки, в коде — `createDadataSource` с вашим ключом.',
			},
			source: storySource({
				template,
				imports: ['BaseDadataInput', 'BaseRequisiteInput'],
				state,
				types,
				omit: ['kind', 'label', 'placeholder'],
				importsFrom: { '@ramzes1385/rise-ui-kit/utils': ['createDadataSource', 'type DadataRequisites'] },
				script: [
					'const token = import.meta.env.VITE_DADATA_TOKEN',
					"const sources = { party: createDadataSource('party', { token }), bank: createDadataSource('bank', { token }) }",
				].join('\n'),
			}),
		},
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseDadataInput, BaseRequisiteInput },
		setup: useStorySetup(args, { state, data: { sources } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.type(canvas.getByRole('combobox', { name: 'Организация' }), 'яндекс')
		await waitFor(() => expect(document.querySelectorAll('[role="option"]')).toHaveLength(1), { timeout: DEMO_DELAY * 10 })
		await userEvent.keyboard('{ArrowDown}{Enter}')
		await expect(canvas.getByRole('textbox', { name: 'ИНН' })).toHaveValue('7736207543')
		await expect(canvas.getByRole('textbox', { name: 'КПП' })).toHaveValue('770401001')
	},
}
