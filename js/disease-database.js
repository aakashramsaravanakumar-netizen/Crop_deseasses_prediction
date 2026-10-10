/**
 * AgriScan AI - Comprehensive Crop Disease Knowledge Base
 * Contains disease classifications, symptoms, treatments, and realistic leaf preview generators.
 */

const DISEASE_DATABASE = {
    'tomato_late_blight': {
        id: 'tomato_late_blight',
        crop: 'Tomato',
        botanicalName: 'Solanum lycopersicum',
        diseaseName: 'Late Blight',
        scientificName: 'Phytophthora infestans',
        pathogen: 'Oomycete (Fungal-like Protist)',
        severity: 'Critical',
        defaultConfidence: 96.8,
        symptoms: 'Irregular dark brown/black water-soaked lesions on leaves and stems. White cottony fungal growth on underside in humid conditions. Rapid foliage collapse.',
        affectedParts: ['Leaves', 'Stems', 'Fruit'],
        lesionCoverage: '42%',
        chlorosisIndex: 'High (0.78)',
        tissueViability: 'Poor (38%)',
        treatments: {
            triage: [
                'Immediately remove and destroy (do not compost) all severely infected leaves and vines.',
                'Isolate unaffected plants and stop overhead sprinkler irrigation immediately.',
                'Disinfect pruning shears with 70% isopropyl alcohol or 10% bleach solution between cuts.'
            ],
            organic: [
                'Apply Copper octanoate (Copper soap) or Bordeaux mixture every 5-7 days under wet conditions.',
                'Foliar spray with Bacillus subtilis bio-fungicide (Serenade Garden) at first sign of humidity.',
                'Apply cold-pressed neem oil (0.5% concentration) as a protective deterrent against secondary spores.'
            ],
            chemical: [
                'Curative application: Dimethomorph + Mancozeb (Acrobat MZ) at 2.0g/L spray volume.',
                'Systemic protection: Metalaxyl-M + Mancozeb (Ridomil Gold MZ) at 2.5g/L.',
                'Maintain strict 7-day pre-harvest interval (PHI) for chemical applications.'
            ],
            prevention: [
                'Ensure 3-4 feet row spacing to maximize airflow and dry canopy rapidly after morning dew.',
                'Install drip irrigation or soaker hoses to keep leaves completely dry.',
                'Plant resistant tomato varieties (e.g., Mountain Magic, Defiant Ph-R, Iron Lady).'
            ]
        },
        differentialDiagnosis: [
            { name: 'Tomato Early Blight', probability: 2.4 },
            { name: 'Tomato Septoria Leaf Spot', probability: 0.8 }
        ],
        badgeColor: 'rose',
        sampleColor: '#4d5924'
    },

    'tomato_early_blight': {
        id: 'tomato_early_blight',
        crop: 'Tomato',
        botanicalName: 'Solanum lycopersicum',
        diseaseName: 'Early Blight',
        scientificName: 'Alternaria solani',
        pathogen: 'Fungus (Ascomycota)',
        severity: 'Mild',
        defaultConfidence: 94.2,
        symptoms: 'Distinct concentric target-like rings with dark brown borders surrounded by chlorotic yellow halos, starting primarily on older lower leaves.',
        affectedParts: ['Lower Leaves', 'Stems', 'Fruit Calyx'],
        lesionCoverage: '26%',
        chlorosisIndex: 'Moderate (0.55)',
        tissueViability: 'Moderate (64%)',
        treatments: {
            triage: [
                'Prune bottom 12 inches of foliage to prevent soil splash onto lower leaves.',
                'Mulch heavily around tomato base with clean straw or black plastic fabric.'
            ],
            organic: [
                'Spray potassium bicarbonate or copper hydroxide fungicide weekly.',
                'Apply compost tea enriched with Trichoderma harzianum to colonize leaf surface.'
            ],
            chemical: [
                'Foliar spray with Chlorothalonil (Daconil 2787) or Azoxystrobin (Quadris) at recommended rates.',
                'Alternate fungicide FRAC classes to prevent chemical resistance buildup.'
            ],
            prevention: [
                'Practice a minimum 3-year crop rotation with non-solanaceous crops.',
                'Sterilize plant stakes and tomato cages at the end of every season.'
            ]
        },
        differentialDiagnosis: [
            { name: 'Tomato Septoria Leaf Spot', probability: 4.1 },
            { name: 'Tomato Late Blight', probability: 1.7 }
        ],
        badgeColor: 'amber',
        sampleColor: '#636b28'
    },

    'corn_common_rust': {
        id: 'corn_common_rust',
        crop: 'Corn (Maize)',
        botanicalName: 'Zea mays',
        diseaseName: 'Common Rust',
        scientificName: 'Puccinia sorghi',
        pathogen: 'Fungus (Basidiomycota)',
        severity: 'Mild',
        defaultConfidence: 95.5,
        symptoms: 'Golden-brown to cinnamon-brown powdery pustules (uredinia) scattered across both upper and lower leaf surfaces, erupting through leaf epidermis.',
        affectedParts: ['Leaf Blade', 'Leaf Sheath'],
        lesionCoverage: '21%',
        chlorosisIndex: 'Moderate (0.48)',
        tissueViability: 'Good (72%)',
        treatments: {
            triage: [
                'Assess crop growth stage: treatment is most economically viable between vegetative stage V8 and silking (R1).',
                'Monitor weather forecasts for sustained cool temperatures (60-75°F) and high relative humidity.'
            ],
            organic: [
                'Sulfur dust or wettable sulfur applied before rust pustules cover more than 5% of leaf area.',
                'Bio-stimulant foliar spray containing silicon to strengthen cell wall silicon-cellulose matrix.'
            ],
            chemical: [
                'Apply Triazole fungicides such as Pyraclostrobin + Metconazole (Headline AMP) or Tebuconazole (Folicur 3.6F).',
                'Ensure high-pressure spray penetration into the dense maize canopy.'
            ],
            prevention: [
                'Plant certified hybrid maize with Rp-resistance genes against Puccinia sorghi.',
                'Early planting in spring to allow corn to mature ahead of peak fungal spore arrival.'
            ]
        },
        differentialDiagnosis: [
            { name: 'Southern Corn Rust (Puccinia polysora)', probability: 3.2 },
            { name: 'Northern Corn Leaf Blight', probability: 1.3 }
        ],
        badgeColor: 'amber',
        sampleColor: '#8a622b'
    },

    'apple_scab': {
        id: 'apple_scab',
        crop: 'Apple',
        botanicalName: 'Malus domestica',
        diseaseName: 'Apple Scab',
        scientificName: 'Venturia inaequalis',
        pathogen: 'Fungus (Ascomycota)',
        severity: 'Critical',
        defaultConfidence: 97.4,
        symptoms: 'Olive-green to velvety dark brown circular lesions on upper leaf surfaces, developing into corky, cracked necrotic patches on leaves and young fruit.',
        affectedParts: ['Leaves', 'Blossoms', 'Fruit Skin'],
        lesionCoverage: '35%',
        chlorosisIndex: 'High (0.72)',
        tissueViability: 'Poor (45%)',
        treatments: {
            triage: [
                'Rake and incinerate or deeply till fallen autumn orchard leaves to break primary ascospore overwintering.',
                'Prune tree canopy during dormancy to promote rapid leaf drying within 4-6 hours post-rain.'
            ],
            organic: [
                'Liquid lime sulfur applied during tight cluster through pink bud stage.',
                'Neem oil or Bacillus amyloliquefaciens spray immediately following rain infection periods.'
            ],
            chemical: [
                'Sterol biosynthesis inhibitors: Difenoconazole (Inspire Super) or Myclobutanil (Rally 40WSP).',
                'Protectant tank-mix: Captan 80WDG or Mancozeb applied prior to predicted wet weather fronts.'
            ],
            prevention: [
                'Select scab-resistant apple cultivars such as Liberty, Freedom, Enterprise, or Prima.',
                'Apply 5% urea spray to orchard floor leaves in autumn to accelerate leaf decomposition.'
            ]
        },
        differentialDiagnosis: [
            { name: 'Cedar Apple Rust', probability: 1.8 },
            { name: 'Frogeye Leaf Spot', probability: 0.8 }
        ],
        badgeColor: 'rose',
        sampleColor: '#4a4625'
    },

    'rice_leaf_blast': {
        id: 'rice_leaf_blast',
        crop: 'Rice (Paddy)',
        botanicalName: 'Oryza sativa',
        diseaseName: 'Rice Leaf Blast',
        scientificName: 'Magnaporthe oryzae',
        pathogen: 'Fungus (Ascomycota)',
        severity: 'Critical',
        defaultConfidence: 98.1,
        symptoms: 'Spindle-shaped or diamond-shaped lesions with grayish-white centers and brownish margins, coalescing to cause entire leaf blade desiccation ("blast").',
        affectedParts: ['Leaves', 'Leaf Collars', 'Panicle Neck'],
        lesionCoverage: '48%',
        chlorosisIndex: 'Very High (0.85)',
        tissueViability: 'Critical (29%)',
        treatments: {
            triage: [
                'Immediately manage paddy water depth; maintain 5-10cm standing water to suppress blast spore germination.',
                'Halt all nitrogen fertilizer top-dressing immediately, as excess nitrogen dramatically exacerbates blast.'
            ],
            organic: [
                'Pseudomonas fluorescens seed treatment (10g/kg seed) and foliar spray (2.5g/L).',
                'Silica foliar amendment (potassium silicate) to harden leaf epidermal silica cells against appressoria.'
            ],
            chemical: [
                'Tricyclazole 75% WP (Beam) at 0.6g/L or Isoprothiolane (Fujione) at 1.5ml/L.',
                'Azoxystrobin + Difenoconazole (Amistar Top) at boot-leaf emergence.'
            ],
            prevention: [
                'Avoid excessive seedling nursery planting density.',
                'Treat seed paddy with hot water immersion (53-54°C for 10-12 minutes) prior to broadcast.'
            ]
        },
        differentialDiagnosis: [
            { name: 'Brown Leaf Spot (Bipolaris oryzae)', probability: 1.2 },
            { name: 'Bacterial Leaf Blight', probability: 0.7 }
        ],
        badgeColor: 'rose',
        sampleColor: '#404c2b'
    },

    'potato_late_blight': {
        id: 'potato_late_blight',
        crop: 'Potato',
        botanicalName: 'Solanum tuberosum',
        diseaseName: 'Potato Late Blight',
        scientificName: 'Phytophthora infestans',
        pathogen: 'Oomycete',
        severity: 'Critical',
        defaultConfidence: 96.1,
        symptoms: 'Large purplish-brown water-soaked spots surrounded by pale yellowish halos, with downy white sporulation on undersides of leaves during cool, damp mornings.',
        affectedParts: ['Foliage', 'Stems', 'Underground Tubers'],
        lesionCoverage: '39%',
        chlorosisIndex: 'High (0.75)',
        tissueViability: 'Poor (34%)',
        treatments: {
            triage: [
                'Hill soil deeply over potato rows to prevent motile zoospores from washing down into tubers.',
                'Cut and burn top foliage 2 weeks before tuber harvest if blight hits near maturity.'
            ],
            organic: [
                'Fixed copper hydroxide applied at 5 to 7-day intervals during risk warning windows.',
                'Equisetum (Horsetail) silica extract foliar booster.'
            ],
            chemical: [
                'Mandipropamid (Revus) or Fluopicolide (Infinito) translaminar fungicides.',
                'Cymoxanil + Mancozeb (Curzate) for kickback action within 48 hours of infection.'
            ],
            prevention: [
                'Plant only certified pathogen-free seed tubers.',
                'Eliminate volunteer potato plants and cull piles from farm perimeter.'
            ]
        },
        differentialDiagnosis: [
            { name: 'Potato Early Blight', probability: 2.8 },
            { name: 'Botrytis Gray Mold', probability: 1.1 }
        ],
        badgeColor: 'rose',
        sampleColor: '#444d28'
    },

    'grape_black_rot': {
        id: 'grape_black_rot',
        crop: 'Grape (Vineyard)',
        botanicalName: 'Vitis vinifera',
        diseaseName: 'Black Rot',
        scientificName: 'Guignardia bidwellii',
        pathogen: 'Fungus (Ascomycota)',
        severity: 'Mild',
        defaultConfidence: 93.9,
        symptoms: 'Circular reddish-brown necrotic spots with distinct dark brown margins on leaves; tiny black speck-like pycnidia fruiting bodies visible inside lesions.',
        affectedParts: ['Leaves', 'Canes', 'Fruit Berries'],
        lesionCoverage: '18%',
        chlorosisIndex: 'Moderate (0.42)',
        tissueViability: 'Fair (76%)',
        treatments: {
            triage: [
                'Remove and discard all shriveled black mummified berries from vine trellises during winter pruning.',
                'Canopy hedging and shoot positioning to maximize sun exposure and wind passage.'
            ],
            organic: [
                'Copper-soap formulation applied at bud-break and immediate post-bloom periods.',
                'Lime sulfur dormant spray to eliminate overwintering cane perithecia.'
            ],
            chemical: [
                'Myclobutanil (Rally 40WSP) or Kresoxim-methyl (Sovran) between pre-bloom and 4 weeks post-bloom.',
                'Mancozeb 75DF applied as early protectant.'
            ],
            prevention: [
                'Keep vineyard floor mowed clean to reduce humidity accumulation below vine canopies.',
                'Plant resistant hybrid grape varieties (e.g., Norton, Steuben).'
            ]
        },
        differentialDiagnosis: [
            { name: 'Grape Downy Mildew', probability: 4.2 },
            { name: 'Phomopsis Cane & Leaf Spot', probability: 1.9 }
        ],
        badgeColor: 'amber',
        sampleColor: '#5a4628'
    },

    'pepper_bacterial_spot': {
        id: 'pepper_bacterial_spot',
        crop: 'Bell Pepper',
        botanicalName: 'Capsicum annuum',
        diseaseName: 'Bacterial Spot',
        scientificName: 'Xanthomonas vesicatoria',
        pathogen: 'Bacterium (Gammaproteobacteria)',
        severity: 'Mild',
        defaultConfidence: 92.7,
        symptoms: 'Small yellow-green circular lesions that turn dark brown with water-soaked margins, often causing extensive premature leaf drop and defoliation.',
        affectedParts: ['Leaves', 'Stems', 'Fruit Pods'],
        lesionCoverage: '23%',
        chlorosisIndex: 'Moderate (0.51)',
        tissueViability: 'Moderate (68%)',
        treatments: {
            triage: [
                'Avoid working in pepper fields while foliage is damp from rain or morning condensation.',
                'Remove infected plant debris and do not overhead irrigate.'
            ],
            organic: [
                'Copper hydroxide + Bacillus amyloliquefaciens tank mix for synergistic bacterial suppression.',
                'Foliar spray with biological systemic acquired resistance (SAR) inducers.'
            ],
            chemical: [
                'Copper hydroxide combined with Mancozeb (improves copper bioavailability against tolerant Xanthomonas strains).',
                'Streptomycin / Oxytetracycline bactericide where permitted by agricultural authorities.'
            ],
            prevention: [
                'Select bell pepper seeds with certified Xv resistance races (Races 1-5).',
                'Treat uncertified seeds with hot water (50°C for 25 minutes) before sowing.'
            ]
        },
        differentialDiagnosis: [
            { name: 'Cercospora Leaf Spot (Frogeye)', probability: 4.8 },
            { name: 'Phytophthora Blight', probability: 2.5 }
        ],
        badgeColor: 'amber',
        sampleColor: '#57612c'
    },

    'healthy_crop_leaf': {
        id: 'healthy_crop_leaf',
        crop: 'Tomato / Crop General',
        botanicalName: 'Solanum lycopersicum (Healthy)',
        diseaseName: 'Healthy Foliage',
        scientificName: 'Non-Pathogenic / Vigorous',
        pathogen: 'None (Optimal Plant Health)',
        severity: 'Healthy',
        defaultConfidence: 99.2,
        symptoms: 'No lesions, chlorosis, necrotic spotting, or fungal spores detected. Uniform chlorophyll distribution, robust cell turgor, and clear leaf venation.',
        affectedParts: ['None (All organs healthy)'],
        lesionCoverage: '0%',
        chlorosisIndex: 'Nominal (0.04)',
        tissueViability: 'Optimal (98%)',
        treatments: {
            triage: [
                'No remediation needed! Continue regular farm management and scouting schedule.'
            ],
            organic: [
                'Maintain routine preventative compost tea or seaweed kelp extract spray to reinforce plant immunity.',
                'Ensure beneficial mycorrhizal fungi colonies are supported in the rhizosphere.'
            ],
            chemical: [
                'No chemical fungicides or bactericides required. Preserve beneficial insect ecosystem.'
            ],
            prevention: [
                'Maintain consistent moisture levels through automated drip irrigation.',
                'Perform balanced N-P-K soil tests every season to ensure micro-nutrient homeostasis (Fe, Mg, Zn).'
            ]
        },
        differentialDiagnosis: [
            { name: 'Minor Sun Scald / Physiological', probability: 0.6 },
            { name: 'Early Chlorosis Variant', probability: 0.2 }
        ],
        badgeColor: 'emerald',
        sampleColor: '#2d6a33'
    }
};

