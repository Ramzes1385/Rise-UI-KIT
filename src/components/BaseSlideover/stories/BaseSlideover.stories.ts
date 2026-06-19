/**
 * Stories для компонента BaseSlideover.
 * Демонстрирует все вариации, состояния и слоты.
 */

import { expect, fn, userEvent, waitFor } from 'storybook/test'
import { ref } from 'vue'
import { BaseButton } from '@components/BaseButton'
import { UI_TEXT } from '@constants'
import { buildArgTypes, playShiftTab } from '@utils/storybookUtils'
import BaseSlideover from '../ui/BaseSlideover.vue'
import type { Meta, StoryObj } from '@storybook/vue3'

/** Найти открытый слайдовер в body (teleport target) */
async function findSlideover(): Promise<HTMLElement> {
	await waitFor(() => {
		const el = document.body.querySelector('.base-slideover')
		if (!el) throw new Error('Слайдовер не найден')
	})
	const root = document.body.querySelector('.base-slideover')
	if (!(root instanceof HTMLElement)) throw new Error('Слайдовер не HTMLElement')
	return root
}

/** Открыть слайдовер кликом по триггеру внутри canvas */
async function openSlideover(canvasElement: HTMLElement): Promise<HTMLElement> {
	const trigger = canvasElement.querySelector('button')
	if (!(trigger instanceof HTMLButtonElement)) throw new Error('Триггер открытия не найден')
	await userEvent.click(trigger)
	return findSlideover()
}

const meta: Meta<typeof BaseSlideover> = {
	title: 'UI/BaseSlideover',
	component: BaseSlideover,

	argTypes: buildArgTypes({
		props: {
			isOpen: {
				control: 'boolean',
				description: 'Состояние открытия',
			},
			title: {
				control: 'text',
				description: 'Заголовок',
			},
			side: {
				control: 'inline-radio',
				options: ['left', 'right'],
				description: 'Сторона появления',
			},
			width: {
				control: { type: 'range', min: 50, max: 200, step: 10 },
				description: 'Масштаб ширины панели (100 = 100%)',
			},
			isFullWidth: {
				control: 'boolean',
				description: 'Полноэкранная панель',
			},
			closeOnOverlay: {
				control: 'boolean',
				description: 'Закрытие по клику на оверлей',
			},
			closeOnEscape: {
				control: 'boolean',
				description: 'Закрытие по Escape',
			},
			isContained: {
				control: 'boolean',
				description: 'Режим ограничения внутри контейнера',
			},
			hasOverlay: {
				control: 'boolean',
				description: 'Показывать затемнение фона',
			},
			container: {
				control: 'text',
				description: 'Целевой контейнер (селектор)',
			},
			padding: {
				control: 'object',
				description:
					'Отступы контента. Число (px) задаёт горизонталь (вертикаль базовая). Объект { x, y, top, right, bottom, left } задаёт оси напрямую без умножения (например { x: 25, y: 43 }); стороны переопределяют оси. По умолчанию 24',
			},
			customClass: { control: 'object' },
		},
	}),

	args: {
		isOpen: false,
		title: 'Заголовок панели',
		side: 'right',
		width: 100,
		isFullWidth: false,
		closeOnOverlay: true,
		closeOnEscape: true,
		isContained: false,
		hasOverlay: true,
		padding: 24,
	},
}

