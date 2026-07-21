package com.example.budgt

import android.annotation.SuppressLint
import android.content.ContentValues
import android.content.Context
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.os.Handler
import android.os.Looper
import android.provider.MediaStore
import android.util.Base64
import android.webkit.JavascriptInterface
import android.webkit.URLUtil
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewAssetLoader.AssetsPathHandler
import java.io.File
import java.io.FileOutputStream

class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView

    class AndroidBridge(private val context: Context) {
        @JavascriptInterface
        fun downloadFile(base64Data: String, fileName: String, mimeType: String) {
            try {
                val cleanBase64 = if (base64Data.contains(",")) {
                    base64Data.substringAfter(",")
                } else {
                    base64Data
                }
                val bytes = Base64.decode(cleanBase64, Base64.DEFAULT)

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    val contentValues = ContentValues().apply {
                        put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
                        put(MediaStore.MediaColumns.MIME_TYPE, mimeType)
                        put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
                    }
                    val resolver = context.contentResolver
                    val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues)
                    if (uri != null) {
                        resolver.openOutputStream(uri)?.use { outputStream ->
                            outputStream.write(bytes)
                        }
                        showSuccessToast(fileName)
                    } else {
                        showErrorToast("Failed to save file")
                    }
                } else {
                    val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                    if (!downloadsDir.exists()) {
                        downloadsDir.mkdirs()
                    }
                    val file = File(downloadsDir, fileName)
                    FileOutputStream(file).use { outputStream ->
                        outputStream.write(bytes)
                    }
                    showSuccessToast(fileName)
                }
            } catch (e: Exception) {
                e.printStackTrace()
                showErrorToast(e.localizedMessage ?: "Download failed")
            }
        }

        private fun showSuccessToast(fileName: String) {
            Handler(Looper.getMainLooper()).post {
                Toast.makeText(context, "Saved to Downloads: $fileName", Toast.LENGTH_LONG).show()
            }
        }

        private fun showErrorToast(msg: String) {
            Handler(Looper.getMainLooper()).post {
                Toast.makeText(context, "Download error: $msg", Toast.LENGTH_LONG).show()
            }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // ── Edge-to-edge dark theme ──
        WindowCompat.setDecorFitsSystemWindows(window, false)
        @Suppress("DEPRECATION")
        window.statusBarColor = Color.parseColor("#161820")
        @Suppress("DEPRECATION")
        window.navigationBarColor = Color.parseColor("#161820")

        val insetsController = WindowInsetsControllerCompat(window, window.decorView)
        insetsController.isAppearanceLightStatusBars = false
        insetsController.isAppearanceLightNavigationBars = false

        // ── WebView setup ──
        webView = WebView(this)
        setContentView(webView)

        webView.setBackgroundColor(Color.parseColor("#161820"))

        // ── Automatically pad WebView so header sits below status bar/notch ──
        ViewCompat.setOnApplyWindowInsetsListener(webView) { view, insets ->
            val statusBarHeight = insets.getInsets(WindowInsetsCompat.Type.statusBars()).top
            val navBarHeight = insets.getInsets(WindowInsetsCompat.Type.navigationBars()).bottom
            view.setPadding(0, statusBarHeight, 0, navBarHeight)
            insets
        }

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            @Suppress("DEPRECATION")
            databaseEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            @Suppress("DEPRECATION")
            allowFileAccessFromFileURLs = true
            @Suppress("DEPRECATION")
            allowUniversalAccessFromFileURLs = true
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            cacheMode = WebSettings.LOAD_DEFAULT
            mediaPlaybackRequiresUserGesture = false
            setSupportZoom(false)
            builtInZoomControls = false
            displayZoomControls = false
            useWideViewPort = true
            loadWithOverviewMode = true
            textZoom = 100
        }

        // ── Register Native JS Bridge & Download Listener for WebView downloads ──
        webView.addJavascriptInterface(AndroidBridge(this), "AndroidBridge")

        webView.setDownloadListener { url, _, contentDisposition, mimetype, _ ->
            if (url != null && (url.startsWith("data:") || url.startsWith("blob:"))) {
                val bridge = AndroidBridge(this@MainActivity)
                val mime = if (mimetype.isNullOrEmpty()) "application/octet-stream" else mimetype
                var fileName = URLUtil.guessFileName(url, contentDisposition, mime)
                if (fileName.isEmpty() || fileName == "downloadfile") {
                    val ext = if (mime.contains("pdf")) "pdf" else if (mime.contains("sheet") || mime.contains("excel")) "xlsx" else "dat"
                    fileName = "budgt-report-${System.currentTimeMillis()}.$ext"
                }
                bridge.downloadFile(url, fileName, mime)
            }
        }

        // ── Use WebViewAssetLoader to serve local assets via https://appassets.androidplatform.net/ ──
        val assetLoader = WebViewAssetLoader.Builder()
            .setDomain("appassets.androidplatform.net")
            .addPathHandler("/", AssetsPathHandler(this))
            .build()

        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView?,
                request: WebResourceRequest
            ): WebResourceResponse? {
                return assetLoader.shouldInterceptRequest(request.url)
            }

            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest?
            ): Boolean {
                val url = request?.url?.toString() ?: return false
                if (url.startsWith("https://appassets.androidplatform.net/")) {
                    return false
                }
                return false
            }
        }

        webView.webChromeClient = WebChromeClient()

        // ── Handle back button for in-app navigation ──
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })

        // ── Load the bundled web app via HTTPS domain asset loader ──
        webView.loadUrl("https://appassets.androidplatform.net/index.html")
    }
}
