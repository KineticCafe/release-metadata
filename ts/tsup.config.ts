import { Options } from 'tsup'

export const tsup: Options = {
  entryPoints: ['src/index.ts', 'src/cli.ts'],
  minify: true,
  format: ['esm', 'cjs'],
  dts: { entry: 'src/index.ts', resolve: false },
  sourcemap: false,
  clean: true,
  splitting: false,
}
