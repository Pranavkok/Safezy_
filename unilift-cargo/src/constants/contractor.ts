type MultiSelectOptionType = {
  value: string;
  label: string;
}[];

export const TYPES_OF_SERVICES_PROVIDED_OPTIONS: MultiSelectOptionType = [
  { label: 'Warehouse Operations', value: 'warehouse_operations' },
  { label: 'Material Handling Services', value: 'material_handling_services' },
  {
    label: 'Operation and Maintenance (O&M) Services',
    value: 'operation_maintenance_services'
  },
  { label: 'Plant Maintenance Services', value: 'plant_maintenance_services' },
  { label: 'Heavy Machinery', value: 'heavy_machinery' },
  { label: 'Store Handling', value: 'store_handling' },
  { label: 'Construction Services', value: 'construction_services' },
  {
    label: 'Engineering Procurement and Commissioning (EPC) Services',
    value: 'epc_services'
  },
  { label: 'Transport & Logistics', value: 'transport_logistics' },
  {
    label: 'Security Personnel Services',
    value: 'security_personnel_services'
  },
  { label: 'Catering Services', value: 'catering_services' },
  {
    label: 'Shutdown Maintenance Services',
    value: 'shutdown_maintenance_services'
  },
  { label: 'Other (please specify)', value: 'other' }
] as const;

export const INDUSTRIES_SERVED_OPTIONS: MultiSelectOptionType = [
  { label: 'Petrochemicals', value: 'petrochemicals' },
  { label: 'Metals', value: 'metals' },
  { label: 'Fibre', value: 'fibre' },
  { label: 'Rubber', value: 'rubber' },
  { label: 'Cables', value: 'cables' },
  { label: 'Technology', value: 'technology' },
  { label: 'Agriculture', value: 'agriculture' },
  { label: 'Retail', value: 'retail' },
  { label: 'Food & Beverage', value: 'food_beverage' },
  { label: 'Hospitality', value: 'hospitality' },
  { label: 'Public Utilities', value: 'public_utilities' },
  { label: 'Cement', value: 'cement' },
  { label: 'Textile', value: 'textile' },
  { label: 'Manufacturing', value: 'manufacturing' },
  { label: 'Construction & Real Estate', value: 'construction_real_estate' },
  { label: 'Mining', value: 'mining' },
  { label: 'Other (please specify)', value: 'other' }
] as const;

export const TOTAL_NUMBER_OF_WORKERS_OPTIONS: MultiSelectOptionType = [
  { label: 'Less than 100', value: 'less_than_100' },
  { label: '100 - 500', value: '100_to_500' },
  { label: '500 - 1000', value: '500_to_1000' },
  { label: '1000 - 2500', value: '1000_to_2500' },
  { label: '2500 - 5000', value: '2500_to_5000' },
  { label: '5000 - 10000', value: '5000_to_10000' },
  { label: 'More than 10000', value: 'more_than_10000' }
] as const;

export const GEOGRAPHICAL_LOCATIONS_OPTIONS: MultiSelectOptionType = [
  { label: 'Industrial Areas', value: 'industrial_areas' },
  { label: 'Healthcare Settings', value: 'healthcare_settings' },
  { label: 'Agricultural and Rural Areas', value: 'agricultural_rural_areas' },
  { label: 'Marine and Coastal Areas', value: 'marine_coastal_areas' },
  {
    label: 'Environmental/Extreme Conditions',
    value: 'environmental_extreme_conditions'
  },
  { label: 'Transport and Logistics', value: 'transport_logistics' },
  { label: 'Military and Defense', value: 'military_defense' },
  { label: 'Energy and Utilities', value: 'energy_utilities' },
  {
    label: 'Public Safety and Emergency Response',
    value: 'public_safety_emergency_response'
  },
  { label: 'Public Crowd Control Areas', value: 'public_crowd_control_areas' },
  { label: 'Urban and Commercial', value: 'urban_commercial' },
  { label: 'Hazardous Material Zones', value: 'hazardous_material_zones' }
] as const;
