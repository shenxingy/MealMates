import { NativeModules, Platform } from "react-native";

declare global {
  var expo:
    | undefined
    | {
        __expo_app_identifier__?: string;
        getViewConfig?: (moduleName: string, viewName?: string) => unknown;
      };
}

type Loader<T> = () => T;

interface NativeUnimoduleProxy {
  viewManagersMetadata?: Record<string, unknown>;
}

function getNativeModules(): {
  NativeUnimoduleProxy?: NativeUnimoduleProxy;
} {
  try {
    return NativeModules as unknown as {
      NativeUnimoduleProxy?: NativeUnimoduleProxy;
    };
  } catch {
    return {};
  }
}

function getViewManagersMetadata(): Record<string, unknown> | undefined {
  const { NativeUnimoduleProxy } = getNativeModules();
  return NativeUnimoduleProxy?.viewManagersMetadata;
}

function hasRegisteredViewManager(moduleName: string): boolean {
  if (Platform.OS === "web") {
    return false;
  }

  const metadata = getViewManagersMetadata();

  if (metadata && Object.prototype.hasOwnProperty.call(metadata, moduleName)) {
    return true;
  }

  const getViewConfig = globalThis.expo?.getViewConfig;
  if (typeof getViewConfig === "function") {
    try {
      return Boolean(getViewConfig(moduleName));
    } catch {
      return false;
    }
  }

  return false;
}

interface LoadNativeOptions {
  skipPlatforms?: readonly string[];
  customCheck?: () => boolean;
}

export function loadNativeModule<T>(
  moduleName: string,
  loader: Loader<T>,
  fallback: T,
  options?: LoadNativeOptions
): { module: T; isAvailable: boolean } {
  if (options?.skipPlatforms?.includes(Platform.OS)) {
    return { module: fallback, isAvailable: false };
  }

  const isRegistered =
    options?.customCheck?.() ?? hasRegisteredViewManager(moduleName);
  if (!isRegistered) {
    return { module: fallback, isAvailable: false };
  }

  try {
    const resolvedModule = loader();
    return { module: resolvedModule, isAvailable: true };
  } catch {
    return { module: fallback, isAvailable: false };
  }
}
