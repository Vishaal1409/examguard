/**
 * ExamGuard — Video Analysis Engine (Frontend Controller)
 * Handles drag-and-drop, strict client validation (30MB, 60s max via loadedmetadata),
 * video preview, loading spinner, timeline visualization, interactive event seeking,
 * and Confirm/Dismiss examiner actions.
 */

// State management
let currentFile = null;
let currentVideoDuration = 0;
let currentSessionData = null;
let activeEventId = null;

// Mock analysis templates calibrated to duration
const MOCK_EVENTS = [
  {
    id: 1,
    label: 'looking_sideways',
    start_s: 10.0,
    end_s: 15.0,
    confidence: 0.914,
    risk: 'Medium',
    review_status: 'pending',
    notes: 'Candidate head turned >45° off-screen towards secondary desk area for 5 consecutive seconds.'
  },
  {
    id: 2,
    label: 'phone_use',
    start_s: 25.0,
    end_s: 31.0,
    confidence: 0.962,
    risk: 'High',
    review_status: 'pending',
    notes: 'Mobile handset screen reflection and device silhouette detected in candidate lower field of view.'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  initVideoUpload();
  initDemoSampleButton();
});

/**
 * Initialize Video Drag & Drop and File Picker
 */
function initVideoUpload() {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('video-file-input');
  const browseBtn = document.getElementById('browse-btn');
  const removeBtn = document.getElementById('remove-file-btn');
  const analyzeBtn = document.getElementById('analyze-btn');

  if (!dropZone || !fileInput) return;

  // Browse button trigger
  browseBtn?.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleSelectedFile(e.target.files[0]);
    }
  });

  // Drag and drop event listeners
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('drag-active');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('drag-active');
    }, false);
  });

  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files && files.length > 0) {
      handleSelectedFile(files[0]);
    }
  });

  // Remove file handler
  removeBtn?.addEventListener('click', () => {
    resetUploadState();
  });

  // Analyze button handler
  analyzeBtn?.addEventListener('click', () => {
    if (!currentFile && !currentVideoDuration) {
      showValidationError('Please select or upload a valid examination video first.');
      return;
    }
    runVideoAnalysis();
  });
}

/**
 * Reset upload container and clear errors
 */
function resetUploadState() {
  currentFile = null;
  currentVideoDuration = 0;
  currentSessionData = null;

  const fileInput = document.getElementById('video-file-input');
  if (fileInput) fileInput.value = '';

  document.getElementById('upload-idle')?.classList.remove('hidden');
  document.getElementById('upload-preview-container')?.classList.add('hidden');
  document.getElementById('results-section')?.classList.add('hidden');
  document.getElementById('validation-error-alert')?.classList.add('hidden');

  const analyzeBtn = document.getElementById('analyze-btn');
  if (analyzeBtn) {
    analyzeBtn.disabled = true;
    analyzeBtn.classList.add('opacity-50', 'cursor-not-allowed');
  }

  const previewVideo = document.getElementById('preview-video');
  if (previewVideo) {
    previewVideo.pause();
    previewVideo.removeAttribute('src');
    previewVideo.load();
  }
}

/**
 * File validation and metadata probing
 */
