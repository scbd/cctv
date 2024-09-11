package org.biodiv.eunomiacctv

import android.os.Bundle
import android.provider.Settings.Secure
import android.webkit.WebSettings
import android.webkit.WebView
import androidx.activity.ComponentActivity
import java.net.URLEncoder


class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val android_id = Secure.getString(baseContext.getContentResolver(), Secure.ANDROID_ID)
        val encoded_id = URLEncoder.encode(android_id, Charsets.UTF_8.name());
        val device_type = URLEncoder.encode("android-tv", Charsets.UTF_8.name());
        var cctvUrl = "https://www.cbd.int/cctv/current?deviceType=$device_type&deviceId=$encoded_id"

        // Enable Debug Inspector -  Turn OFF for production
        // https://developer.chrome.com/docs/devtools/remote-debugging/webviews

        // WebView.setWebContentsDebuggingEnabled(true);

        val myWebView = WebView(baseContext)

        myWebView.settings.javaScriptEnabled = true
        myWebView.settings.cacheMode = WebSettings.LOAD_NO_CACHE
        myWebView.clearCache(true);

        setContentView(myWebView)

        myWebView.loadUrl(cctvUrl)
    }
}
