# White Noise For Sleeping

[![Download APK](https://img.shields.io/badge/Download-APK-6366f1?style=for-the-badge&logo=android)](https://github.com/KazeHubTTV/white-noise-for-sleeping/releases/latest)
[![Build APK](https://github.com/KazeHubTTV/white-noise-for-sleeping/actions/workflows/build-apk.yml/badge.svg)](https://github.com/KazeHubTTV/white-noise-for-sleeping/actions/workflows/build-apk.yml)

A React Native (Expo) white noise machine app with 12 sounds, mixing, sleep timer, and volume controls.

## Download APK

Grab the latest APK from the [Releases page](https://github.com/KazeHubTTV/white-noise-for-sleeping/releases/latest).

## Setup for Development

```bash
git clone https://github.com/KazeHubTTV/white-noise-for-sleeping
cd white-noise-for-sleeping
npm install
npm run generate-noise
npm run generate-assets
npm start
```

## Automatic Builds (GitHub Actions)

Every push to `main` triggers an automatic APK build. The APK is published as a GitHub Release.

To enable this:

1. Create a free [Expo account](https://expo.dev/signup)
2. Generate an Expo token: `eas token:create`
3. Add it as a repository secret on GitHub:
   - Go to **Settings → Secrets and variables → Actions**
   - New repository secret: name `EXPO_TOKEN`, paste your token
4. Run the setup once locally:
   ```bash
   npx eas init --non-interactive
   npx eas build:configure
   ```
5. Push to `main` — the workflow will build and release automatically

## Play Store Build

```bash
npx eas build --platform android --profile production
```

## Features

- 12 sounds: White, Pink, Brown, Rain, Ocean, Wind, Fan, Thunderstorm, Campfire, Crickets, Waterfall, Heartbeat
- Mix multiple sounds simultaneously
- Solo mode (long-press any card)
- Per-sound volume and master volume
- Sleep timer (15/30/60 min)
- Background audio playback
- Dark ambient animated UI

## Privacy

No data is collected. All audio is generated locally. See [Privacy Policy](https://kazehubttv.github.io/white-noise-for-sleeping/assets/privacy.html).
