import { useWindowDimensions } from 'react-native';

export const useResponsiveLayout = () => {
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;
  const maxWidth = isTablet ? 700 : undefined;

  return { isTablet, maxWidth, screenWidth: width };
};