/**
 * Procedural Realistic SVG Leaf Generator for Built-in Demo Testing
 * Returns high-resolution, self-contained SVG Data URIs representing realistic leaves.
 */
function generateLeafSVG(diseaseId) {
    const data = DISEASE_DATABASE[diseaseId] || DISEASE_DATABASE['healthy_crop_leaf'];
    const isHealthy = data.severity === 'Healthy';
    const isCritical = data.severity === 'Critical';
    const isMild = data.severity === 'Mild';

    // Base color tones
    let leafBaseColor = '#2d6a33';
    let leafVeinColor = '#48944f';
    let spotColors = ['#422817', '#2e1c10', '#73522c'];
    let haloColor = 'rgba(234, 179, 8, 0.45)';

    if (diseaseId === 'tomato_late_blight') {
        leafBaseColor = '#3f5628';
        leafVeinColor = '#55723b';
        spotColors = ['#1f1d18', '#2b2316', '#3b2f1c'];
        haloColor = 'rgba(180, 160, 40, 0.6)';
    } else if (diseaseId === 'apple_scab') {
        leafBaseColor = '#354d24';
        leafVeinColor = '#4a6735';
        spotColors = ['#1a1d12', '#2c3319', '#14140e'];
        haloColor = 'rgba(120, 130, 40, 0.4)';
    } else if (diseaseId === 'corn_common_rust') {
        leafBaseColor = '#506c27';
        leafVeinColor = '#6b8e36';
        spotColors = ['#b45309', '#9a3412', '#c2410c'];
        haloColor = 'rgba(245, 158, 11, 0.5)';
    } else if (diseaseId === 'rice_leaf_blast') {
        leafBaseColor = '#3f5926';
        leafVeinColor = '#5b7d39';
        spotColors = ['#78716c', '#57534e', '#44403c'];
        haloColor = 'rgba(180, 83, 9, 0.55)';
    }

    // Build procedural spots
    let spotsSVG = '';
    if (!isHealthy) {
        const spotCount = isCritical ? 24 : 14;
        const seedLocations = [
            { cx: 210, cy: 190, r: isCritical ? 34 : 20 },
            { cx: 270, cy: 230, r: isCritical ? 28 : 16 },
            { cx: 160, cy: 280, r: isCritical ? 38 : 22 },
            { cx: 230, cy: 340, r: isCritical ? 30 : 18 },
            { cx: 310, cy: 160, r: isCritical ? 22 : 14 },
            { cx: 140, cy: 210, r: isCritical ? 26 : 15 },
            { cx: 270, cy: 310, r: isCritical ? 32 : 19 },
            { cx: 190, cy: 390, r: isCritical ? 24 : 16 },
            { cx: 260, cy: 430, r: isCritical ? 20 : 12 },
            { cx: 180, cy: 140, r: 16 },
            { cx: 240, cy: 110, r: 14 },
            { cx: 290, cy: 260, r: 24 }
        ];

        spotsSVG = seedLocations.slice(0, spotCount).map((pt, i) => {
            const col = spotColors[i % spotColors.length];
            return `
                <circle cx="${pt.cx}" cy="${pt.cy}" r="${pt.r * 1.35}" fill="${haloColor}" filter="blur(3px)" />
                <ellipse cx="${pt.cx}" cy="${pt.cy}" rx="${pt.r}" ry="${pt.r * 0.85}" fill="${col}" transform="rotate(${i * 25} ${pt.cx} ${pt.cy})" />
                <circle cx="${pt.cx - 2}" cy="${pt.cy - 1}" r="${pt.r * 0.45}" fill="#110e0b" opacity="0.75" />
            `;
        }).join('\n');
    }

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 550" width="100%" height="100%">
        <defs>
            <radialGradient id="leafGrad_${diseaseId}" cx="45%" cy="40%" r="65%">
                <stop offset="0%" stop-color="${isHealthy ? '#44a34e' : leafBaseColor}" />
                <stop offset="70%" stop-color="${leafBaseColor}" />
                <stop offset="100%" stop-color="#142915" />
            </radialGradient>
            <linearGradient id="stemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#6b8e36" />
                <stop offset="100%" stop-color="#344e1f" />
            </linearGradient>
            <filter id="leafShadow" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#000" flood-opacity="0.6"/>
            </filter>
        </defs>

        <!-- Leaf Stem -->
        <path d="M 225 480 Q 220 535 210 550" stroke="url(#stemGrad)" stroke-width="12" stroke-linecap="round" fill="none" />

        <!-- Main Leaf Blade Body -->
        <g filter="url(#leafShadow)">
            <path d="M 225 50 
                     C 350 120, 395 270, 360 380 
                     C 335 450, 265 475, 225 480 
                     C 185 475, 115 450, 90 380 
                     C 55 270, 100 120, 225 50 Z" 
                  fill="url(#leafGrad_${diseaseId})" 
                  stroke="#1b381c" 
                  stroke-width="3" />

            <!-- Primary Central Midrib / Vein -->
            <path d="M 225 55 Q 224 250 225 480" stroke="${leafVeinColor}" stroke-width="6" stroke-linecap="round" fill="none" opacity="0.85" />
            
            <!-- Secondary Lateral Veins -->
            <path d="M 225 120 Q 280 150 330 160" stroke="${leafVeinColor}" stroke-width="2.5" fill="none" opacity="0.65" />
            <path d="M 225 120 Q 170 150 120 160" stroke="${leafVeinColor}" stroke-width="2.5" fill="none" opacity="0.65" />
            <path d="M 225 190 Q 295 230 355 245" stroke="${leafVeinColor}" stroke-width="2.5" fill="none" opacity="0.65" />
            <path d="M 225 190 Q 155 230 95 245" stroke="${leafVeinColor}" stroke-width="2.5" fill="none" opacity="0.65" />
            <path d="M 225 270 Q 300 310 345 340" stroke="${leafVeinColor}" stroke-width="2.5" fill="none" opacity="0.65" />
            <path d="M 225 270 Q 150 310 105 340" stroke="${leafVeinColor}" stroke-width="2.5" fill="none" opacity="0.65" />
            <path d="M 225 350 Q 285 390 310 420" stroke="${leafVeinColor}" stroke-width="2" fill="none" opacity="0.6" />
            <path d="M 225 350 Q 165 390 140 420" stroke="${leafVeinColor}" stroke-width="2" fill="none" opacity="0.6" />

            <!-- Disease Lesions & Spots Overlay -->
            ${spotsSVG}
        </g>
    </svg>`;

    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// Attach sample image dataURIs directly to each database record
Object.keys(DISEASE_DATABASE).forEach(key => {
    DISEASE_DATABASE[key].sampleImageUrl = generateLeafSVG(key);
});
