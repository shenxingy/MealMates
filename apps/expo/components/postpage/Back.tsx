import { Text, StyleSheet } from 'react-native';

export default function Back() {
  return (
    <Text style={styles.back} >{'<'} Posts</Text>
  )
}

const styles = StyleSheet.create({
  back: {
    width: '30%',
    backgroundColor: '#ffa',
    borderRadius: 20,
    padding: 5,
    marginBottom: 10,
    fontSize: 25,
    textAlign: 'center'
  }
})