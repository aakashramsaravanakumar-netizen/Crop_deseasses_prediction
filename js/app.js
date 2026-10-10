/**
 * AgriScan AI - Main Application Controller
 * Handles UI interactions, scanner HUD state, diagnostic rendering,
 * gauge animations, sound synthesis, records table, and modals.
 */

document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // 1. Audio Feedback Synthesizer (Zero-dependency Web Audio API)
    // =========================================================================
    class SoundFx {
        constructor() {
            this.ctx = null;
        }

        _ensureCtx() {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) this.ctx = new AudioCtx();
            }
        }

        playShutter() {
            try {
                this._ensureCtx();
                if (!this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, this.ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.08);
                gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.08);
            } catch (e) { }
        }

        playBeep(freq = 600, duration = 0.1) {
            try {
                this._ensureCtx();
                if (!this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + duration);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + duration);
            } catch (e) { }
        }
    }
    const sfx = new SoundFx();

    // =========================================================================
    // 2. DOM Elements Cache
    // =========================================================================
    const elements = {
        // Scanner
        scannerViewport: document.getElementById('scannerViewport'),
        webcamVideo: document.getElementById('webcamVideo'),
        leafPreviewImage: document.getElementById('leafPreviewImage'),
        snapshotCanvas: document.getElementById('snapshotCanvas'),
        cameraFlash: document.getElementById('cameraFlash'),
        scannerLaser: document.getElementById('scannerLaser'),
        scanningProgressOverlay: document.getElementById('scanningProgressOverlay'),
        scanningStageLabel: document.getElementById('scanningStageLabel'),
        scanningProgressBar: document.getElementById('scanningProgressBar'),
        btnCaptureAnalyze: document.getElementById('btnCaptureAnalyze'),
        btnCaptureText: document.getElementById('btnCaptureText'),
        btnSwitchCamera: document.getElementById('btnSwitchCamera'),
        btnToggleTorch: document.getElementById('btnToggleTorch'),
        btnToggleStream: document.getElementById('btnToggleStream'),
        btnTriggerUpload: document.getElementById('btnTriggerUpload'),
        fileLeafInput: document.getElementById('fileLeafInput'),
        dropZoneContainer: document.getElementById('dropZoneContainer'),
        scannerModeBadge: document.getElementById('scannerModeBadge'),

        // Diagnostic Output
        diagStandbyCard: document.getElementById('diagStandbyCard'),
        diagResultCard: document.getElementById('diagResultCard'),
        diagCropBadge: document.getElementById('diagCropBadge'),
        diagScientificName: document.getElementById('diagScientificName'),
        diagDiseaseName: document.getElementById('diagDiseaseName'),
        diagPathogenLabel: document.getElementById('diagPathogenLabel'),
        diagSeverityBadge: document.getElementById('diagSeverityBadge'),
        diagSeverityText: document.getElementById('diagSeverityText'),
        diagInferenceTime: document.getElementById('diagInferenceTime'),
        diagGaugeArc: document.getElementById('diagGaugeArc'),
        diagConfidenceValue: document.getElementById('diagConfidenceValue'),
        diagLesionCoverage: document.getElementById('diagLesionCoverage'),
        diagChlorosisIndex: document.getElementById('diagChlorosisIndex'),
        diagViability: document.getElementById('diagViability'),
        diagTopProbabilities: document.getElementById('diagTopProbabilities'),
        diagSymptomsText: document.getElementById('diagSymptomsText'),
        btnQuickDemoScan: document.getElementById('btnQuickDemoScan'),
        btnExportReportPDF: document.getElementById('btnExportReportPDF'),
        btnShareDiagnosis: document.getElementById('btnShareDiagnosis'),
        btnRetakeScan: document.getElementById('btnRetakeScan'),
        btnSaveToLog: document.getElementById('btnSaveToLog'),

        // Stat Counters
        statTotalScans: document.getElementById('statTotalScans'),
        statHealthyRate: document.getElementById('statHealthyRate'),
        statDiseasedCount: document.getElementById('statDiseasedCount'),
        statCriticalCount: document.getElementById('statCriticalCount'),

        // Records Table
        tableRecordsBody: document.getElementById('tableRecordsBody'),
        inputSearchRecords: document.getElementById('inputSearchRecords'),
        selectFilterSeverity: document.getElementById('selectFilterSeverity'),
        selectFilterCrop: document.getElementById('selectFilterCrop'),
        lblVisibleRecordsCount: document.getElementById('lblVisibleRecordsCount'),
        btnExportCSV: document.getElementById('btnExportCSV'),
        btnExportJSON: document.getElementById('btnExportJSON'),
        btnClearHistory: document.getElementById('btnClearHistory'),

        // Modals
        modalReport: document.getElementById('modalReport'),
        modalReportTitle: document.getElementById('modalReportTitle'),
        modalReportContent: document.getElementById('modalReportContent'),
        btnCloseReportModal: document.getElementById('btnCloseReportModal'),
        btnCloseReportModalBtn: document.getElementById('btnCloseReportModalBtn'),
        modalSettings: document.getElementById('modalSettings'),
        btnOpenSettings: document.getElementById('btnOpenSettings'),
        btnCloseSettingsModal: document.getElementById('btnCloseSettingsModal'),
        btnSaveSettings: document.getElementById('btnSaveSettings'),
        inputApiUrl: document.getElementById('inputApiUrl'),
        btnTestApiConnection: document.getElementById('btnTestApiConnection'),
        lblApiPingResult: document.getElementById('lblApiPingResult'),
        headerModelStatus: document.getElementById('headerModelStatus')
    };

    let latestPrediction = null;
    let latestThumbnail = null;
    let isAnalyzing = false;

    // =========================================================================
    // 3. Initialize Camera & Presets
    // =========================================================================
    window.cameraManager.init({
        videoEl: elements.webcamVideo,
        previewImgEl: elements.leafPreviewImage,
        canvasEl: elements.snapshotCanvas,
        onStreamReady: () => {
            elements.scannerModeBadge.textContent = 'WEBCAM LIVE';
            elements.scannerModeBadge.className = 'px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-mono text-[10px]';
        },
        onError: (errMsg) => {
            showToast(errMsg, 'info');
            elements.scannerModeBadge.textContent = 'SAMPLE PRESET MODE';
            elements.scannerModeBadge.className = 'px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-500/30 text-amber-300 font-mono text-[10px]';
            // Auto load sample preset so camera failure never leaves an empty screen
            window.cameraManager.loadSamplePreset('tomato_late_blight');
        }
    });

    // Preset Chip Buttons
    document.querySelectorAll('.sample-chip').forEach(btn => {
        btn.addEventListener('click', () => {
            const sampleId = btn.getAttribute('data-sample');
            window.cameraManager.loadSamplePreset(sampleId);
            elements.scannerModeBadge.textContent = `PRESET: ${sampleId.replace(/_/g, ' ').toUpperCase()}`;
            showToast(`Loaded sample leaf: ${btn.querySelector('div:first-child').textContent.trim()}`, 'success');
            sfx.playBeep(520, 0.05);
        });
    });

    // File Upload handling
    elements.btnTriggerUpload.addEventListener('click', () => {
        elements.fileLeafInput.click();
    });

    elements.fileLeafInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                await window.cameraManager.loadImageFile(file);
                elements.scannerModeBadge.textContent = 'FILE LOADED';
                showToast(`Image loaded: ${file.name}`, 'success');
                sfx.playBeep(650, 0.08);
            } catch (err) {
                showToast(err.message, 'error');
            }
        }
    });

    // Drag and Drop Zone
    const dropZone = elements.dropZoneContainer;
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
        });
    });

    dropZone.addEventListener('drop', async (e) => {
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            try {
                await window.cameraManager.loadImageFile(files[0]);
                elements.scannerModeBadge.textContent = 'FILE DROPPED';
                showToast(`Image loaded: ${files[0].name}`, 'success');
                sfx.playBeep(650, 0.08);
            } catch (err) {
                showToast(err.message, 'error');
            }
        }
    });

    dropZone.addEventListener('click', () => {
        elements.fileLeafInput.click();
    });

    // Camera Flip / Switch
    elements.btnSwitchCamera.addEventListener('click', async () => {
        const success = await window.cameraManager.flipCamera();
        if (success) {
            showToast('Camera flipped successfully.', 'info');
        }
    });

    // Toggle Torch
    elements.btnToggleTorch.addEventListener('click', async () => {
        const isOn = await window.cameraManager.toggleTorch();
        showToast(isOn ? 'Flashlight ON' : 'Torch toggle unavailable on this camera', isOn ? 'success' : 'info');
    });

    // Toggle Webcam
    elements.btnToggleStream.addEventListener('click', async () => {
        if (window.cameraManager.isStreaming) {
            window.cameraManager.stopCamera();
            window.cameraManager.loadSamplePreset('tomato_late_blight');
            elements.scannerModeBadge.textContent = 'CAMERA PAUSED';
            showToast('Webcam stream paused.', 'info');
        } else {
            await window.cameraManager.startCamera();
        }
    });

    // =========================================================================
    // 4. Capture & Analyze Workflow
    // =========================================================================
    async function triggerCaptureAndAnalysis() {
        if (isAnalyzing) return;
        isAnalyzing = true;

        // Visual shutter flash effect & audio click
        elements.cameraFlash.classList.add('flashing');
        sfx.playShutter();
        setTimeout(() => {
            elements.cameraFlash.classList.remove('flashing');
        }, 80);

        // Turn on laser scan HUD
        elements.scannerViewport.classList.add('scanner-active');
        elements.scanningProgressOverlay.classList.remove('hidden');
        elements.btnCaptureAnalyze.disabled = true;
        elements.btnCaptureText.textContent = 'Analyzing Leaf...';

        try {
            // Grab current frame
            const frameData = window.cameraManager.captureCurrentFrame();
            latestThumbnail = frameData.dataUrl;

            // Run Prediction Service with live progress updates
            const prediction = await window.modelService.predict(
                frameData.sourceElement,
                (stageName, percent) => {
                    elements.scanningStageLabel.textContent = stageName;
                    elements.scanningProgressBar.style.width = `${percent}%`;
                    sfx.playBeep(400 + percent * 4, 0.03);
                },
                frameData.sampleHintId
            );

            latestPrediction = prediction;

            // Render Results
            renderDiagnosticResult(prediction);

            // Automatically persist to LocalStorage
            window.storageManager.addScan(prediction, latestThumbnail);

            // Success sound
            sfx.playBeep(780, 0.15);
            showToast(`Diagnosis Complete: ${prediction.crop} - ${prediction.diseaseName}`, 'success');

            // Scroll slightly on mobile if needed
            if (window.innerWidth < 1024) {
                elements.diagResultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }

        } catch (error) {
            console.error('Analysis error:', error);
            showToast(`Analysis failed: ${error.message}`, 'error');
        } finally {
            isAnalyzing = false;
            elements.scannerViewport.classList.remove('scanner-active');
            elements.scanningProgressOverlay.classList.add('hidden');
            elements.btnCaptureAnalyze.disabled = false;
            elements.btnCaptureText.textContent = 'Capture & Analyze Foliage';
        }
    }

    elements.btnCaptureAnalyze.addEventListener('click', triggerCaptureAndAnalysis);

    // Keyboard Spacebar trigger
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && e.target === document.body) {
            e.preventDefault();
            triggerCaptureAndAnalysis();
        }
    });

    elements.btnQuickDemoScan.addEventListener('click', () => {
        window.cameraManager.loadSamplePreset('tomato_late_blight');
        triggerCaptureAndAnalysis();
    });

    elements.btnRetakeScan.addEventListener('click', () => {
        elements.diagResultCard.classList.add('hidden');
        elements.diagStandbyCard.classList.remove('hidden');
        elements.scannerViewport.scrollIntoView({ behavior: 'smooth' });
    });

    // =========================================================================
    // 5. Diagnostic Output Panel Renderer
    // =========================================================================
    function renderDiagnosticResult(prediction) {
        elements.diagStandbyCard.classList.add('hidden');
        elements.diagResultCard.classList.remove('hidden');

        // Text & Header
        elements.diagCropBadge.textContent = prediction.crop;
        elements.diagScientificName.textContent = prediction.botanicalName || '';
        elements.diagDiseaseName.textContent = prediction.diseaseName;
        elements.diagPathogenLabel.innerHTML = `Pathogen: <span class="text-teal-400 font-semibold">${prediction.pathogen}</span>`;
        elements.diagInferenceTime.textContent = `Latency: ${prediction.inferenceTimeMs || 120}ms (${prediction.backendUsed || 'Edge'})`;
        elements.diagSymptomsText.textContent = prediction.symptoms;

        // Biophysical metrics
        elements.diagLesionCoverage.textContent = prediction.lesionCoverage || '15%';
        elements.diagChlorosisIndex.textContent = prediction.chlorosisIndex || '0.45';
        elements.diagViability.textContent = prediction.tissueViability || '80%';

        // Severity Badge Styling
        const severity = prediction.severity;
        elements.diagSeverityBadge.className = 'px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ';
        if (severity === 'Healthy') {
            elements.diagSeverityBadge.classList.add('severity-badge-healthy');
            elements.diagSeverityBadge.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>Optimal Health</span>`;
        } else if (severity === 'Mild') {
            elements.diagSeverityBadge.classList.add('severity-badge-mild');
            elements.diagSeverityBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> <span>Mild Severity</span>`;
        } else {
            elements.diagSeverityBadge.classList.add('severity-badge-critical');
            elements.diagSeverityBadge.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> <span>Critical Severity</span>`;
        }

        // Circular SVG Gauge Animation
        const circumference = 2 * Math.PI * 50; // ~314.159
        const confidence = prediction.confidence || 95;
        const offset = circumference - (confidence / 100) * circumference;

        // Reset first for smooth replay
        elements.diagGaugeArc.style.strokeDasharray = `${circumference}`;
        elements.diagGaugeArc.style.strokeDashoffset = `${circumference}`;

        // Color based on severity / confidence
        if (severity === 'Healthy') {
            elements.diagGaugeArc.style.stroke = '#10b981';
        } else if (severity === 'Mild') {
            elements.diagGaugeArc.style.stroke = '#f59e0b';
        } else {
            elements.diagGaugeArc.style.stroke = '#f43f5e';
        }

        setTimeout(() => {
            elements.diagGaugeArc.style.strokeDashoffset = `${offset}`;
        }, 50);

        elements.diagConfidenceValue.textContent = `${confidence}%`;

        // Differential Probabilities
        elements.diagTopProbabilities.innerHTML = '';
        if (prediction.topPredictions && prediction.topPredictions.length > 0) {
            prediction.topPredictions.forEach(item => {
                const row = document.createElement('div');
                row.className = 'space-y-0.5';
                const isPrimary = item.isPrimary;
                const barColor = isPrimary ? (severity === 'Healthy' ? 'bg-emerald-400' : (severity === 'Mild' ? 'bg-amber-400' : 'bg-rose-400')) : 'bg-slate-600';

                row.innerHTML = `
                    <div class="flex justify-between text-[11px]">
                        <span class="${isPrimary ? 'text-white font-semibold' : 'text-slate-400'} truncate">${item.disease}</span>
                        <span class="font-mono ${isPrimary ? 'text-emerald-300 font-bold' : 'text-slate-400'}">${item.probability}%</span>
                    </div>
                    <div class="w-full bg-forest-900 rounded-full h-1 overflow-hidden">
                        <div class="${barColor} h-full rounded-full transition-all duration-700" style="width: ${Math.min(100, item.probability)}%"></div>
                    </div>
                `;
                elements.diagTopProbabilities.appendChild(row);
            });
        }

        // Treatment & Remedies lists
        renderRemediesList('listTriageRemedies', prediction.treatments?.triage, 'fa-triangle-exclamation text-rose-400');
        renderRemediesList('listOrganicRemedies', prediction.treatments?.organic, 'fa-seedling text-lime-400');
        renderRemediesList('listChemicalRemedies', prediction.treatments?.chemical, 'fa-flask text-cyan-400');
        renderRemediesList('listPreventionRemedies', prediction.treatments?.prevention, 'fa-shield-halved text-emerald-400');
    }

    function renderRemediesList(elementId, items, iconClass) {
        const el = document.getElementById(elementId);
        if (!el) return;
        el.innerHTML = '';
        if (!items || items.length === 0) {
            el.innerHTML = '<li class="text-slate-500 italic">No specific actions required.</li>';
            return;
        }

        items.forEach((txt, idx) => {
            const li = document.createElement('li');
            li.className = 'flex items-start gap-2.5 p-2 rounded-lg bg-forest-900/60 border border-white/5';
            li.innerHTML = `
                <i class="fa-solid ${iconClass} text-xs mt-0.5 shrink-0"></i>
                <span class="text-slate-200">${txt}</span>
            `;
            el.appendChild(li);
        });
    }

    // Treatment Tab Switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));

            btn.classList.add('active');
            const targetId = 'tabContent' + btn.getAttribute('data-tab').charAt(0).toUpperCase() + btn.getAttribute('data-tab').slice(1);
            const targetPane = document.getElementById(targetId);
            if (targetPane) {
                targetPane.classList.remove('hidden');
            }
            sfx.playBeep(480, 0.04);
        });
    });

    // Save to Log button
    elements.btnSaveToLog.addEventListener('click', () => {
        showToast('Record is automatically safely stored in LocalStorage.', 'info');
    });

    // Share Diagnosis
    elements.btnShareDiagnosis.addEventListener('click', async () => {
        if (!latestPrediction) return;
        const text = `AgriScan AI Diagnosis: ${latestPrediction.crop} - ${latestPrediction.diseaseName} (${latestPrediction.confidence}% confidence). Pathogen: ${latestPrediction.pathogen}.`;
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
            showToast('Diagnosis summary copied to clipboard!', 'success');
        } else {
            showToast(text, 'info');
        }
    });

    // Export PDF Report
    elements.btnExportReportPDF.addEventListener('click', () => {
        if (!latestPrediction) return;
        window.print();
    });

    // =========================================================================
    // 6. Historical Scan Repository & Data Table
    // =========================================================================
    function renderScanTable(records = null) {
        const list = records !== null ? records : window.storageManager.queryRecords({
            search: elements.inputSearchRecords.value,
            severity: elements.selectFilterSeverity.value,
            crop: elements.selectFilterCrop.value
        });

        elements.tableRecordsBody.innerHTML = '';
        elements.lblVisibleRecordsCount.textContent = list.length;

        if (list.length === 0) {
            elements.tableRecordsBody.innerHTML = `
                <tr>
                    <td colspan="6" class="py-8 text-center text-slate-500 font-mono">
                        <i class="fa-solid fa-folder-open text-2xl mb-2 block opacity-40"></i>
                        No matching scan records found.
                    </td>
                </tr>
            `;
            return;
        }

        list.forEach(item => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-forest-800/40 transition-colors group';

            const severityBadge = item.severity === 'Healthy'
                ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Healthy</span>'
                : item.severity === 'Mild'
                    ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">Mild</span>'
                    : '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">Critical</span>';

            const formattedDate = new Date(item.timestamp).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            tr.innerHTML = `
                <td class="py-3 px-4">
                    <img src="${item.thumbnail}" alt="Leaf" class="w-10 h-10 object-cover rounded-lg border border-white/10 bg-forest-950">
                </td>
                <td class="py-3 px-4">
                    <div class="font-mono font-bold text-white text-[11px]">${item.id}</div>
                    <div class="text-[10px] text-slate-400">${formattedDate}</div>
                </td>
                <td class="py-3 px-4">
                    <div class="font-semibold text-white">${item.crop}</div>
                    <div class="text-[11px] text-emerald-400">${item.diseaseName}</div>
                </td>
                <td class="py-3 px-4">
                    ${severityBadge}
                </td>
                <td class="py-3 px-4 font-mono font-bold text-slate-200">
                    ${item.confidence}%
                </td>
                <td class="py-3 px-4 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                        <button data-view-id="${item.id}" title="View Full Report" class="btn-view-scan w-7 h-7 rounded-lg bg-forest-800 hover:bg-forest-700 text-slate-300 hover:text-emerald-400 flex items-center justify-center transition-all">
                            <i class="fa-solid fa-eye text-xs"></i>
                        </button>
                        <button data-delete-id="${item.id}" title="Delete Record" class="btn-delete-scan w-7 h-7 rounded-lg bg-rose-950/40 hover:bg-rose-900 text-rose-300 hover:text-white flex items-center justify-center transition-all">
                            <i class="fa-solid fa-trash text-xs"></i>
                        </button>
                    </div>
                </td>
            `;

            elements.tableRecordsBody.appendChild(tr);
        });

        // Attach action handlers
        elements.tableRecordsBody.querySelectorAll('.btn-view-scan').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-view-id');
                const scan = window.storageManager.getScanById(id);
                if (scan) openReportModal(scan);
            });
        });

        elements.tableRecordsBody.querySelectorAll('.btn-delete-scan').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-delete-id');
                window.storageManager.deleteScan(id);
                showToast(`Record ${id} deleted`, 'info');
            });
        });
    }

    // Filter toolbar listeners
    elements.inputSearchRecords.addEventListener('input', () => renderScanTable());
    elements.selectFilterSeverity.addEventListener('change', () => renderScanTable());
    elements.selectFilterCrop.addEventListener('change', () => renderScanTable());

    // Export Buttons
    elements.btnExportCSV.addEventListener('click', () => {
        const ok = window.storageManager.exportCSV();
        if (ok) showToast('CSV export downloaded successfully.', 'success');
        else showToast('No scan records to export.', 'info');
    });

    elements.btnExportJSON.addEventListener('click', () => {
        const ok = window.storageManager.exportJSON();
        if (ok) showToast('JSON log downloaded successfully.', 'success');
        else showToast('No scan records to export.', 'info');
    });

    elements.btnClearHistory.addEventListener('click', () => {
        if (confirm('Are you sure you want to purge all historical prediction logs?')) {
            window.storageManager.clearAll();
            showToast('Scan history cleared.', 'info');
        }
    });

    // =========================================================================
    // 7. Stat Metrics Counter Animations
    // =========================================================================
    function updateMetricsCounters() {
        const metrics = window.storageManager.getSummaryMetrics();

        animateValue(elements.statTotalScans, metrics.totalScans, 800);
        animateValue(elements.statHealthyRate, metrics.healthyRate, 800);
        animateValue(elements.statDiseasedCount, metrics.diseasedCount, 800);
        animateValue(elements.statCriticalCount, metrics.criticalCount, 800);
    }

    function animateValue(obj, endValue, duration) {
        if (!obj) return;
        const startValue = parseInt(obj.textContent) || 0;
        if (startValue === endValue) return;

        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(startValue + (endValue - startValue) * easeOut);
            obj.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                obj.textContent = endValue;
            }
        }

        requestAnimationFrame(update);
    }

    // =========================================================================
    // 8. Modals (Report Viewer & Backend Settings)
    // =========================================================================
    function openReportModal(scan) {
        elements.modalReportTitle.textContent = `${scan.crop} — ${scan.diseaseName}`;

        elements.modalReportContent.innerHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-forest-950/70 border border-white/10 items-center">
                <div class="sm:col-span-1 flex justify-center">
                    <img src="${scan.thumbnail}" alt="Leaf Target" class="w-28 h-28 object-contain rounded-xl border border-emerald-500/30 bg-black/50">
                </div>
                <div class="sm:col-span-2 space-y-1.5">
                    <div class="text-[11px] font-mono text-emerald-400">Scan ID: ${scan.id}</div>
                    <div class="text-sm font-bold text-white">${scan.botanicalName || scan.crop}</div>
                    <div class="text-xs text-slate-300">Classification: <span class="text-teal-300 font-semibold">${scan.scientificName || scan.diseaseName}</span></div>
                    <div class="text-xs text-slate-300">Identified Pathogen: <span class="text-amber-300">${scan.pathogen}</span></div>
                    <div class="flex items-center gap-3 pt-2">
                        <span class="px-2.5 py-1 rounded-full text-xs font-bold ${scan.severity === 'Healthy' ? 'bg-emerald-500/20 text-emerald-300' : (scan.severity === 'Mild' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300')}">
                            ${scan.severity} Severity
                        </span>
                        <span class="text-sm font-mono font-bold text-white">${scan.confidence}% Confidence</span>
                    </div>
                </div>
            </div>

            <div class="p-3.5 rounded-xl bg-forest-950/50 border border-white/5 space-y-1">
                <div class="font-semibold text-emerald-400 text-xs">Pathological Symptom Manifestation:</div>
                <p class="text-slate-300">${scan.symptoms}</p>
            </div>

            <div class="space-y-3 pt-2">
                <div class="font-bold text-white text-xs uppercase tracking-wider">Recommended Treatment Action Plan:</div>
                
                <div class="p-3 rounded-lg bg-rose-950/20 border border-rose-500/20 space-y-1">
                    <div class="text-[11px] font-bold text-rose-400">Immediate Triage & Isolation:</div>
                    <ul class="list-disc list-inside space-y-1 text-slate-300">
                        ${(scan.treatments?.triage || ['Isolate plant and inspect adjacent crops.']).map(t => `<li>${t}</li>`).join('')}
                    </ul>
                </div>

                <div class="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                    <div class="text-[11px] font-bold text-emerald-400">Organic & Bio-Remediation:</div>
                    <ul class="list-disc list-inside space-y-1 text-slate-300">
                        ${(scan.treatments?.organic || ['Apply organic bio-fungicide or neem solution.']).map(t => `<li>${t}</li>`).join('')}
                    </ul>
                </div>

                <div class="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/20 space-y-1">
                    <div class="text-[11px] font-bold text-cyan-400">Chemical Management Protocol:</div>
                    <ul class="list-disc list-inside space-y-1 text-slate-300">
                        ${(scan.treatments?.chemical || ['Follow local agricultural extension guidelines.']).map(t => `<li>${t}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;

        elements.modalReport.classList.remove('hidden');
        elements.modalReport.classList.add('flex');
    }

    function closeReportModal() {
        elements.modalReport.classList.add('hidden');
        elements.modalReport.classList.remove('flex');
    }

    elements.btnCloseReportModal.addEventListener('click', closeReportModal);
    elements.btnCloseReportModalBtn.addEventListener('click', closeReportModal);
    elements.modalReport.addEventListener('click', (e) => {
        if (e.target === elements.modalReport) closeReportModal();
    });

    // Settings Modal
    elements.btnOpenSettings.addEventListener('click', () => {
        elements.modalSettings.classList.remove('hidden');
        elements.modalSettings.classList.add('flex');
    });

    function closeSettingsModal() {
        elements.modalSettings.classList.add('hidden');
        elements.modalSettings.classList.remove('flex');
    }

    elements.btnCloseSettingsModal.addEventListener('click', closeSettingsModal);
    elements.modalSettings.addEventListener('click', (e) => {
        if (e.target === elements.modalSettings) closeSettingsModal();
    });

    elements.btnTestApiConnection.addEventListener('click', async () => {
        const url = elements.inputApiUrl.value.trim();
        elements.lblApiPingResult.textContent = 'Testing connection...';
        elements.lblApiPingResult.className = 'text-[11px] font-mono text-amber-400';

        const testRes = await window.modelService.testApiConnection(url);
        if (testRes.ok) {
            elements.lblApiPingResult.textContent = `Online (HTTP ${testRes.status})`;
            elements.lblApiPingResult.className = 'text-[11px] font-mono text-emerald-400';
            showToast('Python API backend responded successfully!', 'success');
        } else {
            elements.lblApiPingResult.textContent = `Offline (${testRes.error || 'No response'})`;
            elements.lblApiPingResult.className = 'text-[11px] font-mono text-rose-400';
            showToast('Could not reach API. Ensure python server.py is running on port 8000.', 'info');
        }
    });

    elements.btnSaveSettings.addEventListener('click', () => {
        const selected = document.querySelector('input[name="backendType"]:checked').value;
        const apiUrl = elements.inputApiUrl.value.trim();
        window.modelService.configure(selected, { apiUrl });

        elements.headerModelStatus.textContent = selected === 'API' ? 'PYTHON CNN CONNECTED' : 'NEURAL CORE READY';
        showToast(`Inference backend switched to: ${selected}`, 'success');
        closeSettingsModal();
    });

    // =========================================================================
    // 9. Toast Notification System
    // =========================================================================
    function showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast-msg';

        let icon = 'fa-info-circle text-cyan-400';
        if (type === 'success') icon = 'fa-circle-check text-emerald-400';
        if (type === 'error') icon = 'fa-circle-xmark text-rose-400';

        toast.innerHTML = `
            <i class="fa-solid ${icon} text-base shrink-0"></i>
            <span class="text-slate-100">${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(15px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3800);
    }
    window.showToast = showToast;

    // =========================================================================
    // 10. Initial Data Hydration & Chart.js Initialization
    // =========================================================================
    // Subscribe table and metrics to storage manager updates
    window.storageManager.subscribe(() => {
        renderScanTable();
        updateMetricsCounters();
    });

    // Initialize charts and render initial state
    window.analyticsEngine.init();
    renderScanTable();
    updateMetricsCounters();

    // Auto load default sample leaf into preview container for instant ready state
    window.cameraManager.loadSamplePreset('tomato_late_blight');
});
