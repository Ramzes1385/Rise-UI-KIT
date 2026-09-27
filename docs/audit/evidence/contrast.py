#!/usr/bin/env python3
"""WCAG 2.x contrast check for Rise-UI-KIT theme tokens (group "display").

Reads src/styles/_variables.scss (light :root + [data-theme='dark']),
resolves hex tokens, composites translucent layers (color-mix with transparent,
opacity) over their real backdrop and prints a Markdown table.
Run (из корня репозитория): python3 docs/audit/evidence/contrast.py src/styles/_variables.scss [--wide]
"""
import re
import sys

PATH = sys.argv[1] if len(sys.argv) > 1 else 'src/styles/_variables.scss'
scss = open(PATH, encoding='utf-8').read()


def block(selector_regex):
    m = re.search(selector_regex + r'\s*\{(.*?)\n\}', scss, re.S)
    return dict(re.findall(r'(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;', m.group(1)))


light = block(r':root')
dark = {**light, **block(r"\[data-theme='dark'\]")}
# color-mix(in srgb, var(--color-accent) N%, transparent) — доли из _variables.scss
SOFT = {'light': (0.12, 0.18), 'dark': (0.18, 0.26)}


def rgb(h):
    h = h.lstrip('#')
    if len(h) == 3:
        h = ''.join(c * 2 for c in h)
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def mix(fg, bg, alpha):
    """Альфа-композиция fg (с непрозрачностью alpha) поверх bg, sRGB 8 бит."""
    return tuple(round(alpha * f + (1 - alpha) * b) for f, b in zip(fg, bg))


def brightness(c, k):
    """Аппроксимация CSS filter: brightness(k) в sRGB."""
    return tuple(min(255, round(v * k)) for v in c)


def lum(c):
    def ch(v):
        v /= 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = (ch(v) for v in c)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def verdict(r, kind):
    if kind == 'ui':  # нетекстовый контраст 1.4.11
        return 'OK (≥3)' if r >= 3 else 'FAIL (<3)'
    if r >= 4.5:
        return 'AA OK'
    if r >= 3:
        return 'FAIL AA (только крупный текст)'
    return 'FAIL'


WHITE = rgb('#ffffff')


def pairs(theme):
    t = light if theme == 'light' else dark
    c = {k: rgb(v) for k, v in t.items()}
    soft12, _ = SOFT[theme]
    bg, surf, surf_m, white_tok = c['--color-bg'], c['--color-surface'], c['--color-surface-muted'], c['--color-white']
    rows = [
        ('--color-text / --color-bg', c['--color-text'], bg, 'text', 'базовый текст (BaseText, Progress label)'),
        ('--color-text / --color-surface', c['--color-text'], surf, 'text', 'текст на поверхности'),
        ('--color-text-muted / --color-bg', c['--color-text-muted'], bg, 'text', 'Separator/Loader label, Empty description, ghost-кнопка'),
        ('--color-text-muted / --color-surface', c['--color-text-muted'], surf, 'text', 'плейсхолдер Input/Textarea'),
        ('--color-text-muted / --color-surface-muted', c['--color-text-muted'], surf_m, 'text', 'плейсхолдер в hover/filled-состоянии'),
        ('--color-text-muted / --color-bg-soft', c['--color-text-muted'], c['--color-bg-soft'], 'text', 'BaseEmpty variant=soft'),
        ('#fff / --color-accent', WHITE, c['--color-accent'], 'text', 'BaseButton default (14px/600), Stepper, Tabs/Calendar (light)'),
        ('#fff / accent + brightness(1.1)', WHITE, brightness(c['--color-accent'], 1.1), 'text', 'BaseButton :hover (аппрокс.)'),
        ('#fff / --color-accent-hover', WHITE, c['--color-accent-hover'], 'text', 'Stepper/Tabs hover'),
        ('--color-white / --color-accent', white_tok, c['--color-accent'], 'text', 'Tabs/Calendar/Select: color: var(--color-white) на accent'),
        ('#fff / --color-accent (иконка)', WHITE, c['--color-accent'], 'ui', 'Checkbox ✓, Editor active (графика)'),
        ('#fff / --color-error', WHITE, c['--color-error'], 'text', 'BaseChip индикатор (11px bold)'),
        ('--color-primary / soft(accent) over bg', c['--color-primary'], mix(c['--color-accent'], bg, soft12), 'text', 'BaseButton variant=soft'),
        ('--color-text / --color-white', c['--color-text'], white_tok, 'text', 'BaseButton variant=shadow'),
        ('--color-text / --color-surface-muted', c['--color-text'], surf_m, 'text', 'BaseBadge default (если унаследован --color-text)'),
        ('--color-text-muted×0.7 / --color-white', mix(c['--color-text-muted'], white_tok, 0.7), white_tok, 'text', 'BaseCard subtitle (opacity .7)'),
        ('--color-accent / --color-bg', c['--color-accent'], bg, 'ui', 'фокус-кольцо Button/Badge/Card'),
        ('--color-accent / --color-surface-muted', c['--color-accent'], surf_m, 'ui', 'Progress: заливка vs трек'),
    ]
    rows += [
        ('--color-error / --color-bg', c['--color-error'], bg, 'text', 'BaseChip variant=outline: текст индикатора'),
        ('#000 (цвет UA) / --color-surface-muted', rgb('#000000'), surf_m, 'text', 'BaseBadge: текст наследуется от контекста (body без color)'),
        ('light --color-text / --color-surface-muted', rgb(light['--color-text']), surf_m, 'text', 'BaseBadge: body с нетемизированным color'),
    ]
    for k in ('info', 'success', 'warning', 'error'):
        abg = c[f'--color-{k}-bg']
        rows.append((f'--color-{k}-text / --color-{k}-bg', c[f'--color-{k}-text'], abg, 'text', f'BaseAlert {k}: заголовок'))
        rows.append((f'--color-text×0.9 / --color-{k}-bg', mix(c['--color-text'], abg, 0.9), abg, 'text', f'BaseAlert {k}: описание (BaseText, opacity .9)'))
        rows.append((f'--color-{k}-icon / --color-{k}-bg', c[f'--color-{k}-icon'], abg, 'ui', f'BaseAlert {k}: иконка'))
    return rows


def hexs(c):
    return '#%02x%02x%02x' % c


if '--wide' in sys.argv:  # светлая и тёмная тема в одной строке
    print('| Пара (fg / bg) | Где используется | Порог | Light | Dark |')
    print('|---|---|---|---|---|')
    for (name, fg, bgc, kind, where), (_, fg2, bg2, _, _) in zip(pairs('light'), pairs('dark')):
        r1, r2 = ratio(fg, bgc), ratio(fg2, bg2)
        print(f"| {name} | {where} | {'3:1' if kind == 'ui' else '4.5:1'} | "
              f"{r1:.2f} {verdict(r1, kind)} | {r2:.2f} {verdict(r2, kind)} |")
    sys.exit(0)

print('| Тема | Пара (fg / bg) | fg | bg | Контраст | Порог | Вердикт | Где используется |')
print('|---|---|---|---|---|---|---|---|')
for theme in ('light', 'dark'):
    for name, fg, bgc, kind, where in pairs(theme):
        r = ratio(fg, bgc)
        print(f"| {theme} | {name} | {hexs(fg)} | {hexs(bgc)} | {r:.2f}:1 | {'3:1' if kind == 'ui' else '4.5:1'} | {verdict(r, kind)} | {where} |")
