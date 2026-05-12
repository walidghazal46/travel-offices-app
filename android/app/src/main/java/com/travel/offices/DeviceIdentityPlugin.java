package com.travel.offices;

import android.provider.Settings;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "DeviceIdentity")
public class DeviceIdentityPlugin extends Plugin {
    @PluginMethod
    public void getDeviceId(PluginCall call) {
        String deviceId = Settings.Secure.getString(
                getContext().getContentResolver(),
                Settings.Secure.ANDROID_ID
        );

        JSObject result = new JSObject();
        result.put("deviceId", deviceId != null ? deviceId : "");
        call.resolve(result);
    }
}
