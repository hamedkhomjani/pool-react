// English marketing content for the product catalog, keyed by product key.
// Every key here must exist in content/fa.js too (sanity is checked by the
// catalog loader in index.js). Fields:
//   badge       optional highlight label, or null
//   title       listing/product title
//   desc        short card description
//   longDesc    product-page description
//   features    bullet list shown on product page
//   specs       quick spec chips (values are localized; labels live in i18n)
//   detailSpecs full specification table (labels live in i18n)

export const productContent = {
  hw1500: {
    badge: 'Best Seller',
    title: 'Hayward 1.5 HP Pool Pump',
    desc: 'Powerful and quiet pump ideal for water circulation in residential and commercial pools up to 60 m³.',
    longDesc:
      'The Hayward pool pump with a 1.5 HP motor and a full stainless steel body is one of the best-selling pumps on the market. Its advanced hydraulic design reduces energy consumption by up to 30% compared to similar models.',
    features: [
      '1.5 HP high-efficiency motor',
      'Full 304 stainless steel body',
      'Quiet operation (under 45 dB)',
      'Low power consumption',
      'Suitable for pools up to 60 m³',
      '2-inch inlet and outlet',
    ],
    specs: { power: '1.5 HP', flow: '21 m³/h' },
    detailSpecs: {
      model: 'HW-1500',
      power: '1.5 HP (1100W)',
      flow: '21 m³/h',
      maxHead: '12 m',
      bodyMaterial: '304 Stainless Steel',
      inletOutlet: '2 inch',
      weight: '18 kg',
      warranty: '18 months',
    },
  },
  mega650: {
    badge: 'Special Offer',
    title: 'Emaux MEGA Sand Filter',
    desc: 'Fiberglass body resistant to rust and chemicals with an automatic 6-way valve.',
    longDesc:
      'The Emaux MEGA sand filter with a durable fiberglass body and automatic 6-way valve is an ideal solution for filtering large pools. With minimal pressure loss, it delivers the highest filtration quality.',
    features: [
      'Fiberglass body resistant to UV',
      'Automatic 6-way valve',
      'Uniform water distribution system',
      'Drain jet for easy emptying',
      '2.5 bar working pressure',
      'Suitable for pools up to 80 m³',
    ],
    specs: { diameter: '65 cm', flow: '15 m³/h' },
    detailSpecs: {
      model: 'MEGA-650',
      diameter: '65 cm',
      flow: '15 m³/h',
      workingPressure: '2.5 bar',
      bodyMaterial: 'Fiberglass',
      valveType: 'Automatic 6-way',
      weight: '25 kg',
      warranty: '24 months',
    },
  },
  uv85: {
    badge: null,
    title: 'UV Disinfection System',
    desc: 'Reduces chlorine usage by up to 80% and completely eliminates algae and bacteria in the water.',
    longDesc:
      'The advanced UV-C disinfection system with an 85W ultraviolet lamp eliminates 99.9% of water microorganisms without chemicals. This system dramatically reduces chlorine consumption and improves water quality.',
    features: [
      '85W UV-C lamp',
      '9,000 hours useful life',
      'Stainless steel body',
      'Automatic start',
      'Reduces chlorine use by 80%',
      'Smart control panel',
    ],
    specs: { power: '85W', lampLife: '9000h' },
    detailSpecs: {
      model: 'UV-85P',
      power: '85 W',
      lampLife: '9,000 hours',
      flow: '10 m³/h',
      bodyMaterial: '304 Stainless Steel',
      inletOutlet: '1.5 inch',
      weight: '4.5 kg',
      warranty: '12 months',
    },
  },
  ht36: {
    badge: 'Best Seller',
    title: 'Hayward Titanium Heat Exchanger',
    desc: 'Fast and even pool water heating with a titanium exchanger resistant to corrosion and chemicals.',
    longDesc:
      'The Hayward titanium heat exchanger with 36 kW power is the best choice for heating residential and commercial pools. The titanium plate resists corrosion and chemicals while guaranteeing 98% thermal efficiency.',
    features: [
      'Pure titanium plate',
      '98% thermal efficiency',
      'Digital thermostat',
      'Stainless steel body',
      'Horizontal and vertical installation',
      'Suitable for pools up to 80 m²',
    ],
    specs: { power: '36 kW', efficiency: '98%' },
    detailSpecs: {
      model: 'HT-36',
      power: '36 kW',
      efficiency: '98%',
      bodyMaterial: 'Pure Titanium',
      maxTemp: '40°C',
      inletOutlet: '1.5 inch',
      weight: '12 kg',
      warranty: '36 months',
    },
  },
  swg40: {
    badge: null,
    title: 'Salt Chlorinator System (Salt Cell)',
    desc: 'Automatic chlorine production from salt, eliminating the need to buy and store chemicals.',
    longDesc:
      'The AquaPro salt chlorinator produces 40 grams of chlorine per hour, fully automating your pool\u2019s disinfection process. Add salt to the water and the system naturally produces chlorine through electrolysis \u2014 no need to buy or store chemicals.',
    features: [
      'Automatic chlorine production from salt',
      'Titanium plate with ruthenium coating',
      '100% fewer chemical purchases',
      'Digital chlorine level display',
      'Automatic adjustment based on temperature',
      '5-year cell life',
    ],
    specs: { power: '250W', capacity: '40 g/h' },
    detailSpecs: {
      model: 'SWG-40',
      power: '250 W',
      capacity: '40 g/h',
      suitableUpTo: '80 m³',
      cellMaterial: 'Titanium + Ruthenium',
      inputVoltage: '220 V',
      weight: '6.5 kg',
      warranty: '24 months',
    },
  },
  led18: {
    badge: 'New',
    title: 'RGB LED Pool Light',
    desc: 'Professional pool lighting with 16 adjustable colors and remote control.',
    longDesc:
      'The AquaPro LED pool light with 18W power and 1600 lumens gives your pool a striking, colorful atmosphere. With 16 adjustable colors and remote control, you can create exactly the ambiance you want.',
    features: [
      '16 adjustable colors',
      'Remote control',
      'Very low power consumption',
      'Waterproof IP68',
      'Easy wall installation',
      'Stainless steel body',
    ],
    specs: { power: '18W', light: '1600 lm' },
    detailSpecs: {
      model: 'LED-18RGB',
      power: '18 W',
      light: '1600 lumens',
      colorCount: '16 colors + white',
      protection: 'IP68',
      voltageRange: '12-24 V AC/DC',
      weight: '0.8 kg',
      warranty: '18 months',
    },
  },
  pipe50: {
    badge: null,
    title: 'PVC Pressure Pipe 50mm (2 inch)',
    desc: "High-pressure PVC pipe for the pool's return and suction lines, resistant to chemicals and UV.",
    longDesc:
      'The 50mm high-pressure PVC pipe with standard wall thickness is designed for pool suction and return piping. It resists chemicals, sunlight and pressure, and is permanently joined with special PVC glue. Sold per meter.',
    features: [
      'Resistant to chemicals and UV',
      '10 bar working pressure',
      'Standard wall thickness',
      'Glue and solvent-weld joints',
      'Suitable for pools, spas and saunas',
    ],
    specs: { diameter: '50 mm', pressure: '10 bar' },
    detailSpecs: {
      model: 'PVC-50',
      diameter: '50 mm',
      workingPressure: '10 bar',
      bodyMaterial: 'PVC-U',
      length: '6 m',
      warranty: '12 months',
    },
  },
  fitkit50: {
    badge: null,
    title: 'Pool Piping Fittings Kit (50mm)',
    desc: 'Complete fittings kit — elbows, tees, unions and PVC glue — to build your pool piping loop.',
    longDesc:
      'This kit includes everything needed for the pool\u2019s suction and return piping: 90-degree elbows, tees, two-piece unions, couplings and special PVC glue. Assemble the full piping loop without sourcing parts separately.',
    features: [
      '90-degree elbows and tees',
      'Two-piece unions for opening the line',
      'Couplings',
      'Special PVC glue included',
      'Fits 50mm pipes',
    ],
    specs: { diameter: '50 mm' },
    detailSpecs: {
      model: 'FITTING-KIT-50',
      diameter: '50 mm',
      bodyMaterial: 'PVC-U',
      warranty: '12 months',
    },
  },
}

export default productContent