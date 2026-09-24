---
name: android-device-deploy
description: Build and deploy the Sin-Eng Expo/React Native app to a real, physical Android phone over USB (with wireless/adb-over-Wi-Fi as a fallback). Use whenever the user asks to run, install, sideload, test, or debug the app "on my phone", "on a real device", "on my Pixel/Samsung/etc.", or wants to hand someone an APK to install manually. Also use for physical-device connection issues (device unauthorized, "no devices found" with the phone plugged in, USB debugging not working). This app is NOT Expo Go compatible (native modules: react-native-google-mobile-ads, expo-sqlite, expo-dev-client), so it always needs a real build installed on the device, not just scanning a QR code.
---

# Deploy the app to a physical Android phone

This app (`com.sineng.app`, Expo SDK 57) has native modules, so it cannot run inside Expo Go. Deploying to a phone means installing a real dev-client (or preview) build and connecting it to Metro (for dev) or letting it run standalone (for a preview build handed to someone else).

## Step 1 — Enable USB debugging on the phone (one-time, per device)

Tell the user to do this on the phone itself if not already done:
1. Settings → About phone → tap "Build number" 7 times to unlock Developer options.
2. Settings → Developer options → enable "USB debugging".

## Step 2 — Connect and authorize

Plug the phone in via USB, then:

```bash
adb devices
```

- If the device shows as `unauthorized`, look at the phone screen for an "Allow USB debugging?" prompt and accept it (check "always allow from this computer" to avoid repeating this every time), then re-run `adb devices`.
- If nothing shows at all: try a different cable/port (some cables are charge-only), and confirm the phone's USB mode is set to "File transfer" not "Charging only" in the notification shade.
- If it still doesn't show up on Windows, the device may need a matching USB driver installed (Android Studio's SDK Manager → "Google USB Driver", or the phone OEM's driver) — mention this only if plugging in + accepting the prompt didn't work.

## Step 3 — Build and install

From the project root, with exactly one authorized device connected (or use `--device` if multiple):

```bash
npm run android
```

`expo run:android` auto-detects a connected physical device the same way it detects an emulator, builds the dev-client APK, installs it via `adb`, and starts Metro. If both an emulator and a phone are connected, disambiguate:

```bash
adb devices
npx expo run:android --device <device-id-from-adb-devices>
```

After install, the app launches and connects to Metro over the USB connection automatically (via `adb reverse`, which `expo run:android` sets up for you).

## Step 4 (optional) — Go wireless after the first USB connection

Once the device has been built/installed once over USB, you can disconnect the cable and keep developing over Wi-Fi:

```bash
adb tcpip 5555
adb connect <phone-ip>:5555
```

(Find `<phone-ip>` in the phone's Wi-Fi settings.) Then unplug the USB cable — `adb devices` should still show the phone as connected over TCP. Subsequent `npm run android` runs will target it wirelessly, as long as the phone and computer stay on the same network. If the connection drops, redo `adb connect` (no need to replug USB unless `adb devices` shows nothing at all).

## Alternative — hand someone a standalone installable build (no Metro/dev server needed)

If the goal is to give the app to someone else to install and use independently (not for live development), build an internal-distribution APK via EAS instead of `expo run:android`:

```bash
eas build --platform android --profile preview
```

This uses the `preview` profile in `eas.json` (`distribution: internal`) and produces a downloadable APK link once the cloud build finishes. Send that link, or download the APK and:

```bash
adb install path/to/downloaded.apk
```

Use the `development` profile instead of `preview` only if the recipient still needs to connect to your Metro/dev server (rare — normally that's just local `npm run android`).

## Troubleshooting

| Symptom | Fix |
|---|---|
| `adb devices` shows `unauthorized` | Accept the RSA key prompt on the phone screen; if the prompt never appears, revoke USB debugging authorizations on the phone (Developer options → "Revoke USB debugging authorizations") and reconnect |
| `adb devices` shows nothing, phone is plugged in | Try another cable/port; set phone's USB mode to File Transfer; on Windows, install the Google USB Driver via Android Studio SDK Manager |
| Install succeeds but app can't reach Metro | Re-run `adb reverse tcp:8081 tcp:8081` for that device, then reload the app |
| Wireless adb keeps disconnecting | Re-run `adb connect <phone-ip>:5555`; phone must stay on same Wi-Fi and not enter deep sleep/battery-saver networking restrictions |
| Multiple devices connected, wrong one gets targeted | `adb devices` to list IDs, then `npx expo run:android --device <id>` |
| Need to uninstall a stale/broken previous install first | `adb uninstall com.sineng.app`, then re-run `npm run android` |
