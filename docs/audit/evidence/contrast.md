# Контраст токенов темы (WCAG 2.x)

Расчёт скриптом `contrast.py` по `src/styles/_variables.scss` (светлая и тёмная тема). Полупрозрачные слои сведены альфа-композицией. Используется в находке TOK-1 (`findings/display.md`).

| Пара (fg / bg) | Где используется | Порог | Light | Dark |
|---|---|---|---|---|
| --color-text / --color-bg | базовый текст (BaseText, Progress label) | 4.5:1 | 10.01 AA OK | 15.68 AA OK |
| --color-text / --color-surface | текст на поверхности | 4.5:1 | 10.44 AA OK | 13.96 AA OK |
| --color-text-muted / --color-bg | Separator/Loader label, Empty description, ghost-кнопка | 4.5:1 | 4.63 AA OK | 7.76 AA OK |
| --color-text-muted / --color-surface | плейсхолдер Input/Textarea | 4.5:1 | 4.83 AA OK | 6.91 AA OK |
| --color-text-muted / --color-surface-muted | плейсхолдер в hover/filled-состоянии | 4.5:1 | 4.40 FAIL AA (только крупный текст) | 5.81 AA OK |
| --color-text-muted / --color-bg-soft | BaseEmpty variant=soft | 4.5:1 | 4.62 AA OK | 7.36 AA OK |
| #fff / --color-accent | BaseButton default (14px/600), Stepper, Tabs/Calendar (light) | 4.5:1 | 2.80 FAIL | 2.26 FAIL |
| #fff / accent + brightness(1.1) | BaseButton :hover (аппрокс.) | 4.5:1 | 2.53 FAIL | 2.01 FAIL |
| #fff / --color-accent-hover | Stepper/Tabs hover | 4.5:1 | 3.36 FAIL AA (только крупный текст) | 2.83 FAIL |
| --color-white / --color-accent | Tabs/Calendar/Select: color: var(--color-white) на accent | 4.5:1 | 2.80 FAIL | 7.83 AA OK |
| #fff / --color-accent (иконка) | Checkbox ✓, Editor active (графика) | 3:1 | 2.80 FAIL (<3) | 2.26 FAIL (<3) |
| #fff / --color-error | BaseChip индикатор (11px bold) | 4.5:1 | 3.76 FAIL AA (только крупный текст) | 2.77 FAIL |
| --color-primary / soft(accent) over bg | BaseButton variant=soft | 4.5:1 | 15.10 AA OK | 14.47 AA OK |
| --color-text / --color-white | BaseButton variant=shadow | 4.5:1 | 10.44 AA OK | 13.96 AA OK |
| --color-text / --color-surface-muted | BaseBadge default (если унаследован --color-text) | 4.5:1 | 9.50 AA OK | 11.74 AA OK |
| --color-text-muted×0.7 / --color-white | BaseCard subtitle (opacity .7) | 4.5:1 | 2.73 FAIL | 4.04 FAIL AA (только крупный текст) |
| --color-accent / --color-bg | фокус-кольцо Button/Badge/Card | 3:1 | 2.69 FAIL (<3) | 8.79 OK (≥3) |
| --color-accent / --color-surface-muted | Progress: заливка vs трек | 3:1 | 2.55 FAIL (<3) | 6.58 OK (≥3) |
| --color-error / --color-bg | BaseChip variant=outline: текст индикатора | 4.5:1 | 3.61 FAIL AA (только крупный текст) | 7.19 AA OK |
| #000 (цвет UA) / --color-surface-muted | BaseBadge: текст наследуется от контекста (body без color) | 4.5:1 | 19.11 AA OK | 1.41 FAIL |
| light --color-text / --color-surface-muted | BaseBadge: body с нетемизированным color | 4.5:1 | 9.50 AA OK | 1.43 FAIL |
| --color-info-text / --color-info-bg | BaseAlert info: заголовок | 4.5:1 | 5.57 AA OK | 9.81 AA OK |
| --color-text×0.9 / --color-info-bg | BaseAlert info: описание (BaseText, opacity .9) | 4.5:1 | 7.30 AA OK | 11.46 AA OK |
| --color-info-icon / --color-info-bg | BaseAlert info: иконка | 3:1 | 3.84 OK (≥3) | 6.96 OK (≥3) |
| --color-success-text / --color-success-bg | BaseAlert success: заголовок | 4.5:1 | 4.79 AA OK | 10.62 AA OK |
| --color-text×0.9 / --color-success-bg | BaseAlert success: описание (BaseText, opacity .9) | 4.5:1 | 7.45 AA OK | 9.78 AA OK |
| --color-success-icon / --color-success-bg | BaseAlert success: иконка | 3:1 | 3.15 OK (≥3) | 8.55 OK (≥3) |
| --color-warning-text / --color-warning-bg | BaseAlert warning: заголовок | 4.5:1 | 4.84 AA OK | 10.11 AA OK |
| --color-text×0.9 / --color-warning-bg | BaseAlert warning: описание (BaseText, opacity .9) | 4.5:1 | 7.50 AA OK | 9.53 AA OK |
| --color-warning-icon / --color-warning-bg | BaseAlert warning: иконка | 3:1 | 3.07 OK (≥3) | 8.73 OK (≥3) |
| --color-error-text / --color-error-bg | BaseAlert error: заголовок | 4.5:1 | 5.91 AA OK | 8.51 AA OK |
| --color-text×0.9 / --color-error-bg | BaseAlert error: описание (BaseText, opacity .9) | 4.5:1 | 7.18 AA OK | 10.42 AA OK |
| --color-error-icon / --color-error-bg | BaseAlert error: иконка | 3:1 | 4.41 OK (≥3) | 5.84 OK (≥3) |
