import { registerPlugin } from "@capacitor/core";

const NativeInlineAd = registerPlugin("NativeInlineAd");

export function showNativeInlineAdSlot(options) {
  return NativeInlineAd.showSlot(options);
}

export function hideNativeInlineAdSlot(slotId) {
  return NativeInlineAd.hideSlot({ slotId });
}

export function clearNativeInlineAdSlots() {
  return NativeInlineAd.clearAll();
}
