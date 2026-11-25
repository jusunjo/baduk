import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { WebView } from "react-native-webview";

/**
 * 한수 웹 URL (Railway).
 * 로컬 테스트: EXPO_PUBLIC_WEB_URL=http://192.168.0.10:43212 npm start
 * 온보딩은 웹이 /welcome 으로 알아서 보냄.
 */
const WEB_URL =
  process.env.EXPO_PUBLIC_WEB_URL?.trim() || "https://hansu.up.railway.app";

export default function App() {
  const webRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (canGoBack && webRef.current) {
        webRef.current.goBack();
        return true;
      }
      return false;
    });

    return () => sub.remove();
  }, [canGoBack]);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <WebView
        ref={webRef}
        source={{ uri: WEB_URL }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        allowsBackForwardNavigationGestures
        startInLoadingState
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={(nav) => setCanGoBack(nav.canGoBack)}
      />
      {loading ? (
        <View style={styles.loading} pointerEvents="none">
          <ActivityIndicator size="large" color="#2f6b3a" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f7f3ea",
  },
  webview: {
    flex: 1,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(247, 243, 234, 0.72)",
  },
});
