# White Noise For Sleeping

A React Native (Expo) white noise machine app with 12 sounds, mixing, sleep timer, and volume controls.

## Setup

```bash
git clone https://github.com/KazeHubTTV/white-noise-for-sleeping
cd white-noise-for-sleeping
npm install
npm run generate-noise
npm run generate-assets
npm start
```

## Build for Play Store

```bash
npx eas build --platform android --profile production
```

Upload the generated `.aab` file to the Google Play Console.

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
