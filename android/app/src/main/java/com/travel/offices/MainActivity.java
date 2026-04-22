package com.travel.offices;

import android.os.Bundle;
import android.view.Window;

import androidx.appcompat.app.ActionBar;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		// Hide ActionBar if somehow still visible
		ActionBar actionBar = getSupportActionBar();
		if (actionBar != null) {
			actionBar.hide();
		}

		Window window = getWindow();
		WindowCompat.setDecorFitsSystemWindows(window, false);
		WindowInsetsControllerCompat insetsController = WindowCompat.getInsetsController(window, window.getDecorView());
		if (insetsController != null) {
			insetsController.setAppearanceLightStatusBars(false);
			insetsController.setAppearanceLightNavigationBars(false);
		}
	}
}
