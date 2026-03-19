import { createSolidTransformPlugin } from "./src/preload.ts"

const result = await Bun.build({
  entrypoints: ["./src/index.tsx"],
  outdir: "./bin",
  target: "bun",
  plugins: [createSolidTransformPlugin()],
  naming: "jitters.js",
})

if (!result.success) {
  for (const log of result.logs) {
    console.error(log)
  }
  process.exit(1)
}

// Compile the bundled JS into a standalone binary
const compile = Bun.spawn(["bun", "build", "--compile", "./bin/jitters.js", "--outfile", "./bin/jitters"], {
  stdout: "inherit",
  stderr: "inherit",
})
const exitCode = await compile.exited
if (exitCode !== 0) process.exit(exitCode)

// Clean up intermediate bundle
await Bun.file("./bin/jitters.js").delete()
