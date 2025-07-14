import { Color } from 'three'

const BLACK = '#050505'
const DARKEST = '#191A1A'
const DARK = '#2B403E'
const MID = '#7DB0A9'
const LIGHT = '#B7D2CE'
const ACCENT_TEAL = '#37d6c7'
const ACCENT_ORANGE = '#E97449'
const ACCENT_RED = '#B44438'
const WHITE = '#ffffff'

const COLOURS_OBJ = {
  darkest: DARKEST,
  dark: DARK,
  mid: MID,
  light: LIGHT,
  'accent-teal': ACCENT_TEAL,
  'accent-orange': ACCENT_ORANGE,
  white: WHITE,
}

const BLACK_VEC3 = new Color(BLACK)
const DARKEST_VEC3 = new Color(DARKEST)
const DARK_VEC3 = new Color(DARK)
const MID_VEC3 = new Color(MID)
const LIGHT_VEC3 = new Color(LIGHT)
const ORANGE_ACCENT_VEC3 = new Color(ACCENT_ORANGE)
const TEAL_ACCENT_VEC3 = new Color(ACCENT_TEAL)

export {
  ACCENT_ORANGE,
  ACCENT_RED,
  ACCENT_TEAL,
  BLACK_VEC3,
  COLOURS_OBJ,
  DARK,
  DARK_VEC3,
  DARKEST,
  DARKEST_VEC3,
  LIGHT,
  LIGHT_VEC3,
  MID,
  MID_VEC3,
  ORANGE_ACCENT_VEC3,
  TEAL_ACCENT_VEC3,
  WHITE,
}
