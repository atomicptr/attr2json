/// <reference types="vite/client" />
/// <reference types="vitest" />

import { defineConfig } from "vite";
import { resolve } from "node:path";
import dts from "vite-plugin-dts";

export default defineConfig({
    plugins: [dts()],
    build: {
        lib: {
            name: "attr2json",
            entry: resolve(__dirname, "src/main.ts"),
            formats: ["es", "umd"],
        },
        rollupOptions: {
            output: {
                entryFileNames: "attr2json.[format].js",
            },
        },
    },
    test: {
        globals: true,
        environment: "happy-dom",
    }
})
