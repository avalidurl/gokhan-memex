/** @type {import('tailwindcss').Config} */

const ink = "hsl(var(--foreground))"
const paper = "hsl(var(--background))"
const dim = "hsl(var(--muted-foreground))"
const faint = "hsl(var(--muted))"
const ikbAcc = "hsl(var(--primary))"

const editorialScale = {
  50: paper,
  100: faint,
  200: "hsl(var(--border))",
  300: "hsl(var(--border))",
  400: dim,
  500: dim,
  600: dim,
  700: ink,
  800: ink,
  900: ink,
  950: ink,
}

const sansStack = [
  '-apple-system',
  'BlinkMacSystemFont',
  '"Helvetica Neue"',
  'Inter',
  'Arial',
  'sans-serif',
]

const serifStack = [
  'Georgia',
  '"Iowan Old Style"',
  '"Palatino Linotype"',
  'Palatino',
  'serif',
]

const dataStack = [
  '"JetBrains Mono"',
  'ui-monospace',
  '"SF Mono"',
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
      boxShadow: {
        sm: '0 2px 8px rgba(15, 23, 48, 0.04)',
        DEFAULT: '0 4px 16px rgba(15, 23, 48, 0.06)',
        md: '0 8px 24px rgba(15, 23, 48, 0.07)',
        lg: '0 14px 34px rgba(15, 23, 48, 0.09)',
        xl: '0 20px 44px rgba(15, 23, 48, 0.11)',
        '2xl': '0 28px 55px rgba(0, 47, 167, 0.18)',
        inner: 'inset 0 2px 4px rgba(15, 23, 48, 0.04)',
        none: '0 0 #0000',
      },
      ringOffsetColor: {
        DEFAULT: 'hsl(var(--background))',
      },
      colors: {
        white: "hsl(var(--card))",
        black: ink,
        gray: editorialScale,
        slate: editorialScale,
        zinc: editorialScale,
        neutral: editorialScale,
        stone: editorialScale,
        blue: { ...editorialScale, 500: ikbAcc, 600: ikbAcc, 700: ikbAcc },
        indigo: { ...editorialScale, 500: ikbAcc, 600: ikbAcc, 700: ikbAcc },
        red: { ...editorialScale, 500: ikbAcc, 600: ikbAcc },
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
        xl: "20px",
        lg: "16px",
        md: "12px",
        sm: "8px",
      },
      fontFamily: {
        sans: sansStack,
        serif: serifStack,
        mono: dataStack,
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': 'hsl(var(--foreground))',
            '--tw-prose-headings': 'hsl(var(--foreground))',
            '--tw-prose-lead': 'var(--lead-ink)',
            '--tw-prose-links': 'var(--acc)',
            '--tw-prose-bold': 'hsl(var(--foreground))',
            '--tw-prose-counters': 'hsl(var(--muted-foreground))',
            '--tw-prose-bullets': 'var(--acc)',
            '--tw-prose-hr': 'hsl(var(--border))',
            '--tw-prose-quotes': 'var(--lead-ink)',
            '--tw-prose-quote-borders': 'var(--acc)',
            '--tw-prose-captions': 'hsl(var(--muted-foreground))',
            '--tw-prose-code': 'hsl(var(--foreground))',
            '--tw-prose-pre-code': 'hsl(var(--foreground))',
            '--tw-prose-pre-bg': 'hsl(var(--muted))',
            '--tw-prose-th-borders': 'hsl(var(--border))',
            '--tw-prose-td-borders': 'hsl(var(--border))',
            '--tw-prose-invert-body': 'hsl(var(--foreground))',
            '--tw-prose-invert-headings': 'hsl(var(--foreground))',
            '--tw-prose-invert-links': 'var(--acc)',
            '--tw-prose-invert-bold': 'hsl(var(--foreground))',
            '--tw-prose-invert-code': 'hsl(var(--foreground))',
            '--tw-prose-kbd': 'hsl(var(--foreground))',
            '--tw-prose-kbd-shadows': '15 23 48',
            '--tw-prose-invert-lead': 'var(--lead-ink)',
            '--tw-prose-invert-counters': 'hsl(var(--muted-foreground))',
            '--tw-prose-invert-bullets': 'var(--acc)',
            '--tw-prose-invert-hr': 'hsl(var(--border))',
            '--tw-prose-invert-quotes': 'var(--lead-ink)',
            '--tw-prose-invert-quote-borders': 'var(--acc)',
            '--tw-prose-invert-captions': 'hsl(var(--muted-foreground))',
            '--tw-prose-invert-kbd': 'hsl(var(--foreground))',
            '--tw-prose-invert-kbd-shadows': '244 241 236',
            '--tw-prose-invert-pre-code': 'hsl(var(--foreground))',
            '--tw-prose-invert-pre-bg': 'hsl(var(--muted))',
            '--tw-prose-invert-th-borders': 'hsl(var(--border))',
            '--tw-prose-invert-td-borders': 'hsl(var(--border))',

            maxWidth: '68ch',
            color: 'hsl(var(--foreground))',
            fontFamily: 'var(--font-sans)',
            fontSize: '17px',
            lineHeight: '1.68',
            'h1, h2, h3': {
              fontFamily: 'var(--font-serif)',
              fontWeight: '700',
              letterSpacing: '-0.01em',
            },
            h1: {
              fontSize: 'clamp(30px, 5vw, 44px)',
              lineHeight: '1.12',
            },
            h2: {
              fontSize: '26px',
              lineHeight: '1.24',
              borderBottomWidth: '1px',
              borderBottomColor: 'hsl(var(--border))',
              paddingBottom: '0.45rem',
            },
            h3: {
              fontSize: '19px',
              lineHeight: '1.32',
            },
            'h4, h5, h6': {
              fontFamily: 'var(--font-sans)',
              fontWeight: '600',
            },
            p: {
              marginTop: '1rem',
              marginBottom: '1rem',
              lineHeight: '1.68',
            },
            a: {
              color: 'var(--acc)',
              textDecoration: 'underline',
              fontWeight: '400',
              textUnderlineOffset: '3px',
              textDecorationThickness: '1px',
            },
            'a:hover': {
              color: 'var(--acc-dark)',
            },
            blockquote: {
              borderLeftWidth: '4px',
              borderLeftColor: 'var(--acc)',
              backgroundColor: 'var(--soft)',
              borderRadius: '0 12px 12px 0',
              padding: '0.75rem 1.15rem',
              fontStyle: 'italic',
            },
            strong: {
              fontWeight: '700',
            },
            pre: {
              padding: '1rem 1.2rem',
              borderRadius: '14px',
              border: '1px solid hsl(var(--border))',
              fontFamily: 'var(--font-data)',
            },
            code: {
              backgroundColor: 'var(--soft)',
              borderRadius: '6px',
              padding: '2px 6px',
              fontWeight: '400',
              fontFamily: 'var(--font-data)',
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}
