package com.travel.offices;

import android.app.ActivityManager;
import android.app.ApplicationExitInfo;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.ActionBar;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

import java.util.List;

public class MainActivity extends BridgeActivity {

    private static final String TAG = "TravelOffices";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        EdgeToEdge.enable(this);
        registerPlugin(ScreenSecurityPlugin.class);
        registerPlugin(DeviceIdentityPlugin.class);
        registerPlugin(NativeInlineAdPlugin.class);
        supportRequestWindowFeature(Window.FEATURE_NO_TITLE);
        super.onCreate(savedInstanceState);

        // Hide ActionBar if present
        ActionBar actionBar = getSupportActionBar();
        if (actionBar != null) {
            actionBar.hide();
        }
        setTitle("");

        Window window = getWindow();
        WindowInsetsControllerCompat insetsController = WindowCompat.getInsetsController(window, window.getDecorView());
        if (insetsController != null) {
            insetsController.setAppearanceLightStatusBars(false);
            insetsController.setAppearanceLightNavigationBars(false);
        }

        checkPreviousExitReasons();
    }

    /**
     * Logs the last 5 app exit reasons via ApplicationExitInfo (API 30+).
     * Helps diagnose OOM kills, ANRs, and crashes in production via Logcat/Firebase Crashlytics.
     */
    private void checkPreviousExitReasons() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) return;

        ActivityManager am = (ActivityManager) getSystemService(ACTIVITY_SERVICE);
        if (am == null) return;

        List<ApplicationExitInfo> reasons = am.getHistoricalProcessExitReasons(null, 0, 5);
        for (ApplicationExitInfo info : reasons) {
            String reason = exitReasonToString(info.getReason());
            String msg = "Exit reason: " + reason
                    + " | importance=" + info.getImportance()
                    + " | timestamp=" + info.getTimestamp()
                    + " | description=" + info.getDescription();

            if (info.getReason() == ApplicationExitInfo.REASON_LOW_MEMORY) {
                Log.w(TAG, "[OOM] " + msg);
            } else if (info.getReason() == ApplicationExitInfo.REASON_ANR) {
                Log.e(TAG, "[ANR] " + msg);
            } else if (info.getReason() == ApplicationExitInfo.REASON_CRASH
                    || info.getReason() == ApplicationExitInfo.REASON_CRASH_NATIVE) {
                Log.e(TAG, "[CRASH] " + msg);
            } else {
                Log.d(TAG, "[EXIT] " + msg);
            }
        }
    }

    private static String exitReasonToString(int reason) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) return "UNKNOWN";
        switch (reason) {
            case ApplicationExitInfo.REASON_ANR:            return "ANR";
            case ApplicationExitInfo.REASON_CRASH:         return "CRASH_JAVA";
            case ApplicationExitInfo.REASON_CRASH_NATIVE:  return "CRASH_NATIVE";
            case ApplicationExitInfo.REASON_EXIT_SELF:     return "EXIT_SELF";
            case ApplicationExitInfo.REASON_FREEZER:       return "FREEZER";
            case ApplicationExitInfo.REASON_LOW_MEMORY:    return "LOW_MEMORY";
            case ApplicationExitInfo.REASON_OTHER:         return "OTHER";
            case ApplicationExitInfo.REASON_SIGNALED:      return "SIGNALED";
            case ApplicationExitInfo.REASON_USER_REQUESTED:return "USER_REQUESTED";
            case ApplicationExitInfo.REASON_USER_STOPPED:  return "USER_STOPPED";
            default:                                        return "UNKNOWN(" + reason + ")";
        }
    }
}
