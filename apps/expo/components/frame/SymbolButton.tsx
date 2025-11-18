import type { ComponentProps } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { Platform, Pressable } from "react-native";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { SymbolView } from "expo-symbols";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface GlassSymbolButtonProps {
  onPress: () => void;
  pressableStyle: StyleProp<ViewStyle>;
  glassViewStyle: StyleProp<ViewStyle>;
  SFSymbolName: ComponentProps<typeof SymbolView>["name"];
}

interface AndroidSymbolButtonProps {
  onPress: () => void;
  androidStyle: StyleProp<ViewStyle>;
  MaterialSymbolName: ComponentProps<typeof MaterialIcons>["name"];
}

type SymbolButtonProps = GlassSymbolButtonProps & AndroidSymbolButtonProps;

export default function SymbolButton(props: SymbolButtonProps) {
  const {
    onPress,
    pressableStyle,
    androidStyle,
    glassViewStyle,
    SFSymbolName,
    MaterialSymbolName,
  } = props;

  if (Platform.OS === "ios") {
    return (
      <>
        <Pressable style={pressableStyle} onPress={onPress}>
          <GlassView
            style={
              isLiquidGlassAvailable()
                ? glassViewStyle
                : [
                    glassViewStyle,
                    { backgroundColor: "rgba(255,255,255,0.85)" },
                  ]
            }
            isInteractive
          >
            <SymbolView
              name={SFSymbolName}
              size={21}
              colors="black"
              weight="medium"
            />
          </GlassView>
        </Pressable>
      </>
    );
  }
  if (Platform.OS === "android") {
    return (
      <>
        <Pressable style={androidStyle} onPress={onPress}>
          <MaterialIcons name={MaterialSymbolName} size={21} color="black" />
        </Pressable>
      </>
    );
  }
}
