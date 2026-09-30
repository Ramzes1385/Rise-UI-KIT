import { mount } from '@vue/test-utils'
import { setLocale } from '@/locales/state'
import { defineComponent, h, inject } from 'vue'
import { UI_ARIA } from '@/locales/messages'
import { createUiKitPlugin, UI_COMPONENTS, uiKitPlugin } from '@/plugin'
import { TELEPORT_TARGET_KEY } from '@composables/app/useTeleportTarget/useTeleportTarget'
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { BaseLink } from '@components/BaseLink'

const RouterLinkStub = defineComponent({
	name: 'RouterLinkStub',
	props: { to: { type: String, required: true } },
	setup:
		(props, { slots }) =>
		() =>
			h('a', { href: props.to, 'data-router': '' }, slots.default?.()),
})

const CustomIcon = defineComponent({ name: 'CustomIcon', render: () => h('svg', { 'data-custom': '' }) })

describe('createUiKitPlugin', () => {
	it('регистрирует компоненты глобально, с префиксом', () => {
		const wrapper = mount(
			{ template: '<UiBaseButton>Сохранить</UiBaseButton>' },
			{ global: { plugins: [createUiKitPlugin({ prefix: 'Ui' })] } },
		)

		expect(wrapper.get('button').classes()).toContain('base-button')
	})

	it('defaults: global — для всех компонентов, по имени — для одного', () => {
		const plugin = createUiKitPlugin({ defaults: { global: { sizeScale: 90 }, BaseButton: { variant: 'soft' } } })
		const wrapper = mount(
			{ render: () => [h(BaseButton, null, () => 'Сохранить'), h(BaseButton, { variant: 'outline' }, () => 'Отмена')] },
			{ global: { plugins: [plugin] } },
		)

		const [save, cancel] = wrapper.findAll('button')
		expect(save.classes()).toContain('base-button--soft')
		expect(save.attributes('style')).toContain('--size-scale: 0.9')
		expect(cancel.classes()).toContain('base-button--outline')
	})

	it('icons: иконка кита заменяется символом спрайта или компонентом', () => {
		const plugin = createUiKitPlugin({ iconSpritePath: '/icons.svg', icons: { close: 'x-mark', search: CustomIcon } })
		const wrapper = mount(
			{ render: () => [h(BaseIcon, { name: 'close' }), h(BaseIcon, { name: 'search' })] },
			{ global: { plugins: [plugin] } },
		)

		expect(wrapper.get('use').attributes('href')).toBe('/icons.svg#x-mark')
		const custom = wrapper.get('[data-custom]')
		expect(custom.classes()).toContain('base-icon__svg')
		expect(custom.attributes('aria-hidden')).toBe('true')
	})

	it('linkComponent: ссылки на маршруты рендерит компонент приложения', () => {
		const wrapper = mount(BaseLink, {
			props: { to: '/docs', label: 'Документация' },
			global: { plugins: [createUiKitPlugin({ linkComponent: RouterLinkStub })] },
		})

		expect(wrapper.get('a').attributes()).toMatchObject({ href: '/docs', 'data-router': '' })
	})

	it('без настроек: имена как есть, тяжёлые компоненты — асинхронные', () => {
		const wrapper = mount({ template: '<BaseButton>Сохранить</BaseButton>' }, { global: { plugins: [uiKitPlugin] } })

		expect(wrapper.get('button').classes()).toContain('base-button')
		expect(Object.keys(UI_COMPONENTS)).toHaveLength(115)
		expect(
			Object.entries(UI_COMPONENTS)
				.filter(([, component]) => '__asyncLoader' in component)
				.map(([name]) => name),
		).toEqual(['BaseCalendar', 'BaseChat', 'BaseDatePicker', 'BaseEditor', 'BaseFileUpload', 'BaseTable'])
	})

	it('teleportTo и locale: контейнер слоёв для provide, язык — для всего кита', () => {
		const Probe = defineComponent({ setup: () => () => h('output', String(inject(TELEPORT_TARGET_KEY, 'body'))) })
		const wrapper = mount(Probe, { global: { plugins: [createUiKitPlugin({ teleportTo: '#layers', locale: 'en' })] } })

		expect(wrapper.text()).toBe('#layers')
		expect(UI_ARIA.BREADCRUMBS_NAV).toBe('Breadcrumbs')
		setLocale('ru')
	})
})
