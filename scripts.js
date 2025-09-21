(() => {
  'use strict';

  const config = window.posterConfig || {};
  const canvas = document.getElementById('posterCanvas');
  if (!canvas) {
    return;
  }
  const ctx = canvas.getContext('2d');
  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
  const FONT_FAMILY = '"Noto Sans Devanagari", "Mangal", "Mukta", "Kohinoor Devanagari", sans-serif';
  const BODY_FONT = FONT_FAMILY;
  const DEFAULT_HEADLINE = 'अपना समाचार शीर्षक यहाँ लिखें';
  const DEFAULT_BODY = 'मुख्य समाचार विवरण यहाँ जोड़ा जाएगा। संक्षिप्त बिंदुओं का उपयोग करें ताकि पोस्टर पूरी तरह संतुलित दिखे।';
  const DEFAULT_SECOND_BODY = 'अतिरिक्त जानकारी के लिए यहाँ पाठ लिखें।';
  const istFormatter = new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata'
  });

  const state = {
    design: 'classic',
    headline: '',
    summary: '',
    body: '',
    byline: '',
    username: config.username || 'editor',
    accentColor: '#c62828',
    backgroundColor: '#ffffff'
  };

  const images = {
    masthead: null,
    topAd: null,
    bottomAd: null,
    primary: null,
    secondary: null
  };

  let renderPending = false;

  function requestRender() {
    if (renderPending) {
      return;
    }
    renderPending = true;
    window.requestAnimationFrame(() => {
      renderPending = false;
      renderPoster();
    });
  }

  function loadStaticImage(src, key) {
    if (!src) {
      images[key] = null;
      requestRender();
      return;
    }
    const image = new Image();
    image.onload = requestRender;
    image.src = src;
    if (image.complete) {
      requestRender();
    }
    images[key] = image;
  }

  loadStaticImage(config.masthead, 'masthead');
  if (config.ads) {
    loadStaticImage(config.ads.top, 'topAd');
    loadStaticImage(config.ads.bottom, 'bottomAd');
  }

  const controls = {
    design: document.getElementById('designSelect'),
    headline: document.getElementById('headlineInput'),
    summary: document.getElementById('summaryInput'),
    body: document.getElementById('bodyInput'),
    byline: document.getElementById('bylineInput'),
    primaryPhoto: document.getElementById('primaryPhotoInput'),
    secondaryPhoto: document.getElementById('secondaryPhotoInput'),
    backgroundColor: document.getElementById('backgroundColorInput'),
    accentColor: document.getElementById('accentColorInput'),
    status: document.getElementById('statusText'),
    reset: document.getElementById('resetButton'),
    topAdPreview: document.getElementById('topAdPreview'),
    bottomAdPreview: document.getElementById('bottomAdPreview')
  };

  if (controls.design) {
    state.design = controls.design.value;
    controls.design.addEventListener('change', (event) => {
      state.design = event.target.value;
      announceStatus('');
      requestRender();
    });
  }

  if (controls.headline) {
    state.headline = controls.headline.value;
    controls.headline.addEventListener('input', (event) => {
      state.headline = event.target.value;
      requestRender();
    });
  }

  if (controls.summary) {
    state.summary = controls.summary.value;
    controls.summary.addEventListener('input', (event) => {
      state.summary = event.target.value;
      requestRender();
    });
  }

  if (controls.body) {
    state.body = controls.body.value;
    controls.body.addEventListener('input', (event) => {
      state.body = event.target.value;
      requestRender();
    });
  }

  if (controls.byline) {
    state.byline = controls.byline.value;
    controls.byline.addEventListener('input', (event) => {
      state.byline = event.target.value;
      requestRender();
    });
  }

  if (controls.backgroundColor) {
    state.backgroundColor = controls.backgroundColor.value || state.backgroundColor;
    controls.backgroundColor.addEventListener('input', (event) => {
      state.backgroundColor = event.target.value;
      requestRender();
    });
  }

  if (controls.accentColor) {
    state.accentColor = controls.accentColor.value || state.accentColor;
    controls.accentColor.addEventListener('input', (event) => {
      state.accentColor = event.target.value;
      requestRender();
    });
  }

  if (controls.primaryPhoto) {
    controls.primaryPhoto.addEventListener('change', (event) => {
      handleImageUpload(event.target.files, 'primary');
    });
  }

  if (controls.secondaryPhoto) {
    controls.secondaryPhoto.addEventListener('change', (event) => {
      handleImageUpload(event.target.files, 'secondary');
    });
  }

  if (controls.reset) {
    controls.reset.addEventListener('click', () => {
      if (controls.design) {
        controls.design.selectedIndex = 0;
        state.design = controls.design.value;
      }
      if (controls.headline) {
        controls.headline.value = '';
      }
      if (controls.summary) {
        controls.summary.value = '';
      }
      if (controls.body) {
        controls.body.value = '';
      }
      if (controls.byline) {
        controls.byline.value = '';
      }
      if (controls.primaryPhoto) {
        controls.primaryPhoto.value = '';
      }
      if (controls.secondaryPhoto) {
        controls.secondaryPhoto.value = '';
      }
      if (controls.backgroundColor) {
        controls.backgroundColor.value = '#ffffff';
      }
      if (controls.accentColor) {
        controls.accentColor.value = '#c62828';
      }
      state.headline = '';
      state.summary = '';
      state.body = '';
      state.byline = '';
      state.backgroundColor = '#ffffff';
      state.accentColor = '#c62828';
      images.primary = null;
      images.secondary = null;
      announceStatus('Cleared all fields.');
      requestRender();
    });
  }

  document.querySelectorAll('.export').forEach((button) => {
    button.addEventListener('click', () => {
      const format = button.getAttribute('data-format') || 'png';
      performExport(format);
    });
  });

  function announceStatus(message) {
    if (!controls.status) {
      return;
    }
    controls.status.textContent = message;
  }

  function handleImageUpload(files, key) {
    if (!files || files.length === 0) {
      images[key] = null;
      requestRender();
      return;
    }
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = requestRender;
      img.src = reader.result;
      images[key] = img;
      if (img.complete) {
        requestRender();
      }
    };
    reader.readAsDataURL(file);
  }

  function performExport(format) {
    const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    window.requestAnimationFrame(() => {
      canvas.toBlob((blob) => {
        if (!blob) {
          announceStatus('Export failed. Please try again.');
          return;
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `poster-${state.design}-${timestamp}.${format === 'jpeg' ? 'jpg' : 'png'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        announceStatus(`Exported ${format.toUpperCase()} successfully.`);
        logExport(format).catch(() => {
          announceStatus('Exported, but logging failed.');
        });
      }, mime, format === 'jpeg' ? 0.92 : undefined);
    });
  }

  async function logExport(format) {
    try {
      const response = await fetch('log_export.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          design: state.design,
          format: format
        })
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const data = await response.json();
      if (data && data.nextAds) {
        updateAds(data.nextAds);
      }
      if (data && data.message) {
        announceStatus(data.message);
      }
    } catch (error) {
      throw error;
    }
  }

  function updateAds(nextAds) {
    if (!nextAds) {
      return;
    }
    if (nextAds.top) {
      loadStaticImage(nextAds.top, 'topAd');
      if (controls.topAdPreview) {
        controls.topAdPreview.src = nextAds.top;
      }
    }
    if (nextAds.bottom) {
      loadStaticImage(nextAds.bottom, 'bottomAd');
      if (controls.bottomAdPreview) {
        controls.bottomAdPreview.src = nextAds.bottom;
      }
    }
  }

  function renderPoster() {
    ctx.save();
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = state.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const mastheadHeight = 180;
    const adHeight = 120;
    const topAdY = mastheadHeight;
    const bottomAdY = HEIGHT - adHeight;

    drawMasthead(mastheadHeight);
    drawAdSlot(images.topAd, 0, topAdY, WIDTH, adHeight, 'Top Ad');
    drawAdSlot(images.bottomAd, 0, bottomAdY, WIDTH, adHeight, 'Bottom Ad');

    const marginX = 72;
    const contentTop = topAdY + adHeight + 36;
    const footerReserved = 96;
    const contentBottom = bottomAdY - footerReserved;
    const layout = {
      contentX: marginX,
      contentY: contentTop,
      contentWidth: WIDTH - marginX * 2,
      contentBottom: contentBottom,
      contentHeight: contentBottom - contentTop,
      bottomAdY: bottomAdY
    };

    const renderer = DESIGN_RENDERERS[state.design] || renderClassic;
    renderer(layout);

    drawFooter(bottomAdY);

    ctx.restore();
  }

  function drawMasthead(height) {
    ctx.save();
    if (images.masthead && images.masthead.complete && images.masthead.naturalWidth) {
      ctx.drawImage(images.masthead, 0, 0, WIDTH, height);
    } else {
      ctx.fillStyle = '#0d3a78';
      ctx.fillRect(0, 0, WIDTH, height);
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${Math.floor(height * 0.42)}px ${FONT_FAMILY}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('Chandigarh Dinbhar', 48, height / 2);
    }
    ctx.restore();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
  }

  function drawAdSlot(image, x, y, width, height, label) {
    ctx.save();
    if (image && image.complete && image.naturalWidth) {
      ctx.drawImage(image, x, y, width, height);
    } else {
      ctx.fillStyle = '#f6f6f6';
      ctx.fillRect(x, y, width, height);
      ctx.strokeStyle = hexToRgba(state.accentColor, 0.8);
      ctx.lineWidth = 4;
      ctx.setLineDash([14, 10]);
      ctx.strokeRect(x + 12, y + 12, width - 24, height - 24);
      ctx.setLineDash([]);
      ctx.fillStyle = '#666666';
      ctx.font = `500 ${Math.min(42, height * 0.4)}px ${BODY_FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x + width / 2, y + height / 2);
    }
    ctx.restore();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
  }

  function drawFooter(bottomAdY) {
    const footerText = `www.chandigarhdinbhar.in • ${formatIST()} • Made by: ${state.username}`;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const fontSize = 32;
    ctx.font = `500 ${fontSize}px ${BODY_FONT}`;
    const textWidth = ctx.measureText(footerText).width;
    const paddingX = 24;
    const width = Math.min(textWidth + paddingX * 2, WIDTH - 80);
    const height = fontSize * 1.8;
    const centerX = WIDTH / 2;
    const centerY = bottomAdY - height / 2 - 8;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.fillRect(centerX - width / 2, centerY - height / 2, width, height);
    ctx.fillStyle = '#1f1f1f';
    ctx.fillText(footerText, centerX, centerY);
    ctx.restore();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
  }

  function formatIST() {
    return istFormatter.format(new Date());
  }

  function drawHeadlineBlock(layout) {
    let cursorY = layout.contentY;
    const kicker = (state.summary || '').trim();
    if (kicker) {
      ctx.fillStyle = state.accentColor;
      const kickerSize = 36;
      ctx.font = `600 ${kickerSize}px ${BODY_FONT}`;
      cursorY = drawWrappedText(kicker, layout.contentX, cursorY, layout.contentWidth, kickerSize * 1.2);
      cursorY += 12;
    }
    const headlineText = (state.headline || '').trim() || DEFAULT_HEADLINE;
    const baseSize = 82;
    const headlineSize = adjustFontSize(headlineText, layout.contentWidth, baseSize, 48, '700');
    ctx.fillStyle = '#121212';
    ctx.font = `700 ${headlineSize}px ${FONT_FAMILY}`;
    cursorY = drawWrappedText(headlineText, layout.contentX, cursorY, layout.contentWidth, headlineSize * 1.05);
    return cursorY;
  }

  function adjustFontSize(text, maxWidth, baseSize, minSize, weight) {
    const words = (text || '').split(/\s+/).filter(Boolean);
    let size = baseSize;
    if (words.length === 0) {
      ctx.font = `${weight} ${baseSize}px ${FONT_FAMILY}`;
      return baseSize;
    }
    while (size > minSize) {
      ctx.font = `${weight} ${size}px ${FONT_FAMILY}`;
      const tooWide = words.some((word) => ctx.measureText(word).width > maxWidth);
      if (!tooWide) {
        break;
      }
      size -= 2;
    }
    size = Math.max(size, minSize);
    ctx.font = `${weight} ${size}px ${FONT_FAMILY}`;
    return size;
  }

  function drawWrappedText(text, x, y, maxWidth, lineHeight) {
    const paragraphs = (text || '').split(/\n+/);
    let cursorY = y;
    paragraphs.forEach((paragraph, index) => {
      const words = paragraph.trim().split(/\s+/).filter(Boolean);
      if (words.length === 0) {
        cursorY += lineHeight;
        return;
      }
      let line = '';
      words.forEach((word) => {
        const testLine = line ? `${line} ${word}` : word;
        if (ctx.measureText(testLine).width > maxWidth && line) {
          ctx.fillText(line, x, cursorY);
          line = word;
          cursorY += lineHeight;
        } else {
          line = testLine;
        }
      });
      if (line) {
        ctx.fillText(line, x, cursorY);
        cursorY += lineHeight;
      }
      if (index < paragraphs.length - 1) {
        cursorY += lineHeight * 0.6;
      }
    });
    return cursorY;
  }

  function drawByline(x, y) {
    const bylineText = (state.byline || '').trim();
    if (!bylineText) {
      return y;
    }
    const size = 32;
    ctx.fillStyle = hexToRgba(state.accentColor, 0.9);
    ctx.font = `600 ${size}px ${BODY_FONT}`;
    ctx.fillText(bylineText, x, y);
    return y + size * 1.4;
  }

  function computePhotoLayout(layout, headerBottom, fraction, minHeight, reservedSpace) {
    const photoY = headerBottom + 3;
    const available = layout.contentBottom - photoY;
    if (available <= 180) {
      return { y: photoY, height: Math.max(available - 40, 160) };
    }
    const min = minHeight || 240;
    const reserved = reservedSpace || 160;
    let height = Math.min(layout.contentHeight * fraction, 540);
    if (!Number.isFinite(height) || height < min) {
      height = Math.min(available - reserved, Math.max(min, available * 0.55));
    }
    if (!Number.isFinite(height) || height <= 0) {
      height = Math.max(available - reserved, min);
    }
    if (height > available - 80) {
      height = Math.max(min, available - 80);
    }
    if (height < min) {
      height = Math.min(min, available - 60);
    }
    if (!Number.isFinite(height) || height <= 0) {
      height = Math.max(available * 0.7, 200);
    }
    height = Math.max(160, Math.min(height, available - 40));
    return { y: photoY, height: height };
  }

  function drawPrimaryPhoto(x, y, width, height, placeholderLabel) {
    if (height <= 0) {
      return y;
    }
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();
    if (images.primary && images.primary.complete && images.primary.naturalWidth) {
      drawImageCover(images.primary, x, y, width, height);
    } else {
      drawPhotoPlaceholder(x, y, width, height, placeholderLabel);
    }
    ctx.restore();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    return y + height;
  }

  function drawSecondaryPhoto(x, y, width, height, placeholderLabel) {
    if (height <= 0) {
      return y;
    }
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();
    if (images.secondary && images.secondary.complete && images.secondary.naturalWidth) {
      drawImageCover(images.secondary, x, y, width, height);
    } else {
      drawPhotoPlaceholder(x, y, width, height, placeholderLabel);
    }
    ctx.restore();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    return y + height;
  }

  function drawPhotoPlaceholder(x, y, width, height, label) {
    ctx.fillStyle = '#f2f2f2';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = hexToRgba(state.accentColor, 0.8);
    ctx.lineWidth = 4;
    ctx.setLineDash([16, 12]);
    ctx.strokeRect(x + 10, y + 10, width - 20, height - 20);
    ctx.setLineDash([]);
    ctx.fillStyle = '#666666';
    const fontSize = Math.max(28, Math.min(width, height) * 0.06);
    ctx.font = `500 ${fontSize}px ${BODY_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + width / 2, y + height / 2);
  }

  function drawImageCover(image, x, y, width, height) {
    const imgWidth = image.naturalWidth || image.width;
    const imgHeight = image.naturalHeight || image.height;
    const imageRatio = imgWidth / imgHeight;
    const targetRatio = width / height;
    let sx = 0;
    let sy = 0;
    let sWidth = imgWidth;
    let sHeight = imgHeight;

    if (imageRatio > targetRatio) {
      sHeight = imgHeight;
      sWidth = sHeight * targetRatio;
      sx = (imgWidth - sWidth) / 2;
    } else {
      sWidth = imgWidth;
      sHeight = sWidth / targetRatio;
      sy = (imgHeight - sHeight) / 2;
    }

    ctx.drawImage(image, sx, sy, sWidth, sHeight, x, y, width, height);
  }

  function drawJustifiedText(text, x, y, maxWidth, lineHeight, options) {
    const maxHeight = options && typeof options.maxHeight === 'number' ? options.maxHeight : Infinity;
    const maxY = y + maxHeight;
    const paragraphs = (text || '').split(/\n+/);
    const spaceWidth = ctx.measureText(' ').width || 4;
    let cursorY = y;

    for (let pIndex = 0; pIndex < paragraphs.length; pIndex += 1) {
      const paragraph = paragraphs[pIndex].trim();
      if (paragraph.length === 0) {
        if (cursorY + lineHeight > maxY) {
          const remainderParas = paragraphs.slice(pIndex + 1);
          return { y: cursorY, remainder: remainderParas.join('\n').trim() };
        }
        cursorY += lineHeight;
        continue;
      }

      const words = paragraph.split(/\s+/);
      let lineWords = [];
      let lineWidth = 0;

      for (let wIndex = 0; wIndex < words.length; wIndex += 1) {
        const word = words[wIndex];
        const wordWidth = ctx.measureText(word).width;
        if (lineWords.length === 0) {
          lineWords.push(word);
          lineWidth = wordWidth;
          continue;
        }
        const projectedWidth = lineWidth + spaceWidth + wordWidth;
        if (projectedWidth > maxWidth) {
          if (cursorY + lineHeight > maxY) {
            const remainderParagraph = lineWords.concat(words.slice(wIndex)).join(' ');
            const remainder = [remainderParagraph].concat(paragraphs.slice(pIndex + 1)).join('\n');
            return { y: cursorY, remainder: remainder.trim() };
          }
          drawJustifiedLine(lineWords, x, cursorY, maxWidth, spaceWidth, false);
          cursorY += lineHeight;
          lineWords = [word];
          lineWidth = wordWidth;
        } else {
          lineWords.push(word);
          lineWidth = projectedWidth;
        }
      }

      if (lineWords.length > 0) {
        if (cursorY + lineHeight > maxY) {
          const remainder = [lineWords.join(' ')].concat(paragraphs.slice(pIndex + 1)).join('\n');
          return { y: cursorY, remainder: remainder.trim() };
        }
        drawJustifiedLine(lineWords, x, cursorY, maxWidth, spaceWidth, true);
        cursorY += lineHeight;
      }

      if (pIndex < paragraphs.length - 1) {
        if (cursorY + lineHeight * 0.6 > maxY) {
          const remainder = paragraphs.slice(pIndex + 1).join('\n');
          return { y: cursorY, remainder: remainder.trim() };
        }
        cursorY += lineHeight * 0.6;
      }
    }

    return { y: cursorY, remainder: '' };
  }

  function drawJustifiedLine(words, x, y, maxWidth, spaceWidth, isLastLine) {
    if (words.length <= 1 || isLastLine) {
      ctx.fillText(words.join(' '), x, y);
      return;
    }
    const totalWordsWidth = words.reduce((sum, word) => sum + ctx.measureText(word).width, 0);
    const gaps = words.length - 1;
    const gapWidth = gaps > 0 ? (maxWidth - totalWordsWidth) / gaps : spaceWidth;
    let cursorX = x;
    words.forEach((word, index) => {
      ctx.fillText(word, cursorX, y);
      if (index < words.length - 1) {
        cursorX += ctx.measureText(word).width + gapWidth;
      }
    });
  }

  function renderClassic(layout) {
    const headerBottom = drawHeadlineBlock(layout);
    const photo = computePhotoLayout(layout, headerBottom, 0.52, 260, 160);
    const photoBottom = drawPrimaryPhoto(layout.contentX, photo.y, layout.contentWidth, photo.height, 'Upload primary photo');
    let textY = photoBottom + 24;
    textY = drawByline(layout.contentX, textY);
    const bodyText = (state.body || '').trim() || DEFAULT_BODY;
    ctx.fillStyle = '#1b1b1b';
    const bodySize = 38;
    ctx.font = `400 ${bodySize}px ${BODY_FONT}`;
    drawJustifiedText(bodyText, layout.contentX, textY, layout.contentWidth, bodySize * 1.45, { maxHeight: layout.contentBottom - textY });
  }

  function renderCompact(layout) {
    const headerBottom = drawHeadlineBlock(layout);
    const photo = computePhotoLayout(layout, headerBottom, 0.42, 220, 140);
    const photoBottom = drawPrimaryPhoto(layout.contentX, photo.y, layout.contentWidth, photo.height, 'Upload primary photo');
    let cardY = photoBottom + 20;
    let cardHeight = layout.contentBottom - cardY;
    if (cardHeight < 160) {
      cardHeight = 160;
    }
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(layout.contentX, cardY, layout.contentWidth, cardHeight);
    ctx.restore();
    let textY = cardY + 24;
    textY = drawByline(layout.contentX + 24, textY);
    const bodyText = (state.body || '').trim() || DEFAULT_BODY;
    ctx.fillStyle = '#1d1d1d';
    const bodySize = 34;
    ctx.font = `400 ${bodySize}px ${BODY_FONT}`;
    drawJustifiedText(bodyText, layout.contentX + 24, textY, layout.contentWidth - 48, bodySize * 1.4, { maxHeight: cardHeight - (textY - cardY) - 24 });
  }

  function renderMagazine(layout) {
    const headerBottom = drawHeadlineBlock(layout);
    const photo = computePhotoLayout(layout, headerBottom, 0.6, 260, 160);
    const photoBottom = drawPrimaryPhoto(layout.contentX, photo.y, layout.contentWidth, photo.height, 'Upload primary photo');
    const overlayHeight = Math.min(150, photo.height * 0.32);
    ctx.save();
    ctx.fillStyle = hexToRgba(state.accentColor, 0.82);
    ctx.fillRect(layout.contentX, photoBottom - overlayHeight, layout.contentWidth, overlayHeight);
    ctx.fillStyle = '#ffffff';
    const overlayFont = Math.max(34, overlayHeight * 0.35);
    ctx.font = `600 ${overlayFont}px ${BODY_FONT}`;
    drawWrappedText((state.summary || '').trim() || 'प्रमुख बिंदु यहाँ जाएँ', layout.contentX + 24, photoBottom - overlayHeight + 16, layout.contentWidth - 48, overlayFont * 1.15);
    ctx.restore();
    let textY = photoBottom + 24;
    textY = drawByline(layout.contentX, textY);
    const bodyText = (state.body || '').trim() || DEFAULT_BODY;
    ctx.fillStyle = '#1b1b1b';
    const bodySize = 36;
    ctx.font = `400 ${bodySize}px ${BODY_FONT}`;
    drawJustifiedText(bodyText, layout.contentX, textY, layout.contentWidth, bodySize * 1.45, { maxHeight: layout.contentBottom - textY });
  }

  function renderOverlay(layout) {
    const headerBottom = drawHeadlineBlock(layout);
    const photo = computePhotoLayout(layout, headerBottom, 0.68, 260, 120);
    const photoBottom = drawPrimaryPhoto(layout.contentX, photo.y, layout.contentWidth, photo.height, 'Upload primary photo');
    ctx.save();
    ctx.fillStyle = hexToRgba('#000000', 0.35);
    ctx.fillRect(layout.contentX, photo.y, layout.contentWidth, photo.height);
    const overlayPadding = 36;
    ctx.fillStyle = '#ffffff';
    const bodySize = 36;
    ctx.font = `400 ${bodySize}px ${BODY_FONT}`;
    drawJustifiedText((state.body || '').trim() || DEFAULT_BODY, layout.contentX + overlayPadding, photo.y + overlayPadding, layout.contentWidth - overlayPadding * 2, bodySize * 1.4, { maxHeight: photo.height - overlayPadding * 2 });
    ctx.restore();
    let textY = photoBottom + 18;
    textY = drawByline(layout.contentX, textY);
  }

  function renderTwoColumn(layout) {
    const headerBottom = drawHeadlineBlock(layout);
    const photo = computePhotoLayout(layout, headerBottom, 0.48, 240, 160);
    const photoBottom = drawPrimaryPhoto(layout.contentX, photo.y, layout.contentWidth, photo.height, 'Upload primary photo');
    let textY = photoBottom + 24;
    textY = drawByline(layout.contentX, textY);
    const columnGap = 42;
    const columnWidth = (layout.contentWidth - columnGap) / 2;
    const bodyText = (state.body || '').trim() || DEFAULT_BODY;
    ctx.fillStyle = '#1d1d1d';
    const bodySize = 34;
    ctx.font = `400 ${bodySize}px ${BODY_FONT}`;
    const maxHeight = layout.contentBottom - textY;
    const first = drawJustifiedText(bodyText, layout.contentX, textY, columnWidth, bodySize * 1.4, { maxHeight: maxHeight });
    if (first.remainder) {
      drawJustifiedText(first.remainder, layout.contentX + columnWidth + columnGap, textY, columnWidth, bodySize * 1.4, { maxHeight: maxHeight });
    }
  }

  function renderTwoPhotos(layout) {
    const headerBottom = drawHeadlineBlock(layout);
    const primaryLayout = computePhotoLayout(layout, headerBottom, 0.4, 220, 220);
    const firstBottom = drawPrimaryPhoto(layout.contentX, primaryLayout.y, layout.contentWidth, primaryLayout.height, 'Upload primary photo');
    const secondY = firstBottom + 12;
    const remaining = layout.contentBottom - secondY;
    const secondHeight = Math.max(200, Math.min(remaining * 0.5, 420));
    const secondBottom = drawSecondaryPhoto(layout.contentX, secondY, layout.contentWidth, secondHeight, 'Upload secondary photo');
    let textY = secondBottom + 20;
    textY = drawByline(layout.contentX, textY);
    const bodyText = (state.body || '').trim() || DEFAULT_SECOND_BODY;
    ctx.fillStyle = '#202020';
    const bodySize = 34;
    ctx.font = `400 ${bodySize}px ${BODY_FONT}`;
    drawJustifiedText(bodyText, layout.contentX, textY, layout.contentWidth, bodySize * 1.45, { maxHeight: layout.contentBottom - textY });
  }

  const DESIGN_RENDERERS = {
    classic: renderClassic,
    compact: renderCompact,
    magazine: renderMagazine,
    overlay: renderOverlay,
    two_column: renderTwoColumn,
    two_photos: renderTwoPhotos
  };

  function hexToRgba(hex, alpha) {
    if (!hex) {
      return `rgba(0, 0, 0, ${alpha})`;
    }
    let value = hex.replace('#', '');
    if (value.length === 3) {
      value = value.split('').map((char) => char + char).join('');
    }
    const intValue = parseInt(value, 16);
    const r = (intValue >> 16) & 255;
    const g = (intValue >> 8) & 255;
    const b = intValue & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  requestRender();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(requestRender).catch(() => {
      requestRender();
    });
  }
})();
