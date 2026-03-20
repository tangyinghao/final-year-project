/**
 * NTU Campus Zones - Simplified SVG path data for interactive map.
 * Each zone is a clickable region rendered as an SVG polygon/path.
 * Coordinates are relative to a 400x500 viewBox representing the NTU campus layout.
 */

export interface ZoneData {
  id: string;
  name: string;
  shortName: string;
  // SVG path data (simplified polygon points)
  path: string;
  // Label position (center of zone)
  labelX: number;
  labelY: number;
}

// NTU campus zones arranged in approximate geographic layout
export const NTU_ZONES: ZoneData[] = [
  // ── Halls of Residence ──
  {
    id: 'hall-1',
    name: 'Hall 1',
    shortName: 'H1',
    path: 'M30,30 L90,30 L90,70 L30,70 Z',
    labelX: 60,
    labelY: 50,
  },
  {
    id: 'hall-2',
    name: 'Hall 2',
    shortName: 'H2',
    path: 'M100,30 L160,30 L160,70 L100,70 Z',
    labelX: 130,
    labelY: 50,
  },
  {
    id: 'hall-3',
    name: 'Hall 3',
    shortName: 'H3',
    path: 'M170,30 L230,30 L230,70 L170,70 Z',
    labelX: 200,
    labelY: 50,
  },
  {
    id: 'hall-4',
    name: 'Hall 4',
    shortName: 'H4',
    path: 'M240,30 L300,30 L300,70 L240,70 Z',
    labelX: 270,
    labelY: 50,
  },
  {
    id: 'hall-5',
    name: 'Hall 5',
    shortName: 'H5',
    path: 'M30,85 L90,85 L90,125 L30,125 Z',
    labelX: 60,
    labelY: 105,
  },
  {
    id: 'hall-6',
    name: 'Hall 6',
    shortName: 'H6',
    path: 'M100,85 L160,85 L160,125 L100,125 Z',
    labelX: 130,
    labelY: 105,
  },
  {
    id: 'hall-7',
    name: 'Hall 7',
    shortName: 'H7',
    path: 'M170,85 L230,85 L230,125 L170,125 Z',
    labelX: 200,
    labelY: 105,
  },
  {
    id: 'hall-8',
    name: 'Hall 8',
    shortName: 'H8',
    path: 'M240,85 L300,85 L300,125 L240,125 Z',
    labelX: 270,
    labelY: 105,
  },
  {
    id: 'hall-9',
    name: 'Hall 9',
    shortName: 'H9',
    path: 'M310,30 L370,30 L370,70 L310,70 Z',
    labelX: 340,
    labelY: 50,
  },
  {
    id: 'hall-10',
    name: 'Hall 10',
    shortName: 'H10',
    path: 'M310,85 L370,85 L370,125 L310,125 Z',
    labelX: 340,
    labelY: 105,
  },
  {
    id: 'hall-11',
    name: 'Hall 11',
    shortName: 'H11',
    path: 'M30,140 L90,140 L90,180 L30,180 Z',
    labelX: 60,
    labelY: 160,
  },
  {
    id: 'hall-12',
    name: 'Hall 12',
    shortName: 'H12',
    path: 'M100,140 L160,140 L160,180 L100,180 Z',
    labelX: 130,
    labelY: 160,
  },
  {
    id: 'hall-13',
    name: 'Hall 13',
    shortName: 'H13',
    path: 'M170,140 L230,140 L230,180 L170,180 Z',
    labelX: 200,
    labelY: 160,
  },
  {
    id: 'hall-14',
    name: 'Hall 14',
    shortName: 'H14',
    path: 'M240,140 L300,140 L300,180 L240,180 Z',
    labelX: 270,
    labelY: 160,
  },
  {
    id: 'hall-15',
    name: 'Hall 15 (Tanjong)',
    shortName: 'H15',
    path: 'M310,140 L370,140 L370,180 L310,180 Z',
    labelX: 340,
    labelY: 160,
  },
  {
    id: 'hall-16',
    name: 'Hall 16 (Binjai)',
    shortName: 'H16',
    path: 'M30,195 L90,195 L90,235 L30,235 Z',
    labelX: 60,
    labelY: 215,
  },
  // ── Academic Buildings ──
  {
    id: 'north-spine',
    name: 'North Spine',
    shortName: 'NS',
    path: 'M110,210 L250,210 L250,260 L110,260 Z',
    labelX: 180,
    labelY: 235,
  },
  {
    id: 'south-spine',
    name: 'South Spine',
    shortName: 'SS',
    path: 'M110,275 L250,275 L250,325 L110,325 Z',
    labelX: 180,
    labelY: 300,
  },
  {
    id: 'the-hive',
    name: 'The Hive',
    shortName: 'Hive',
    path: 'M265,210 L345,210 L345,260 L265,260 Z',
    labelX: 305,
    labelY: 235,
  },
  {
    id: 'gaia',
    name: 'Gaia',
    shortName: 'Gaia',
    path: 'M265,275 L345,275 L345,325 L265,325 Z',
    labelX: 305,
    labelY: 300,
  },
  {
    id: 'arc',
    name: 'The Arc',
    shortName: 'Arc',
    path: 'M110,340 L210,340 L210,390 L110,390 Z',
    labelX: 160,
    labelY: 365,
  },
  {
    id: 'nie',
    name: 'NIE',
    shortName: 'NIE',
    path: 'M225,340 L345,340 L345,390 L225,390 Z',
    labelX: 285,
    labelY: 365,
  },
];

export const NTU_TOTAL_ZONES = NTU_ZONES.length;
export const NTU_VIEWBOX = '0 0 400 420';
