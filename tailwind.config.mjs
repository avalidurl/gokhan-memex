/** @type {import('tailwindcss').Config} */

// Strict monochrome: every palette name collapses onto the four house tokens
// (ink / paper / dim / faint) via the theme-aware CSS variables, so stray
// literal utilities (bg-red-600, text-white, …) cannot introduce color.
const ink = "hsl(var(--foreground))"
const paper = "hsl(var(--background))"
const dim = "hsl(var(--muted-foreground))"
const faint = "hsl(var(--muted))"

const monoScale = {
  50: paper,
  100: faint,
  200: faint,
  300: faint,
  400: dim,
  500: dim,
  600: dim,
  700: ink,
  800: ink,
  900: ink,
  950: ink,
}

const monoStack = [
  '"SF Mono"',
  '"IBM Plex Mono"',
  '"JetBrains Mono"',
  'ui-monospace',
  'Menlo',
  'monospace',
]

export default {
  darkMode: ["class"],
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // Shadows do not exist in the house register; keep the utilities inert
      // so content-embedded classes cannot ship colored shadow values.
      boxShadow: {
        sm: '0 0 #0000',
        DEFAULT: '0 0 #0000',
        md: '0 0 #0000',
        lg: '0 0 #0000',
        xl: '0 0 #0000',
        '2xl': '0 0 #0000',
        inner: '0 0 #0000',
        none: '0 0 #0000',
      },
      ringOffsetColor: {
        DEFAULT: 'hsl(var(--background))',
      },
      colors: {
        white: paper,
        black: ink,
        gray: monoScale,
        slate: monoScale,
        zinc: monoScale,
        neutral: monoScale,
        stone: monoScale,
        red: monoScale,
        orange: monoScale,
        amber: monoScale,
        yellow: monoScale,
        lime: monoScale,
        green: monoScale,
        emerald: monoScale,
        teal: monoScale,
        cyan: monoScale,
        sky: monoScale,
        blue: monoScale,
        indigo: monoScale,
        violet: monoScale,
        purple: monoScale,
        fuchsia: monoScale,
        pink: monoScale,
        rose: monoScale,
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "0",
        md: "0",
        sm: "0",
      },
      fontFamily: {
        sans: monoStack,
        serif: monoStack,
        mono: monoStack,
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': 'hsl(var(--foreground))',
            '--tw-prose-headings': 'hsl(var(--foreground))',
            '--tw-prose-lead': 'hsl(var(--muted-foreground))',
            '--tw-prose-links': 'hsl(var(--foreground))',
            '--tw-prose-bold': 'hsl(var(--foreground))',
            '--tw-prose-counters': 'hsl(var(--muted-foreground))',
            '--tw-prose-bullets': 'hsl(var(--muted-foreground))',
            '--tw-prose-hr': 'hsl(var(--foreground))',
            '--tw-prose-quotes': 'hsl(var(--foreground))',
            '--tw-prose-quote-borders': 'hsl(var(--foreground))',
            '--tw-prose-captions': 'hsl(var(--muted-foreground))',
            '--tw-prose-code': 'hsl(var(--foreground))',
            '--tw-prose-pre-code': 'hsl(var(--foreground))',
            '--tw-prose-pre-bg': 'hsl(var(--muted))',
            '--tw-prose-th-borders': 'hsl(var(--foreground))',
            '--tw-prose-td-borders': 'hsl(var(--foreground))',
            '--tw-prose-invert-body': 'hsl(var(--foreground))',
            '--tw-prose-invert-headings': 'hsl(var(--foreground))',
            '--tw-prose-invert-links': 'hsl(var(--foreground))',
            '--tw-prose-invert-bold': 'hsl(var(--foreground))',
            '--tw-prose-invert-code': 'hsl(var(--foreground))',
            '--tw-prose-kbd': 'hsl(var(--foreground))',
            '--tw-prose-kbd-shadows': '10 10 10',
            '--tw-prose-invert-lead': 'hsl(var(--muted-foreground))',
            '--tw-prose-invert-counters': 'hsl(var(--muted-foreground))',
            '--tw-prose-invert-bullets': 'hsl(var(--muted-foreground))',
            '--tw-prose-invert-hr': 'hsl(var(--foreground))',
            '--tw-prose-invert-quotes': 'hsl(var(--foreground))',
            '--tw-prose-invert-quote-borders': 'hsl(var(--foreground))',
            '--tw-prose-invert-captions': 'hsl(var(--muted-foreground))',
            '--tw-prose-invert-kbd': 'hsl(var(--foreground))',
            '--tw-prose-invert-kbd-shadows': '230 230 230',
            '--tw-prose-invert-pre-code': 'hsl(var(--foreground))',
            '--tw-prose-invert-pre-bg': 'hsl(var(--muted))',
            '--tw-prose-invert-th-borders': 'hsl(var(--foreground))',
            '--tw-prose-invert-td-borders': 'hsl(var(--foreground))',

            maxWidth: '72ch',
            color: 'hsl(var(--foreground))',
            fontFamily: '"SF Mono", "IBM Plex Mono", "JetBrains Mono", ui-monospace, Menlo, monospace',
            fontSize: '14px',
            lineHeight: '1.55',
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: '"SF Mono", "IBM Plex Mono", "JetBrains Mono", ui-monospace, Menlo, monospace',
              fontWeight: '700',
              letterSpacing: '0.02em',
            },
            h1: {
              fontSize: 'clamp(26px, 5.5vw, 44px)',
              lineHeight: '1.05',
              fontWeight: '700',
            },
            h2: {
              fontSize: '12px',
              lineHeight: '1.4',
              textTransform: 'uppercase',
              letterSpacing: '0.22em',
              borderBottomWidth: '2px',
              borderBottomColor: 'hsl(var(--foreground))',
              paddingBottom: '0.35rem',
            },
            h3: {
              fontSize: '12px',
              lineHeight: '1.4',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
            },
            p: {
              marginTop: '1rem',
              marginBottom: '1rem',
              lineHeight: '1.55',
            },
            a: {
              color: 'hsl(var(--foreground))',
              textDecoration: 'underline',
              fontWeight: '400',
              textUnderlineOffset: '0.12em',
              textDecorationThickness: '1px',
            },
            strong: {
              fontWeight: '700',
            },
            '[data-rehype-pretty-code-fragment]': {
              position: 'relative',
            },
            pre: {
              padding: '1rem',
              fontFamily: '"SF Mono", "IBM Plex Mono", "JetBrains Mono", ui-monospace, Menlo, monospace',
            },
            code: {
              border: '1px solid hsl(var(--foreground))',
              position: 'relative',
              borderRadius: '0',
              fontFamily: '"SF Mono", "IBM Plex Mono", "JetBrains Mono", ui-monospace, Menlo, monospace',
            }
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}
