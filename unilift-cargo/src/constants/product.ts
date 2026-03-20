import { SelectOptionsType } from '@/components/inputs-fields/SelectWithLabel';

export const PRODUCT_CATEGORIES: SelectOptionsType = [
  { value: 'head_protection', label: 'Head Protection' },
  { value: 'respiratory_protection', label: 'Respiratory Protection' },
  { value: 'face_protection', label: 'Face Protection' },
  { value: 'eye_protection', label: 'Eye Protection' },
  { value: 'hand_protection', label: 'Hand Protection' },
  { value: 'leg_protection', label: 'Foot Protection' },
  { value: 'fall_protection', label: 'Fall Protection' },
  { value: 'body_protection', label: 'Body Protection' },
  { value: 'ear_protection', label: 'Ear Protection' }
] as const;

export const CATEGORY_SUBCATEGORIES: Record<string, SelectOptionsType> = {
  head_protection: [
    { value: 'manual_adjustment', label: 'Manual Adjustment' },
    { value: 'ratchet_adjustment', label: 'Ratchet Adjustment' },
    { value: 'slider_adjustment', label: 'Slider Adjustment' }
  ],
  respiratory_protection: [
    { value: 'ffp1', label: 'FFP1' },
    { value: 'ffp2', label: 'FFP2' },
    { value: 'ffp3', label: 'FFP3' }
  ],
  face_protection: [
    { value: 'ir05', label: 'IR05' },
    { value: 'ir11', label: 'IR11' }
  ],
  eye_protection: [
    { value: 'clear_lens', label: 'Clear Lens' },
    { value: 'smoked_lens', label: 'Smoked Lens' },
    { value: 'clear_antifog', label: 'Clear/Antifog' },
    { value: 'smoked_antifog', label: 'Smoked/Antifog' }
  ],
  hand_protection: [
    { value: 'abrasion_resistance', label: 'Abrasion Resistance' },
    {
      value: 'abrasion_and_tear_resistance',
      label: 'Abrasion & Tear Resistance'
    },
    {
      value: 'abrasion_resistance_chemical_protection',
      label: 'Abrasion Resistance/Chemical Protection'
    },
    {
      value: 'cut_resistance_abrasion_resistance',
      label: 'Cut Resistance/Abrasion Resistance'
    },
    { value: 'heat_resistance', label: 'Heat Resistance' },
    {
      value: 'abrasion_resistance_oil_resistance',
      label: 'Abrasion Resistance/Oil Resistance'
    },
    { value: 'cut_resistant', label: 'Cut Resistant' }
  ],
  leg_protection: [
    { value: 'steel_toe', label: 'Steel Toe' },
    { value: 'fiber_toe', label: 'Fiber Toe' },
    { value: 'slip_on', label: 'Slip On' },
    { value: 'laces', label: 'Laces' },
    { value: 'composite_toe', label: 'Composite Toe' }
  ],
  fall_protection: [
    { value: 'anchorage', label: 'Anchorage' },
    { value: 'harness_series', label: 'Harness CE Series' },
    { value: 'harness_techno_series', label: 'Harness Magna & Techno Series' },
    { value: 'hooks_karabiners', label: 'Hooks & Karabiner' },
    { value: 'jacket_harness', label: 'Jacket Harness' },
    { value: 'lanyards', label: 'Lanyards' },
    { value: 'rope_access', label: 'Rope Access' },
    { value: 'load_arrester', label: 'Load Arrester' },
    { value: 'retractable_block', label: 'Retractable Block' }
  ],
  body_protection: [
    {
      value: '180_plus_gsm_reflective_tape',
      label: '180+ GSM Reflective Tape'
    },
    { value: 'leather_material', label: 'Leather Material' },
    { value: 'high_visibility', label: 'High Visibility' },
    { value: 'full_body_protection', label: 'Full Body Protection' }
  ],
  ear_protection: [
    { value: '34DB', label: '34DB' },
    { value: '29DB', label: '29DB' }
  ]
} as const;

export const PRODUCT_BRANDS: SelectOptionsType = [
  { label: '3M', value: '3m' },
  { label: 'Agarson', value: 'agarson' },
  { label: 'Aktion', value: 'aktion' },
  { label: 'Ansell', value: 'ansell' },
  { label: 'Atlas', value: 'atlas' },
  { label: 'DK Safety', value: 'dk_safety' },
  { label: 'Hillson', value: 'hillson' },
  { label: 'Joseph leslie', value: 'joseph_leslie' },
  { label: 'Karam', value: 'karam' },
  { label: 'Metro', value: 'metro' },
  { label: 'Midas', value: 'midas' },
  { label: 'Momentum', value: 'momentum' },
  { label: 'Udyogi', value: 'udyogi' },
  { label: 'Unicare', value: 'unicare' },
  { label: 'Unicorn', value: 'unicorn' },
  { label: 'Venus', value: 'venus' },
  { label: 'Weldohard', value: 'Weldohard' },
  { label: 'Weldosafe', value: 'weldosafe' }
] as const;

// Product Filter
export const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low To High', value: 'price-asc' },
  { label: 'Price: High To Low', value: 'price-desc' }
] as const;
