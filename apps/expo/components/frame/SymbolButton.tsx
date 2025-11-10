import type { SFSymbol } from "sf-symbols-typescript";
import { Pressable } from "react-native";
import { GlassView } from "expo-glass-effect";
import { SymbolView } from "expo-symbols";

interface GlassSymbolButtonProps {
  onPress: () => void;
  pressableStyle: object;
  glassViewStyle: object;
  SFSymbolName: SFSymbol;
}

type SymbolButtonProps = GlassSymbolButtonProps;

export default function SymbolButton(props: SymbolButtonProps) {
  const { onPress, pressableStyle, glassViewStyle, SFSymbolName } = props;

  return (
    <>
      <Pressable style={pressableStyle} onPress={onPress}>
        <GlassView style={glassViewStyle} isInteractive>
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
