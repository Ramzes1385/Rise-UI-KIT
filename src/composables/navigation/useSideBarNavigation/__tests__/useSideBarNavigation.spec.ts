import { defineComponent, nextTick, reactive } from 'vue'
import { useSideBarNavigation } from '../useSideBarNavigation'
import type { UseSideBarNavigationOptions } from '../types/useSideBarNavigation.types'
import type { BaseSideBarNavigationProps, SideBarItem } from '@components/BaseSideBar/types/BaseSideBar.types'

const RouterLink = defineComponent({ name: 'RouterLink' })

function setup(props: BaseSideBarNavigationProps = {}) {
	const emit = vi.fn()
	const navigation = useSideBarNavigation({ props, emit: emit as unknown as UseSideBarNavigationOptions['emit'] })
	return { navigation, emit }
}

function click(): MouseEvent {
	return new MouseEvent('click', { cancelable: true })
}

const group: SideBarItem = {
	label: 'Настройки',
	children: [
		{ label: 'Профиль', to: '/settings/profile' },
		{ label: 'Безопасность', to: '/settings/security' },
	],
}

describe('useSideBarNavigation', () => {
	describe('ключ пункта', () => {
		it('по key, затем по адресу, затем по подписи', () => {
			const { navigation } = setup()

			expect(navigation.getItemKey({ key: 7, label: 'Пункт', to: '/a' })).toBe(7)
			expect(navigation.getItemKey({ label: 'Пункт', to: '/a' })).toBe('/a')
			expect(navigation.getItemKey({ label: 'Пункт', to: { name: 'home' } })).toBe('{"name":"home"}')
			expect(navigation.getItemKey({ label: 'Пункт' })).toBe('Пункт')
		})
	})

	describe('элемент и атрибуты пункта', () => {
		it('пункт без адреса или отключённый — кнопка', () => {
			const { navigation } = setup()

			expect(navigation.getItemComponent({ label: 'Выход' })).toBe('button')
			expect(navigation.getItemProps({ label: 'Выход' })).toEqual({ type: 'button', disabled: undefined })
			expect(navigation.getItemComponent({ label: 'Отчёты', to: '/reports', isDisabled: true })).toBe('button')
			expect(navigation.getItemProps({ label: 'Отчёты', to: '/reports', isDisabled: true })).toEqual({
				type: 'button',
				disabled: true,
			})
		})

		it('внутренний адрес — компонент роутера с to, по умолчанию — ссылка', () => {
			const withRouter = setup({ linkComponent: RouterLink }).navigation
			expect(withRouter.getItemComponent({ label: 'Главная', to: '/' })).toBe(RouterLink)
			expect(withRouter.getItemProps({ label: 'Главная', to: { name: 'home' } })).toEqual({ to: { name: 'home' } })

			const plain = setup().navigation
			expect(plain.getItemComponent({ label: 'Главная', to: '/' })).toBe('a')
		})

		it('внешний адрес — обычная ссылка с href даже при роутере', () => {
			const { navigation } = setup({ linkComponent: RouterLink })
			const item: SideBarItem = { label: 'Документация', to: 'https://example.com/docs' }

			expect(navigation.getItemComponent(item)).toBe('a')
			expect(navigation.getItemProps(item)).toEqual({ href: 'https://example.com/docs' })
		})

		it('linkComponent «a» — href; объектный адрес превращается в «#»', () => {
			const { navigation } = setup({ linkComponent: 'a' })

			expect(navigation.getItemProps({ label: 'Главная', to: '/' })).toEqual({ href: '/' })
			expect(navigation.getItemProps({ label: 'Главная', to: { name: 'home' } })).toEqual({ href: '#' })
		})

		it('небезопасный адрес остаётся кнопкой и предупреждает один раз', () => {
			const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
			const { navigation } = setup()
			const item: SideBarItem = { label: 'Опасно', to: 'javascript:alert(1)' }

			expect(navigation.getItemComponent(item)).toBe('button')
			expect(navigation.getItemProps(item)).toEqual({ type: 'button', disabled: undefined })

			expect(warn).toHaveBeenCalledOnce()
			expect(String(warn.mock.calls[0][0])).toContain('Опасно')
		})
	})

	describe('группы', () => {
		it('группа без адреса раскрывается и сворачивается кликом', () => {
			const { navigation, emit } = setup()
			const event = click()

			expect(navigation.isDisclosureItem(group)).toBe(true)
			expect(navigation.isItemExpanded(group)).toBe(false)
			expect(navigation.getItemAriaExpanded(group)).toBe(false)

			navigation.handleClick(group, event)
			expect(event.defaultPrevented).toBe(true)
			expect(navigation.isItemExpanded(group)).toBe(true)
			expect(navigation.shouldRenderChildren(group)).toBe(true)
			expect(emit).toHaveBeenCalledWith('itemClick', group, event)

			navigation.handleClick(group, click())
			expect(navigation.isItemExpanded(group)).toBe(false)
		})

		it('группа с активным пунктом раскрыта сама', () => {
			const { navigation } = setup({ activePath: '/settings/security' })

			expect(navigation.isItemExpanded(group)).toBe(true)
			expect(navigation.isItemActive(group)).toBe(true)
			expect(navigation.isCurrentItemActive(group)).toBe(false)
		})

		it('отключённая группа не раскрывается; пункт с адресом и детьми раскрыт всегда', () => {
			const { navigation } = setup()

			expect(navigation.isItemExpanded({ ...group, isDisabled: true })).toBe(false)
			const linkGroup: SideBarItem = { ...group, to: '/settings' }
			expect(navigation.isDisclosureItem(linkGroup)).toBe(false)
			expect(navigation.isItemExpanded(linkGroup)).toBe(true)
			expect(navigation.getItemAriaExpanded(linkGroup)).toBeUndefined()
		})

		it('в свёрнутом сайдбаре дети не показываются и клик группу не раскрывает', () => {
			const { navigation } = setup({ isCollapsed: true })

			navigation.handleClick(group, click())

			expect(navigation.shouldRenderChildren(group)).toBe(false)
			expect(navigation.getItemAriaExpanded(group)).toBeUndefined()
			expect(navigation.isItemExpanded(group)).toBe(false)
		})

		it('пункт без детей не рендерит вложенный список', () => {
			const { navigation } = setup()

			expect(navigation.hasChildren({ label: 'Пункт', children: [] })).toBe(false)
			expect(navigation.shouldRenderChildren({ label: 'Пункт' })).toBe(false)
		})
	})

	describe('активный пункт', () => {
		it('явный isActive', () => {
			expect(setup().navigation.isCurrentItemActive({ label: 'Пункт', isActive: true })).toBe(true)
		})

		it('по ключу, если заданы оба ключа', () => {
			const { navigation } = setup({ activeKey: 'b', activePath: '/a' })

			expect(navigation.isCurrentItemActive({ key: 'b', label: 'Б' })).toBe(true)
			expect(navigation.isCurrentItemActive({ key: 'a', label: 'А', to: '/a' })).toBe(false)
		})

		it('по точному адресу', () => {
			const { navigation } = setup({ activePath: '/reports' })

			expect(navigation.isCurrentItemActive({ label: 'Отчёты', to: '/reports' })).toBe(true)
			expect(navigation.isCurrentItemActive({ label: 'Отчёты', to: '/reports/2026' })).toBe(false)
			expect(navigation.isCurrentItemActive({ label: 'Отчёты', to: { name: 'reports' } })).toBe(false)
			expect(navigation.isCurrentItemActive({ label: 'Отчёты' })).toBe(false)
		})

		it('без activePath ничего не активно', () => {
			expect(setup().navigation.isItemActive({ label: 'Отчёты', to: '/reports' })).toBe(false)
		})

		it('startsWith — вложенный адрес активирует пункт без детей', () => {
			const { navigation } = setup({ activePath: '/reports/2026', activeMatch: 'startsWith' })

			expect(navigation.isCurrentItemActive({ label: 'Отчёты', to: '/reports' })).toBe(true)
			expect(navigation.isCurrentItemActive({ label: 'Отчёты', to: '/reports', children: [{ label: 'Год', to: '/year' }] })).toBe(
				false,
			)
		})
	})

	describe('клик', () => {
		it('отключённый пункт гасит клик без события', () => {
			const { navigation, emit } = setup()
			const onClick = vi.fn()
			const event = click()

			navigation.handleClick({ label: 'Пункт', isDisabled: true, click: onClick }, event)

			expect(event.defaultPrevented).toBe(true)
			expect(onClick).not.toHaveBeenCalled()
			expect(emit).not.toHaveBeenCalled()
		})

		it('обычный пункт вызывает свой click и отдаёт itemClick', () => {
			const { navigation, emit } = setup()
			const onClick = vi.fn()
			const item: SideBarItem = { label: 'Пункт', to: '/a', click: onClick }
			const event = click()

			navigation.handleClick(item, event)

			expect(event.defaultPrevented).toBe(false)
			expect(onClick).toHaveBeenCalledWith(item, event)
			expect(emit).toHaveBeenCalledWith('itemClick', item, event)
		})

		it('клик по вложенному пункту пробрасывается наверх', () => {
			const { navigation, emit } = setup()
			const event = click()

			navigation.handleChildItemClick(group.children![0], event)

			expect(emit).toHaveBeenCalledWith('itemClick', group.children![0], event)
		})
	})

	describe('пропсы слота', () => {
		it('по умолчанию — первый уровень, не свёрнут; onClick — клик по пункту', () => {
			const { navigation, emit } = setup({ activePath: '/a' })
			const item: SideBarItem = { label: 'Пункт', to: '/a' }

			const slot = navigation.getSlotProps(item)
			expect(slot).toMatchObject({ item, level: 0, isActive: true, isCurrent: true, isCollapsed: false, hasChildren: false })

			const event = click()
			slot.onClick(event)
			expect(emit).toHaveBeenCalledWith('itemClick', item, event)
		})

		it('уровень и свёрнутость из пропсов', () => {
			const { navigation } = setup({ level: 2, isCollapsed: true })

			expect(navigation.getSlotProps(group)).toMatchObject({ level: 2, isCollapsed: true, hasChildren: true })
		})
	})

	describe('активный путь: слэш, query и хеш (SB-11)', () => {
		const item: SideBarItem = { label: 'Пользователи', to: '/users' }

		it.each(['/users/', '/users?page=2', '/users#top', '/users/?page=2#top', '/users?'])(
			'«%s» активирует пункт «/users»',
			activePath => {
				expect(setup({ activePath }).navigation.isCurrentItemActive(item)).toBe(true)
			},
		)

		it('завершающий слэш и хеш в to не мешают; корень остаётся корнем', () => {
			expect(setup({ activePath: '/users' }).navigation.isCurrentItemActive({ label: 'П', to: '/users/#list' })).toBe(true)
			expect(setup({ activePath: '//' }).navigation.isCurrentItemActive({ label: 'Главная', to: '/' })).toBe(true)
			expect(setup({ activePath: '/users' }).navigation.isCurrentItemActive({ label: 'Главная', to: '/' })).toBe(false)
		})

		it('to с query требует совпадения query; to без query её игнорирует', () => {
			const { navigation } = setup({ activePath: '/users?tab=a' })

			expect(navigation.isCurrentItemActive({ label: 'A', to: '/users?tab=a' })).toBe(true)
			expect(navigation.isCurrentItemActive({ label: 'B', to: '/users?tab=b' })).toBe(false)
			expect(navigation.isCurrentItemActive({ label: 'Все', to: '/users' })).toBe(true)
		})

		it('якорь без пути не считается корнем; похожий префикс не совпадает', () => {
			expect(setup({ activePath: '/' }).navigation.isCurrentItemActive({ label: 'Якорь', to: '#top' })).toBe(false)
			expect(setup({ activePath: '/users-old', activeMatch: 'startsWith' }).navigation.isCurrentItemActive(item)).toBe(false)
			expect(setup({ activePath: '/users/42/?x=1', activeMatch: 'startsWith' }).navigation.isCurrentItemActive(item)).toBe(true)
		})
	})

	describe('свернуть активную группу (SB-3)', () => {
		it('клик по группе с активным пунктом сворачивает её, второй клик раскрывает', () => {
			const { navigation } = setup({ activePath: '/settings/security' })

			expect(navigation.isItemExpanded(group)).toBe(true)
			navigation.handleClick(group, click())
			expect(navigation.isItemExpanded(group)).toBe(false)
			expect(navigation.getItemAriaExpanded(group)).toBe(false)
			navigation.handleClick(group, click())
			expect(navigation.isItemExpanded(group)).toBe(true)
		})

		it('выбор пользователя сбрасывается, когда активный пункт приходит в группу или уходит из неё', async () => {
			const props = reactive<BaseSideBarNavigationProps>({ items: [group], activePath: '/settings/security' })
			const { navigation } = setup(props)

			navigation.handleClick(group, click())
			expect(navigation.isItemExpanded(group)).toBe(false)

			props.activePath = '/settings/profile'
			await nextTick()
			expect(navigation.isItemExpanded(group)).toBe(false)

			props.activePath = '/home'
			await nextTick()
			expect(navigation.isItemExpanded(group)).toBe(false)

			props.activePath = '/settings/profile'
			await nextTick()
			expect(navigation.isItemExpanded(group)).toBe(true)
		})

		it('раскрытая вручную неактивная группа остаётся раскрытой при смене маршрута вне группы', async () => {
			const props = reactive<BaseSideBarNavigationProps>({ items: [group], activePath: '/home' })
			const { navigation } = setup(props)

			navigation.handleClick(group, click())
			props.activePath = '/about'
			await nextTick()

			expect(navigation.isItemExpanded(group)).toBe(true)
		})
	})

	describe('одинаковые ключи (SB-12)', () => {
		const first: SideBarItem = { label: 'Раздел', children: [{ label: 'А', to: '/a' }] }
		const second: SideBarItem = { label: 'Раздел', children: [{ label: 'Б', to: '/b' }] }

		afterEach(() => {
			vi.restoreAllMocks()
		})

		it('второй и следующие пункты получают уникальный ключ, состояние раскрытия у них своё', () => {
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
			const { navigation } = setup({ items: [first, second, { label: 'Раздел' }] })

			expect(navigation.getItemKey(first)).toBe('Раздел')
			expect(navigation.getItemKey(second)).toBe('Раздел#1')
			navigation.handleClick(second, click())
			expect(navigation.isItemExpanded(second)).toBe(true)
			expect(navigation.isItemExpanded(first)).toBe(false)
			expect(warnSpy).toHaveBeenCalledTimes(1)
			expect(warnSpy.mock.calls[0][0]).toContain('«Раздел»')
		})

		it('предупреждает один раз на ключ, даже если список пересчитывается', async () => {
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
			const props = reactive<BaseSideBarNavigationProps>({ items: [first, second] })
			setup(props)

			props.items = [first, second, { label: 'Другой' }]
			await nextTick()
			props.items = [first, second]
			await nextTick()

			expect(warnSpy).toHaveBeenCalledTimes(1)
		})

		it('один и тот же объект дважды в списке сохраняет первый ключ', () => {
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
			const { navigation } = setup({ items: [first, second, first] })

			expect(navigation.getItemKey(first)).toBe('Раздел')
			expect(navigation.getItemKey(second)).toBe('Раздел#1')
			expect(warnSpy).toHaveBeenCalledTimes(1)
		})

		it('без дублей предупреждений нет', () => {
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
			setup({ items: [first, { label: 'Другой' }] })

			expect(warnSpy).not.toHaveBeenCalled()
		})
	})
})
