import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const kaplayCongrats = () => {
    return {
        name: "vite-plugin-kaplay-hello",
        buildEnd() {
            const line =
                "---------------------------------------------------------";
            const msg = `🦖 Awesome pal! Send your game to us:\n\n💎 Discord: https://discord.com/invite/aQ6RuQm3TF \n💖 Donate to KAPLAY: https://opencollective.com/kaplay\n\ (you can disable this msg on vite.config)`;

            process.stdout.write(`\n${line}\n${msg}\n${line}\n`);
        },
    };
};

export default defineConfig({
    // index.html out file will start with a relative path for script
    base: "./",
    server: {
        port: 3001,
    },
    build: {
        // disable this for low bundle sizes
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    kaplay: ["kaplay"],
                },
            },
        },
    },
    plugins: [
        // Disable messages removing this line
        kaplayCongrats(),
        VitePWA({
            registerType: "autoUpdate",
            injectRegister: "auto",
            workbox: {
                globPatterns: ["**/*.{js,css,html,ico,png,svg,mp3,wav,ogg,ttf,woff,woff2}"],
                maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
            },
            manifest: {
                name: "Spicy Tower",
                short_name: "SpicyTower",
                description: "A SPICY tower climbing game!",
                theme_color: "#ff4500",
                icons: [
                    {
                        src: "pwa-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                    {
                        src: "pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "any maskable",
                    },
                ],
            },
        }),
    ],
});