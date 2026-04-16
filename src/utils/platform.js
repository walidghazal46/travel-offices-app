import { Capacitor, registerPlugin } from '@capacitor/core';

export const isAndroid = () => Capacitor.getPlatform() === 'android';
export const isWeb = () => Capacitor.getPlatform() === 'web';
export const isNative = () => Capacitor.isNativePlatform();

const DeviceIdentity = registerPlugin('DeviceIdentity');

export async function getClientDeviceId() {
  if (!isNative()) return 'web-guest-id';
  try {
    const { deviceId } = await DeviceIdentity.getDeviceId();
    return deviceId || 'unknown-native-id';
  } catch (e) {
    console.error('Failed to get device ID', e);
    return 'error-device-id';
  }
}
