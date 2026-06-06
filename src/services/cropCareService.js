const CROP_CARE = {
  TOMATO: {
    optimalTemp: '8-12°C',
    humidity: '85-90%',
    shelfLife: { ambient: '3-5 days', cold: '15-20 days' },
    harvestTips: [
      'Harvest when 50-75% red for best shelf life',
      'Handle gently — bruising accelerates spoilage',
      'Remove damaged or cracked fruits immediately',
      'Do not wash before storage',
      'Keep in shade within 30 minutes of harvest'
    ],
    storeTips: [
      'Store stem-side down to reduce moisture loss',
      'Do not refrigerate below 8°C — causes chilling injury',
      'Keep away from ethylene-producing fruits like apples',
      'Check daily and remove any spoiling fruits'
    ],
    transportTips: [
      'Use ventilated plastic crates — not gunny bags',
      'Do not stack more than 4 layers',
      'Transport in early morning or evening to avoid heat',
      'Line crates with newspaper to absorb moisture'
    ]
  },
  POTATO: {
    optimalTemp: '3-5°C',
    humidity: '90-95%',
    shelfLife: { ambient: '2-3 weeks', cold: '3-6 months' },
    harvestTips: [
      'Allow skin to cure for 1-2 weeks before cold storage',
      'Harvest in dry weather to avoid disease',
      'Remove soil gently — do not wash',
      'Keep in dark place — light causes greening'
    ],
    storeTips: [
      'Store in complete darkness — light produces solanine',
      'Maintain humidity above 90% to prevent shrinkage',
      'Keep away from onions — gases affect each other',
      'Check for sprouting monthly'
    ],
    transportTips: [
      'Use jute bags or ventilated crates',
      'Avoid loading in rain',
      'Do not mix with other vegetables'
    ]
  },
  ONION: {
    optimalTemp: '0-2°C',
    humidity: '65-70%',
    shelfLife: { ambient: '1-2 months', cold: '6-8 months' },
    harvestTips: [
      'Harvest when tops fall over naturally',
      'Cure in field for 2-3 weeks after harvest',
      'Remove excess soil without washing',
      'Cut tops leaving 2cm neck'
    ],
    storeTips: [
      'Store in LOW humidity — high moisture causes rotting',
      'Ensure good air circulation',
      'Keep away from potatoes',
      'Check monthly for soft or sprouting bulbs'
    ],
    transportTips: [
      'Use mesh bags for ventilation',
      'Avoid plastic bags — traps moisture',
      'Stack maximum 8-10 bags high'
    ]
  },
  MANGO: {
    optimalTemp: '12-14°C',
    humidity: '85-90%',
    shelfLife: { ambient: '5-7 days', cold: '3-4 weeks' },
    harvestTips: [
      'Harvest with 5cm stem to prevent sap burn',
      'Handle extremely carefully — bruises are invisible initially',
      'Harvest in morning before heat builds up',
      'Grade by size before storage'
    ],
    storeTips: [
      'Do not store below 12°C — causes chilling injury',
      'Wrap individually in newspaper for premium storage',
      'Store in single layer if possible',
      'Check every 2 days'
    ],
    transportTips: [
      'Use corrugated cardboard boxes with padding',
      'Keep away from direct sunlight during transport',
      'Transport in air-conditioned vehicle if possible'
    ]
  },
  BANANA: {
    optimalTemp: '13-15°C',
    humidity: '90-95%',
    shelfLife: { ambient: '5-7 days', cold: '2-4 weeks' },
    harvestTips: [
      'Harvest when fingers are plump and rounded',
      'Cut entire bunch — do not separate hands',
      'Handle with extreme care',
      'Harvest early morning'
    ],
    storeTips: [
      'Never store below 12°C — causes blackening',
      'Keep away from other fruits',
      'Do not store in sealed containers',
      'Separate hands only when ready to sell'
    ],
    transportTips: [
      'Hang bunches if possible during transport',
      'Use padded vehicle floor',
      'Avoid jerky roads when loaded'
    ]
  }
};

const DEFAULT_CARE = {
  optimalTemp: '4-8°C',
  humidity: '85-90%',
  shelfLife: { ambient: '3-7 days', cold: '2-4 weeks' },
  harvestTips: [
    'Harvest in early morning to reduce field heat',
    'Handle produce gently to avoid bruising',
    'Remove damaged produce immediately',
    'Keep in shade after harvest'
  ],
  storeTips: [
    'Pre-cool produce before cold storage',
    'Maintain consistent temperature',
    'Check daily for signs of spoilage'
  ],
  transportTips: [
    'Use ventilated containers',
    'Avoid overloading',
    'Transport in cooler parts of the day'
  ]
};

function getCropCare(cropName) {
  return CROP_CARE[cropName.toUpperCase()] || DEFAULT_CARE;
}

function formatCareMessage(cropName) {
  const care = getCropCare(cropName);
  
  return `🌡️ POST-HARVEST CARE — ${cropName}

📦 Storage Requirements:
- Optimal Temp: ${care.optimalTemp}
- Humidity: ${care.humidity}
- Ambient shelf life: ${care.shelfLife.ambient}
- Cold storage life: ${care.shelfLife.cold}

✅ Harvest Tips:
${care.harvestTips.slice(0,3).map(t => `• ${t}`).join('\n')}

🏪 Storage Tips:
${care.storeTips.slice(0,3).map(t => `• ${t}`).join('\n')}

🚛 Transport Tips:
${care.transportTips.slice(0,2).map(t => `• ${t}`).join('\n')}`;
}

module.exports = { getCropCare, formatCareMessage };