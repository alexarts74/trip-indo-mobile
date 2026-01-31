import { View, ViewProps, StyleProp, ViewStyle } from 'react-native';
import { useResponsiveLayout } from '@/src/hooks/useResponsiveLayout';

interface ResponsiveContainerProps extends ViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export const ResponsiveContainer = ({
  children,
  style,
  containerStyle,
  ...props
}: ResponsiveContainerProps) => {
  const { maxWidth } = useResponsiveLayout();

  return (
    <View style={[{ flex: 1, alignItems: 'center' }, containerStyle]} {...props}>
      <View style={[{ flex: 1, width: '100%', maxWidth }, style]}>
        {children}
      </View>
    </View>
  );
};
