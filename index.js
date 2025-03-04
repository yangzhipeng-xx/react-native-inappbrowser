/**
 * InAppBrowser for React Native
 * https://github.com/proyecto26/react-native-inappbrowser
 *
 * @format
 * @flow strict-local
 */

import type {
  BrowserResult,
  AuthSessionResult,
  InAppBrowserOptions,
} from './types';
import {
  isAndroid,
  RNInAppBrowser,
  openBrowserAsync,
  openAuthSessionAsync,
  openAuthSessionPolyfillAsync,
  closeAuthSessionPolyfillAsync,
  authSessionIsNativelySupported,
  isHarmony,
} from './utils';

/**
 * Opens the url with Safari in a modal on iOS using [`SFSafariViewController`](https://developer.apple.com/documentation/safariservices/sfsafariviewcontroller),
 * or Chrome in a new [custom tab](https://developer.chrome.com/multidevice/android/customtabs) on Android.
 *
 * @param url The url to open in the web browser.
 * @param options A dictionary of key-value pairs.
 *
 * @return The promise behaves differently based on the platform:
 * - If the user closed the web browser, the Promise resolves with `{ type: 'cancel' }`.
 * - If the browser is closed using [`close`](#webbrowserdismissbrowser), the Promise resolves with `{ type: 'dismiss' }`.
 */
async function open(
  url: string,
  options?: InAppBrowserOptions
): Promise<BrowserResult> {
  return openBrowserAsync(url, options);
}

/**
 * # On iOS:
 * Opens the url with Safari in a modal using `ASWebAuthenticationSession`. The user will be asked
 * whether to allow the app to authenticate using the given url.
 *
 * # On Android:
 * This will be done using a "custom Chrome tabs" browser and [activityResumedEvent](https://docs.nativescript.org/api-reference/classes/androidapplication#activityresumedevent),
 *
 * @param url The url to open in the web browser. This should be a login page.
 * @param redirectUrl _Optional_ - The url to deep link back into your app.
 * @param options _Optional_ - An object extending the InAppBrowser Options.
 *
 * @return
 * - If the user does not permit the application to authenticate with the given url, the Promise fulfills with `{ type: 'cancel' }` object.
 * - If the user closed the web browser, the Promise fulfills with `{ type: 'cancel' }` object.
 * - If the browser is closed using `dismissBrowser`, the Promise fulfills with `{ type: 'dismiss' }` object.
 */
async function openAuth(
  url: string,
  redirectUrl: string,
  options?: InAppBrowserOptions
): Promise<AuthSessionResult> {
  if (authSessionIsNativelySupported()) {
    return openAuthSessionAsync(url, redirectUrl, options);
  } else {
    return openAuthSessionPolyfillAsync(url, redirectUrl, options);
  }
}

/**
 * Dismisses the presented web browser.
 */
function close(): void {
  RNInAppBrowser.close();
}

/**
 * Warm up the browser process.
 * Allows the browser application to pre-initialize itself in the background.
 * Significantly speeds up URL opening in the browser.
 * This is asynchronous and can be called several times.
 *
 * @platform android
 */
function warmup(): Promise<boolean> {
  if (isAndroid || isHarmony) {
    return RNInAppBrowser.warmup();
  }
  return Promise.resolve(false);
}

/**
 * Tells the browser of a likely future navigation to a URL.
 * The most likely URL has to be specified first.
 * Optionally, a list of other likely URLs can be provided.
 * They are treated as less likely than the first one, and have to be sorted in decreasing priority order.
 * These additional URLs may be ignored.
 *
 * @param mostLikelyUrl Most likely URL, may be null if otherUrls is provided.
 * @param otherUrls Other likely destinations, sorted in decreasing likelihood order.
 *
 * @platform android
 */
function mayLaunchUrl(
  mostLikelyUrl: string,
  otherUrls: Array<string> = []
): void {
  if (isAndroid || isHarmony) {
    RNInAppBrowser.mayLaunchUrl(mostLikelyUrl, otherUrls);
  }
}

/**
 * Dismisses the current authentication session
 */
function closeAuth(): void {
  closeAuthSessionPolyfillAsync();
  if (authSessionIsNativelySupported()) {
    RNInAppBrowser.closeAuth();
  } else {
    close();
  }
}

/**
 * Detect if the device supports this plugin.
 */
async function isAvailable(): Promise<boolean> {
  return RNInAppBrowser.isAvailable();
}

export const InAppBrowser = {
  open,
  openAuth,
  close,
  closeAuth,
  isAvailable,
  warmup,
  mayLaunchUrl,
};

export default InAppBrowser;
