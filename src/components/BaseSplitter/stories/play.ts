import { isRtl } from '@utils/dom/directionUtils'
import { inlineKey, tabTo } from '@/stories/helpers'
import { expect, userEvent as defaultUserEvent, waitFor } from 'storybook/test'

type PlayUserEvent = Pick<ReturnType<typeof defaultUserEvent.setup>, 'tab' | 'keyboard'>

interface SplitterBounds {
	min: number
	max: number
	step: number
	orientation?: 'horizontal' | 'vertical'
}

const pointer = (type: string, x: number, y: number) =>
	new PointerEvent(type, { bubbles: true, clientX: x, clientY: y, button: 0, pointerType: 'mouse' })

export async function checkSplitterKeyboard(separator: HTMLElement, bounds: SplitterBounds, userEvent: PlayUserEvent): Promise<void> {
	const { min, max, step, orientation = 'horizontal' } = bounds
	const [less, more] = orientation === 'horizontal' ? [inlineKey('{ArrowLeft}'), inlineKey('{ArrowRight}')] : ['{ArrowUp}', '{ArrowDown}']
	await expect(separator).toHaveAttribute('aria-valuemin', String(min))
	await expect(separator).toHaveAttribute('aria-valuemax', String(max))
	await tabTo(separator, userEvent)
	await userEvent.keyboard('{Home}')
	await expect(separator).toHaveAttribute('aria-valuenow', String(min))
	await userEvent.keyboard(less)
	await expect(separator).toHaveAttribute('aria-valuenow', String(min))
	await userEvent.keyboard(more)
	await expect(separator).toHaveAttribute('aria-valuenow', String(min + step))
	await userEvent.keyboard('{End}')
	await expect(separator).toHaveAttribute('aria-valuenow', String(max))
	await userEvent.keyboard(more)
	await expect(separator).toHaveAttribute('aria-valuenow', String(max))
	await userEvent.keyboard(less)
	await expect(separator).toHaveAttribute('aria-valuenow', String(max - step))
}

export async function checkSplitterDrag(
	separator: HTMLElement,
	bounds: Pick<SplitterBounds, 'min' | 'max' | 'orientation'>,
): Promise<void> {
	const { min, max, orientation = 'horizontal' } = bounds
	const root = separator.parentElement as HTMLElement
	const rect = root.getBoundingClientRect()
	const isHorizontal = orientation === 'horizontal'
	const startX = isHorizontal && isRtl(root) ? rect.right : rect.left
	const at = (percent: number) => {
		const offset = ((isHorizontal ? rect.width : rect.height) * percent) / 100
		const x = isHorizontal && isRtl(root) ? startX - offset : startX + offset
		return isHorizontal ? pointer('pointermove', x, rect.top) : pointer('pointermove', rect.left, rect.top + offset)
	}
	const middle = Math.round((min + max) / 2)
	separator.setPointerCapture = () => undefined
	separator.dispatchEvent(pointer('pointerdown', startX, rect.top))
	separator.dispatchEvent(at(middle))
	await waitFor(() => expect(separator).toHaveAttribute('aria-valuenow', String(middle)))
	separator.dispatchEvent(at(100))
	await waitFor(() => expect(separator).toHaveAttribute('aria-valuenow', String(max)))
	separator.dispatchEvent(at(0))
	await waitFor(() => expect(separator).toHaveAttribute('aria-valuenow', String(min)))
	separator.dispatchEvent(pointer('pointerup', startX, rect.top))
}
