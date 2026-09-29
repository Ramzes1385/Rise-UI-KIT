import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { TELEPORT_TARGET_KEY, useInheritedTheme, useTeleportTarget } from '../useTeleportTarget'

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
