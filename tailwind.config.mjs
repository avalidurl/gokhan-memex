import { fontFamily } from "tailwindcss/defaultTheme"
import twColors from "tailwindcss/colors"

/** @type {import('tailwindcss').Config} */
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
      colors: {
        gray: twColors.neutral,
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
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', "Helvetica", "Arial", '"Liberation Sans"', ...fontFamily.sans],
        serif: ['"Helvetica Neue"', "Helvetica", "Arial", '"Liberation Sans"', ...fontFamily.sans],
        mono: ['ui-monospace', '"SF Mono"', 'Menlo', ...fontFamily.mono],
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
            '--tw-prose-hr': 'hsl(var(--border))',
            '--tw-prose-quotes': 'hsl(var(--foreground))',
            '--tw-prose-quote-borders': 'hsl(var(--border))',
            '--tw-prose-captions': 'hsl(var(--muted-foreground))',
            '--tw-prose-code': 'hsl(var(--foreground))',
            '--tw-prose-pre-code': 'hsl(var(--background))',
            '--tw-prose-pre-bg': 'hsl(var(--secondary-foreground))',
            '--tw-prose-th-borders': 'hsl(var(--border))',
            '--tw-prose-td-borders': 'hsl(var(--border))',
            '--tw-prose-invert-body': 'hsl(var(--foreground))',
            '--tw-prose-invert-headings': 'hsl(var(--foreground))',
            '--tw-prose-invert-links': 'hsl(var(--foreground))',
            '--tw-prose-invert-bold': 'hsl(var(--foreground))',
            '--tw-prose-invert-code': 'hsl(var(--foreground))',
            '--tw-prose-kbd': 'hsl(var(--foreground))',
            '--tw-prose-kbd-shadows': '20 20 20',
            '--tw-prose-invert-lead': 'hsl(var(--muted-foreground))',
            '--tw-prose-invert-counters': 'hsl(var(--muted-foreground))',
            '--tw-prose-invert-bullets': 'hsl(var(--muted-foreground))',
            '--tw-prose-invert-hr': 'hsl(var(--border))',
            '--tw-prose-invert-quotes': 'hsl(var(--foreground))',
            '--tw-prose-invert-quote-borders': 'hsl(var(--border))',
            '--tw-prose-invert-captions': 'hsl(var(--muted-foreground))',
            '--tw-prose-invert-kbd': 'hsl(var(--foreground))',
            '--tw-prose-invert-kbd-shadows': '230 230 230',
            '--tw-prose-invert-pre-code': 'hsl(var(--background))',
            '--tw-prose-invert-pre-bg': 'hsl(var(--secondary))',
            '--tw-prose-invert-th-borders': 'hsl(var(--border))',
            '--tw-prose-invert-td-borders': 'hsl(var(--border))',

            maxWidth: 'none',
            color: 'hsl(var(--foreground))',
            fontFamily: '"Helvetica Neue", Helvetica, Arial, "Liberation Sans", sans-serif',
            fontSize: '1.125rem',
            lineHeight: '1.75',
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: '"Helvetica Neue", Helvetica, Arial, "Liberation Sans", sans-serif',
              fontWeight: '700',
              letterSpacing: '0',
            },
            h1: {
              fontSize: '2.35rem',
              lineHeight: '1.15',
              fontWeight: '700',
            },
            h2: {
              fontSize: '1.85rem',
              lineHeight: '1.2',
            },
            h3: {
              fontSize: '1.45rem',
              lineHeight: '1.3',
            },
            p: {
              marginTop: '1rem',
              marginBottom: '1rem',
              lineHeight: '1.75',
            },
            a: {
              color: 'hsl(var(--primary))',
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
              fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
            },
            code: {
              border: '1px solid hsl(var(--border))',
              position: 'relative',
              borderRadius: '0',
              fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
            }
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}
