/**
 * Stories для компонента BaseModal.
 * Демонстрирует варианты, размеры через sizeScale, состояния и закрытие.
 */

import { expect, userEvent, waitFor } from 'storybook/test'
import { ref } from 'vue'
import { BaseButton } from '@components/BaseButton'
import { playShiftTab } from '@utils/storybookUtils/a11yHelpers'
import { MODAL_VARIANTS } from '../model/BaseModal.types'
import BaseModal from '../ui/BaseModal.vue'
import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<typeof BaseModal> = {
	title: 'UI/BaseModal',
	component: BaseModal,

	argTypes: {
		isOpen: { control: 'boolean' },
		title: { control: 'text' },
		variant: {
			control: 'radio',
			options: MODAL_VARIANTS,
		},
		color: {
			control: 'object',
			description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
		},
		closeOnOverlay: { control: 'boolean' },
		fullScreen: {
			control: 'inline-radio',
			options: ['width', 'height', 'both'],
			description: 'Режим fullScreen: width — на всю ширину, height — на всю высоту, both — полноэкранный',
		},
		sizeScale: {
			control: { type: 'range', min: 50, max: 200, step: 10 },
			description: 'Масштаб размера (100 = 500px ширина)',
		},
		isContained: { control: 'boolean' },
		hasOverlay: { control: 'boolean' },
		onClose: { table: { disable: true } },
		onConfirm: { table: { disable: true } },
		'onUpdate:isOpen': { table: { disable: true } },
	},

	args: {
		isOpen: false,
		title: 'Модальное окно',
		variant: 'default',
		closeOnOverlay: true,
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseModal>
/** Базовое модальное окно */
export const Default: Story = {
	render: args => ({
		components: { BaseModal, BaseButton },
		setup() {
			const isOpen = ref(false)
			return { args, isOpen }
		},
		template: `
			<div>
				<BaseButton @click="isOpen = true">Открыть</BaseButton>
				<BaseModal v-bind="args" v-model:is-open="isOpen">
					<p>Содержимое модального окна</p>
				</BaseModal>
			</div>
		`,
	}),
	play: async ({ canvasElement, step }) => {
		await step('Фокусировка кнопки открытия по Tab', async () => {
			await userEvent.tab()
			const button = canvasElement.querySelector('button')
			expect(button).toHaveFocus()
		})

		await step('Обратная фокусировка по Shift+Tab', async () => {
			await playShiftTab(canvasElement, { role: 'button', name: 'Открыть' })
		})

		await step('Открытие модала по Enter', async () => {
			await userEvent.keyboard('{Enter}')
			await waitFor(() => {
				expect(document.querySelector('.base-modal')).toBeInTheDocument()
			})
		})

		await step('Закрытие модала по Escape', async () => {
			await userEvent.keyboard('{Escape}')
			await waitFor(() => {
				expect(document.querySelector('.base-modal')).not.toBeInTheDocument()
			})
		})
	},
}
/** Отключённое состояние — контент недоступен */
export const Disabled: Story = {
	tags: ['!autodocs'],
	render: () => ({
		components: { BaseModal, BaseButton },
		setup() {
			const isOpen = ref(true)
			return { isOpen }
		},
		template: `
			<div>
				<BaseModal v-model:is-open="isOpen" title="Недоступное окно">
					<p style="opacity:0.5;pointer-events:none;">Контент заблокирован</p>
					<template #footer>
						<BaseButton is-disabled>Подтвердить</BaseButton>
					</template>
				</BaseModal>
			</div>
		`,
	}),
}
/** Размеры через sizeScale */
export const SizeScale: Story = {
	render: () => ({
		components: { BaseModal, BaseButton },
		setup() {
			const scale = ref(50)
			const isOpen = ref(false)
			const scales = [50, 75, 100, 150, 200]
			return { scale, isOpen, scales }
		},
		template: `
			<div style="display:flex;gap:8px;">
				<BaseButton v-for="s in scales" :key="s" @click="scale = s; isOpen = true">
					{{ s }}%
				</BaseButton>
				<BaseModal :is-open="isOpen" :size-scale="scale" title="Размер" @update:is-open="isOpen = $event" @close="isOpen = false">
					<p>Масштаб: {{ scale }}% ({{ Math.round(500 * scale / 100) }}px)</p>
				</BaseModal>
			</div>
		`,
	}),
}
/** Все варианты */
export const Variants: Story = {
	render: () => ({
		components: { BaseModal, BaseButton },
		setup() {
			const isOpenDefault = ref(false)
			const isOpenGhost = ref(false)
			const isOpenShadow = ref(false)
			return { isOpenDefault, isOpenGhost, isOpenShadow }
		},
		template: `
			<div style="display:flex;gap:8px;flex-wrap:wrap;">
				<BaseButton @click="isOpenDefault = true">default</BaseButton>
				<BaseButton @click="isOpenGhost = true">ghost</BaseButton>
				<BaseButton @click="isOpenShadow = true">shadow</BaseButton>

				<BaseModal v-model:is-open="isOpenDefault" variant="default" title="Default">
					<p>Стандартное модальное окно</p>
				</BaseModal>
				<BaseModal v-model:is-open="isOpenGhost" variant="ghost" title="Ghost">
					<p>Призрачное модальное окно</p>
				</BaseModal>
				<BaseModal v-model:is-open="isOpenShadow" variant="shadow" title="Shadow">
					<p>Модальное окно с тенью</p>
				</BaseModal>
			</div>
		`,
	}),
}
/** Без закрытия по оверлею */
export const NoOverlayClose: Story = {
	render: () => ({
		components: { BaseModal, BaseButton },
		setup() {
			const isOpen = ref(false)
			return { isOpen }
		},
		template: `
			<div>
				<BaseButton @click="isOpen = true">Открыть</BaseButton>
				<BaseModal v-model:is-open="isOpen" title="Без закрытия по оверлею" :close-on-overlay="false">
					<p>Клик по оверлею не закроет окно. Используйте кнопку закрытия.</p>
				</BaseModal>
			</div>
		`,
	}),
}
/** Полноэкранное по ширине */
export const FullScreenWidth: Story = {
	render: () => ({
		components: { BaseModal, BaseButton },
		setup() {
			const isOpen = ref(false)
			return { isOpen }
		},
		template: `
			<div>
				<BaseButton @click="isOpen = true">Full Width</BaseButton>
				<BaseModal v-model:is-open="isOpen" full-screen="width" title="На всю ширину">
					<p>Модальное окно растянуто на всю ширину экрана</p>
				</BaseModal>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const button = canvasElement.querySelector('button')
		if (!(button instanceof HTMLElement)) return
		await userEvent.click(button)
		await waitFor(() => {
			const modal = document.querySelector('.base-modal--fullscreen-width')
			expect(modal).toBeTruthy()
		})
	},
}
/** Полноэкранное по высоте */
export const FullScreenHeight: Story = {
	render: () => ({
		components: { BaseModal, BaseButton },
		setup() {
			const isOpen = ref(false)
			return { isOpen }
		},
		template: `
			<div>
				<BaseButton @click="isOpen = true">Full Height</BaseButton>
				<BaseModal v-model:is-open="isOpen" full-screen="height" title="На всю высоту">
					<p>Модальное окно растянуто на всю высоту экрана</p>
				</BaseModal>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const button = canvasElement.querySelector('button')
		if (!(button instanceof HTMLElement)) return
		await userEvent.click(button)
		await waitFor(() => {
			const modal = document.querySelector('.base-modal--fullscreen-height')
			expect(modal).toBeTruthy()
		})
	},
}
/** Полноэкранное */
export const FullScreenBoth: Story = {
	render: () => ({
		components: { BaseModal, BaseButton },
		setup() {
			const isOpen = ref(false)
			return { isOpen }
		},
		template: `
			<div>
				<BaseButton @click="isOpen = true">Full</BaseButton>
				<BaseModal v-model:is-open="isOpen" full-screen="both" title="Полноэкранное">
					<p>Полноэкранное модальное окно</p>
				</BaseModal>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const button = canvasElement.querySelector('button')
		if (!(button instanceof HTMLElement)) return
		await userEvent.click(button)
		await waitFor(() => {
			const modal = document.querySelector('.base-modal--fullscreen-both')
			expect(modal).toBeTruthy()
		})
	},
}
/** Позиционирование внутри контейнера */
export const Contained: Story = {
	render: () => ({
		components: { BaseModal, BaseButton },
		setup() {
			const isOpen = ref(false)
			return { isOpen }
		},
		template: `
			<div style="position: relative; width: 100%; height: 400px; border: 2px dashed var(--color-border); border-radius: var(--border-radius-lg); overflow: hidden; background: var(--color-surface-muted);">
				<div style="padding: 16px;">
					<BaseButton @click="isOpen = true">Открыть внутри блока</BaseButton>
					<p style="margin-top: 8px; color: var(--color-text-muted);">Модал не выйдет за пределы этого контейнера</p>
				</div>
				<BaseModal v-model:is-open="isOpen" title="Внутри блока" is-contained>
					<p>Модал ограничен контейнером</p>
				</BaseModal>
			</div>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: `
<div style="position: relative; height: 400px; overflow: hidden;">
	<BaseButton @click="isOpen = true">Открыть</BaseButton>
	<BaseModal v-model:is-open="isOpen" is-contained title="Внутри блока">
		<p>Модал ограничен контейнером</p>
	</BaseModal>
</div>
				`,
			},
		},
	},
}
/** Без затемнения фона */
export const WithoutOverlay: Story = {
	args: {
		hasOverlay: false,
	},
	render: args => ({
		components: { BaseModal, BaseButton },
		setup() {
			const isOpen = ref(false)
			return { args, isOpen }
		},
		template: `
			<div>
				<BaseButton @click="isOpen = true">Без оверлея</BaseButton>
				<BaseModal v-bind="args" v-model:is-open="isOpen" title="Без оверлея">
					<p>Модал без затемнения фона</p>
				</BaseModal>
			</div>
		`,
	}),
}
/** Тёмная тема */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
	render: args => ({
		components: { BaseModal, BaseButton },
		setup() {
			const isOpen = ref(false)
			return { args, isOpen }
		},
		template: `
			<div>
				<BaseButton @click="isOpen = true">Открыть</BaseButton>
				<BaseModal v-bind="args" v-model:is-open="isOpen">
					<p>Тёмная тема</p>
				</BaseModal>
			</div>
		`,
	}),
}
/** Модал с длинным содержимым */
export const LongContent: Story = {
	render: args => ({
		components: { BaseModal, BaseButton },
		setup() {
			const isOpen = ref(false)
			return { args, isOpen }
		},
		template: `
			<div>
				<BaseButton @click="isOpen = true">Открыть</BaseButton>
				<BaseModal v-bind="args" v-model:is-open="isOpen" title="Длинное содержимое">
					<p>Каждое изделие проходит многоэтапный контроль качества. Сначала мастер проверяет заготовку, затем после ковки — форму и пропорции, после шлифовки — поверхность, и финальная проверка перед упаковкой. Мы гарантируем высочайшее качество каждого изделия, созданного в нашей мастерской.</p>
					<p>Доставка осуществляется по всей России транспортными компаниями. Сроки доставки составляют от 3 до 14 рабочих дней в зависимости от региона. Стоимость доставки рассчитывается индивидуально при оформлении заказа и зависит от габаритов и веса изделия.</p>
					<p>Гарантия на все изделия составляет 2 года с момента покупки. В течение гарантийного срока мы бесплатно устраняем любые дефекты, возникшие по нашей вине. Для обращения по гарантии свяжитесь с нами через форму обратной связи или по телефону.</p>
				</BaseModal>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		expect(canvasElement).toBeInTheDocument()
	},
}
/** Интерактивное */
export const Interactive: Story = {
	render: args => ({
		components: { BaseModal, BaseButton },
		setup() {
			const isOpen = ref(false)
			return { args, isOpen }
		},
		template: `
			<div>
				<BaseButton @click="isOpen = true">Открыть</BaseButton>
				<BaseModal v-bind="args" v-model:is-open="isOpen">
					<p>Контент</p>
				</BaseModal>
			</div>
		`,
	}),
	play: async ({ canvasElement, step }) => {
		await step('модалка закрыта до взаимодействия', async () => {
			expect(document.querySelector('.base-modal')).not.toBeInTheDocument()
		})

		await step('клик по кнопке открывает модалку', async () => {
			const trigger = canvasElement.querySelector('button')
			if (trigger) await userEvent.click(trigger)
			await waitFor(() => {
				expect(document.querySelector('.base-modal')).toBeInTheDocument()
			})
		})

		await step('закрытие по Escape', async () => {
			await userEvent.keyboard('{Escape}')
			await waitFor(() => {
				expect(document.querySelector('.base-modal')).not.toBeInTheDocument()
			})
		})
	},
}
/** Закрытие по клику по оверлею (покрытие handleOverlayClick) */
export const OverlayClickClose: Story = {
	tags: ['!autodocs'],
	render: () => ({
		components: { BaseModal },
		setup() {
			const isOpen = ref(true)
			return { isOpen }
		},
		template: `
			<BaseModal v-model:is-open="isOpen" title="Overlay click">
				<p>Контент</p>
			</BaseModal>
		`,
	}),
	play: async () => {
		await waitFor(() => {
			expect(document.querySelector('.base-modal')).toBeInTheDocument()
		})
		const overlay = document.querySelector('.base-modal')
		if (overlay instanceof HTMLElement) {
			await userEvent.click(overlay)
		}
		await waitFor(() => {
			expect(document.querySelector('.base-modal')).not.toBeInTheDocument()
		})
	},
}
/** Клик по оверлею с closeOnOverlay=false (покрытие ветки closeOnOverlay) */
export const OverlayClickBlocked: Story = {
	tags: ['!autodocs'],
	render: () => ({
		components: { BaseModal },
		setup() {
			const isOpen = ref(true)
			return { isOpen }
		},
		template: `
			<BaseModal v-model:is-open="isOpen" :close-on-overlay="false" title="No overlay close">
				<p>Контент</p>
			</BaseModal>
		`,
	}),
	play: async () => {
		await waitFor(() => {
			expect(document.querySelector('.base-modal')).toBeInTheDocument()
		})
		const overlay = document.querySelector('.base-modal')
		if (overlay instanceof HTMLElement) {
			await userEvent.click(overlay)
		}
		expect(document.querySelector('.base-modal')).toBeInTheDocument()
	},
}
/** FullScreen=undefined — покрытие ветки fullScreenClass=undefined */
export const FullScreenUnset: Story = {
	tags: ['!autodocs'],
	render: () => ({
		components: { BaseModal },
		setup() {
			const isOpen = ref(true)
			return { isOpen }
		},
		template: `
			<BaseModal v-model:is-open="isOpen" title="Без fullscreen">
				<p>fullScreenClass = undefined</p>
			</BaseModal>
		`,
	}),
	play: async () => {
		await waitFor(() => {
			expect(document.querySelector('.base-modal')).toBeInTheDocument()
		})
		const modal = document.querySelector('.base-modal')
		expect(modal?.className).not.toContain('fullscreen')
	},
}
/** Модал без title — ветка v-if="title" false */
export const WithoutTitle: Story = {
	tags: ['!autodocs'],
	render: () => ({
		components: { BaseModal },
		setup() {
			const isOpen = ref(true)
			return { isOpen }
		},
		template: `
			<BaseModal v-model:is-open="isOpen">
				<p>Без заголовка</p>
			</BaseModal>
		`,
	}),
	play: async () => {
		await waitFor(() => {
			expect(document.querySelector('.base-modal')).toBeInTheDocument()
		})
		expect(document.querySelector('.base-modal__header')).toBeNull()
	},
}
/** Модал с footer-слотом — покрывает ветку hasFooter=true */
export const WithFooter: Story = {
	tags: ['!autodocs'],
	render: () => ({
		components: { BaseModal, BaseButton },
		setup() {
			const isOpen = ref(true)
			return { isOpen }
		},
		template: `
			<BaseModal v-model:is-open="isOpen" title="С футером">
				<p>Контент</p>
				<template #footer>
					<BaseButton>OK</BaseButton>
				</template>
			</BaseModal>
		`,
	}),
	play: async () => {
		await waitFor(() => {
			expect(document.querySelector('.base-modal__footer')).toBeInTheDocument()
		})
	},
}
/** Модал с customClass — покрытие всех elementKeys */
export const WithCustomClass: Story = {
	tags: ['!autodocs'],
	render: () => ({
		components: { BaseModal, BaseButton },
		setup() {
			const isOpen = ref(true)
			const customClass = {
				root: 'custom-root',
				content: 'custom-content',
				header: 'custom-header',
				headerLeft: 'custom-header-left',
				title: 'custom-title',
				close: 'custom-close',
				body: 'custom-body',
				footer: 'custom-footer',
			}
			return { isOpen, customClass }
		},
		template: `
			<BaseModal v-model:is-open="isOpen" title="Custom" :custom-class="customClass">
				<p>Контент</p>
				<template #footer>
					<BaseButton>OK</BaseButton>
				</template>
			</BaseModal>
		`,
	}),
	play: async () => {
		await waitFor(() => {
			expect(document.querySelector('.custom-root')).toBeInTheDocument()
		})
		expect(document.querySelector('.custom-content')).toBeInTheDocument()
		expect(document.querySelector('.custom-header')).toBeInTheDocument()
		expect(document.querySelector('.custom-body')).toBeInTheDocument()
		expect(document.querySelector('.custom-footer')).toBeInTheDocument()
	},
}
/** Модал с customColor — покрытие customColorStyle */
export const WithCustomColor: Story = {
	tags: ['!autodocs'],
	render: () => ({
		components: { BaseModal },
		setup() {
			const isOpen = ref(true)
			const color = {
				bg: { base: '#fafafa', hover: '#f0f0f0' },
				text: { base: '#222', hover: '#000' },
			}
			return { isOpen, color }
		},
		template: `
			<BaseModal v-model:is-open="isOpen" title="Color" :color="color">
				<p>customColor</p>
			</BaseModal>
		`,
	}),
	play: async () => {
		await waitFor(() => {
			expect(document.querySelector('.base-modal')).toBeInTheDocument()
		})
	},
}
/** Модал isContained с кликом по оверлею — покрывает закрытие при isContained */
export const ContainedOverlayClose: Story = {
	tags: ['!autodocs'],
	render: () => ({
		components: { BaseModal },
		setup() {
			const isOpen = ref(true)
			return { isOpen }
		},
		template: `
			<div style="position:relative;width:400px;height:300px;">
				<BaseModal v-model:is-open="isOpen" title="Contained" is-contained>
					<p>Контент</p>
				</BaseModal>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		await waitFor(() => {
			expect(canvasElement.querySelector('.base-modal--contained')).toBeInTheDocument()
		})
		const overlay = canvasElement.querySelector('.base-modal--contained')
		if (overlay instanceof HTMLElement) {
			await userEvent.click(overlay)
		}
		await waitFor(() => {
			expect(canvasElement.querySelector('.base-modal')).toBeNull()
		})
	},
}
/** Клик внутри content — overlay click не срабатывает (ветка self) */
export const ContentClickNoClose: Story = {
	tags: ['!autodocs'],
	render: () => ({
		components: { BaseModal },
		setup() {
			const isOpen = ref(true)
			return { isOpen }
		},
		template: `
			<BaseModal v-model:is-open="isOpen" title="Content click">
				<p class="inner-content">Клик по контенту</p>
			</BaseModal>
		`,
	}),
	play: async () => {
		await waitFor(() => {
			expect(document.querySelector('.base-modal')).toBeInTheDocument()
		})
		const content = document.querySelector('.inner-content')
		if (content instanceof HTMLElement) {
			await userEvent.click(content)
		}
		expect(document.querySelector('.base-modal')).toBeInTheDocument()
	},
}
/** Клик по кнопке закрытия в шапке — покрывает handleClose */
export const HeaderCloseClick: Story = {
	tags: ['!autodocs'],
	render: () => ({
		components: { BaseModal },
		setup() {
			const isOpen = ref(true)
			return { isOpen }
		},
		template: `
			<BaseModal v-model:is-open="isOpen" title="Закрытие">
				<p>Контент</p>
			</BaseModal>
		`,
	}),
	play: async () => {
		await waitFor(() => {
			expect(document.querySelector('.base-modal__close')).toBeInTheDocument()
		})
		const closeBtn = document.querySelector('.base-modal__close')
		if (closeBtn instanceof HTMLElement) {
			await userEvent.click(closeBtn)
		}
		await waitFor(() => {
			expect(document.querySelector('.base-modal')).toBeNull()
		})
	},
}
/** hasOverlay=false, модал открыт сразу — покрывает шаблонную ветку `!hasOverlay && 'base-modal--no-overlay'` (стр. 10). */
export const NoOverlayOpen: Story = {
	tags: ['!autodocs'],
	render: () => ({
		components: { BaseModal },
		setup() {
			const isOpen = ref(true)
			return { isOpen }
		},
		template: `
			<BaseModal v-model:is-open="isOpen" title="Без оверлея" :has-overlay="false">
				<p>Без затемнения</p>
			</BaseModal>
		`,
	}),
	play: async () => {
		await waitFor(() => {
			expect(document.querySelector('.base-modal--no-overlay')).toBeInTheDocument()
		})
	},
}
/** closeOnOverlay явно undefined — покрывает ветку `?? true` в usePopup (стр. 117 BaseModal.vue). */
export const CloseOnOverlayUndefined: Story = {
	tags: ['!autodocs'],
	render: () => ({
		components: { BaseModal },
		setup() {
			const isOpen = ref(true)
			const overlayFlag: boolean | undefined = undefined
			return { isOpen, overlayFlag }
		},
		template: `
			<BaseModal v-model:is-open="isOpen" title="undefined overlay" :close-on-overlay="overlayFlag">
				<p>Контент</p>
			</BaseModal>
		`,
	}),
	play: async () => {
		await waitFor(() => {
			expect(document.querySelector('.base-modal')).toBeInTheDocument()
		})
		const overlay = document.querySelector('.base-modal')
		if (overlay instanceof HTMLElement) {
			await userEvent.click(overlay)
		}
		await waitFor(() => {
			expect(document.querySelector('.base-modal')).not.toBeInTheDocument()
		})
	},
}
/** Escape закрывает модал — закрепляет ветку closeOnEscape для дополнительного прогона handleClose и isOpen-watcher. */
export const EscapeClose: Story = {
	tags: ['!autodocs'],
	render: () => ({
		components: { BaseModal },
		setup() {
			const isOpen = ref(true)
			return { isOpen }
		},
		template: `
			<BaseModal v-model:is-open="isOpen" title="Escape">
				<p>Контент</p>
			</BaseModal>
		`,
	}),
	play: async () => {
		await waitFor(() => {
			expect(document.querySelector('.base-modal')).toBeInTheDocument()
		})
		await userEvent.keyboard('{Escape}')
		await waitFor(() => {
			expect(document.querySelector('.base-modal')).not.toBeInTheDocument()
		})
	},
}
