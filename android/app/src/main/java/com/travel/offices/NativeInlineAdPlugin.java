package com.travel.offices;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.text.TextUtils;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.TextView;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdLoader;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.nativead.MediaView;
import com.google.android.gms.ads.nativead.NativeAd;
import com.google.android.gms.ads.nativead.NativeAdOptions;
import com.google.android.gms.ads.nativead.NativeAdView;

import java.util.HashMap;
import java.util.Map;

@CapacitorPlugin(name = "NativeInlineAd")
public class NativeInlineAdPlugin extends Plugin {

    private static final int MIN_SLOT_SIZE_DP = 96;
    private static final long LOAD_RETRY_DELAY_MS = 30000L;
    private final Map<String, SlotState> slots = new HashMap<>();

    @PluginMethod
    public void showSlot(PluginCall call) {
        final Activity activity = getActivity();
        if (activity == null) {
            call.reject("activity-unavailable");
            return;
        }

        final String slotId = String.valueOf(call.getString("slotId", "")).trim();
        final String adUnitId = String.valueOf(call.getString("adUnitId", "")).trim();
        final double x = call.getDouble("x", 0d);
        final double y = call.getDouble("y", 0d);
        final double width = call.getDouble("width", 0d);
        final double height = call.getDouble("height", 0d);
        final double pixelRatio = call.getDouble("pixelRatio", 1d);
        final String lang = String.valueOf(call.getString("lang", "ar")).trim();

        if (slotId.isEmpty() || adUnitId.isEmpty()) {
            call.reject("slotId-and-adUnitId-are-required");
            return;
        }

        activity.runOnUiThread(() -> {
            try {
                updateSlot(slotId, adUnitId, x, y, width, height, pixelRatio, lang);
                JSObject result = new JSObject();
                result.put("slotId", slotId);
                result.put("visible", true);
                call.resolve(result);
            } catch (Exception error) {
                call.reject("showSlot-failed", error);
            }
        });
    }

    @PluginMethod
    public void hideSlot(PluginCall call) {
        final Activity activity = getActivity();
        if (activity == null) {
            call.reject("activity-unavailable");
            return;
        }

        final String slotId = String.valueOf(call.getString("slotId", "")).trim();
        if (slotId.isEmpty()) {
            call.reject("slotId-is-required");
            return;
        }

        activity.runOnUiThread(() -> {
            hideSlotInternal(slotId);
            JSObject result = new JSObject();
            result.put("slotId", slotId);
            result.put("visible", false);
            call.resolve(result);
        });
    }

    @PluginMethod
    public void clearAll(PluginCall call) {
        final Activity activity = getActivity();
        if (activity == null) {
            call.reject("activity-unavailable");
            return;
        }

        activity.runOnUiThread(() -> {
            clearAllSlots();
            call.resolve();
        });
    }

    @Override
    protected void handleOnDestroy() {
        super.handleOnDestroy();
        Activity activity = getActivity();
        if (activity != null) {
            activity.runOnUiThread(this::clearAllSlots);
        } else {
            clearAllSlots();
        }
    }

    private void updateSlot(
            String slotId,
            String adUnitId,
            double xCss,
            double yCss,
            double widthCss,
            double heightCss,
            double pixelRatio,
            String lang
    ) {
        Activity activity = getActivity();
        if (activity == null) return;

        int minPx = dpToPx(MIN_SLOT_SIZE_DP);
        int left = Math.max(0, (int) Math.round(xCss * pixelRatio));
        int top = Math.max(0, (int) Math.round(yCss * pixelRatio));
        int width = Math.max(minPx, (int) Math.round(widthCss * pixelRatio));
        int height = Math.max(minPx, (int) Math.round(heightCss * pixelRatio));

        ViewGroup root = activity.findViewById(android.R.id.content);
        if (root == null) return;

        SlotState state = slots.get(slotId);
        if (state == null) {
            state = new SlotState(slotId);
            state.container = createSlotContainer(activity);
            slots.put(slotId, state);
            root.addView(state.container);
        }

        state.adUnitId = adUnitId;
        state.lang = "en".equalsIgnoreCase(lang) ? "en" : "ar";

        FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(width, height);
        params.leftMargin = left;
        params.topMargin = top;
        state.container.setLayoutParams(params);
        state.container.setVisibility(View.VISIBLE);

        long now = System.currentTimeMillis();
        if (state.nativeAd == null && !state.loading && (now - state.lastLoadAtMs) >= LOAD_RETRY_DELAY_MS) {
            loadNativeAd(state);
        }
    }

    private FrameLayout createSlotContainer(Activity activity) {
        FrameLayout container = new FrameLayout(activity);
        container.setClickable(true);
        container.setFocusable(true);
        container.setClipChildren(false);
        container.setClipToPadding(false);

        GradientDrawable background = new GradientDrawable();
        background.setColor(Color.parseColor("#0F172A"));
        background.setCornerRadius(dpToPx(20));
        background.setStroke(dpToPx(1), Color.parseColor("#1E293B"));
        container.setBackground(background);
        container.setElevation(dpToPx(10));
        return container;
    }

