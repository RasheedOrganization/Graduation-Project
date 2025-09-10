import React, {useState} from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';

interface AsyncButtonProps {
  onPress: () => Promise<void>;
  onSuccess?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
}

const AsyncButton: React.FC<AsyncButtonProps> = ({
  onPress,
  onSuccess,
  children,
  style,
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePress = async () => {
    setLoading(true);
    try {
      await onPress();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onSuccess) {
          onSuccess();
        }
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handlePress}
      disabled={loading}>
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : success ? (
        <Text style={styles.success}>✓</Text>
      ) : (
        <Text style={styles.text}>{children}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 12,
    backgroundColor: '#0066cc',
    borderRadius: 4,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
  },
  success: {
    color: '#0f0',
    fontWeight: 'bold',
  },
});

export default AsyncButton;
