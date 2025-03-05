import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

export default {
  packagerConfig: {
    asar: true,
    icon: './images/icon.ico',
    platform: ['win32', 'linux'],
    arch: 'x64',
    executableName: 'stockmachine',
    name: 'STOCKMACHINE'
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        platforms: ['win32'],
        iconUrl: 'https://stockmachine.online/icon.ico',
        noMsi: true,
        shortcutName: 'STOCKMACHINE',
        setupIcon: './images/icon.ico',
        loadingGif: './images/loading.gif',
        setupExe: 'STOCKMACHINE-Setup.exe'
      },
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'StockMachine',
          homepage: 'https://stockmachine.online',
          icon: './images/icon.ico',
          categories: ['Utility'],
          description: 'Stock Management Application',
          productName: 'STOCKMACHINE',
          executableName: 'stockmachine',
          desktop: {
            Name: 'STOCKMACHINE',
            Type: 'Application',
            Categories: 'Utility;'
          },
          bin: 'stockmachine',
          name: 'stockmachine'
        },
      },
    },

  ],
  plugins: [
    {
      name: '@electron-forge/plugin-vite',
      config: {
        build: [
          {
            entry: 'src/main.js',
            config: 'vite.main.config.mjs',
          },
          {
            entry: 'src/preload.js',
            config: 'vite.preload.config.mjs',
          },
        ],
        renderer: [
          {
            name: 'main_window',
            config: 'vite.renderer.config.mjs',
          },
        ],
      },
    },
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
