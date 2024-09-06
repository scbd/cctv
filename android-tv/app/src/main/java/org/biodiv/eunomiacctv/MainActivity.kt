package org.biodiv.eunomiacctv

import android.os.Bundle
import android.webkit.WebView
import androidx.activity.ComponentActivity
import android.provider.Settings.Secure
import java.net.URLEncoder

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)


        val myWebView = WebView(baseContext)
        setContentView(myWebView)
        myWebView.settings.javaScriptEnabled = true

        val android_id = Secure.getString(baseContext.getContentResolver(), Secure.ANDROID_ID)
        val encoded_id = URLEncoder.encode(android_id, Charsets.UTF_8.name());
        val device_type = URLEncoder.encode("android-tv", Charsets.UTF_8.name());

        myWebView.loadUrl("https://www.cbd.int/cctv/current?deviceType=$device_type&deviceId=$encoded_id")
    }
}
