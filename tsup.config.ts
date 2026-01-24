import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/YearlyCalendar/index.ts"],
  format: ["cjs", "esm"],
  dts: {
    compilerOptions: {
      incremental: false,
    },
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom"],
  outDir: "dist",
  treeshake: true,
  minify: false,
  tsconfig: "tsconfig.json",
});