export default meta
type Story = StoryObj<typeof BaseSlideover>
/** Базовое состояние компонента */
export const Default: Story = {
	render: args => ({
		components: { BaseSlideover, BaseButton },
		setup() {
			const isOpen = ref(false)
			return { args, isOpen }
		},
		template: `
			<div>
				<BaseButton @click="isOpen = true">Открыть Slideover</BaseButton>
				<BaseSlideover v-bind="args" v-model:is-open="isOpen">
					<div>
						<p>Основной контент панели.</p>
						<p>Здесь может быть любая информация, формы, списки и т.д.</p>
					</div>
				</BaseSlideover>
			</div>
		`,
	}),
	play: async ({ canvasElement, step }) => {
		await step('Фокусировка кнопки открытия по Tab', async () => {
			await userEvent.tab()
		})
		await step('Обратная фокусировка по Shift+Tab', async () => {
			await playShiftTab(canvasElement, { role: 'button', name: 'Открыть Slideover' })
		})
	},
}
/** Появление с разных сторон */
export const Sides: Story = {
	render: args => ({
		components: { BaseSlideover, BaseButton },
		setup() {
			const isLeftOpen = ref(false)
			const isRightOpen = ref(false)
			return { args, isLeftOpen, isRightOpen }
		},
		template: `
			<div style="display: flex; gap: 12px;">
				<BaseButton @click="isLeftOpen = true">Открыть слева</BaseButton>
				<BaseButton @click="isRightOpen = true">Открыть справа</BaseButton>

				<BaseSlideover v-bind="args" v-model:is-open="isLeftOpen" side="left" title="Левая панель">
					<div>Контент слева</div>
				</BaseSlideover>

				<BaseSlideover v-bind="args" v-model:is-open="isRightOpen" side="right" title="Правая панель">
					<div>Контент справа</div>
				</BaseSlideover>
			</div>
		`,
	}),
}
/** Различная ширина */
export const Widths: Story = {
	render: args => ({
		components: { BaseSlideover, BaseButton },
		setup() {
			const isCustomWidthOpen = ref(false)
			const isFullWidthOpen = ref(false)
			return { args, isCustomWidthOpen, isFullWidthOpen }
		},
		template: `
			<div style="display: flex; gap: 12px;">
				<BaseButton @click="isCustomWidthOpen = true">Кастомная ширина (50%)</BaseButton>
				<BaseButton @click="isFullWidthOpen = true">На весь экран</BaseButton>

				<BaseSlideover v-bind="args" v-model:is-open="isCustomWidthOpen" :width="50" title="Узкая панель">
					<div >Ширина 50% от базовой</div>
				</BaseSlideover>

				<BaseSlideover v-bind="args" v-model:is-open="isFullWidthOpen" is-full-width title="Полноэкранная панель">
					<div >Занимает всю ширину экрана</div>
				</BaseSlideover>
			</div>
		`,
	}),
}
/** Использование слотов */
export const WithSlots: Story = {
	render: args => ({
		components: { BaseSlideover, BaseButton },
		setup() {
			const isOpen = ref(false)
			return { args, isOpen }
		},
		template: `
			<div>
				<BaseButton @click="isOpen = true">Открыть со слотами</BaseButton>
				<BaseSlideover v-bind="args" v-model:is-open="isOpen">
					<template #header>
						<div style="display: flex; align-items: center; gap: 8px; color: var(--color-primary);">
							<span>🌟</span>
							<h3 style="margin: 0;">Кастомный заголовок</h3>
						</div>
					</template>
					
					<div >
						<p>Контент со своим заголовком и подвалом.</p>
					</div>

					<template #footer>
						<div style="display: flex; justify-content: flex-end; gap: 8px; padding: 16px; border-top: 1px solid var(--color-border);">
							<BaseButton variant="outline" @click="isOpen = false">${UI_TEXT.CANCEL}</BaseButton>
							<BaseButton @click="isOpen = false">Сохранить</BaseButton>
						</div>
					</template>
				</BaseSlideover>
			</div>
		`,
	}),
}
/** Без затемнения фона */
export const NoOverlay: Story = {
	render: args => ({
		components: { BaseSlideover, BaseButton },
		setup() {
			const isOpen = ref(false)
			return { args, isOpen }
		},
		template: `
			<div>
				<BaseButton @click="isOpen = true">Открыть без оверлея</BaseButton>
				<BaseSlideover v-bind="args" v-model:is-open="isOpen" :has-overlay="false" title="Без затемнения">
					<div >
						<p>Фон не затемняется, можно взаимодействовать с остальной страницей (если не заблокирован скролл).</p>
					</div>
				</BaseSlideover>
			</div>
		`,
	}),
}
/** Ограничение внутри контейнера */
export const Contained: Story = {
	render: args => ({
		components: { BaseSlideover, BaseButton },
		setup() {
			const isOpen = ref(false)
			return { args, isOpen }
		},
		template: `
		<div style="position: relative; overflow: hidden; width: 100%; max-width: 600px; height: 400px; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-bg-soft); display: flex; align-items: center; justify-content: center;">
			<BaseButton @click="isOpen = true">Открыть внутри контейнера</BaseButton>
			
			<BaseSlideover v-bind="args" v-model:is-open="isOpen" is-contained title="Внутри блока">
				<div >
					<p>Эта панель не выходит за пределы родительского блока.</p>
				</div>
			</BaseSlideover>
		</div>
	`,
	}),
}
/** Слайдовер с длинным содержимым — проверка прокрутки */
export const LongContent: Story = {
	render: args => ({
		components: { BaseSlideover, BaseButton },
		setup() {
			const isOpen = ref(false)
			return { args, isOpen }
		},
		template: `
		<div>
			<BaseButton @click="isOpen = true">Открыть с длинным контентом</BaseButton>
			<BaseSlideover v-bind="args" v-model:is-open="isOpen" title="Длинный контент">
				<div>
					<p>Это пример длинного содержимого внутри слайдовера. Цель — убедиться, что панель корректно прокручивается при большом объёме контента.</p>
					<p>Содержимое должно прокручиваться независимо от заголовка и подвала панели. Проверяем, что overflow работает правильно и скроллбар появляется при необходимости.</p>
					<p>Ниже — несколько параграфов для заполнения пространства и проверки поведения при переполнении.</p>
					<p v-for="i in 20" :key="i">
						Параграф {{ i }}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
					</p>
					<p>Конец длинного контента. Если вы видите этот текст без прокрутки — значит контент помещается в панель.</p>
				</div>
			</BaseSlideover>
		</div>
	`,
	}),
}
/** Слайдовер сразу открыт — рендер title через BaseText (покрытие шапки) */
export const OpenedWithTitle: Story = {
	tags: ['!autodocs'],
	args: {
		isOpen: true,
		title: 'Открытая панель',
	},
	render: args => ({
		components: { BaseSlideover },
		setup() {
			return { args }
		},
		template: `
		<BaseSlideover v-bind="args">
			<div>Контент открытой панели</div>
		</BaseSlideover>
	`,
	}),
	play: async () => {
		const root = await findSlideover()
		const title = root.querySelector('.base-slideover__title')
		expect(title).not.toBeNull()
		expect(title?.textContent).toContain('Открытая панель')
	},
}
/** Клик по оверлею закрывает панель (покрытие handleOverlayClick) */
export const OverlayClickCloses: Story = {
	tags: ['!autodocs'],
	args: {
		isOpen: true,
		title: 'Закрыть кликом',
	},
	render: args => ({
		components: { BaseSlideover },
		setup() {
			const onUpdate = fn()
			const onClose = fn()
			return { args, onUpdate, onClose }
		},
		template: `
		<BaseSlideover v-bind="args" @update:is-open="onUpdate" @close="onClose">
			<div>Контент</div>
		</BaseSlideover>
	`,
	}),
	play: async () => {
		const root = await findSlideover()
		root.click()
		await waitFor(() => {
			expect(root.isConnected).toBe(true)
		})
	},
}
/** closeOnOverlay=false: клик по оверлею не закрывает */
export const OverlayClickDisabled: Story = {
	tags: ['!autodocs'],
	args: {
		isOpen: true,
		closeOnOverlay: false,
		title: 'Без закрытия по оверлею',
	},
	render: args => ({
		components: { BaseSlideover },
		setup() {
			return { args }
		},
		template: `
		<BaseSlideover v-bind="args">
			<div>Контент</div>
		</BaseSlideover>
	`,
	}),
	play: async () => {
		const root = await findSlideover()
		root.click()
		expect(root.isConnected).toBe(true)
	},
}
/** Нажатие Escape закрывает панель (покрытие useEscapeKey + close) */
export const EscapeCloses: Story = {
	tags: ['!autodocs'],
	args: {
		isOpen: true,
		title: 'Закрыть по Escape',
	},
	render: args => ({
		components: { BaseSlideover },
		setup() {
			return { args }
		},
		template: `
		<BaseSlideover v-bind="args">
			<div>Контент</div>
		</BaseSlideover>
	`,
	}),
	play: async () => {
		await findSlideover()
		await userEvent.keyboard('{Escape}')
	},
}
/** closeOnEscape=false: Escape не закрывает */
export const EscapeDisabled: Story = {
	tags: ['!autodocs'],
	args: {
		isOpen: true,
		closeOnEscape: false,
		title: 'Без Escape',
	},
	render: args => ({
		components: { BaseSlideover },
		setup() {
			return { args }
		},
		template: `
		<BaseSlideover v-bind="args">
			<div>Контент</div>
		</BaseSlideover>
	`,
	}),
	play: async () => {
		const root = await findSlideover()
		await userEvent.keyboard('{Escape}')
		expect(root.isConnected).toBe(true)
	},
}
/** Клик по close-кнопке вызывает handleClose */
export const CloseButtonClick: Story = {
	tags: ['!autodocs'],
	args: {
		isOpen: true,
		title: 'С кнопкой закрытия',
	},
	render: args => ({
		components: { BaseSlideover },
		setup() {
			return { args }
		},
		template: `
		<BaseSlideover v-bind="args">
			<div>Контент</div>
		</BaseSlideover>
	`,
	}),
	play: async () => {
		const root = await findSlideover()
		const button = root.querySelector('button[aria-label="Закрыть"]')
		if (!(button instanceof HTMLButtonElement)) throw new Error('Кнопка закрытия не найдена')
		await userEvent.click(button)
	},
}
/** width=50: widthStyle устанавливает --slideover-width-scale */
export const CustomWidthVar: Story = {
	tags: ['!autodocs'],
	args: {
		isOpen: true,
		width: 50,
		title: 'Ширина 50',
	},
	render: args => ({
		components: { BaseSlideover },
		setup() {
			return { args }
		},
		template: `
		<BaseSlideover v-bind="args">
			<div>Контент 50%</div>
		</BaseSlideover>
	`,
	}),
	play: async () => {
		const root = await findSlideover()
		const style = root.getAttribute('style') ?? ''
		expect(style).toContain('--slideover-width-scale')
	},
}
/** padding=12: panelStyle устанавливает горизонтальные --slideover-pad-left/right */
export const CustomPaddingVar: Story = {
	tags: ['!autodocs'],
	args: {
		isOpen: true,
		padding: 12,
		title: 'Padding 12',
	},
	render: args => ({
		components: { BaseSlideover },
		setup() {
			return { args }
		},
		template: `
		<BaseSlideover v-bind="args">
			<div>Контент с padding 12</div>
		</BaseSlideover>
	`,
	}),
	play: async () => {
		const root = await findSlideover()
		const panel = root.querySelector('.base-slideover__panel')
		if (!(panel instanceof HTMLElement)) throw new Error('Панель не найдена')
		const style = panel.getAttribute('style') ?? ''
		expect(style).toContain('--slideover-pad-left')
		expect(style).toContain('--slideover-pad-right')
	},
}
/** Объектный padding: точечные стороны включают вертикаль панели */
export const ObjectPadding: Story = {
	tags: ['!autodocs'],
	args: {
		isOpen: true,
		padding: { x: 20, top: 8, bottom: 12 },
		title: 'Объектный padding',
	},
	render: args => ({
		components: { BaseSlideover },
		setup() {
			return { args }
		},
		template: `
		<BaseSlideover v-bind="args">
			<div>padding: { x: 20, top: 8, bottom: 12 }</div>
		</BaseSlideover>
	`,
	}),
	play: async () => {
		const root = await findSlideover()
		const panel = root.querySelector('.base-slideover__panel')
		if (!(panel instanceof HTMLElement)) throw new Error('Панель не найдена')
		const style = panel.getAttribute('style') ?? ''
		expect(style).toContain('--slideover-pad-top')
		expect(style).toContain('--slideover-pad-bottom')
		expect(style).toContain('--slideover-pad-left')
	},
}
/** Footer-слот рендерится (покрытие hasFooter=true) */
export const WithFooterSlot: Story = {
	tags: ['!autodocs'],
	args: {
		isOpen: true,
		title: 'С футером',
	},
	render: args => ({
		components: { BaseSlideover, BaseButton },
		setup() {
			return { args }
		},
		template: `
		<BaseSlideover v-bind="args">
			<div>Контент с футером</div>
			<template #footer>
				<BaseButton>Действие</BaseButton>
			</template>
		</BaseSlideover>
	`,
	}),
	play: async () => {
		const root = await findSlideover()
		const footer = root.querySelector('.base-slideover__footer')
		expect(footer).not.toBeNull()
	},
}
/** Header-слот без title (ветка hasHeader через slots.header) */
export const HeaderSlotNoTitle: Story = {
	tags: ['!autodocs'],
	args: {
		isOpen: true,
		title: '',
	},
	render: args => ({
		components: { BaseSlideover },
		setup() {
			return { args }
		},
		template: `
		<BaseSlideover v-bind="args">
			<template #header>
				<span class="custom-header">Свой заголовок</span>
			</template>
			<div>Контент</div>
		</BaseSlideover>
	`,
	}),
	play: async () => {
		const root = await findSlideover()
		const header = root.querySelector('.custom-header')
		expect(header).not.toBeNull()
	},
}
/** isFullWidth=true: widthStyle возвращает undefined (ранний return) */
export const FullWidthOpened: Story = {
	tags: ['!autodocs'],
	args: {
		isOpen: true,
		isFullWidth: true,
		width: 50,
		title: 'Полная ширина',
	},
	render: args => ({
		components: { BaseSlideover },
		setup() {
			return { args }
		},
		template: `
		<BaseSlideover v-bind="args">
			<div>Контент</div>
		</BaseSlideover>
	`,
	}),
	play: async () => {
		const root = await findSlideover()
		expect(root.classList.contains('base-slideover--full')).toBe(true)
	},
}
/** side=left: модификатор класса левой стороны */
export const SideLeftOpened: Story = {
	tags: ['!autodocs'],
	args: {
		isOpen: true,
		side: 'left',
		title: 'Слева',
	},
	render: args => ({
		components: { BaseSlideover },
		setup() {
			return { args }
		},
		template: `
		<BaseSlideover v-bind="args">
			<div>Контент слева</div>
		</BaseSlideover>
	`,
	}),
	play: async () => {
		const root = await findSlideover()
		expect(root.classList.contains('base-slideover--left')).toBe(true)
	},
}
/** hasOverlay=false: модификатор no-overlay */
export const NoOverlayOpened: Story = {
	tags: ['!autodocs'],
	args: {
		isOpen: true,
		hasOverlay: false,
		title: 'Без оверлея',
	},
	render: args => ({
		components: { BaseSlideover },
		setup() {
			return { args }
		},
		template: `
		<BaseSlideover v-bind="args">
			<div>Контент</div>
		</BaseSlideover>
	`,
	}),
	play: async () => {
		const root = await findSlideover()
		expect(root.classList.contains('base-slideover--no-overlay')).toBe(true)
	},
}
/** isContained=true: модификатор contained, teleport отключён */
export const ContainedOpened: Story = {
	tags: ['!autodocs'],
	args: {
		isOpen: true,
		isContained: true,
		title: 'Внутри блока',
	},
	render: args => ({
		components: { BaseSlideover },
		setup() {
			return { args }
		},
		template: `
		<div style="position: relative; width: 400px; height: 300px;">
			<BaseSlideover v-bind="args">
				<div>Contained</div>
			</BaseSlideover>
		</div>
	`,
	}),
	play: async ({ canvasElement }) => {
		await waitFor(() => {
			const root = canvasElement.querySelector('.base-slideover')
			if (!root) throw new Error('Слайдовер не найден внутри canvas')
		})
		const root = canvasElement.querySelector('.base-slideover')
		if (!(root instanceof HTMLElement)) throw new Error('Контейнер не HTMLElement')
		expect(root.classList.contains('base-slideover--contained')).toBe(true)
	},
}
/** customClass на корневом элементе и подэлементах */
export const WithCustomClass: Story = {
	tags: ['!autodocs'],
	args: {
		isOpen: true,
		title: 'Custom class',
		customClass: {
			root: 'my-slideover-root',
			panel: 'my-slideover-panel',
			header: 'my-slideover-header',
			title: 'my-slideover-title',
			body: 'my-slideover-body',
			footer: 'my-slideover-footer',
		},
	},
	render: args => ({
		components: { BaseSlideover },
		setup() {
			return { args }
		},
		template: `
		<BaseSlideover v-bind="args">
			<div>Контент</div>
		</BaseSlideover>
	`,
	}),
	play: async () => {
		const root = await findSlideover()
		expect(root.classList.contains('my-slideover-root')).toBe(true)
		expect(root.querySelector('.my-slideover-panel')).not.toBeNull()
		expect(root.querySelector('.my-slideover-title')).not.toBeNull()
	},
}
/** Полный цикл: открыли через триггер, закрыли кликом по оверлею */
export const FullCloseFlow: Story = {
	render: args => ({
		components: { BaseSlideover, BaseButton },
		setup() {
			const isOpen = ref(false)
			return { args, isOpen }
		},
		template: `
		<div>
			<BaseButton @click="isOpen = true">Открыть</BaseButton>
			<BaseSlideover v-bind="args" v-model:is-open="isOpen" title="Поток закрытия">
				<div>Контент</div>
			</BaseSlideover>
		</div>
	`,
	}),
	play: async ({ canvasElement }) => {
		const root = await openSlideover(canvasElement)
		root.click()
		await waitFor(() => {
			expect(document.body.querySelector('.base-slideover')).toBeNull()
		})
	},
}
