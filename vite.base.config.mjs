import { builtinModules } from 'module';
import { defineConfig } from 'vite';

export const external = [
  'electron',
  ...builtinModules,
  ...builtinModules.map((m) => `node:${m}`),
];

export function getBuildConfig(env) {
  /** @type {import('vite').UserConfig} */
  return {
    mode: env.mode,
    build: {
      minify: false,
      sourcemap: true,
      outDir: '.vite/build',
      watch: env.watch ? {} : null,
    },
  };
}

export function getBuildDefine(env) {
  return {
    'process.env.NODE_ENV': JSON.stringify(env.mode),
  };
}

export function pluginHotRestart(type) {
  return {
    name: 'hot-restart',
    closeBundle() {
      if (!process.env.VITE_DEV_SERVER_URL) return;
      process.stdin.emit('data', Buffer.from(type === 'restart' ? 'rs\n' : 'r\n'));
    },
  };
}

export default defineConfig({});
