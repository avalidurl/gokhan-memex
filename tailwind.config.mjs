import { fontFamily } from "tailwindcss/defaultTheme"

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
        sans: ["Source Sans Pro", ...fontFamily.sans],
        serif: ["Crimson Text", ...fontFamily.serif],
        mono: ["JetBrains Mono", ...fontFamily.mono],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'hsl(var(--foreground))',
            fontFamily: '"Crimson Text", Georgia, "Times New Roman", Times, serif',
            fontSize: 'clamp(1.125rem, 1rem + 0.5vw, 1.3rem)',
            lineHeight: '1.8',
            fontVariantNumeric: 'oldstyle-nums',
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: '"Crimson Text", Georgia, "Times New Roman", Times, serif',
              fontWeight: '600',
              letterSpacing: '-0.02em',
            },
            h1: {
              fontSize: '2.5rem',
              lineHeight: '1.1',
              fontWeight: '700',
            },
            h2: {
              fontSize: '2rem',
              lineHeight: '1.2',
            },
            h3: {
              fontSize: '1.625rem',
              lineHeight: '1.3',
            },
            p: {
              marginBottom: '1.25rem',
              lineHeight: '1.8',
            },
            a: {
              color: 'hsl(var(--primary))',
              textDecoration: 'underline',
              fontWeight: '500',
            },
            strong: {
              fontWeight: '600',
            },
            '[data-rehype-pretty-code-fragment]': {
              position: 'relative',
            },
            pre: {
              padding: 0,
              fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            },
            code: {
              border: '1px solid hsl(var(--border))',
              position: 'relative',
              borderRadius: '0.375rem',
              fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            }
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}