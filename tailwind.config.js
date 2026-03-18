/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                'gold-film': '#C9A227',
                'gold-warm': '#E8D5A3',
                'gold-highlight': '#FFE55C',
                'void': '#0A0908',
                'darkroom': '#141210',
                'velvet': '#1C1A18',
                'cyan-film': '#4ECDC4',
                'orange-film': '#FF6B35',
                'purple-dusk': '#7B68EE',
                'silver-screen': '#C0C0C0',
                'celluloid': '#F7F2E9',
                'smoke': '#5C5552',
            },
            fontFamily: {
                display: ["Gowun Batang", "serif"],
                body: ["Pretendard", "sans-serif"],
                mono: ["JetBrains Mono", "monospace"],
            },
            aspectRatio: {
                'cinematic': '2.35 / 1',
                'poster': '2 / 3',
            },
            animation: {
                'grain': 'grain 8s steps(10) infinite',
                'leak': 'leak 25s infinite',
                'float': 'float linear infinite',
            },
            keyframes: {
                grain: {
                    '0%, 100%': { transform: 'translate(0, 0)' },
                    '10%': { transform: 'translate(-5%, -5%)' },
                    '20%': { transform: 'translate(-10%, 5%)' },
                    '30%': { transform: 'translate(5%, -10%)' },
                    '40%': { transform: 'translate(-5%, 15%)' },
                    '50%': { transform: 'translate(-10%, -5%)' },
                    '60%': { transform: 'translate(15%, 0)' },
                    '70%': { transform: 'translate(0, 10%)' },
                    '80%': { transform: 'translate(-15%, 0)' },
                    '90%': { transform: 'translate(10%, 10%)' },
                },
                leak: {
                    '0%, 100%': { opacity: '0' },
                    '15%': { opacity: '0.15' },
                    '17%': { opacity: '0.05' },
                    '18%': { opacity: '0.2' },
                    '20%': { opacity: '0' },
                    '50%': { opacity: '0' },
                    '75%': { opacity: '0.1' },
                    '77%': { opacity: '0' },
                },
            },
        },
    },
    plugins: [],
}
