import { TouchableOpacity, TouchableOpacityProps, Text, ActivityIndicator } from "react-native"
import { styles } from "./styles";


type Props = TouchableOpacityProps & {
  title: string;
  isProcessing?: boolean
}


export function Button({ title, isProcessing = false, ...rest }: Props) {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.8}
      disabled={isProcessing}
      {...rest}
    >
      <Text style={styles.title}>
        {isProcessing ? (
          <ActivityIndicator />
        ) : (
          title
        )}
      </Text>
    </TouchableOpacity>
  )
}