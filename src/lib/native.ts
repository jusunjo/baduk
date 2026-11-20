import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { StatusBar, Style } from "@capacitor/status-bar";

export const isNative = Capacitor.isNativePlatform();

export function setupNative(goBack: () => boolean) {
  if (!isNative) return;
  void StatusBar.setStyle({ style: Style.Light }).catch(() => {});
  void App.addListener("backButton", () => {
    if (!goBack()) void App.exitApp();
  });
}

export const haptic = {
  tap() {
    if (isNative) void Haptics.impact({ style: ImpactStyle.Light });
  },
  correct() {
    if (isNative) void Haptics.notification({ type: NotificationType.Success });
  },
  wrong() {
    if (isNative) void Haptics.notification({ type: NotificationType.Error });
  },
};
