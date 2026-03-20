/**
 * Singapore Planning Areas - Simplified SVG regions.
 * Based on URA planning areas, simplified to polygons for SVG rendering.
 * Coordinates are relative to a 400x480 viewBox representing Singapore.
 */

import { ZoneData } from './ntuZones';

// Major planning areas grouped by region
export const SG_ZONES: ZoneData[] = [
  // ── Central Region ──
  {
    id: 'sg-downtown-core',
    name: 'Downtown Core',
    shortName: 'Downtown',
    path: 'M185,235 L225,225 L240,240 L230,265 L195,260 Z',
    labelX: 212,
    labelY: 245,
  },
  {
    id: 'sg-orchard',
    name: 'Orchard',
    shortName: 'Orchard',
    path: 'M160,215 L195,210 L200,230 L165,235 Z',
    labelX: 178,
    labelY: 222,
  },
  {
    id: 'sg-novena',
    name: 'Novena',
    shortName: 'Novena',
    path: 'M165,185 L200,180 L205,210 L170,215 Z',
    labelX: 185,
    labelY: 198,
  },
  {
    id: 'sg-toa-payoh',
    name: 'Toa Payoh',
    shortName: 'Toa Payoh',
    path: 'M200,175 L240,170 L245,200 L205,205 Z',
    labelX: 222,
    labelY: 188,
  },
  {
    id: 'sg-bishan',
    name: 'Bishan',
    shortName: 'Bishan',
    path: 'M195,145 L240,140 L245,170 L200,175 Z',
    labelX: 218,
    labelY: 158,
  },
  {
    id: 'sg-ang-mo-kio',
    name: 'Ang Mo Kio',
    shortName: 'AMK',
    path: 'M215,110 L265,105 L270,140 L220,145 Z',
    labelX: 242,
    labelY: 125,
  },
  // ── East Region ──
  {
    id: 'sg-tampines',
    name: 'Tampines',
    shortName: 'Tampines',
    path: 'M305,155 L365,150 L370,190 L310,195 Z',
    labelX: 338,
    labelY: 172,
  },
  {
    id: 'sg-bedok',
    name: 'Bedok',
    shortName: 'Bedok',
    path: 'M280,195 L330,190 L335,230 L285,235 Z',
    labelX: 308,
    labelY: 212,
  },
  {
    id: 'sg-pasir-ris',
    name: 'Pasir Ris',
    shortName: 'Pasir Ris',
    path: 'M340,125 L390,120 L395,155 L345,160 Z',
    labelX: 367,
    labelY: 140,
  },
  {
    id: 'sg-changi',
    name: 'Changi',
    shortName: 'Changi',
    path: 'M355,170 L395,165 L398,210 L360,215 Z',
    labelX: 377,
    labelY: 190,
  },
  // ── North Region ──
  {
    id: 'sg-woodlands',
    name: 'Woodlands',
    shortName: 'Woodlands',
    path: 'M175,30 L240,25 L245,65 L180,70 Z',
    labelX: 210,
    labelY: 48,
  },
  {
    id: 'sg-yishun',
    name: 'Yishun',
    shortName: 'Yishun',
    path: 'M195,70 L255,65 L260,105 L200,110 Z',
    labelX: 228,
    labelY: 88,
  },
  {
    id: 'sg-sembawang',
    name: 'Sembawang',
    shortName: 'Sembawang',
    path: 'M240,25 L310,20 L315,60 L245,65 Z',
    labelX: 278,
    labelY: 42,
  },
  // ── North-East Region ──
  {
    id: 'sg-sengkang',
    name: 'Sengkang',
    shortName: 'Sengkang',
    path: 'M280,85 L340,80 L345,120 L285,125 Z',
    labelX: 312,
    labelY: 102,
  },
  {
    id: 'sg-punggol',
    name: 'Punggol',
    shortName: 'Punggol',
    path: 'M310,55 L375,50 L380,90 L315,95 Z',
    labelX: 345,
    labelY: 72,
  },
  {
    id: 'sg-hougang',
    name: 'Hougang',
    shortName: 'Hougang',
    path: 'M265,125 L315,120 L320,160 L270,165 Z',
    labelX: 292,
    labelY: 142,
  },
  {
    id: 'sg-serangoon',
    name: 'Serangoon',
    shortName: 'Serangoon',
    path: 'M245,145 L280,140 L285,175 L250,180 Z',
    labelX: 265,
    labelY: 160,
  },
  // ── West Region ──
  {
    id: 'sg-jurong-west',
    name: 'Jurong West',
    shortName: 'Jurong W',
    path: 'M35,205 L100,200 L105,245 L40,250 Z',
    labelX: 70,
    labelY: 225,
  },
  {
    id: 'sg-jurong-east',
    name: 'Jurong East',
    shortName: 'Jurong E',
    path: 'M75,175 L130,170 L135,210 L80,215 Z',
    labelX: 105,
    labelY: 192,
  },
  {
    id: 'sg-clementi',
    name: 'Clementi',
    shortName: 'Clementi',
    path: 'M110,215 L160,210 L165,250 L115,255 Z',
    labelX: 138,
    labelY: 232,
  },
  {
    id: 'sg-bukit-batok',
    name: 'Bukit Batok',
    shortName: 'Bt Batok',
    path: 'M100,140 L160,135 L165,175 L105,180 Z',
    labelX: 132,
    labelY: 158,
  },
  {
    id: 'sg-bukit-panjang',
    name: 'Bukit Panjang',
    shortName: 'Bt Panjang',
    path: 'M115,95 L175,90 L180,135 L120,140 Z',
    labelX: 148,
    labelY: 115,
  },
  {
    id: 'sg-choa-chu-kang',
    name: 'Choa Chu Kang',
    shortName: 'CCK',
    path: 'M65,100 L120,95 L125,140 L70,145 Z',
    labelX: 95,
    labelY: 118,
  },
  {
    id: 'sg-tuas',
    name: 'Tuas',
    shortName: 'Tuas',
    path: 'M5,250 L55,245 L60,295 L10,300 Z',
    labelX: 32,
    labelY: 272,
  },
  // ── South ──
  {
    id: 'sg-bukit-merah',
    name: 'Bukit Merah',
    shortName: 'Bt Merah',
    path: 'M150,255 L200,250 L205,290 L155,295 Z',
    labelX: 178,
    labelY: 272,
  },
  {
    id: 'sg-queenstown',
    name: 'Queenstown',
    shortName: "Q'town",
    path: 'M120,255 L155,250 L160,290 L125,295 Z',
    labelX: 140,
    labelY: 272,
  },
  // ── NTU area ──
  {
    id: 'sg-western-water',
    name: 'Western Water Catchment (NTU)',
    shortName: 'NTU',
    path: 'M15,145 L70,140 L75,200 L20,205 Z',
    labelX: 45,
    labelY: 172,
  },
];

export const SG_TOTAL_ZONES = SG_ZONES.length;
export const SG_VIEWBOX = '0 0 400 320';
