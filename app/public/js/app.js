// Photo Prompt Generator Application

// State
let colors = ['#2A5BDA', 'amber glow'];
let presets = {};
let stylePresets = {};
let cameraPresets = {};
let lightingPresets = {};
let moodPresets = {};
let compositionPresets = {};

// DOM elements (initialized after DOM loads)
let promptInput, styleInput, cameraAngle, cameraShot, cameraLens;
let cameraAperture, cameraISO, cameraFocus, cameraModel;
let lightingInput, colorPalette, colorMood, compositionInput;
let jsonOutput, copyBtn, presetSelect, includeEmpty, numericLens;
let styleDropdown, styleSelector, styleEditToggle;
let cameraDropdown, cameraSelector, cameraEditToggle;
let lightingDropdown, lightingSelector, lightingEditToggle;
let moodDropdown, moodSelector, moodEditToggle;
let compositionDropdown, compositionSelector, compositionEditToggle;
let addColorBtn;

// Image picker elements
let imageDropZone, imageInput, imageCanvas, canvasCtx;
let clearImageBtn, pickedColorPreview, previewSwatch, previewHex;
let currentPickedColor = null;

// Check if EyeDropper API is supported (requires secure context: HTTPS or localhost)
const eyeDropperSupported = 'EyeDropper' in window && window.isSecureContext;

// Debug info for EyeDropper
console.log('EyeDropper Debug:', {
  'EyeDropper in window': 'EyeDropper' in window,
  'isSecureContext': window.isSecureContext,
  'eyeDropperSupported': eyeDropperSupported,
  'location': window.location.href
});

// SVG icon for eye dropper
const eyeDropperIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="m2 22 1-1h3l9-9"/>
  <path d="M3 21v-3l9-9"/>
  <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z"/>
