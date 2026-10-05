import { mount } from '@vue/test-utils'
import { defineComponent, effectScope, h, nextTick, ref, Teleport } from 'vue'
import {
	readThemeAttrs,
	TELEPORT_TARGET_KEY,
	useInheritedTheme,
	useInheritedThemeAttrs,
	useOwnThemeAttrs,
	useTeleportTarget,
} from '../useTeleportTarget'

describe('useTeleportTarget', () => {
	it('body по умолчанию, вне компонента и без настройки', () => {
		expect(useTeleportTarget()).toBe('body')

		let target: unknown
		mount(defineComponent({ setup: () => ((target = useTeleportTarget()), () => null) }))
		expect(target).toBe('body')
	})

	it('цель из плагина или BaseApp', () => {
		let target: unknown
		mount(defineComponent({ setup: () => ((target = useTeleportTarget()), () => null) }), {
			global: { provide: { [TELEPORT_TARGET_KEY as symbol]: '#layers' } },
		})
		expect(target).toBe('#layers')
	})
})

describe('useInheritedTheme', () => {
	it('при открытии берёт тему ближайшего предка якоря', async () => {
		const section = document.createElement('section')
		section.setAttribute('data-theme', 'dark')
		const anchor = document.createElement('button')
		section.append(anchor)
		const isOpen = ref(false)
		let theme!: ReturnType<typeof useInheritedTheme>
		mount(
			defineComponent({
				setup: () => (
					(theme = useInheritedTheme(
						() => anchor,
						() => isOpen.value,
					)),
					() => h('div')
				),
			}),
		)

		await nextTick()
		expect(theme.value).toBeUndefined()

		isOpen.value = true
		await nextTick()
		expect(theme.value).toBe('dark')

		section.setAttribute('data-theme', 'light')
		isOpen.value = false
		await nextTick()
		expect(theme.value).toBe('dark')
	})

	it('без темы у предков и без якоря — undefined', async () => {
		let plain!: ReturnType<typeof useInheritedTheme>
		let detached!: ReturnType<typeof useInheritedTheme>
		mount(
			defineComponent({
				setup() {
					plain = useInheritedTheme(
						() => document.createElement('button'),
						() => true,
					)
					detached = useInheritedTheme(
						() => null,
						() => true,
					)
					return () => h('div')
				},
			}),
		)
		await nextTick()

		expect(plain.value).toBeUndefined()
		expect(detached.value).toBeUndefined()
	})
})

describe('readThemeAttrs', () => {
	it('режим и тема бренда ищутся у разных предков независимо', () => {
		const brand = document.createElement('div')
		brand.setAttribute('data-rise-theme', 'playful')
		brand.setAttribute('data-theme', 'dark')
		const light = document.createElement('section')
		light.setAttribute('data-theme', 'light')
		const anchor = document.createElement('button')
		light.append(anchor)
		brand.append(light)

		expect(readThemeAttrs(anchor)).toEqual({ 'data-theme': 'light', 'data-rise-theme': 'playful' })
	})

	it('пресет движения data-rise-motion ищется так же независимо', () => {
		const area = document.createElement('div')
		area.setAttribute('data-rise-motion', 'subtle')
		const anchor = document.createElement('button')
		area.append(anchor)

		expect(readThemeAttrs(anchor)).toEqual({ 'data-rise-motion': 'subtle' })
	})

	it('без атрибутов у предков и без якоря — пустой объект', () => {
		expect(readThemeAttrs(document.createElement('button'))).toEqual({})
		expect(readThemeAttrs(null)).toEqual({})
	})
})

describe('useInheritedThemeAttrs', () => {
	function setup(anchor: () => Element | null, isOpen: () => boolean) {
		let attrs!: ReturnType<typeof useInheritedThemeAttrs>
		mount(defineComponent({ setup: () => ((attrs = useInheritedThemeAttrs(anchor, isOpen)), () => h('div')) }))
		return attrs
	}

	it('при открытии копирует data-theme и data-rise-theme области якоря', async () => {
		const area = document.createElement('div')
		area.setAttribute('data-theme', 'dark')
		area.setAttribute('data-rise-theme', 'corporate')
		const anchor = document.createElement('button')
		area.append(anchor)
		const isOpen = ref(false)
		const attrs = setup(
			() => anchor,
			() => isOpen.value,
		)

		await nextTick()
		expect(attrs.value).toEqual({})

		isOpen.value = true
		await nextTick()
		expect(attrs.value).toEqual({ 'data-theme': 'dark', 'data-rise-theme': 'corporate' })
	})

	it('панель, открытая при монтировании, читает тему сразу; закрытие не сбрасывает', async () => {
		const area = document.createElement('div')
		area.setAttribute('data-rise-theme', 'minimal')
		const anchor = document.createElement('span')
		area.append(anchor)
		const isOpen = ref(true)
		const attrs = setup(
			() => anchor,
			() => isOpen.value,
		)
		await nextTick()
		expect(attrs.value).toEqual({ 'data-rise-theme': 'minimal' })

		isOpen.value = false
		await nextTick()
		expect(attrs.value).toEqual({ 'data-rise-theme': 'minimal' })
	})
})

describe('useOwnThemeAttrs', () => {
	it('якорь — родитель места компонента в разметке (метки телепорта)', async () => {
		const area = document.createElement('div')
		area.setAttribute('data-rise-motion', 'expressive')
		area.setAttribute('data-theme', 'dark')
		document.body.append(area)
		const isOpen = ref(false)
		let attrs!: ReturnType<typeof useOwnThemeAttrs>
		const Comp = defineComponent({
			setup: () => {
				attrs = useOwnThemeAttrs(() => isOpen.value)
				return () => h(Teleport, { to: 'body' }, [h('div', { class: 'panel' })])
			},
		})
		const wrapper = mount(Comp, { attachTo: area })
		expect(attrs.value).toEqual({})

		isOpen.value = true
		await nextTick()
		expect(attrs.value).toEqual({ 'data-theme': 'dark', 'data-rise-motion': 'expressive' })
		wrapper.unmount()
		area.remove()
	})

	it('вне компонента (без экземпляра) — пустой объект', () => {
		let attrs!: ReturnType<typeof useOwnThemeAttrs>
		const scope = effectScope()
		scope.run(() => {
			attrs = useOwnThemeAttrs(() => true)
		})
		expect(attrs.value).toEqual({})
		scope.stop()
	})
})
