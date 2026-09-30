import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseRequisiteInput.stories'
import { storySource, useStorySetup } from '@/stories/helpers'
import BaseRequisiteInput from '../../../ui/BaseRequisiteInput.vue'

const state = {
	values: {
		inn: '7707083893',
		kpp: '773601001',
		ogrn: '1027700132195',
		bik: '044525225',
		account: '40702810938000000001',
		correspondentAccount: '30101810400000000225',
		snils: '11223344595',
	},
}

const template = `
	<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; max-width: 800px">
		<BaseRequisiteInput v-model="values.inn" kind="inn" :variant="slots.variant" :size-scale="slots.sizeScale" />
		<BaseRequisiteInput v-model="values.kpp" kind="kpp" :variant="slots.variant" :size-scale="slots.sizeScale" />
		<BaseRequisiteInput v-model="values.ogrn" kind="ogrn" :variant="slots.variant" :size-scale="slots.sizeScale" />
		<BaseRequisiteInput v-model="values.bik" kind="bik" :variant="slots.variant" :size-scale="slots.sizeScale" />
		<BaseRequisiteInput v-model="values.account" kind="account" :bik="values.bik" :variant="slots.variant" :size-scale="slots.sizeScale" />
		<BaseRequisiteInput
			v-model="values.correspondentAccount"
			kind="correspondentAccount"
			:bik="values.bik"
			:variant="slots.variant"
			:size-scale="slots.sizeScale" />
		<BaseRequisiteInput v-model="values.snils" kind="snils" label="СНИЛС директора" :variant="slots.variant" :size-scale="slots.sizeScale" />
	</div>
`

export const Company: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Реквизиты организации: все значения верны. Расчётный и корреспондентский счёт проверяются по БИК из соседнего поля.',
			},
			source: storySource({ template, imports: ['BaseRequisiteInput'], state }),
		},
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseRequisiteInput },
		setup: useStorySetup(args, { state }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByLabelText('СНИЛС директора')).toHaveValue('112-233-445 95')
		for (const field of canvas.getAllByRole('textbox')) await expect(field).not.toHaveAttribute('aria-invalid', 'true')
	},
}
