/**
 * AgriScan AI - Camera and Ingestion Module
 * Controls HTML5 getUserMedia video stream, camera flip, drag-and-drop upload,
 * sample presets, frame capture, and camera shutter effects.
 */

class CameraManager {
    constructor() {
        this.videoElement = null;
        this.previewImageElement = null;
        this.canvasElement = null;
        this.stream = null;
        this.currentFacingMode = 'environment'; // 'environment' | 'user'
        this.activeSource = 'camera'; // 'camera' | 'upload' | 'sample'
        this.currentSampleId = null;
        this.isStreaming = false;
        this.torchOn = false;

        // Callback hooks
        this.onStreamReady = null;
        this.onError = null;
    }

    /**
     * Initialize elements
     */
    init({ videoEl, previewImgEl, canvasEl, onStreamReady, onError }) {
        this.videoElement = videoEl;
        this.previewImageElement = previewImgEl;
        this.canvasElement = canvasEl;
        this.onStreamReady = onStreamReady;
        this.onError = onError;

        this.startCamera();
    }

    /**
     * Request webcam permissions and start video stream
     */
    async startCamera() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this._handleError('Webcam API is not supported in this browser. Please use file upload or sample leaves.');
            return false;
        }

        this.stopCamera();

        const constraints = {
            video: {
                facingMode: this.currentFacingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        };

        try {
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            if (this.videoElement) {
                this.videoElement.srcObject = this.stream;
                await this.videoElement.play();
                this.isStreaming = true;
                this.activeSource = 'camera';
                
                // Show video, hide preview image
                this.videoElement.classList.remove('hidden');
                this.previewImageElement.classList.add('hidden');

                if (this.onStreamReady) this.onStreamReady();
                return true;
            }
        } catch (err) {
            console.warn('[CameraManager] Camera access could not be acquired:', err.name, err.message);
            this.isStreaming = false;
            let friendlyMessage = 'Camera access unavailable. Using leaf upload & preset testing mode.';
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                friendlyMessage = 'Camera permission was denied. You can test immediately using Drag & Drop or Preset Samples.';
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                friendlyMessage = 'No physical webcam found. You can test using the built-in leaf presets below!';
            }
            this._handleError(friendlyMessage);
            return false;
        }
    }

    /**
     * Stop active stream tracks
     */
    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.videoElement) {
            this.videoElement.srcObject = null;
        }
        this.isStreaming = false;
    }

    /**
     * Toggle between front and back cameras
     */
    async flipCamera() {
        this.currentFacingMode = this.currentFacingMode === 'environment' ? 'user' : 'environment';
        return await this.startCamera();
    }

    /**
     * Toggle hardware torch if supported
     */
    async toggleTorch() {
        if (!this.stream) return false;
        const track = this.stream.getVideoTracks()[0];
        if (!track) return false;

        const capabilities = track.getCapabilities ? track.getCapabilities() : {};
        if (!capabilities.torch) {
            return false; // Torch not supported on this device
        }

        try {
            this.torchOn = !this.torchOn;
            await track.applyConstraints({
                advanced: [{ torch: this.torchOn }]
            });
            return this.torchOn;
        } catch (e) {
            console.warn('Torch constraint error:', e);
            return false;
        }
    }

    /**
     * Load an image file from disk or drag-and-drop
     */
    loadImageFile(file) {
        if (!file || !file.type.startsWith('image/')) {
            throw new Error('Please select a valid image file (JPEG, PNG, WebP).');
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target.result;
                this.setPreviewImage(dataUrl);
                this.activeSource = 'upload';
                this.currentSampleId = null;
                resolve(dataUrl);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Load a procedural or preset sample leaf
     */
    loadSamplePreset(diseaseId) {
        const item = DISEASE_DATABASE[diseaseId];
        if (!item) return false;

        const imgUrl = item.sampleImageUrl;
        this.setPreviewImage(imgUrl);
        this.activeSource = 'sample';
        this.currentSampleId = diseaseId;
        return true;
    }

    /**
     * Set the preview image element and switch visibility from video
     */
    setPreviewImage(dataUrl) {
        if (this.videoElement) {
            this.videoElement.classList.add('hidden');
        }
        if (this.previewImageElement) {
            this.previewImageElement.src = dataUrl;
            this.previewImageElement.classList.remove('hidden');
        }
    }

    /**
     * Capture frame snapshot from currently active source (video, previewImg, or sample)
     * Returns a Data URL and the source DOM element for model processing
     */
    captureCurrentFrame() {
        const canvas = this.canvasElement || document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let sourceEl = null;

        if (this.activeSource === 'camera' && this.isStreaming && this.videoElement) {
            canvas.width = this.videoElement.videoWidth || 640;
            canvas.height = this.videoElement.videoHeight || 480;
            ctx.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
            sourceEl = this.videoElement;
        } else if (this.previewImageElement && this.previewImageElement.src) {
            canvas.width = this.previewImageElement.naturalWidth || 500;
            canvas.height = this.previewImageElement.naturalHeight || 500;
            ctx.drawImage(this.previewImageElement, 0, 0, canvas.width, canvas.height);
            sourceEl = this.previewImageElement;
        } else {
            // Fallback default sample if nothing loaded yet
            this.loadSamplePreset('tomato_late_blight');
            canvas.width = 450;
            canvas.height = 550;
            ctx.drawImage(this.previewImageElement, 0, 0, canvas.width, canvas.height);
            sourceEl = this.previewImageElement;
        }

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        return {
            sourceElement: sourceEl,
            dataUrl: dataUrl,
            sampleHintId: this.activeSource === 'sample' ? this.currentSampleId : null
        };
    }

    _handleError(msg) {
        if (this.onError) {
            this.onError(msg);
        }
    }
}

window.cameraManager = new CameraManager();
