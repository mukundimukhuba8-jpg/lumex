# LUMEXAI

Expo **React Native** mobile app for iOS and Android (TypeScript).

## Run the app (React Native)

```bash
npm install
npx expo start
```

Then press:
- `a` for Android emulator / device
- `i` for iOS simulator / device
- scan the QR code with Expo Go

## API server (backend only)

The `server/` folder is a Node API used by the mobile app. It is **not** the UI.

```bash
npm run server
```

Set `EXPO_PUBLIC_API_URL` to your API URL when testing on a physical device.
