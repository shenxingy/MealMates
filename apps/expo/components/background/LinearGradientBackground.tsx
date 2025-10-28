import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type React from "react";

const LinearGradientBackground = (props: {
  children: React.ReactNode,
  startColor: string,
  endColor: string,
}) => {
  const { children, startColor, endColor } = props;
  return (
    <>
      <View style={styles.container}>
        <LinearGradient
          // Background Linear Gradient
          colors={[startColor, endColor]}
          style={styles.background}
        />
        <View style={styles.children}>
          {children}
        </View>
      </View>
    </>
  );
}

export default LinearGradientBackground;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 400,
  },
  children: {
    flex: 1,
    backgroundColor: 'transparent',
  }
})