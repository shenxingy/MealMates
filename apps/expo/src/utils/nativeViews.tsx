import type { ComponentType, PropsWithChildren, ReactNode } from "react";
import { Platform, UIManager, View } from "react-native";
import type { ViewProps } from "react-native";

import type { BlurViewProps } from "expo-blur";
import type {
  GlassContainerProps,
  GlassViewProps,
} from "expo-glass-effect";
import type { LinearGradientProps } from "expo-linear-gradient";
import type { SymbolViewProps } from "expo-symbols";

import { loadNativeModule } from "./nativeViewLoader";

type MaskedViewProps = ViewProps & {
  children?: ReactNode;
  maskElement?: ReactNode;
  androidRenderingMode?: "software" | "hardware";
};

const BaseView = ({ children, ...viewProps }: PropsWithChildren<ViewProps>) => (
  <View {...viewProps}>{children}</View>
);

const GlassFallback: ComponentType<GlassViewProps> = ({
  children,
  ...viewProps
}) => <BaseView {...viewProps}>{children}</BaseView>;

const GlassContainerFallback: ComponentType<GlassContainerProps> = ({
  children,
  ...viewProps
}) => <BaseView {...viewProps}>{children}</BaseView>;

const BlurFallback: ComponentType<BlurViewProps> = ({ children, ...viewProps }) => (
  <BaseView {...viewProps}>{children}</BaseView>
);

const LinearGradientFallback: ComponentType<LinearGradientProps> = ({
  children,
  ...viewProps
}) => <BaseView {...viewProps}>{children}</BaseView>;

const SymbolFallback: ComponentType<SymbolViewProps> = ({ children, ...viewProps }) => (
  <BaseView {...viewProps}>{children}</BaseView>
);

const MaskedViewFallback: ComponentType<MaskedViewProps> = ({
  children,
  maskElement,
  androidRenderingMode,
  ...viewProps
}) => {
  void maskElement;
  void androidRenderingMode;
  return <BaseView {...viewProps}>{children}</BaseView>;
};

interface GlassEffectModule {
  GlassView?: ComponentType<GlassViewProps>;
  GlassContainer?: ComponentType<GlassContainerProps>;
  isLiquidGlassAvailable?: () => boolean;
}

interface BlurModule {
  BlurView?: ComponentType<BlurViewProps>;
}

interface LinearGradientModule {
  LinearGradient?: ComponentType<LinearGradientProps>;
}

interface SymbolsModule {
  SymbolView?: ComponentType<SymbolViewProps>;
}

interface MaskedViewModule {
  default?: ComponentType<MaskedViewProps>;
}

const loadGlassModule = (): GlassEffectModule => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("expo-glass-effect") as GlassEffectModule;
};

const loadBlurModule = (): BlurModule => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("expo-blur") as BlurModule;
};

const loadLinearGradientModule = (): LinearGradientModule => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("expo-linear-gradient") as LinearGradientModule;
};

const loadSymbolsModule = (): SymbolsModule => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("expo-symbols") as SymbolsModule;
};

const loadMaskedViewModule = (): MaskedViewModule => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const requiredModule: unknown = require("@react-native-masked-view/masked-view");
  if (typeof requiredModule === "function") {
    return { default: requiredModule as ComponentType<MaskedViewProps> };
  }
  if (
    requiredModule &&
    typeof requiredModule === "object" &&
    "default" in requiredModule
  ) {
    return requiredModule as MaskedViewModule;
  }
  return {};
};

const { module: glassModule, isAvailable: isGlassEffectAvailable } =
  loadNativeModule<GlassEffectModule>(
    "ExpoGlassEffect",
    loadGlassModule,
    {
      GlassView: GlassFallback,
      GlassContainer: GlassContainerFallback,
      isLiquidGlassAvailable: () => false,
    }
  );

const { module: blurModule, isAvailable: isBlurViewAvailable } =
  loadNativeModule<BlurModule>("ExpoBlurView", loadBlurModule, {
    BlurView: BlurFallback,
  });

const { module: linearGradientModule, isAvailable: isLinearGradientAvailable } =
  loadNativeModule<LinearGradientModule>(
    "ExpoLinearGradient",
    loadLinearGradientModule,
    {
      LinearGradient: LinearGradientFallback,
    }
  );

const { module: symbolsModule, isAvailable: isSymbolModuleAvailable } =
  loadNativeModule<SymbolsModule>("SymbolModule", loadSymbolsModule, {
    SymbolView: SymbolFallback,
  });

const { module: maskedViewModule, isAvailable: isMaskedViewAvailable } =
  loadNativeModule<MaskedViewModule>(
    "RNCMaskedView",
    loadMaskedViewModule,
    { default: MaskedViewFallback },
    {
      customCheck: () => {
        if (Platform.OS === "web") {
          return false;
        }
        try {
          if (typeof UIManager.hasViewManagerConfig !== "function") {
            return false;
          }
          return UIManager.hasViewManagerConfig("RNCMaskedView");
        } catch {
          return false;
        }
      },
    }
  );

export const GlassView =
  glassModule.GlassView ?? GlassFallback;
export const GlassContainer =
  glassModule.GlassContainer ?? GlassContainerFallback;
export const isLiquidGlassAvailable = (): boolean =>
  typeof glassModule.isLiquidGlassAvailable === "function"
    ? Boolean(glassModule.isLiquidGlassAvailable())
    : false;
export const hasGlassEffect = isGlassEffectAvailable;

export const BlurView = blurModule.BlurView ?? BlurFallback;
export const hasBlurView = isBlurViewAvailable;

export const LinearGradient =
  linearGradientModule.LinearGradient ?? LinearGradientFallback;
export const hasLinearGradient = isLinearGradientAvailable;

export const SymbolView = symbolsModule.SymbolView ?? SymbolFallback;
export const hasSymbolModule = isSymbolModuleAvailable;

export const MaskedView =
  maskedViewModule.default ?? MaskedViewFallback;
export const hasMaskedView = isMaskedViewAvailable;
