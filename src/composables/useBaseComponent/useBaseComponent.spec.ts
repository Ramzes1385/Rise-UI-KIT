import { render } from '@testing-library/vue'
import { describe, it, expect } from 'vitest'
import { defineComponent, h } from 'vue'
import { useBaseComponent } from './useBaseComponent'

const TestComponent = defineComponent({
	props: {
		variant: { type: String, default: undefined },
		sizeScale: { type: Number, default: undefined },
		color: { type: Object, default: undefined },
		customClass: { type: [String, Object], default: undefined },
	},
	setup(props) {
		const result = useBaseComponent({
			block: 'test-block',
			getVariant: () => props.variant,
			getSizeScale: () => props.sizeScale ?? 100,
			getColor: () => props.color,
			getClass: () => props.customClass,
			elementKeys: ['root', 'label'],
		})
		return result
	},
	render() {
		return h('div', {
			class: [this.variantClass, this.classes.root],
			style: [this.sizeScaleStyle, this.variantStyle, this.customColorStyle],
		})
	},
})

describe('useBaseComponent', () => {
	it('returns all required composable results', () => {
		const { container } = render(TestComponent)
		expect(container.querySelector('div')).toBeTruthy()
	})

	it('applies variant class when variant is not default', () => {
		const { container } = render(TestComponent, { props: { variant: 'ghost' } })
		expect(container.querySelector('.test-block--ghost')).toBeTruthy()
	})

	it('does not apply variant class for default variant', () => {
		const { container } = render(TestComponent, { props: { variant: 'default' } })
		const el = container.querySelector('div') as HTMLElement
		expect(el.classList.contains('test-block--default')).toBe(false)
	})

	it('applies --size-scale when not 100', () => {
		const { container } = render(TestComponent, { props: { sizeScale: 150 } })
		const el = container.querySelector('div') as HTMLElement
		expect(el.style.getPropertyValue('--size-scale')).toBe('1.5')
	})

	it('does not apply --size-scale when 100', () => {
		const { container } = render(TestComponent, { props: { sizeScale: 100 } })
		const el = container.querySelector('div') as HTMLElement
		expect(el.style.getPropertyValue('--size-scale')).toBe('')
	})

	it('applies custom color CSS variables', () => {
		const { container } = render(TestComponent, {
			props: { color: { bg: { base: '#ff0000' } } },
		})
		const el = container.querySelector('div') as HTMLElement
		expect(el.style.getPropertyValue('--custom-bg')).toBe('#ff0000')
	})

	it('applies custom class as string to root', () => {
		const { container } = render(TestComponent, {
			props: { customClass: 'my-class' },
		})
		expect(container.querySelector('.my-class')).toBeTruthy()
	})

	it('applies custom class as object with element keys', () => {
		const { container } = render(TestComponent, {
			props: { customClass: { root: 'root-class', label: 'label-class' } },
		})
		expect(container.querySelector('.root-class')).toBeTruthy()
	})
})
