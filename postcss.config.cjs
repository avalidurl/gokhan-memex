// Tailwind 3 stays on the PostCSS plugin. @astrojs/tailwind does not peer Astro 7.
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
