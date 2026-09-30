import { demoSource } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDadataInput.stories'
import BaseDadataInput from '../../../ui/BaseDadataInput.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const sources = {
	address: demoSource('address'),
	party: demoSource('party'),
	bank: demoSource('bank'),
	fio: demoSource('fio'),
	email: demoSource('email'),
}

const template = `
	<div class="story-stack" style="max-width: 480px; min-height: 360px">
		<BaseDadataInput v-bind="args" kind="address" label="Адрес" placeholder="Город, улица, дом" :source="sources.address" />
		<BaseDadataInput v-bind="args" kind="party" label="Организация" placeholder="Название, ИНН или ОГРН" :source="sources.party" />
		<BaseDadataInput v-bind="args" kind="bank" label="Банк" placeholder="Название или БИК" :source="sources.bank" />
		<BaseDadataInput v-bind="args" kind="fio" label="ФИО" placeholder="Фамилия Имя Отчество" :source="sources.fio" />
		<BaseDadataInput v-bind="args" kind="email" label="Почта" placeholder="name@example.ru" :source="sources.email" />
	</div>
`

export const Kinds: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Пять видов подсказок: адрес («тверская»), организация («яндекс»), банк («044525»), ФИО («иван»), почта («ivan@»). У организации и банка во второй строке — ИНН или БИК и адрес. В превью источники — демо-списки, в коде — `createDadataSource` с вашим ключом.',
			},
			source: storySource({
				template,
				imports: ['BaseDadataInput'],
				omit: ['kind', 'label', 'placeholder'],
				importsFrom: { '@ramzes1385/rise-ui-kit/utils': ['createDadataSource', 'DADATA_KINDS'] },
				script: [
					'const token = import.meta.env.VITE_DADATA_TOKEN',
					'const sources = Object.fromEntries(DADATA_KINDS.map(kind => [kind, createDadataSource(kind, { token })]))',
				].join('\n'),
			}),
		},
		controls: { include: ['variant', 'sizeScale', 'token', 'baseUrl'] },
	},
	render: args => ({
		components: { BaseDadataInput },
		setup: useStorySetup(args, { data: { sources } }),
		template,
	}),
}
