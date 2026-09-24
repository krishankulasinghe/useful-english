---
name: android-emulator-run
description: Build and run the Sin-Eng Expo/React Native app on an Android emulator (AVD). Use whenever the user asks to run, build, launch, or test the app "on the emulator", "on Android Studio's emulator", "in an AVD", or wants to see their latest changes on a virtual Android device. Also use for emulator-related build failures (Metro not connecting, app not installing, AVD not found, stale native build after adding a native dependency). This app is NOT Expo-Go compatible (it uses react-native-google-mobile-ads, expo-sqlite, expo-dev-client as native modules), so plain `expo start` + scanning a QR code will not work here — this skill covers the real workflow of `expo run:android` against a prebuilt android/ folder and a running AVD.
---

# Run the app on an Android emulator

This project (`com.sineng.app`, Expo SDK 57) ships a prebuilt `android/` folder because it depends on native modules (`react-native-google-mobile-ads`, `expo-sqlite`, `expo-dev-client`). It is **not** Expo Go compatible — never suggest scanning a QR code with Expo Go for this app. The real dev loop is: boot an emulator → `expo run:android` (which builds the dev-client APK and installs it) → Metro serves JS to it → subsequent runs just need `expo start` unless native code changed.

## Prerequisites (assume already installed; only mention if a command below fails because of this)
- Android Studio with at least one AVD already created
- `ANDROID_HOME` / `ANDROID_SDK_ROOT` set, and `platform-tools`, `emulator` on `PATH`
- Node deps installed (`npm install` in the repo root)

## Step 1 — Confirm/boot an emulator

List available AVDs and running devices:

```bash
emulator -list-avds
adb devices
```

If `adb devices` already shows a device whose ID starts with `emulator-`, it's running — skip to Step 2.

Otherwise boot one in the background (replace `Pixel_7_API_34` with the actual AVD name from the list above):

```bash
emulator -avd Pixel_7_API_34 &
```

Wait for it to fully boot before proceeding:

```bash
adb wait-for-device
adb shell 'while [[ -z $(getprop sys.boot_completed) ]]; do sleep 1; done'
```

## Step 2 — Build and launch

From the project root:

```bash
npm run android
```

This runs `expo run:android`, which:
1. Compiles the native Android project in `android/` (Gradle) — first run or after native changes takes several minutes.
2. Installs the resulting dev-client APK onto the running emulator.
3. Starts Metro and opens the app, which connects to Metro automatically.

If Gradle fails with a stale-cache-looking error (weird symbol resolution, "task not found", duplicate class errors after a dependency bump), clean first:

```bash
cd android && ./gradlew clean && cd ..
npm run android
```

## Step 3 — Iterate

- **Pure JS/TSX changes**: just save the file — Fast Refresh updates the running app, no rebuild needed.
- **Changed anything native** (added/removed a package with native code, edited `app.config.ts` plugins, edited files under `android/`): re-run `npm run android` so the dev-client APK is rebuilt. A plain Metro reload will *not* pick up native changes.
- If Metro is already running in another terminal and you just need the app to reconnect, you can skip the build and instead press `a` in the Metro terminal (Metro's interactive menu triggers `adb reverse` + relaunch).

## Troubleshooting

| Symptom | Fix |
|---|---|
| `adb devices` shows nothing / emulator never appears | Emulator is still booting — wait longer, or check `emulator -avd <name> -no-snapshot-load` to rule out a corrupt snapshot |
| App installs but shows a red screen "Unable to load script" | Metro isn't reachable from the emulator — run `adb reverse tcp:8081 tcp:8081`, then reload (press `r` twice in the app or in the Metro terminal) |
| Build fails after adding a package with native code | Re-run `npx expo prebuild --clean` is destructive to manual `android/` edits — prefer `cd android && ./gradlew clean` first; only use `prebuild --clean` if the user confirms they have no manual native edits to lose |
| AdMob shows no ads / crashes referencing `google-mobile-ads` | Expected in dev with test ad unit IDs (`app.config.ts` defaults to Google's public test IDs) — not a build problem |
| Wrong emulator picked when multiple are running | `adb devices` to get the exact `emulator-XXXX` id, then `npx expo run:android --device emulator-XXXX` |
| A physical phone is also plugged in and `npm run android` installs onto the phone instead of the emulator (`ANDROID_SERIAL` is **not** honored) | Get the AVD's name — not the adb serial — via `adb -s emulator-5554 emu avd name`, then run `npx expo run:android --device <that-avd-name>` (e.g. `npx expo run:android --device pixel_7_-_api_35`) |
