import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

export default {
  packagerConfig: {
    asar: true,
    icon: './images/icon.ico',
    platform: ['win32', 'linux'],
    arch: 'x64',

    executableName: process.env.APP_NAME || 'stockmachine',
    name: process.env.APP_NAME || 'stockmachine',
    // certificateFile: 'build-assets/stockmachine.pfx',
    // certificatePassword: process.env.CERTIFICATE_PASSWORD || 'your-certificate-password',
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        platforms: ['win32'],
        authors: 'Lumexio',
        iconUrl: 'https://stockmachine.online/icon.ico',
        noMsi: true,
        shortcutName: process.env.APP_NAME || 'stockmachine',
        setupIcon: './images/icon.ico',
        description: 'Stock Management Application',
        loadingGif: './images/loading.gif',
        setupExe: `${process.env.APP_NAME}.exe`
      },
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'Lumexio',
          homepage: 'https://stockmachine.online',
          icon: './images/icon.ico',
          categories: ['Utility'],
          description: 'Stock Management Application',
          productName: process.env.APP_NAME || 'stockmachine',
          executableName: process.env.APP_NAME || 'stockmachine',
          filename: `${process.env.APP_NAME}.deb`,
          desktop: {
            Name: process.env.APP_NAME || 'stockmachine',
            Type: 'Application',
            Categories: 'Utility;'
          },
          bin: process.env.APP_NAME || 'stockmachine',
          name: process.env.APP_NAME || 'stockmachine',
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
