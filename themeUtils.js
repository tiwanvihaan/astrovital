import useTheme from '@/components/theme/ThemeProvider';

/** Chart colours for the active theme plus a gradient-safe id fragment. */
export { gradientKey } from '@/lib/themes';

export function useChartColors() {
  const { colors } = useTheme();
  return colors;
}

export default useTheme;