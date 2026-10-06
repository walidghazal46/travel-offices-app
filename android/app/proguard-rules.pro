# ============================================================
# ProGuard / R8 rules for com.travel.offices
# Optimized for high DEX obfuscation and code shrinking
# ============================================================

# Preserve line numbers in crash stack traces for Firebase Crashlytics
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# R8 Optimization & Repackaging for maximum obfuscation
-repackageclasses ''
-allowaccessmodification

# ── Capacitor Plugins & Custom Native Code ────────────────────
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
-keepclassmembers class * extends com.getcapacitor.Plugin {
    @com.getcapacitor.PluginMethod public *;
}

-keep class com.travel.offices.ScreenSecurityPlugin { *; }
-keep class com.travel.offices.DeviceIdentityPlugin { *; }
-keep class com.travel.offices.NativeInlineAdPlugin { *; }
-keep class com.travel.offices.MainActivity { *; }

# ── WebView / JavaScript interface ───────────────────────────
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ── Suppress missing class warnings ───────────────────────────
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**
-dontwarn kotlinx.coroutines.**
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn sun.misc.**
-dontwarn java.lang.invoke.**
-dontwarn com.facebook.**
