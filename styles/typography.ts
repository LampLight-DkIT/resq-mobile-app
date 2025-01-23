// styles/typography.ts

import { TextStyle } from 'react-native';
import { FONTS } from '@/constants/fonts';

export const typography = {
  h1: {
    fontFamily: FONTS.medium,
    fontSize: 28,
  } as TextStyle,
  
  h2: {
    fontFamily: FONTS.medium,
    fontSize: 24,
  } as TextStyle,
  
  h3: {
    fontFamily: FONTS.medium,
    fontSize: 20,
  } as TextStyle,
  
  body: {
    fontFamily: FONTS.regular,
    fontSize: 16,
  } as TextStyle,
  
  bodySmall: {
    fontFamily: FONTS.regular,
    fontSize: 14,
  } as TextStyle,
  
  button: {
    fontFamily: FONTS.medium,
    fontSize: 16,
  } as TextStyle,
  
  caption: {
    fontFamily: FONTS.light,
    fontSize: 12,
  } as TextStyle,
};