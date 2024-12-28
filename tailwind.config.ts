import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        primary: '#5c3c92', // Matching border color
        accent: '#61a3ba',  // Accent color
        error: '#ff3333',   // Error color
        success: '#3ba25f', // Success color
        // Add more custom colors as needed
      },
      fontFamily: {
        caveat: ['Caveat', 'cursive'],
        pressStart: ['"Press Start 2P"', 'cursive'],
        roboto: ['Roboto', 'sans-serif'],
        agbalumo: ['Agbalumo', 'cursive'],
        orbitron: ['Orbitron', 'serif']
      },
      height: {
        '128': '32rem', // Adds h-128 class
      },
      width: {
        '128': '32rem', // Similarly, if needed
      },
      fontSize: {
        'xxs': '0.65rem', // Adds a custom font size
      },
    },
  },
  plugins: [],
}
export default config
