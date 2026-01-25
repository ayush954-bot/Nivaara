package com.nivaararealty.app;

import android.net.Uri;
import android.os.Bundle;
import androidx.browser.customtabs.CustomTabsIntent;
import com.google.androidbrowserhelper.trusted.TwaLauncher;

public class MainActivity extends com.google.androidbrowserhelper.trusted.LauncherActivity {
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    protected Uri getLaunchingUrl() {
        // Replace with your actual website URL
        return Uri.parse("https://nivaararealty.com");
    }
}
