# ============================================================
# ProGuard / R8 rules for com.travel.offices (Capacitor + Firebase)
# ============================================================

# Preserve line numbers in crash stack traces
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# ── Capacitor core ──────────────────────────────────────────
-keep class com.getcapacitor.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
-keepclassmembers class * extends com.getcapacitor.Plugin {
    @com.getcapacitor.PluginMethod public *;
}

# ── Custom plugins ───────────────────────────────────────────
-keep class com.travel.offices.ScreenSecurityPlugin { *; }
-keep class com.travel.offices.DeviceIdentityPlugin { *; }
-keep class com.travel.offices.MainActivity { *; }

# ── Firebase ─────────────────────────────────────────────────
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# Firebase Auth phone (Capacitor Firebase Authentication plugin)
-keep class com.getcapacitor.community.** { *; }

# ── WebView / JavaScript interface ───────────────────────────
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ── AndroidX / AppCompat ─────────────────────────────────────
-keep class androidx.core.** { *; }
-keep class androidx.appcompat.** { *; }
-keep class androidx.coordinatorlayout.** { *; }

# ── AdMob ────────────────────────────────────────────────────
-keep class com.google.android.gms.ads.** { *; }
-dontwarn com.google.android.gms.ads.**

# ── File provider / FileProvider paths ───────────────────────
-keep class androidx.core.content.FileProvider { *; }

# ── Kotlin stdlib ────────────────────────────────────────────
-dontwarn kotlin.**
-keep class kotlin.** { *; }
-keep class kotlin.Metadata { *; }

# ── Coroutines (used internally by Firebase SDK) ─────────────
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory { *; }
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler { *; }
-dontwarn kotlinx.coroutines.**

# ── OkHttp / Retrofit (used by Firebase internals) ───────────
-dontwarn okhttp3.**
-dontwarn okio.**

# ── Suppress common warnings ─────────────────────────────────
-dontwarn sun.misc.**
-dontwarn java.lang.invoke.**

# ── Facebook SDK (Suppress warnings for missing classes) ─────
-dontwarn com.facebook.CallbackManager$Factory
-dontwarn com.facebook.CallbackManager
-dontwarn com.facebook.FacebookCallback
-dontwarn com.facebook.login.LoginManager
-dontwarn com.facebook.login.widget.LoginButton