async function handleSelectedFile(file) {
  hideValidationError();
  resetUploadState();

  const fileName = file.name.toLowerCase();
  const fileExtension = '.' + fileName.split('.').pop();
  const allowedExtensions = CONFIG.LIMITS.ALLOWED_EXTENSIONS;
  const maxBytes = CONFIG.LIMITS.MAX_VIDEO_BYTES; // 30 MB
  const maxSeconds = CONFIG.LIMITS.MAX_VIDEO_SECONDS; // 60 s

  // 1. File extension & MIME type check
  const isExtensionValid = allowedExtensions.some(ext => fileName.endsWith(ext));
  if (!isExtensionValid) {
    showValidationError(`Unsupported file type ("${fileExtension}"). Please upload an MP4, WEBM, or MOV video.`);
    return;
  }

  // 2. File size check (30 MB limit)
  if (file.size > maxBytes) {
    showValidationError(`File size (${formatBytes(file.size)}) exceeds the strict 30 MB institutional limit. Please upload a shorter clip.`);
    return;
  }

  // 3. Probing duration using loadedmetadata on offscreen video
  const objectUrl = URL.createObjectURL(file);
  const probeVideo = document.createElement('video');
  probeVideo.preload = 'metadata';

  // Show temporary validating indicator
  const dropZoneText = document.getElementById('drop-zone-text');
  const originalText = dropZoneText ? dropZoneText.innerHTML : '';
  if (dropZoneText) {
    dropZoneText.innerHTML = '<span class="text-blue-600 font-semibold animate-pulse">Checking video integrity & duration...</span>';
  }

  probeVideo.onloadedmetadata = () => {
    URL.revokeObjectURL(probeVideo.src);
    const duration = probeVideo.duration;

    if (dropZoneText) dropZoneText.innerHTML = originalText;

    if (isNaN(duration) || duration <= 0) {
      showValidationError('Could not determine video length. The video file header may be corrupt.');
      return;
    }

    if (duration > maxSeconds) {
      showValidationError(`Video duration (${duration.toFixed(1)}s) exceeds the maximum allowed limit of 60 seconds.`);
      return;
    }

    // Validation passed!
    currentFile = file;
    currentVideoDuration = duration;
    displayVideoPreview(file, objectUrl, duration);
  };

  probeVideo.onerror = () => {
    URL.revokeObjectURL(probeVideo.src);
    if (dropZoneText) dropZoneText.innerHTML = originalText;
    showValidationError('Could not read this video. The file may be corrupt or encoded in an unsupported codec.');
  };

  probeVideo.src = objectUrl;
}

/**
 * Display validated video in preview container
 */
function displayVideoPreview(file, objectUrl, duration) {
  document.getElementById('upload-idle')?.classList.add('hidden');
  const previewContainer = document.getElementById('upload-preview-container');
  previewContainer?.classList.remove('hidden');

  document.getElementById('file-name-display').textContent = file.name;
  document.getElementById('file-size-display').textContent = `${formatBytes(file.size)} • ${duration.toFixed(1)}s duration`;

  const previewVideo = document.getElementById('preview-video');
  if (previewVideo) {
    previewVideo.src = objectUrl;
    previewVideo.load();
  }

  const analyzeBtn = document.getElementById('analyze-btn');
  if (analyzeBtn) {
    analyzeBtn.disabled = false;
    analyzeBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  }
}

/**
 * Show validation alert banner
 */