    private void loadNativeAd(SlotState state) {
        if (state == null || state.adUnitId == null || state.adUnitId.isEmpty()) return;

        state.loading = true;
        state.lastLoadAtMs = System.currentTimeMillis();
        AdLoader adLoader = new AdLoader.Builder(getContext(), state.adUnitId)
                .forNativeAd(nativeAd -> {
                    Activity activity = getActivity();
                    if (activity == null) {
                        nativeAd.destroy();
                        return;
                    }
                    activity.runOnUiThread(() -> {
                        SlotState activeState = slots.get(state.slotId);
                        if (activeState == null) {
                            nativeAd.destroy();
                            return;
                        }
                        activeState.loading = false;
                        if (activeState.nativeAd != null) {
                            activeState.nativeAd.destroy();
                        }
                        activeState.nativeAd = nativeAd;
                        bindNativeAd(activeState);
                    });
                })
                .withNativeAdOptions(new NativeAdOptions.Builder().build())
                .withAdListener(new AdListener() {
                    @Override
                    public void onAdFailedToLoad(LoadAdError error) {
                        SlotState activeState = slots.get(state.slotId);
                        if (activeState == null) return;
                        activeState.loading = false;
                        activeState.container.setVisibility(View.GONE);
                    }
                })
                .build();

        adLoader.loadAd(new AdRequest.Builder().build());
    }

    private void bindNativeAd(SlotState state) {
        Activity activity = getActivity();
        if (activity == null || state == null || state.container == null || state.nativeAd == null) return;

        LayoutInflater inflater = LayoutInflater.from(activity);
        NativeAdView adView = (NativeAdView) inflater.inflate(R.layout.native_inline_ad, state.container, false);

        TextView badgeView = adView.findViewById(R.id.ad_badge);
        TextView headlineView = adView.findViewById(R.id.ad_headline);
        TextView bodyView = adView.findViewById(R.id.ad_body);
        TextView advertiserView = adView.findViewById(R.id.ad_advertiser);
        Button ctaView = adView.findViewById(R.id.ad_call_to_action);
        ImageView iconView = adView.findViewById(R.id.ad_app_icon);
        MediaView mediaView = adView.findViewById(R.id.ad_media);

        badgeView.setText("en".equals(state.lang) ? "Ad" : "إعلان");

        adView.setHeadlineView(headlineView);
        adView.setBodyView(bodyView);
        adView.setAdvertiserView(advertiserView);
        adView.setCallToActionView(ctaView);
        adView.setIconView(iconView);
        adView.setMediaView(mediaView);

        headlineView.setText(nonEmptyOrFallback(state.nativeAd.getHeadline(), "en".equals(state.lang) ? "Sponsored" : "محتوى إعلاني"));
        bindOptionalText(bodyView, state.nativeAd.getBody());
        bindOptionalText(advertiserView, state.nativeAd.getAdvertiser());

        String callToAction = state.nativeAd.getCallToAction();
        if (TextUtils.isEmpty(callToAction)) {
            ctaView.setVisibility(View.INVISIBLE);
        } else {
            ctaView.setVisibility(View.VISIBLE);
            ctaView.setText(callToAction);
        }

        NativeAd.Image icon = state.nativeAd.getIcon();
        if (icon == null || icon.getDrawable() == null) {
            iconView.setVisibility(View.GONE);
        } else {
            iconView.setVisibility(View.VISIBLE);
            iconView.setImageDrawable(icon.getDrawable());
        }

        if (state.nativeAd.getMediaContent() != null) {
            mediaView.setMediaContent(state.nativeAd.getMediaContent());
            mediaView.setVisibility(View.VISIBLE);
        } else {
            mediaView.setVisibility(View.GONE);
        }

        adView.setNativeAd(state.nativeAd);

        state.container.removeAllViews();
        state.container.addView(adView, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT,
                Gravity.CENTER
        ));
        state.adView = adView;
    }

    private void bindOptionalText(TextView textView, String value) {
        if (textView == null) return;
        if (TextUtils.isEmpty(value)) {
            textView.setVisibility(View.GONE);
        } else {
            textView.setVisibility(View.VISIBLE);
            textView.setText(value);
        }
    }

    private String nonEmptyOrFallback(String value, String fallback) {
        return TextUtils.isEmpty(value) ? fallback : value;
    }

    private void hideSlotInternal(String slotId) {
        SlotState state = slots.get(slotId);
        if (state == null || state.container == null) return;
        state.container.setVisibility(View.GONE);
    }

    private void clearAllSlots() {
        for (SlotState state : slots.values()) {
            if (state.container != null) {
                ViewParent parent = state.container.getParent();
                if (parent instanceof ViewGroup) {
                    ((ViewGroup) parent).removeView(state.container);
                }
                state.container.removeAllViews();
            }
            if (state.nativeAd != null) {
                state.nativeAd.destroy();
                state.nativeAd = null;
            }
        }
        slots.clear();
    }

    private int dpToPx(int dp) {
        return (int) TypedValue.applyDimension(
                TypedValue.COMPLEX_UNIT_DIP,
                dp,
                getContext().getResources().getDisplayMetrics()
        );
    }

    private static class SlotState {
        final String slotId;
        FrameLayout container;
        NativeAdView adView;
        NativeAd nativeAd;
        boolean loading;
        long lastLoadAtMs;
        String adUnitId;
        String lang = "ar";

        SlotState(String slotId) {
            this.slotId = slotId;
        }
    }
}