</svg>`;

// Load data from API
async function loadData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();

    presets = data.presets;
    stylePresets = data.styles;
    cameraPresets = data.cameras;
    lightingPresets = data.lighting;
    moodPresets = data.mood;
    compositionPresets = data.composition;

    // Initialize dropdowns with loaded data
    populateStyleDropdown();
    populateCameraDropdown();
    populateLightingDropdown();
    populateMoodDropdown();
    populateCompositionDropdown();

    // Initialize display
    renderColors();
    updateOutput();
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Populate style dropdown
function populateStyleDropdown() {
  styleDropdown.innerHTML = '<option value="">— Select a style —</option>';

  for (const [category, styles] of Object.entries(stylePresets)) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = category;

    styles.forEach(style => {
      const option = document.createElement('option');
      option.value = style.prompt;
      option.textContent = style.name;
      optgroup.appendChild(option);
    });

    styleDropdown.appendChild(optgroup);
  }
}

// Populate camera dropdown
function populateCameraDropdown() {
  cameraDropdown.innerHTML = '<option value="">— Select camera/lens —</option>';

  for (const [category, cameras] of Object.entries(cameraPresets)) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = category;

    cameras.forEach(camera => {
      const option = document.createElement('option');
      option.value = camera.prompt;
      option.textContent = camera.name;
      optgroup.appendChild(option);
    });

    cameraDropdown.appendChild(optgroup);
  }
}

// Populate lighting dropdown
function populateLightingDropdown() {
  lightingDropdown.innerHTML = '<option value="">— Select lighting —</option>';

  for (const [category, lights] of Object.entries(lightingPresets)) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = category;

    lights.forEach(light => {
      const option = document.createElement('option');
      option.value = light.prompt;
      option.textContent = light.name;
      optgroup.appendChild(option);
    });

    lightingDropdown.appendChild(optgroup);
  }
}

// Populate mood dropdown
function populateMoodDropdown() {
  moodDropdown.innerHTML = '<option value="">— Select mood —</option>';

  for (const [category, moods] of Object.entries(moodPresets)) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = category;

    moods.forEach(mood => {
      const option = document.createElement('option');
      option.value = mood.prompt;
      option.textContent = mood.name;
      optgroup.appendChild(option);
    });

    moodDropdown.appendChild(optgroup);
  }
}

// Populate composition dropdown
function populateCompositionDropdown() {
  compositionDropdown.innerHTML = '<option value="">— Select composition —</option>';

  for (const [category, compositions] of Object.entries(compositionPresets)) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = category;

    compositions.forEach(comp => {
      const option = document.createElement('option');
      option.value = comp.prompt;
      option.textContent = comp.name;
      optgroup.appendChild(option);
    });

    compositionDropdown.appendChild(optgroup);
  }
}

// Render colors
function renderColors() {
  colorPalette.innerHTML = '';
  colors.forEach((color, index) => {
    const chip = document.createElement('div');
    chip.className = 'color-chip';

    const isHex = color.startsWith('#');
    const eyeDropperTitle = eyeDropperSupported
      ? 'Pick color from screen'
      : 'Eye dropper requires HTTPS or localhost';

    chip.innerHTML = `
      <input type="color" value="${isHex ? color : '#888888'}" data-index="${index}" title="Pick a color">
      <button class="eyedropper-btn" data-index="${index}" title="${eyeDropperTitle}" ${!eyeDropperSupported ? 'disabled' : ''}>${eyeDropperIcon}</button>
      <input type="text" value="${color}" data-index="${index}" placeholder="Color name or hex">
      <button class="remove-btn" data-index="${index}">×</button>
    `;
    colorPalette.appendChild(chip);
  });

  // Add event listeners for text inputs
  colorPalette.querySelectorAll('input[type="text"]').forEach(input => {
    input.addEventListener('input', (e) => {
      const index = parseInt(e.target.dataset.index);
      colors[index] = e.target.value;
      updateColorPicker(e.target, e.target.value);
      updateOutput();
    });
  });

  // Add event listeners for color pickers
  colorPalette.querySelectorAll('input[type="color"]').forEach(picker => {
    picker.addEventListener('input', (e) => {
      const index = parseInt(e.target.dataset.index);
      const hexValue = e.target.value;
      colors[index] = hexValue;
      // Update the text input
      const textInput = e.target.parentElement.querySelector('input[type="text"]');
      textInput.value = hexValue;
      updateOutput();
    });
  });

  // Add event listeners for eye dropper buttons
  colorPalette.querySelectorAll('.eyedropper-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      if (!eyeDropperSupported) return;

      const index = parseInt(e.target.dataset.index);
      try {
        const eyeDropper = new EyeDropper();
        const result = await eyeDropper.open();
        const hexValue = result.sRGBHex;
        colors[index] = hexValue;
        renderColors();
        updateOutput();
      } catch (err) {
        // User cancelled or error occurred
        console.log('EyeDropper cancelled or failed:', err);
      }
    });
  });

  colorPalette.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      colors.splice(index, 1);
      renderColors();
      updateOutput();
    });
  });
}

function updateColorPicker(textInput, value) {
  const colorPicker = textInput.parentElement.querySelector('input[type="color"]');
  if (value.startsWith('#') && (value.length === 4 || value.length === 7)) {
    colorPicker.value = value.length === 4
      ? '#' + value[1] + value[1] + value[2] + value[2] + value[3] + value[3]
      : value;
  }
}

// Generate JSON
function generateJSON() {
  const shouldIncludeEmpty = includeEmpty.checked;
  const useNumericLens = numericLens.checked;

  const data = {};

  // Add fields conditionally
  if (promptInput.value || shouldIncludeEmpty) data.prompt = promptInput.value;
  if (styleInput.value || shouldIncludeEmpty) data.style = styleInput.value;

  // Camera object
  const camera = {};
  if (cameraAngle.value || shouldIncludeEmpty) camera.angle = cameraAngle.value;
  if (cameraShot.value || shouldIncludeEmpty) camera.distance = cameraShot.value;

  // Lens handling
  if (cameraLens.value || shouldIncludeEmpty) {
    if (useNumericLens) {
      const lensMatch = cameraLens.value.match(/(\d+)/);
      if (lensMatch) {
        camera['lens-mm'] = parseInt(lensMatch[1]);
      } else {
        camera.lens = cameraLens.value;
      }
    } else {
      camera.lens = cameraLens.value;
    }
  }

  if (cameraAperture.value || shouldIncludeEmpty) camera['f-number'] = cameraAperture.value;
  if (cameraISO.value || shouldIncludeEmpty) {
    const isoNum = parseInt(cameraISO.value);
    camera.ISO = isNaN(isoNum) ? cameraISO.value : isoNum;
  }
  if (cameraFocus.value || shouldIncludeEmpty) camera.focus = cameraFocus.value;

  if (Object.keys(camera).length > 0 || shouldIncludeEmpty) data.camera = camera;

  // Film stock as separate field
  if (cameraModel.value) data.film_stock = cameraModel.value;

  // Lighting
  if (lightingInput.value || shouldIncludeEmpty) data.lighting = lightingInput.value;

  // Colors
  const filteredColors = colors.filter(c => c.trim() !== '');
  if (filteredColors.length > 0 || colorMood.value || shouldIncludeEmpty) {
    data.colors = {};
    if (filteredColors.length > 0 || shouldIncludeEmpty) data.colors.palette = filteredColors;
    if (colorMood.value || shouldIncludeEmpty) data.colors.mood = colorMood.value;
  }

  // Composition
  if (compositionInput.value || shouldIncludeEmpty) data.composition = compositionInput.value;

  return data;
}

// Syntax highlight JSON
function highlightJSON(json) {
  const str = JSON.stringify(json, null, 2);
  return str
    .replace(/"([^"]+)":/g, '<span class="key">"$1"</span>:')
    .replace(/: "([^"]*)"/g, ': <span class="string">"$1"</span>')
    .replace(/: (\d+)/g, ': <span class="number">$1</span>');
}

// Update output
function updateOutput() {
  const json = generateJSON();
  jsonOutput.innerHTML = highlightJSON(json);
}

// Load preset
function loadPreset(preset) {
  if (!preset) return;

  promptInput.value = preset.prompt || '';
  styleInput.value = preset.style || '';

  // Sync style dropdown
  let styleFound = false;
  for (const styles of Object.values(stylePresets)) {
    const match = styles.find(s => s.prompt === preset.style);
    if (match) {
      styleDropdown.value = match.prompt;
      styleFound = true;
      break;
    }
  }
  if (!styleFound) {
    styleDropdown.value = '';
  }
  // Exit edit mode when loading preset
  styleSelector.classList.remove('edit-mode');

  cameraAngle.value = preset.camera?.angle || '';
  cameraShot.value = preset.camera?.shot || '';
  cameraLens.value = preset.camera?.lens || '';
  cameraAperture.value = preset.camera?.aperture || '';
  cameraISO.value = preset.camera?.iso || '';
  cameraFocus.value = preset.camera?.focus || '';
  cameraModel.value = preset.camera?.model || '';

  // Sync camera dropdown
  let cameraFound = false;
  for (const cameras of Object.values(cameraPresets)) {
    const match = cameras.find(c => c.prompt === cameraModel.value);
    if (match) {
      cameraDropdown.value = match.prompt;
      cameraFound = true;
      break;
    }
  }
  if (!cameraFound) {
    cameraDropdown.value = '';
  }
  // Exit edit mode when loading preset
  cameraSelector.classList.remove('edit-mode');

  lightingInput.value = preset.lighting || '';

  // Sync lighting dropdown
  let lightingFound = false;
  for (const lights of Object.values(lightingPresets)) {
    const match = lights.find(l => l.prompt === lightingInput.value);
    if (match) {
      lightingDropdown.value = match.prompt;
      lightingFound = true;
      break;
    }
  }
  if (!lightingFound) {
    lightingDropdown.value = '';
  }
  // Exit edit mode when loading preset
  lightingSelector.classList.remove('edit-mode');

  colors = preset.colors?.palette ? [...preset.colors.palette] : [];
  colorMood.value = preset.colors?.mood || '';

  // Sync mood dropdown
  let moodFound = false;
  for (const moods of Object.values(moodPresets)) {
    const match = moods.find(m => m.prompt === colorMood.value);
    if (match) {
      moodDropdown.value = match.prompt;
      moodFound = true;
      break;
    }
  }
  if (!moodFound) {
    moodDropdown.value = '';
  }
  // Exit edit mode when loading preset
  moodSelector.classList.remove('edit-mode');

  compositionInput.value = preset.composition || '';

  // Sync composition dropdown
  let compositionFound = false;
  for (const compositions of Object.values(compositionPresets)) {
    const match = compositions.find(c => c.prompt === compositionInput.value);
    if (match) {
      compositionDropdown.value = match.prompt;
      compositionFound = true;
      break;
    }
  }
  if (!compositionFound) {
    compositionDropdown.value = '';
  }
  // Exit edit mode when loading preset
  compositionSelector.classList.remove('edit-mode');

  renderColors();
  updateOutput();
}

// Initialize the application
function initApp() {
  // Get DOM elements
  promptInput = document.getElementById('prompt');
  styleInput = document.getElementById('style');
  cameraAngle = document.getElementById('camera-angle');
  cameraShot = document.getElementById('camera-shot');
  cameraLens = document.getElementById('camera-lens');
  cameraAperture = document.getElementById('camera-aperture');
  cameraISO = document.getElementById('camera-iso');
  cameraFocus = document.getElementById('camera-focus');
  cameraModel = document.getElementById('camera-model');
  lightingInput = document.getElementById('lighting');
  colorPalette = document.getElementById('color-palette');
  colorMood = document.getElementById('color-mood');
  moodDropdown = document.getElementById('mood-dropdown');
  moodSelector = document.getElementById('mood-selector');
  moodEditToggle = document.getElementById('mood-edit-toggle');
  compositionInput = document.getElementById('composition');
  compositionDropdown = document.getElementById('composition-dropdown');
  compositionSelector = document.getElementById('composition-selector');
  compositionEditToggle = document.getElementById('composition-edit-toggle');
  addColorBtn = document.getElementById('add-color');
  jsonOutput = document.getElementById('json-output');
  copyBtn = document.getElementById('copy-btn');
  presetSelect = document.getElementById('preset-select');
  includeEmpty = document.getElementById('include-empty');
  numericLens = document.getElementById('numeric-lens');
  styleDropdown = document.getElementById('style-dropdown');
  styleSelector = document.getElementById('style-selector');
  styleEditToggle = document.getElementById('style-edit-toggle');
  cameraDropdown = document.getElementById('camera-dropdown');
  cameraSelector = document.getElementById('camera-selector');
  cameraEditToggle = document.getElementById('camera-edit-toggle');
  lightingDropdown = document.getElementById('lighting-dropdown');
  lightingSelector = document.getElementById('lighting-selector');
  lightingEditToggle = document.getElementById('lighting-edit-toggle');

  // Setup combo dropdowns
  document.querySelectorAll('.dropdown-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const menuId = btn.dataset.target;
      const menu = document.getElementById(menuId);

      // Close all other menus
      document.querySelectorAll('.dropdown-menu').forEach(m => {
        if (m.id !== menuId) m.classList.remove('open');
      });

      menu.classList.toggle('open');
    });
  });

  document.querySelectorAll('.dropdown-menu .option').forEach(opt => {
    opt.addEventListener('click', () => {
      const menu = opt.closest('.dropdown-menu');
      const input = menu.previousElementSibling.previousElementSibling;
      input.value = opt.dataset.value;
      menu.classList.remove('open');
      updateOutput();
    });
  });

  // Close dropdowns on outside click
  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('open'));
  });

  // Style dropdown change handler
  styleDropdown.addEventListener('change', (e) => {
    styleInput.value = e.target.value;
    updateOutput();
  });

  // Style edit toggle handler
  styleEditToggle.addEventListener('click', () => {
    styleSelector.classList.toggle('edit-mode');
    if (styleSelector.classList.contains('edit-mode')) {
      styleInput.focus();
    }
  });

  // Sync dropdown when text input changes
  styleInput.addEventListener('input', () => {
    let found = false;
    for (const styles of Object.values(stylePresets)) {
      const match = styles.find(s => s.prompt === styleInput.value);
      if (match) {
        styleDropdown.value = match.prompt;
        found = true;
        break;
      }
    }
    if (!found) {
      styleDropdown.value = '';
    }
    updateOutput();
  });

  // Camera dropdown change handler
  cameraDropdown.addEventListener('change', (e) => {
    cameraModel.value = e.target.value;
    updateOutput();
  });

  // Camera edit toggle handler
  cameraEditToggle.addEventListener('click', () => {
    cameraSelector.classList.toggle('edit-mode');
    if (cameraSelector.classList.contains('edit-mode')) {
      cameraModel.focus();
    }
  });

  // Sync camera dropdown when text input changes
  cameraModel.addEventListener('input', () => {
    let found = false;
    for (const cameras of Object.values(cameraPresets)) {
      const match = cameras.find(c => c.prompt === cameraModel.value);
      if (match) {
        cameraDropdown.value = match.prompt;
        found = true;
        break;
      }
    }
    if (!found) {
      cameraDropdown.value = '';
    }
    updateOutput();
  });

  // Lighting dropdown change handler
  lightingDropdown.addEventListener('change', (e) => {
    lightingInput.value = e.target.value;
    updateOutput();
  });

  // Lighting edit toggle handler
  lightingEditToggle.addEventListener('click', () => {
    lightingSelector.classList.toggle('edit-mode');
    if (lightingSelector.classList.contains('edit-mode')) {
      lightingInput.focus();
    }
  });

  // Sync lighting dropdown when text input changes
  lightingInput.addEventListener('input', () => {
    let found = false;
    for (const lights of Object.values(lightingPresets)) {
      const match = lights.find(l => l.prompt === lightingInput.value);
      if (match) {
        lightingDropdown.value = match.prompt;
        found = true;
        break;
      }
    }
    if (!found) {
      lightingDropdown.value = '';
    }
    updateOutput();
  });

  // Mood dropdown change handler
  moodDropdown.addEventListener('change', (e) => {
    colorMood.value = e.target.value;
    updateOutput();
  });

  // Mood edit toggle handler
  moodEditToggle.addEventListener('click', () => {
    moodSelector.classList.toggle('edit-mode');
    if (moodSelector.classList.contains('edit-mode')) {
      colorMood.focus();
    }
  });

  // Sync mood dropdown when text input changes
  colorMood.addEventListener('input', () => {
    let found = false;
    for (const moods of Object.values(moodPresets)) {
      const match = moods.find(m => m.prompt === colorMood.value);
      if (match) {
        moodDropdown.value = match.prompt;
        found = true;
        break;
      }
    }
    if (!found) {
      moodDropdown.value = '';
    }
    updateOutput();
  });

  // Composition dropdown change handler
  compositionDropdown.addEventListener('change', (e) => {
    compositionInput.value = e.target.value;
    updateOutput();
  });

  // Composition edit toggle handler
  compositionEditToggle.addEventListener('click', () => {
    compositionSelector.classList.toggle('edit-mode');
    if (compositionSelector.classList.contains('edit-mode')) {
      compositionInput.focus();
    }
  });

  // Sync composition dropdown when text input changes
  compositionInput.addEventListener('input', () => {
    let found = false;
    for (const compositions of Object.values(compositionPresets)) {
      const match = compositions.find(c => c.prompt === compositionInput.value);
      if (match) {
        compositionDropdown.value = match.prompt;
        found = true;
        break;
      }
    }
    if (!found) {
      compositionDropdown.value = '';
    }
    updateOutput();
  });

  // Add color button
  addColorBtn.addEventListener('click', () => {
    colors.push('');
    renderColors();
    const inputs = colorPalette.querySelectorAll('input');
    inputs[inputs.length - 1].focus();
  });

  // All input listeners
  const allInputs = [
    promptInput, cameraAngle, cameraShot, cameraLens,
    cameraAperture, cameraISO, cameraFocus
  ];

  allInputs.forEach(el => {
    el.addEventListener('input', updateOutput);
    el.addEventListener('change', updateOutput);
  });

  [includeEmpty, numericLens].forEach(el => {
    el.addEventListener('change', updateOutput);
  });

  // Preset select
  presetSelect.addEventListener('change', (e) => {
    const presetName = e.target.value;
    if (presetName && presets[presetName]) {
      loadPreset(presets[presetName]);
    }
  });

  // Copy button
  copyBtn.addEventListener('click', () => {
    const json = generateJSON();
    const text = JSON.stringify(json, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = 'Copy to Clipboard';
        copyBtn.classList.remove('copied');
      }, 2000);
    });
  });

  // Initialize image picker
  initImagePicker();

  // Load data from API
  loadData();
}

// ==========================================
// Image-based Color Picker (Canvas Mode)
// ==========================================

function initImagePicker() {
  // Get DOM elements
  imageDropZone = document.getElementById('image-drop-zone');
  imageInput = document.getElementById('image-input');
  imageCanvas = document.getElementById('image-canvas');
  clearImageBtn = document.getElementById('clear-image');
  pickedColorPreview = document.getElementById('picked-color-preview');
  previewSwatch = document.getElementById('preview-swatch');
  previewHex = document.getElementById('preview-hex');

  // Initialize canvas context
  canvasCtx = imageCanvas.getContext('2d', { willReadFrequently: true });

  // Click to upload
  imageDropZone.addEventListener('click', (e) => {
    // Don't trigger file input if clicking on canvas or clear button
    if (e.target === imageCanvas || e.target === clearImageBtn) return;
    if (!imageDropZone.classList.contains('has-image')) {
      imageInput.click();
    }
  });

  // File input change
  imageInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      loadImageToCanvas(e.target.files[0]);
    }
  });

  // Drag and drop handlers
  imageDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    imageDropZone.classList.add('drag-over');
  });

  imageDropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    imageDropZone.classList.remove('drag-over');
  });

  imageDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    imageDropZone.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type.startsWith('image/')) {
      loadImageToCanvas(files[0]);
    }
  });

  // Clear image button
  clearImageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    clearImage();
  });

  // Canvas click to pick color (auto-adds to palette)
  imageCanvas.addEventListener('click', (e) => {
    pickColorFromCanvas(e);
  });

  // Canvas mousemove to preview color
  imageCanvas.addEventListener('mousemove', (e) => {
    previewColorFromCanvas(e);
  });
}

function loadImageToCanvas(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      // Calculate dimensions to fit within max constraints
      const maxWidth = imageDropZone.clientWidth - 4; // Account for border
      const maxHeight = 300;

      let width = img.width;
      let height = img.height;

      // Scale down if needed
      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (maxHeight / height) * width;
        height = maxHeight;
      }

      // Set canvas size
      imageCanvas.width = width;
      imageCanvas.height = height;

      // Draw image
      canvasCtx.drawImage(img, 0, 0, width, height);

      // Update UI state
      imageDropZone.classList.add('has-image');
      pickedColorPreview.classList.add('visible');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function clearImage() {
  // Clear canvas
  canvasCtx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
  imageCanvas.width = 0;
  imageCanvas.height = 0;

  // Reset file input
  imageInput.value = '';

  // Update UI state
  imageDropZone.classList.remove('has-image');
  pickedColorPreview.classList.remove('visible');
  currentPickedColor = null;
}

function getCanvasColorAt(e) {
  const rect = imageCanvas.getBoundingClientRect();
  const scaleX = imageCanvas.width / rect.width;
  const scaleY = imageCanvas.height / rect.height;

  const x = Math.floor((e.clientX - rect.left) * scaleX);
  const y = Math.floor((e.clientY - rect.top) * scaleY);

  // Get pixel data
  const pixel = canvasCtx.getImageData(x, y, 1, 1).data;

  // Convert to hex
  const hex = '#' +
    pixel[0].toString(16).padStart(2, '0') +
    pixel[1].toString(16).padStart(2, '0') +
    pixel[2].toString(16).padStart(2, '0');

  return hex.toUpperCase();
}

function previewColorFromCanvas(e) {
  if (!imageDropZone.classList.contains('has-image')) return;

  const hex = getCanvasColorAt(e);
  previewSwatch.style.backgroundColor = hex;
  previewHex.textContent = hex;
}

function pickColorFromCanvas(e) {
  if (!imageDropZone.classList.contains('has-image')) return;

  currentPickedColor = getCanvasColorAt(e);
  previewSwatch.style.backgroundColor = currentPickedColor;
  previewHex.textContent = currentPickedColor;

  // Auto-add to palette on click
  colors.push(currentPickedColor);
  renderColors();
  updateOutput();

  // Visual feedback - flash the preview
  pickedColorPreview.style.borderColor = '#7c3aed';
  setTimeout(() => {
    pickedColorPreview.style.borderColor = '#3a3a3a';
  }, 200);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