function showValidationError(message) {
  const alertEl = document.getElementById('validation-error-alert');
  const msgEl = document.getElementById('validation-error-text');
  if (alertEl && msgEl) {
    msgEl.textContent = message;
    alertEl.classList.remove('hidden');
    alertEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function hideValidationError() {
  document.getElementById('validation-error-alert')?.classList.add('hidden');
}

/**
 * Execute Video Analysis (handles Demo simulation or real FastAPI call)
 */
async function runVideoAnalysis() {
  const analyzeBtn = document.getElementById('analyze-btn');
  const loadingOverlay = document.getElementById('analysis-loading-overlay');
  const resultsSection = document.getElementById('results-section');

  // Disable button and show spinner
  if (analyzeBtn) {
    analyzeBtn.disabled = true;
    analyzeBtn.classList.add('opacity-50', 'cursor-not-allowed');
  }
  loadingOverlay?.classList.remove('hidden');
  resultsSection?.classList.add('hidden');

  // Step messages sequence
  const stepText = document.getElementById('loading-step-text');
  const steps = [
    'Decoding video stream & validating frames...',
    'Sampling 1 frame per second for head pose and mobile devices...',
    'Evaluating temporal behavioral anomalies (MobileNetV2 Simulation)...',
    'Generating review timeline and confidence metrics...'
  ];

  let stepIdx = 0;
  const stepInterval = setInterval(() => {
    stepIdx = (stepIdx + 1) % steps.length;
    if (stepText) stepText.textContent = steps[stepIdx];
  }, 500);

  // Check if live API is preferred and token exists
  const token = getAuthToken();
  const preferLive = !isDemoMode() && token && currentFile;

  if (preferLive) {
    try {
      const formData = new FormData();
      formData.append('file', currentFile);

      const resp = await fetch(`${CONFIG.API_BASE}/analyze-video`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (resp.ok) {
        const liveData = await resp.json();
        clearInterval(stepInterval);
        loadingOverlay?.classList.add('hidden');
        renderAnalysisResults(liveData, false);
        return;
      }
    } catch (err) {
      console.warn('Live API request failed, falling back to client demo mock:', err);
    }
  }

  // Simulated Demo Analysis Delay (2.2 seconds)
  setTimeout(() => {
    clearInterval(stepInterval);
    loadingOverlay?.classList.add('hidden');

    const totalDur = currentVideoDuration || 32.0;
    const mockData = generateMockAnalysisData(totalDur);

    renderAnalysisResults(mockData, true);
  }, 2200);
}

/**
 * Generate calibrated mock data for current video duration
 */
function generateMockAnalysisData(duration) {
  const totalSeconds = Math.max(Math.floor(duration), 10);
  const timeline = [];

  // Scale event timings relative to duration
  const ev1Start = Math.round(duration * 0.25);
  const ev1End = Math.min(ev1Start + 5, Math.floor(duration * 0.45));
  const ev2Start = Math.round(duration * 0.65);
  const ev2End = Math.min(ev2Start + 6, Math.floor(duration * 0.85));

  for (let t = 0; t < totalSeconds; t++) {
    if (t >= ev1Start && t < ev1End) {
      timeline.push({ t, label: 'looking_sideways', confidence: 0.91 });
    } else if (t >= ev2Start && t < ev2End) {
      timeline.push({ t, label: 'phone_use', confidence: 0.96 });
    } else {
      timeline.push({ t, label: 'normal', confidence: 0.94 });
    }
  }

  const normalCount = timeline.filter(p => p.label === 'normal').length;
  const normalPct = ((normalCount / totalSeconds) * 100).toFixed(1);

  const events = [
    {
      id: 1,
      label: 'looking_sideways',
      start_s: ev1Start,
      end_s: ev1End,
      confidence: 0.914,
      risk: 'Medium',
      review_status: 'pending',
      notes: 'Candidate head turned >45° off-screen towards desk area for consecutive frames.'
    },
    {
      id: 2,
      label: 'phone_use',
      start_s: ev2Start,
      end_s: ev2End,
      confidence: 0.962,
      risk: 'High',
      review_status: 'pending',
      notes: 'Mobile handset screen reflection and device silhouette detected in candidate lower field of view.'
    }
  ];

  return {
    session_id: 1042,
    duration_s: parseFloat(duration.toFixed(1)),
    frames_analyzed: totalSeconds,
    summary: {
      normal_pct: parseFloat(normalPct),
      n_events: events.length
    },
    timeline,
    events
  };
}

/**
 * Render Complete Results Section
 */
function renderAnalysisResults(data, isMock = true) {
  currentSessionData = data;
  const resultsSection = document.getElementById('results-section');
  if (!resultsSection) return;

  resultsSection.classList.remove('hidden');
  resultsSection.scrollIntoView({ behavior: 'smooth' });

  // 1. Demo Mode Banner visibility
  const mockBanner = document.getElementById('mock-data-banner');
  if (mockBanner) {
    mockBanner.classList.toggle('hidden', !isMock);
  }

  // 2. Summary Metrics Cards
  document.getElementById('stat-frames').textContent = data.frames_analyzed || Math.round(data.duration_s);
  document.getElementById('stat-normal-pct').textContent = `${data.summary.normal_pct}%`;
  document.getElementById('stat-flagged-count').textContent = data.events.length;
  document.getElementById('stat-duration').textContent = `${data.duration_s}s`;

  // 3. Sync Main Results Video Player
  const resultsVideo = document.getElementById('results-video-player');
  const previewVideo = document.getElementById('preview-video');
  if (resultsVideo && previewVideo && previewVideo.src) {
    resultsVideo.src = previewVideo.src;
    resultsVideo.load();
  }

  // 4. Render Interactive Coloured Timeline
  renderTimeline(data.duration_s, data.timeline, data.events);

  // 5. Render Flagged Event Cards
  renderEventList(data.events);

  // Re-enable analyze button
  const analyzeBtn = document.getElementById('analyze-btn');
  if (analyzeBtn) {
    analyzeBtn.disabled = false;
    analyzeBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  }
}

/**
 * Render Responsive Coloured Timeline
 * Green = Normal, Orange = Looking Sideways, Red = Phone Usage
 */
function renderTimeline(totalDuration, timelinePoints, events) {
  const container = document.getElementById('timeline-bar');
  const timeLabels = document.getElementById('timeline-ticks');
  if (!container) return;

  container.innerHTML = '';
  if (timeLabels) timeLabels.innerHTML = '';

  const total = totalDuration || 1;

  // Group continuous timeline points into segments for rendering
  const segments = [];
  let currentSeg = null;

  timelinePoints.forEach((point) => {
    if (!currentSeg || currentSeg.label !== point.label) {
      if (currentSeg) segments.push(currentSeg);
      currentSeg = {
        label: point.label,
        start_s: point.t,
        end_s: point.t + 1,
        confs: [point.confidence]
      };
    } else {
      currentSeg.end_s = point.t + 1;
      currentSeg.confs.push(point.confidence);
    }
  });
  if (currentSeg) segments.push(currentSeg);

  // Render segments
  segments.forEach(seg => {
    const segDuration = seg.end_s - seg.start_s;
    const widthPct = (segDuration / total) * 100;

    const segEl = document.createElement('div');
    segEl.className = 'timeline-segment group relative';
    segEl.style.width = `${widthPct}%`;

    // Colors matching specifications
    if (seg.label === 'normal') {
      segEl.classList.add('bg-emerald-500');
    } else if (seg.label === 'looking_sideways') {
      segEl.classList.add('bg-amber-500');
    } else if (seg.label === 'phone_use') {
      segEl.classList.add('bg-rose-500');
    }

    // Tooltip
    const avgConf = (seg.confs.reduce((a, b) => a + b, 0) / seg.confs.length * 100).toFixed(0);
    const labelTitle = seg.label.replace('_', ' ').toUpperCase();
    segEl.innerHTML = `
      <div class="hidden group-hover:block absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
        <div class="bg-slate-900 text-white text-[11px] font-medium py-1 px-2.5 rounded shadow-lg whitespace-nowrap border border-slate-700">
          <span class="font-bold">${labelTitle}</span> (${seg.start_s}s - ${seg.end_s}s) • ${avgConf}%
        </div>
      </div>
    `;

    // Clicking a timeline segment seeks video to that start time
    segEl.addEventListener('click', () => {
      seekVideoToTime(seg.start_s);
      // Find matching event if any
      const matched = events.find(e => seg.start_s >= e.start_s && seg.start_s <= e.end_s);
      if (matched) {
        highlightEventCard(matched.id);
      }
    });

    container.appendChild(segEl);
  });

  // Render Time tick marks (0s, 25%, 50%, 75%, 100%)
  if (timeLabels) {
    const ticks = [0, total * 0.25, total * 0.5, total * 0.75, total];
    timeLabels.innerHTML = ticks.map(t => `
      <span class="text-[11px] font-mono text-slate-500">${t.toFixed(0)}s</span>
    `).join('');
  }
}

/**
 * Render Clickable Flagged Events with Confirm & Dismiss buttons
 */
function renderEventList(events) {
  const container = document.getElementById('flagged-events-container');
  if (!container) return;

  container.innerHTML = '';

  if (!events || events.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-slate-500 text-sm">
        No suspicious activities flagged in this video clip.
      </div>
    `;
    return;
  }

  events.forEach(evt => {
    const card = document.createElement('div');
    card.id = `event-card-${evt.id}`;
    card.className = 'event-card p-4 rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:shadow-md cursor-pointer mb-3.5';

    // Label formatting
    const isSideways = evt.label === 'looking_sideways';
    const isPhone = evt.label === 'phone_use';
    const labelTitle = isSideways ? 'Looking Sideways' : isPhone ? 'Phone Usage' : evt.label;
    
    const badgeColor = isSideways
      ? 'bg-amber-50 text-amber-800 border-amber-300'
      : isPhone
      ? 'bg-rose-50 text-rose-800 border-rose-300'
      : 'bg-slate-100 text-slate-800 border-slate-300';

    const riskBadgeColor = evt.risk.toLowerCase() === 'high'
      ? 'bg-rose-100 text-rose-700 font-bold'
      : 'bg-amber-100 text-amber-700 font-medium';

    const reviewBadge = getReviewBadgeMarkup(evt.review_status);

    card.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <!-- Event Info & Click to Seek -->
        <div class="flex items-start space-x-3.5 flex-1" onclick="handleEventCardClick(${evt.id}, ${evt.start_s})">
          <div class="p-2.5 rounded-lg ${isSideways ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600'} flex-shrink-0">
            ${isSideways ? `
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            ` : `
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
            `}
          </div>

          <div>
            <div class="flex items-center flex-wrap gap-2">
              <span class="text-xs font-mono font-bold text-slate-500">#EVT-0${evt.id}</span>
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${badgeColor}">
                ${labelTitle}
              </span>
              <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] ${riskBadgeColor}">
                ${evt.risk} Risk
              </span>
              <span id="review-status-badge-${evt.id}">
                ${reviewBadge}
              </span>
            </div>

            <div class="mt-1.5 flex items-center space-x-3 text-xs text-slate-500">
              <span class="font-mono font-semibold text-slate-800 flex items-center gap-1">
                <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                ${formatSeconds(evt.start_s)} - ${formatSeconds(evt.end_s)} (${(evt.end_s - evt.start_s).toFixed(0)}s duration)
              </span>
              <span>•</span>
              <span>Confidence: <strong class="text-slate-700">${(evt.confidence * 100).toFixed(1)}%</strong></span>
            </div>

            <p class="text-xs text-slate-600 mt-1 italic">${evt.notes || ''}</p>
          </div>
        </div>

        <!-- Action Buttons: Confirm & Dismiss -->
        <div class="flex items-center space-x-2 pt-2 sm:pt-0 sm:border-l sm:border-slate-100 sm:pl-4 self-end sm:self-center">
          <button 
            id="btn-confirm-${evt.id}" 
            onclick="updateEventReviewStatus(${evt.id}, 'confirmed')" 
            class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 transition-colors flex items-center gap-1 shadow-sm"
            title="Confirm this suspicious activity as examination malpractice">
            <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            Confirm
          </button>

          <button 
            id="btn-dismiss-${evt.id}" 
            onclick="updateEventReviewStatus(${evt.id}, 'dismissed')" 
            class="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-300 transition-colors flex items-center gap-1 shadow-sm"
            title="Dismiss as false positive or benign movement">
            <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            Dismiss
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

/**
 * Handle Event Card click: seek video and highlight card
 */
function handleEventCardClick(eventId, startTime) {
  seekVideoToTime(startTime);
  highlightEventCard(eventId);
}

/**
 * Seek video player to exact timestamp and autoplay
 */
function seekVideoToTime(seconds) {
  const video = document.getElementById('results-video-player');
  if (video) {
    video.currentTime = seconds;
    video.play().catch(() => {
      // Autoplay with audio might be blocked by browser policy
      video.muted = true;
      video.play();
    });
  }
}

/**
 * Highlight active event card
 */
function highlightEventCard(eventId) {
  activeEventId = eventId;
  document.querySelectorAll('.event-card').forEach(el => {
    el.classList.remove('event-card-active', 'ring-2', 'ring-blue-500');
  });

  const target = document.getElementById(`event-card-${eventId}`);
  if (target) {
    target.classList.add('event-card-active', 'ring-2', 'ring-blue-500');
  }
}

/**
 * Badge markup helper for review statuses
 */
function getReviewBadgeMarkup(status) {
  switch (status) {
    case 'confirmed':
      return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">✓ Confirmed Malpractice</span>`;
    case 'dismissed':
      return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-300">✕ Dismissed (Benign)</span>`;
    default:
      return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">Pending Examiner Review</span>`;
  }
}

/**
 * Update Event Review Status (Confirm or Dismiss)
 */
function updateEventReviewStatus(eventId, newStatus) {
  if (!currentSessionData) return;

  const eventItem = currentSessionData.events.find(e => e.id === eventId);
  if (!eventItem) return;

  eventItem.review_status = newStatus;

  // 1. Update UI badge
  const badgeContainer = document.getElementById(`review-status-badge-${eventId}`);
  if (badgeContainer) {
    badgeContainer.innerHTML = getReviewBadgeMarkup(newStatus);
  }

  // 2. Visually adjust button styles
  const btnConfirm = document.getElementById(`btn-confirm-${eventId}`);
  const btnDismiss = document.getElementById(`btn-dismiss-${eventId}`);

  if (newStatus === 'confirmed') {
    btnConfirm?.classList.add('bg-emerald-600', 'text-white', 'border-emerald-700');
    btnConfirm?.classList.remove('bg-emerald-50', 'text-emerald-700');
    btnDismiss?.classList.remove('bg-rose-600', 'text-white');
    btnDismiss?.classList.add('bg-slate-50', 'text-slate-700');
    showActionToast(`Event #EVT-0${eventId} confirmed as examination malpractice. Audit log updated.`, 'success');
  } else if (newStatus === 'dismissed') {
    btnDismiss?.classList.add('bg-slate-700', 'text-white', 'border-slate-800');
    btnDismiss?.classList.remove('bg-slate-50', 'text-slate-700');
    btnConfirm?.classList.remove('bg-emerald-600', 'text-white');
    btnConfirm?.classList.add('bg-emerald-50', 'text-emerald-700');
    showActionToast(`Event #EVT-0${eventId} dismissed as false positive / benign movement.`, 'info');
  }
}

/**
 * Action toast notification helper
 */
function showActionToast(message, type = 'success') {
  const existing = document.getElementById('floating-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'floating-toast';
  const bgClass = type === 'success' ? 'bg-emerald-900 border-emerald-700 text-emerald-100' : 'bg-slate-900 border-slate-700 text-slate-100';

  toast.className = `fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl border ${bgClass} text-xs font-semibold flex items-center space-x-2 animate-bounce transition-all`;
  toast.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()" class="ml-2 text-current opacity-70 hover:opacity-100">&times;</button>
  `;

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

/**
 * Generate a synthetic HTML5 Canvas video clip (32s) for instant examiner testing
 * without requiring the examiner to download an MP4 file!
 */
function initDemoSampleButton() {
  const sampleBtn = document.getElementById('load-sample-btn');
  if (!sampleBtn) return;

  sampleBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    hideValidationError();

    sampleBtn.disabled = true;
    sampleBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-emerald-700 inline-block" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg> Generating 32s Candidate Clip...
    `;

    try {
      const syntheticBlob = await generateSyntheticExamVideo(32);
      const sampleFile = new File([syntheticBlob], 'exam_hall_camera_candidate_04.webm', { type: 'video/webm' });
      await handleSelectedFile(sampleFile);
    } catch (err) {
      console.warn('Canvas video generation fallback:', err);
      // Fallback: Create minimal dummy webm file object and simulate metadata
      currentVideoDuration = 32.0;
      displayVideoPreview(
        { name: 'exam_hall_candidate_sample.mp4', size: 4.8 * 1024 * 1024 },
        '',
        32.0
      );
    } finally {
      sampleBtn.disabled = false;
      sampleBtn.innerHTML = `
        <svg class="w-4 h-4 mr-1.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        Load Sample Exam Clip (32s)
      `;
    }
  });
}

/**
 * Synthetic Canvas Video Recorder for Zero-Dependency In-Browser Testing
 */
function generateSyntheticExamVideo(durationSeconds = 32) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');

    const stream = canvas.captureStream(15); // 15 fps
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];

    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve(blob);
    };

    recorder.start();

    // Fast-generate frames
    let frame = 0;
    const totalFrames = durationSeconds * 15;
    const interval = setInterval(() => {
      frame++;
      const t = frame / 15;

      // Draw background examination hall desk
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 640, 360);

      // Desk
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(40, 220, 560, 140);

      // Candidate silhouette
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      // Candidate head position shifts during events
      let headX = 320;
      let labelNotice = 'Normal Behavior (Writing Answer Script)';
      let boxColor = '#10b981';

      if (t >= 10 && t < 15) {
        headX = 260; // head turned left
        labelNotice = 'Simulated Anomaly: Looking Sideways (t=10s to 15s)';
        boxColor = '#f59e0b';
      } else if (t >= 25 && t < 31) {
        labelNotice = 'Simulated Anomaly: Mobile Phone Usage (t=25s to 31s)';
        boxColor = '#ef4444';
      }

      // Head
      ctx.arc(headX, 120, 48, 0, Math.PI * 2);
      ctx.fill();

      // Body / Shoulders
      ctx.beginPath();
      ctx.ellipse(320, 240, 110, 60, 0, 0, Math.PI * 2);
      ctx.fill();

      // If phone use event, draw phone in hand
      if (t >= 25 && t < 31) {
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(360, 230, 24, 44);
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(360, 230, 24, 44);
      }

      // Draw Camera HUD Overlay
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(`CAM-04 (HALL B) • REC [${formatSeconds(t)} / ${formatSeconds(durationSeconds)}]`, 24, 34);

      ctx.fillStyle = boxColor;
      ctx.font = '12px sans-serif';
      ctx.fillText(labelNotice, 24, 56);

      // Bounding Box
      ctx.strokeStyle = boxColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(headX - 60, 60, 120, 140);

      if (frame >= totalFrames) {
        clearInterval(interval);
        recorder.stop();
      }
    }, 1000 / 60); // render at 60Hz to finish recording faster
  });
}
