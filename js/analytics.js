/**
 * AgriScan AI - Analytics & Chart.js Engine
 * Generates and updates interactive charts for disease distribution, scan trends,
 * and crop health breakdowns.
 */

class AnalyticsEngine {
    constructor() {
        this.distributionChart = null;
        this.trendsChart = null;
        this.severityChart = null;
        this.initialized = false;
    }

    init() {
        if (!window.Chart) {
            console.warn('[AnalyticsEngine] Chart.js not loaded yet');
            return;
        }

        // Apply dark mode global Chart.js defaults
        Chart.defaults.color = '#94a3b8';
        Chart.defaults.font.family = "'Inter', system-ui, -apple-system, sans-serif";
        Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.07)';

        this.renderDistributionChart();
        this.renderTrendsChart();
        this.renderSeverityChart();
        this.initialized = true;

        // Auto subscribe to storage manager changes
        if (window.storageManager) {
            window.storageManager.subscribe(() => {
                this.updateAllCharts();
            });
        }
    }

    /**
     * Chart 1: Disease Type Distribution (Doughnut Chart)
     */
    renderDistributionChart() {
        const canvas = document.getElementById('chartDiseaseDist');
        if (!canvas) return;

        const data = this._computeDistributionData();

        this.distributionChart = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.counts,
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.85)', // Healthy (Emerald)
                        'rgba(244, 63, 94, 0.85)',  // Late Blight (Rose)
                        'rgba(245, 158, 11, 0.85)', // Rust (Amber)
                        'rgba(225, 29, 72, 0.85)',  // Apple Scab (Crimson)
                        'rgba(139, 92, 246, 0.85)', // Blast (Purple)
                        'rgba(6, 182, 212, 0.85)',  // Bacterial Spot (Cyan)
                        'rgba(132, 204, 22, 0.85)'  // Others (Lime)
                    ],
                    borderColor: '#0f172a',
                    borderWidth: 2,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '72%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 10,
                            boxHeight: 10,
                            borderRadius: 4,
                            usePointStyle: true,
                            padding: 14,
                            font: { size: 11 }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        borderColor: 'rgba(16, 185, 129, 0.3)',
                        borderWidth: 1,
                        padding: 10,
                        callbacks: {
                            label: function (ctx) {
                                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                const val = ctx.raw;
                                const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                                return ` ${ctx.label}: ${val} scans (${pct}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Chart 2: 7-Day Scan Volume & Health Ratio (Line/Area Chart)
     */
    renderTrendsChart() {
        const canvas = document.getElementById('chartScanTrends');
        if (!canvas) return;

        const trendsData = this._computeTrendsData();

        this.trendsChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: trendsData.labels,
                datasets: [
                    {
                        label: 'Total Scans',
                        data: trendsData.totalScans,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        fill: true,
                        tension: 0.38,
                        pointBackgroundColor: '#10b981',
                        pointBorderColor: '#0f172a',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Diseased Plants',
                        data: trendsData.diseasedScans,
                        borderColor: '#f43f5e',
                        backgroundColor: 'rgba(244, 63, 94, 0.08)',
                        fill: true,
                        borderDash: [4, 4],
                        tension: 0.38,
                        pointBackgroundColor: '#f43f5e',
                        pointBorderColor: '#0f172a',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 11 } }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { stepSize: 1, font: { size: 11 } }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'end',
                        labels: {
                            boxWidth: 10,
                            usePointStyle: true,
                            padding: 12,
                            font: { size: 11 }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                        borderWidth: 1,
                        padding: 10
                    }
                }
            }
        });
    }

    /**
     * Chart 3: Crop Severity Breakdown (Stacked Bar Chart)
     */
    renderSeverityChart() {
        const canvas = document.getElementById('chartCropSeverity');
        if (!canvas) return;

        const sevData = this._computeSeverityData();

        this.severityChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: sevData.crops,
                datasets: [
                    {
                        label: 'Healthy',
                        data: sevData.healthy,
                        backgroundColor: 'rgba(16, 185, 129, 0.85)',
                        borderRadius: 4
                    },
                    {
                        label: 'Mild',
                        data: sevData.mild,
                        backgroundColor: 'rgba(245, 158, 11, 0.85)',
                        borderRadius: 4
                    },
                    {
                        label: 'Critical',
                        data: sevData.critical,
                        backgroundColor: 'rgba(244, 63, 94, 0.85)',
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true,
                        grid: { display: false },
                        ticks: { font: { size: 11 } }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { stepSize: 1, font: { size: 11 } }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'end',
                        labels: {
                            boxWidth: 10,
                            usePointStyle: true,
                            padding: 12,
                            font: { size: 11 }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                        borderWidth: 1,
                        padding: 10
                    }
                }
            }
        });
    }

    /**
     * Update all charts with latest storage records
     */
    updateAllCharts() {
        if (!this.initialized) return;

        if (this.distributionChart) {
            const distData = this._computeDistributionData();
            this.distributionChart.data.labels = distData.labels;
            this.distributionChart.data.datasets[0].data = distData.counts;
            this.distributionChart.update();
        }

        if (this.trendsChart) {
            const trendsData = this._computeTrendsData();
            this.trendsChart.data.labels = trendsData.labels;
            this.trendsChart.data.datasets[0].data = trendsData.totalScans;
            this.trendsChart.data.datasets[1].data = trendsData.diseasedScans;
            this.trendsChart.update();
        }

        if (this.severityChart) {
            const sevData = this._computeSeverityData();
            this.severityChart.data.labels = sevData.crops;
            this.severityChart.data.datasets[0].data = sevData.healthy;
            this.severityChart.data.datasets[1].data = sevData.mild;
            this.severityChart.data.datasets[2].data = sevData.critical;
            this.severityChart.update();
        }
    }

    _computeDistributionData() {
        const records = window.storageManager ? window.storageManager.getAll() : [];
        const map = {};

        records.forEach(r => {
            const label = r.diseaseName === 'Healthy Foliage' ? 'Healthy Leaf' : r.diseaseName;
            map[label] = (map[label] || 0) + 1;
        });

        const labels = Object.keys(map);
        const counts = Object.values(map);

        if (labels.length === 0) {
            return { labels: ['No scans yet'], counts: [1] };
        }

        return { labels, counts };
    }

    _computeTrendsData() {
        const records = window.storageManager ? window.storageManager.getAll() : [];
        const daysMap = {};
        const now = new Date();

        // Build last 7 days keys
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            daysMap[key] = { total: 0, diseased: 0 };
        }

        records.forEach(r => {
            const d = new Date(r.timestamp);
            const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (daysMap[key]) {
                daysMap[key].total++;
                if (r.severity !== 'Healthy') {
                    daysMap[key].diseased++;
                }
            }
        });

        const labels = Object.keys(daysMap);
        const totalScans = labels.map(k => daysMap[k].total);
        const diseasedScans = labels.map(k => daysMap[k].diseased);

        return { labels, totalScans, diseasedScans };
    }

    _computeSeverityData() {
        const records = window.storageManager ? window.storageManager.getAll() : [];
        const cropMap = {};

        records.forEach(r => {
            const cropName = r.crop.split('/')[0].trim();
            if (!cropMap[cropName]) {
                cropMap[cropName] = { healthy: 0, mild: 0, critical: 0 };
            }
            if (r.severity === 'Healthy') {
                cropMap[cropName].healthy++;
            } else if (r.severity === 'Mild') {
                cropMap[cropName].mild++;
            } else if (r.severity === 'Critical') {
                cropMap[cropName].critical++;
            }
        });

        const crops = Object.keys(cropMap);
        if (crops.length === 0) {
            return {
                crops: ['Tomato', 'Corn', 'Apple', 'Rice'],
                healthy: [0, 0, 0, 0],
                mild: [0, 0, 0, 0],
                critical: [0, 0, 0, 0]
            };
        }

        const healthy = crops.map(c => cropMap[c].healthy);
        const mild = crops.map(c => cropMap[c].mild);
        const critical = crops.map(c => cropMap[c].critical);

        return { crops, healthy, mild, critical };
    }
}

window.analyticsEngine = new AnalyticsEngine();
