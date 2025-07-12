// File: src/utils/transpile.ts
import * as esbuild from 'esbuild-wasm';

let initialized = false;

export const bundleClientCode = async (files: { filename: string; content: string }[]) => {
  if (!initialized) {
    await esbuild.initialize({
      wasmURL: '/esbuild.wasm',
      worker: true,
    });
    initialized = true;
  }

  const fileMap: Record<string, string> = {};
  for (const file of files) {
    fileMap[file.filename] = file.content;
  }

  const entryFile = fileMap['index.js'] ? 'index.js' : 'App.js';

  const result = await esbuild.build({
    entryPoints: [entryFile],
    bundle: true,
    write: false,
    plugins: [
      {
        name: 'virtual-files',
        setup(build) {
          build.onResolve({ filter: /.*/ }, (args) => {
            const path = args.path;
            if (path.startsWith('.') || path.startsWith('/')) {
              const fullPath = new URL(path, `file://${args.resolveDir}/`).pathname.slice(1);
              return { path: fullPath, namespace: 'virtual' };
            }
            return { path, external: true }; // e.g., react
          });

          build.onLoad({ filter: /.*/ }, (args) => {
            const content = fileMap[args.path];
            if (content) {
              return { contents: content, loader: 'jsx' };
            }
          });
        },
      },
    ],
  });

  return result.outputFiles?.[0]?.text || '';
};
