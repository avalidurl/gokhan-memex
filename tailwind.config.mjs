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
        sans: ["Georgia", '"Times New Roman"', "Times", ...fontFamily.serif],
        serif: ["Georgia", '"Times New Roman"', "Times", ...fontFamily.serif],
        mono: ['"Courier New"', "Courier", ...fontFamily.mono],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'hsl(var(--foreground))',
            fontFamily: 'Georgia, "Times New Roman", Times, serif',
            fontSize: '1.125rem',
            lineHeight: '1.75',
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: 'Georgia, "Times New Roman", Times, serif',
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
              fontFamily: '"Courier New", Courier, ui-monospace, monospace',
            },
            code: {
              border: '1px solid hsl(var(--border))',
              position: 'relative',
              borderRadius: '0',
              fontFamily: '"Courier New", Courier, ui-monospace, monospace',
            }
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}
