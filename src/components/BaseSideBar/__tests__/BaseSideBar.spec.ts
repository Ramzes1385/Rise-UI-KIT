import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import BaseSideBar from '../ui/BaseSideBar.vue'
import { BASE_SIDEBAR_STUBS } from './BaseSideBar.test-utils'

describe('BaseSideBar unit', () => {
  it('рендерит корневой aside с role=complementary', () => {
    const { container } = render(BaseSideBar, {
      props: {
        title: 'Навигация',
      },
      global: {
        stubs: BASE_SIDEBAR_STUBS,
      },
    })

    expect(container.querySelector('aside.base-sidebar')).toBeInTheDocument()
    expect(screen.getByRole('complementary')).toBeInTheDocument()
  })

  it('рендерит title', () => {
    render(BaseSideBar, {
      props: {
        title: 'Навигация',
      },
      global: {
        stubs: BASE_SIDEBAR_STUBS,
      },
    })

    expect(screen.getByText('Навигация')).toBeInTheDocument()
  })

  it('рендерит header slot вместо title', () => {
    render(BaseSideBar, {
      props: {
        title: 'Навигация',
      },
      slots: {
        header: '<div>Custom header</div>',
      },
      global: {
        stubs: BASE_SIDEBAR_STUBS,
      },
    })

    expect(screen.getByText('Custom header')).toBeInTheDocument()
    expect(screen.queryByText('Навигация')).not.toBeInTheDocument()
  })

  it('рендерит default slot', () => {
    render(BaseSideBar, {
      props: {
        title: 'Навигация',
      },
      slots: {
        default: '<div>Body content</div>',
      },
      global: {
        stubs: BASE_SIDEBAR_STUBS,
      },
    })

    expect(screen.getByText('Body content')).toBeInTheDocument()
  })

  it('рендерит footer slot', () => {
    render(BaseSideBar, {
      props: {
        title: 'Навигация',
      },
      slots: {
        footer: '<div>Footer content</div>',
      },
      global: {
        stubs: BASE_SIDEBAR_STUBS,
      },
    })

    expect(screen.getByText('Footer content')).toBeInTheDocument()
  })

  it('рендерит collapsedContent только в collapsed режиме', () => {
    render(BaseSideBar, {
      props: {
        isCollapsed: true,
      },
      slots: {
        collapsedContent: '<div>Collapsed content</div>',
      },
      global: {
        stubs: BASE_SIDEBAR_STUBS,
      },
    })

    expect(screen.getByText('Collapsed content')).toBeInTheDocument()
  })

  it('добавляет класс collapsed при isCollapsed=true', () => {
    const { container } = render(BaseSideBar, {
      props: {
        isCollapsed: true,
      },
      global: {
        stubs: BASE_SIDEBAR_STUBS,
      },
    })

    expect(container.querySelector('.base-sidebar')).toHaveClass('base-sidebar--collapsed')
  })

  it('добавляет variant class', () => {
    const { container } = render(BaseSideBar, {
      props: {
        title: 'Навигация',
        variant: 'soft',
      },
      global: {
        stubs: BASE_SIDEBAR_STUBS,
      },
    })

    expect(container.querySelector('.base-sidebar')).toHaveClass('base-sidebar--soft')
  })

  it('устанавливает дефолтную CSS-переменную width', () => {
    const { container } = render(BaseSideBar, {
      props: {
        title: 'Навигация',
      },
      global: {
        stubs: BASE_SIDEBAR_STUBS,
      },
    })

    expect((container.querySelector('.base-sidebar') as HTMLElement).style.getPropertyValue('--sidebar-width')).toBe(
      '280px',
    )
  })

  it('устанавливает кастомную CSS-переменную width', () => {
    const { container } = render(BaseSideBar, {
      props: {
        title: 'Навигация',
        width: 320,
      },
      global: {
        stubs: BASE_SIDEBAR_STUBS,
      },
    })

    expect((container.querySelector('.base-sidebar') as HTMLElement).style.getPropertyValue('--sidebar-width')).toBe(
      '320px',
    )
  })

  it('устанавливает дефолтную CSS-переменную collapsedWidth', () => {
    const { container } = render(BaseSideBar, {
      props: {
        title: 'Навигация',
      },
      global: {
        stubs: BASE_SIDEBAR_STUBS,
      },
    })

    expect(
      (container.querySelector('.base-sidebar') as HTMLElement).style.getPropertyValue('--sidebar-collapsed-width'),
    ).toBe('68px')
  })

  it('устанавливает кастомную CSS-переменную collapsedWidth', () => {
    const { container } = render(BaseSideBar, {
      props: {
        title: 'Навигация',
        collapsedWidth: 80,
      },
      global: {
        stubs: BASE_SIDEBAR_STUBS,
      },
    })

    expect(
      (container.querySelector('.base-sidebar') as HTMLElement).style.getPropertyValue('--sidebar-collapsed-width'),
    ).toBe('80px')
  })

  it('устанавливает дефолтную CSS-переменную gap', () => {
    const { container } = render(BaseSideBar, {
      props: {
        title: 'Навигация',
      },
      global: {
        stubs: BASE_SIDEBAR_STUBS,
      },
    })

    expect((container.querySelector('.base-sidebar') as HTMLElement).style.getPropertyValue('--sidebar-gap')).toBe(
      '4px',
    )
  })

  it('устанавливает кастомную CSS-переменную gap', () => {
    const { container } = render(BaseSideBar, {
      props: {
        title: 'Навигация',
        gap: 12,
      },
      global: {
        stubs: BASE_SIDEBAR_STUBS,
      },
    })

    expect((container.querySelector('.base-sidebar') as HTMLElement).style.getPropertyValue('--sidebar-gap')).toBe(
      '12px',
    )
  })

  it('по умолчанию показывает кнопку "Свернуть"', () => {
    render(BaseSideBar, {
      props: {
        title: 'Навигация',
      },
      global: {
        stubs: BASE_SIDEBAR_STUBS,
      },
    })

    expect(screen.getByRole('button', { name: 'Свернуть' })).toBeInTheDocument()
  })

  it('показывает кнопку "Развернуть" когда isCollapsed=true', () => {
    render(BaseSideBar, {
      props: {
        isCollapsed: true,
      },
      global: {
        stubs: BASE_SIDEBAR_STUBS,
      },
    })

    expect(screen.getByRole('button', { name: 'Развернуть' })).toBeInTheDocument()
  })

  it('не показывает кнопку, если isCollapsible=false', () => {
    render(BaseSideBar, {
      props: {
        title: 'Навигация',
        isCollapsible: false,
      },
      global: {
        stubs: BASE_SIDEBAR_STUBS,
      },
    })

    expect(screen.queryByRole('button', { name: 'Свернуть' })).not.toBeInTheDocument()
  })

  it('рендерит loading skeleton', () => {
    render(BaseSideBar, {
      props: {
        isLoading: true,
      },
      global: {
        stubs: BASE_SIDEBAR_STUBS,
      },
    })

    expect(screen.getAllByTestId('base-skeleton')).toHaveLength(4)
  })

  it('прокидывает customClass на элементы', () => {
    const { container } = render(BaseSideBar, {
      props: {
        title: 'Навигация',
        customClass: {
          root: 'custom-root',
          header: 'custom-header',
          title: 'custom-title',
          toggle: 'custom-toggle',
          navigation: 'custom-navigation',
          body: 'custom-body',
          footer: 'custom-footer',
          collapsed: 'custom-collapsed',
        },
      },
      slots: {
        default: '<div>Body</div>',
        footer: '<div>Footer</div>',
        collapsedContent: '<div>Collapsed</div>',
      },
      global: {
        stubs: BASE_SIDEBAR_STUBS,
      },
    })

    expect(container.querySelector('.custom-root')).toBeInTheDocument()
    expect(container.querySelector('.custom-header')).toBeInTheDocument()
    expect(container.querySelector('.custom-title')).toBeInTheDocument()
    expect(container.querySelector('.custom-toggle')).toBeInTheDocument()
    expect(container.querySelector('.custom-body')).toBeInTheDocument()
    expect(container.querySelector('.custom-footer')).toBeInTheDocument()
  })
})