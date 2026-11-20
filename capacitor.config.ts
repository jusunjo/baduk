import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.apelo.hansu",
  appName: "한수",
  webDir: "dist",
  backgroundColor: "#ffffff",
  ios: {
    contentInset: "never",
  },
  android: {
    backgroundColor: "#ffffff",
  },
};

export default config;
