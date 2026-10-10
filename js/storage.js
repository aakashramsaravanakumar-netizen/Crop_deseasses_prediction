/**
 * AgriScan AI - Storage & Record Persistence Engine
 * Manages LocalStorage scan history, default seed data, filtering, metrics computation,
 * and export utilities (CSV / JSON).
 */

const STORAGE_KEY = 'agriscan_prediction_history_v1';

class StorageManager {
    constructor() {
        this.records = [];
        this.listeners = [];
        this.init();
    }

    init() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                this.records = JSON.parse(raw);
            } else {
                // Seed initial realistic history for immediate rich dashboard experience
                this.records = this._getSeedData();
                this._persist();
            }
        } catch (e) {
            console.warn('[StorageManager] Error reading LocalStorage:', e);
            this.records = this._getSeedData();
        }
    }

    _persist() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.records));
        } catch (e) {
            console.error('[StorageManager] LocalStorage quota or write error:', e);
        }
        this._notifyListeners();
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    _notifyListeners() {
        this.listeners.forEach(cb => cb(this.records));
    }

    getAll() {
        return [...this.records];
    }

    /**
     * Add new prediction scan
     */
    addScan(prediction, thumbnailDataUrl) {
        const id = 'SCAN-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
        
        const newRecord = {
            id: id,
            timestamp: new Date().toISOString(),
            crop: prediction.crop,
            diseaseName: prediction.diseaseName,
            botanicalName: prediction.botanicalName,
            scientificName: prediction.scientificName,
            severity: prediction.severity,
            confidence: prediction.confidence,
            pathogen: prediction.pathogen,
            symptoms: prediction.symptoms,
            treatments: prediction.treatments,
            lesionCoverage: prediction.lesionCoverage || 'N/A',
            chlorosisIndex: prediction.chlorosisIndex || 'N/A',
            tissueViability: prediction.tissueViability || 'N/A',
            topPredictions: prediction.topPredictions || [],
            thumbnail: thumbnailDataUrl || prediction.sampleImageUrl || ''
        };

        // Add to beginning of array
        this.records.unshift(newRecord);
        this._persist();
        return newRecord;
    }

    deleteScan(id) {
        this.records = this.records.filter(r => r.id !== id);
        this._persist();
    }

    clearAll() {
        this.records = [];
        this._persist();
    }

    getScanById(id) {
        return this.records.find(r => r.id === id) || null;
    }

    /**
     * Filter & search scans
     */
    queryRecords({ search = '', severity = 'ALL', crop = 'ALL' } = {}) {
        let list = [...this.records];

        if (severity && severity !== 'ALL') {
            list = list.filter(r => r.severity.toLowerCase() === severity.toLowerCase());
        }

        if (crop && crop !== 'ALL') {
            list = list.filter(r => r.crop.toLowerCase().includes(crop.toLowerCase()));
        }

        if (search && search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter(r => 
                r.crop.toLowerCase().includes(q) ||
                r.diseaseName.toLowerCase().includes(q) ||
                (r.pathogen && r.pathogen.toLowerCase().includes(q)) ||
                (r.id && r.id.toLowerCase().includes(q))
            );
        }

        return list;
    }

    /**
     * Calculate summary metrics
     */
    getSummaryMetrics() {
        const total = this.records.length;
        if (total === 0) {
            return {
                totalScans: 0,
                diseasedCount: 0,
                healthyCount: 0,
                healthyRate: 0,
                criticalCount: 0,
                mildCount: 0,
                avgConfidence: 0
            };
        }

        let diseased = 0;
        let healthy = 0;
        let critical = 0;
        let mild = 0;
        let sumConf = 0;

        this.records.forEach(r => {
            sumConf += (r.confidence || 90);
            if (r.severity === 'Healthy') {
                healthy++;
            } else {
                diseased++;
                if (r.severity === 'Critical') critical++;
                if (r.severity === 'Mild') mild++;
            }
        });

        const healthyRate = Math.round((healthy / total) * 100);
        const avgConfidence = parseFloat((sumConf / total).toFixed(1));

        return {
            totalScans: total,
            diseasedCount: diseased,
            healthyCount: healthy,
            healthyRate: healthyRate,
            criticalCount: critical,
            mildCount: mild,
            avgConfidence: avgConfidence
        };
    }

    /**
     * Export all records as CSV file
     */
    exportCSV() {
        if (!this.records.length) return false;

        const headers = ['Scan ID', 'Timestamp', 'Crop', 'Diagnosis', 'Severity', 'Confidence (%)', 'Pathogen', 'Lesion Coverage'];
        const rows = this.records.map(r => [
            `"${r.id}"`,
            `"${new Date(r.timestamp).toLocaleString()}"`,
            `"${r.crop}"`,
            `"${r.diseaseName}"`,
            `"${r.severity}"`,
            r.confidence,
            `"${(r.pathogen || '').replace(/"/g, '""')}"`,
            `"${r.lesionCoverage || ''}"`
        ]);

        const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        this._downloadFile(csvContent, `agriscan_log_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
        return true;
    }

    /**
     * Export all records as JSON file
     */
    exportJSON() {
        if (!this.records.length) return false;
        const jsonContent = JSON.stringify(this.records, null, 2);
        this._downloadFile(jsonContent, `agriscan_log_${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
        return true;
    }

    _downloadFile(content, fileName, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    _getSeedData() {
        const now = Date.now();
        const hour = 3600 * 1000;
        const day = 24 * hour;

        return [
            {
                id: 'SCAN-CROP901',
                timestamp: new Date(now - 25 * 60 * 1000).toISOString(),
                crop: 'Tomato',
                diseaseName: 'Late Blight',
                botanicalName: 'Solanum lycopersicum',
                scientificName: 'Phytophthora infestans',
                pathogen: 'Oomycete (Fungal-like Protist)',
                severity: 'Critical',
                confidence: 96.8,
                symptoms: DISEASE_DATABASE['tomato_late_blight'].symptoms,
                treatments: DISEASE_DATABASE['tomato_late_blight'].treatments,
                lesionCoverage: '42%',
                chlorosisIndex: 'High (0.78)',
                tissueViability: 'Poor (38%)',
                topPredictions: [
                    { disease: 'Tomato - Late Blight', probability: 96.8, isPrimary: true },
                    { disease: 'Tomato Early Blight', probability: 2.4, isPrimary: false },
                    { disease: 'Septoria Leaf Spot', probability: 0.8, isPrimary: false }
                ],
                thumbnail: DISEASE_DATABASE['tomato_late_blight'].sampleImageUrl
            },
            {
                id: 'SCAN-CROP902',
                timestamp: new Date(now - 3 * hour).toISOString(),
                crop: 'Corn (Maize)',
                diseaseName: 'Common Rust',
                botanicalName: 'Zea mays',
                scientificName: 'Puccinia sorghi',
                pathogen: 'Fungus (Basidiomycota)',
                severity: 'Mild',
                confidence: 95.5,
                symptoms: DISEASE_DATABASE['corn_common_rust'].symptoms,
                treatments: DISEASE_DATABASE['corn_common_rust'].treatments,
                lesionCoverage: '21%',
                chlorosisIndex: 'Moderate (0.48)',
                tissueViability: 'Good (72%)',
                topPredictions: [
                    { disease: 'Corn - Common Rust', probability: 95.5, isPrimary: true },
                    { disease: 'Southern Rust', probability: 3.2, isPrimary: false },
                    { disease: 'Northern Corn Blight', probability: 1.3, isPrimary: false }
                ],
                thumbnail: DISEASE_DATABASE['corn_common_rust'].sampleImageUrl
            },
            {
                id: 'SCAN-CROP903',
                timestamp: new Date(now - 6 * hour).toISOString(),
                crop: 'Tomato / Crop General',
                diseaseName: 'Healthy Foliage',
                botanicalName: 'Solanum lycopersicum (Healthy)',
                scientificName: 'Non-Pathogenic / Vigorous',
                pathogen: 'None (Optimal Plant Health)',
                severity: 'Healthy',
                confidence: 99.4,
                symptoms: DISEASE_DATABASE['healthy_crop_leaf'].symptoms,
                treatments: DISEASE_DATABASE['healthy_crop_leaf'].treatments,
                lesionCoverage: '0%',
                chlorosisIndex: 'Nominal (0.04)',
                tissueViability: 'Optimal (98%)',
                topPredictions: [
                    { disease: 'Tomato - Healthy Foliage', probability: 99.4, isPrimary: true },
                    { disease: 'Minor Sun Scald', probability: 0.4, isPrimary: false },
                    { disease: 'Early Chlorosis', probability: 0.2, isPrimary: false }
                ],
                thumbnail: DISEASE_DATABASE['healthy_crop_leaf'].sampleImageUrl
            },
            {
                id: 'SCAN-CROP904',
                timestamp: new Date(now - 1 * day).toISOString(),
                crop: 'Apple',
                diseaseName: 'Apple Scab',
                botanicalName: 'Malus domestica',
                scientificName: 'Venturia inaequalis',
                pathogen: 'Fungus (Ascomycota)',
                severity: 'Critical',
                confidence: 97.4,
                symptoms: DISEASE_DATABASE['apple_scab'].symptoms,
                treatments: DISEASE_DATABASE['apple_scab'].treatments,
                lesionCoverage: '35%',
                chlorosisIndex: 'High (0.72)',
                tissueViability: 'Poor (45%)',
                topPredictions: [
                    { disease: 'Apple - Apple Scab', probability: 97.4, isPrimary: true },
                    { disease: 'Cedar Apple Rust', probability: 1.8, isPrimary: false },
                    { disease: 'Frogeye Leaf Spot', probability: 0.8, isPrimary: false }
                ],
                thumbnail: DISEASE_DATABASE['apple_scab'].sampleImageUrl
            },
            {
                id: 'SCAN-CROP905',
                timestamp: new Date(now - 2 * day).toISOString(),
                crop: 'Rice (Paddy)',
                diseaseName: 'Rice Leaf Blast',
                botanicalName: 'Oryza sativa',
                scientificName: 'Magnaporthe oryzae',
                pathogen: 'Fungus (Ascomycota)',
                severity: 'Critical',
                confidence: 98.1,
                symptoms: DISEASE_DATABASE['rice_leaf_blast'].symptoms,
                treatments: DISEASE_DATABASE['rice_leaf_blast'].treatments,
                lesionCoverage: '48%',
                chlorosisIndex: 'Very High (0.85)',
                tissueViability: 'Critical (29%)',
                topPredictions: [
                    { disease: 'Rice - Leaf Blast', probability: 98.1, isPrimary: true },
                    { disease: 'Brown Leaf Spot', probability: 1.2, isPrimary: false },
                    { disease: 'Bacterial Blight', probability: 0.7, isPrimary: false }
                ],
                thumbnail: DISEASE_DATABASE['rice_leaf_blast'].sampleImageUrl
            },
            {
                id: 'SCAN-CROP906',
                timestamp: new Date(now - 3 * day).toISOString(),
                crop: 'Bell Pepper',
                diseaseName: 'Bacterial Spot',
                botanicalName: 'Capsicum annuum',
                scientificName: 'Xanthomonas vesicatoria',
                pathogen: 'Bacterium (Gammaproteobacteria)',
                severity: 'Mild',
                confidence: 92.7,
                symptoms: DISEASE_DATABASE['pepper_bacterial_spot'].symptoms,
                treatments: DISEASE_DATABASE['pepper_bacterial_spot'].treatments,
                lesionCoverage: '23%',
                chlorosisIndex: 'Moderate (0.51)',
                tissueViability: 'Moderate (68%)',
                topPredictions: [
                    { disease: 'Pepper - Bacterial Spot', probability: 92.7, isPrimary: true },
                    { disease: 'Cercospora Spot', probability: 4.8, isPrimary: false },
                    { disease: 'Phytophthora Blight', probability: 2.5, isPrimary: false }
                ],
                thumbnail: DISEASE_DATABASE['pepper_bacterial_spot'].sampleImageUrl
            },
            {
                id: 'SCAN-CROP907',
                timestamp: new Date(now - 4 * day).toISOString(),
                crop: 'Tomato / Crop General',
                diseaseName: 'Healthy Foliage',
                botanicalName: 'Solanum lycopersicum (Healthy)',
                scientificName: 'Non-Pathogenic / Vigorous',
                pathogen: 'None (Optimal Plant Health)',
                severity: 'Healthy',
                confidence: 98.9,
                symptoms: DISEASE_DATABASE['healthy_crop_leaf'].symptoms,
                treatments: DISEASE_DATABASE['healthy_crop_leaf'].treatments,
                lesionCoverage: '0%',
                chlorosisIndex: 'Nominal (0.02)',
                tissueViability: 'Optimal (99%)',
                topPredictions: [
                    { disease: 'Tomato - Healthy Foliage', probability: 98.9, isPrimary: true }
                ],
                thumbnail: DISEASE_DATABASE['healthy_crop_leaf'].sampleImageUrl
            }
        ];
    }
}

window.storageManager = new StorageManager();
