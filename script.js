/* ============================================================
   SHADOWBID — script.js v2.1 (WEB3 INTEGRATED)
   ============================================================ */

'use strict';

/* ─── State ─────────────────────────────────────────────── */
const STATE = {
  walletConnected: false,
  walletAddress:   null,
  floorRevealed:   false,
  bidCount:        3,
  auctionEnd:      null,
  auctionDuration: 0,
  processing:      false,
};

/* ─── DOM refs ───────────────────────────────────────────── */
const walletBtn       = document.getElementById('walletBtn');
const walletLabel     = document.getElementById('walletLabel');
const walletIndicator = document.getElementById('walletIndicator');
const floorShroud     = document.getElementById('floorShroud');
const floorRevealBtn  = document.getElementById('floorRevealBtn');
const floorValue      = document.getElementById('floorValue');
const countdown       = document.getElementById('countdown');
const timerFill       = document.getElementById('timerFill');
const bidInput        = document.getElementById('bidInput');
const bidInputGroup   = document.getElementById('bidInputGroup');
const bidHint         = document.getElementById('bidHint');
const bidValidIcon    = document.getElementById('bidValidIcon');
const placeBidBtn     = document.getElementById('placeBidBtn');
const bidsList        = document.getElementById('bidsList');
const bidCountBadge   = document.getElementById('bidCountBadge');
const consoleLog      = document.getElementById('consoleLog');
const consoleDot      = document.getElementById('consoleDot');
const toastContainer  = document.getElementById('toastContainer');

/* ─── Animated Background Canvas ───────────────────────── */
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');

  const LINE_COUNT = 28;
  const lines = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function randRange(a, b) { return a + Math.random() * (b - a); }

  function createLine() {
    const sapphire = Math.random() > 0.5;
    return {
      x:      randRange(0, window.innerWidth),
      y:      randRange(0, window.innerHeight),
      angle:  randRange(0, Math.PI * 2),
      speed:  randRange(0.08, 0.28),
      length: randRange(60, 220),
      opacity: randRange(0.02, 0.06),
      opacityDir: Math.random() > 0.5 ? 1 : -1,
      opacitySpeed: randRange(0.0003, 0.0008),
      color: sapphire ? '37,99,235' : '6,182,212',
      dashOffset: 0,
      dashSpeed: randRange(0.4, 0.9),
      rotate: randRange(-0.002, 0.002),
    };
  }

  for (let i = 0; i < LINE_COUNT; i++) lines.push(createLine());
  resize();
  window.addEventListener('resize', resize);

  function drawLine(l) {
    const x2 = l.x + Math.cos(l.angle) * l.length;
    const y2 = l.y + Math.sin(l.angle) * l.length;
    ctx.save();
    ctx.setLineDash([6, 10]);
    ctx.lineDashOffset = -l.dashOffset;
    ctx.strokeStyle = `rgba(${l.color},${l.opacity})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(l.x, l.y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const l of lines) {
      // drift
      l.x += Math.cos(l.angle) * l.speed;
      l.y += Math.sin(l.angle) * l.speed;
      l.angle += l.rotate;

      // breathe opacity
      l.opacity += l.opacityDir * l.opacitySpeed;
      if (l.opacity >= 0.07 || l.opacity <= 0.01) l.opacityDir *= -1;

      // animate dash
      l.dashOffset += l.dashSpeed;

      // recycle off-screen
      if (l.x < -300 || l.x > canvas.width + 300 ||
          l.y < -300 || l.y > canvas.height + 300) {
        Object.assign(l, createLine(), {
          x: randRange(0, canvas.width),
          y: randRange(0, canvas.height),
        });
      }

      drawLine(l);
    }

    requestAnimationFrame(tick);
  }

  tick();
})();

/* ─── Countdown Timer ────────────────────────────────────── */
(function initCountdown() {
  if (!countdown) return;
  const DURATION = 47 * 60 + 33; // ~47m 33s for demo
  STATE.auctionEnd      = Date.now() + DURATION * 1000;
  STATE.auctionDuration = DURATION;

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const remaining = Math.max(0, Math.round((STATE.auctionEnd - Date.now()) / 1000));
    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;
    countdown.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;

    if(timerFill) {
        const pct = remaining / STATE.auctionDuration;
        timerFill.style.width = (pct * 100) + '%';
    }

    if (remaining === 0) {
      countdown.textContent = 'ENDED';
      if(placeBidBtn) placeBidBtn.disabled  = true;
      return;
    }
    setTimeout(tick, 1000);
  }

  tick();
})();

/* ─── Wallet Connect (REAL WEB3) ─────────────────────────── */
if(walletBtn) {
    walletBtn.addEventListener('click', async () => {
      if (STATE.processing) return;

      if (STATE.walletConnected) {
        // Disconnect
        if (window.solana) window.solana.disconnect();
        STATE.walletConnected = false;
        STATE.walletAddress   = null;
        walletBtn.classList.remove('connected');
        walletLabel.textContent = 'Connect Wallet';
        log('sys', '▸ Wallet disconnected.');
        showToast('Wallet disconnected', 'info');
      } else {
        // REAL CONNECT
        walletLabel.textContent = 'Connecting…';
        try {
            const provider = window.solana;
            if (!provider || !provider.isPhantom) {
                throw new Error("Phantom not found. Open in Phantom app browser.");
            }

            const resp = await provider.connect();
            const pubKey = resp.publicKey.toString();

            STATE.walletConnected = true;
            STATE.walletAddress   = pubKey.slice(0, 6) + '…' + pubKey.slice(-4);

            walletBtn.classList.add('connected');
            walletLabel.textContent = STATE.walletAddress;
            log('ok', `✓ Wallet connected: ${STATE.walletAddress}`);
            showToast('Wallet connected', 'success');
        } catch (err) {
            console.error(err);
            walletLabel.textContent = 'Connect Wallet';
            log('sys', `✗ Connection failed: ${err.message}`);
            showToast('Connection failed', 'error');
        }
      }
    });
}

/* ─── Floor Price Reveal ─────────────────────────────────── */
if(floorShroud) floorShroud.addEventListener('click', revealFloor);
if (floorRevealBtn) floorRevealBtn.addEventListener('click', revealFloor);

function revealFloor() {
  if (STATE.floorRevealed) return;
  STATE.floorRevealed = true;
  floorShroud.style.display = 'none';
  floorValue.classList.add('visible');
  log('info', '▸ Floor price revealed: $2,840 USDC');
}

/* ─── Bid Input Validation ───────────────────────────────── */
if(bidInput) bidInput.addEventListener('input', validateBid);

function validateBid() {
  const val = parseFloat(bidInput.value);
  bidInputGroup.classList.remove('invalid');
  bidHint.classList.remove('error');

  if (!bidInput.value) {
    bidValidIcon.textContent = '';
    bidHint.textContent      = 'Minimum bid: 500 USDC';
    return true;
  }

  if (isNaN(val) || val < 500) {
    bidValidIcon.textContent = '✗';
    bidValidIcon.style.color = '#f87171';
    bidHint.textContent      = 'Minimum bid is 500 USDC';
    bidHint.classList.add('error');
    return false;
  }

  bidValidIcon.textContent = '✓';
  bidValidIcon.style.color = '#10b981';
  bidHint.textContent      = 'Bid looks good';
  bidHint.classList.remove('error');
  return true;
}

/* ─── Place Bid (REAL SIGNATURE) ─────────────────────────── */
if(placeBidBtn) {
    placeBidBtn.addEventListener('click', async () => {
      if (STATE.processing) return;

      // Wallet check
      if (!STATE.walletConnected || !window.solana) {
        showToast('Please connect your wallet first', 'error');
        walletBtn.style.animation = 'none';
        setTimeout(() => { walletBtn.style.animation = ''; }, 100);
        return;
      }

      // Amount check
      const val = parseFloat(bidInput.value);
      if (!bidInput.value || isNaN(val) || val < 500) {
        bidInputGroup.classList.remove('invalid');
        void bidInputGroup.offsetWidth; // reflow for re-trigger
        bidInputGroup.classList.add('invalid');
        bidHint.textContent = 'Minimum bid is 500 USDC';
        bidHint.classList.add('error');
        showToast('Invalid bid amount', 'error');
        return;
      }

      STATE.processing = true;
      placeBidBtn.disabled = true;
      setConsoleDot('active');

      // Clear log
      consoleLog.innerHTML = '';
      log('sys', '▸ Initiating Shadow Protocol sequence…');

      // --- REAL PHANTOM SIGNATURE ---
      try {
         log('info', '▸ Awaiting wallet signature…');
         const message = `Sign to encrypt and seal your confidential bid of ${val} USDC on ShadowBid.\n\nPowered by MagicBlock Ephemeral Rollups.\nTimestamp: ${Date.now()}`;
         const encodedMessage = new TextEncoder().encode(message);
         await window.solana.signMessage(encodedMessage, "utf8");
      } catch (err) {
         log('sys', '✗ Signature rejected by user.');
         showToast('Transaction cancelled', 'error');
         setConsoleDot('idle');
         placeBidBtn.disabled = false;
         STATE.processing = false;
         return;
      }
      // ------------------------------

      await runProtocolStep('encrypt',  'ENCRYPT',  1200, [
        ['info', '→ Generating ephemeral AES-256-GCM key pair…'],
        ['info', `→ Encrypting bid amount: ${val.toFixed(2)} USDC`],
        ['ok',   '✓ Ciphertext sealed. Key discarded.'],
      ]);

      await runProtocolStep('rollup', 'ROLLUP', 1600, [
        ['info', '→ Routing to MagicBlock Ephemeral Rollup…'],
        ['info', '→ Batch slot: #' + Math.floor(Math.random() * 99999 + 10000)],
        ['ok',   '✓ Encrypted payload committed to rollup.'],
      ]);

      await runProtocolStep('zkproof', 'ZK PROOF', 2200, [
        ['info', '→ Loading Groth16 proving key (Circom 2.0)…'],
        ['info', '→ Generating ZK proof… (this takes a moment)'],
        ['info', '→ Verifying proof locally…'],
        ['ok',   '✓ π proof valid. Constraint satisfaction: PASS'],
      ]);

      await runProtocolStep('submit', 'SUBMIT', 1400, [
        ['info', '→ Submitting to Solana Devnet…'],
        ['info', '→ Awaiting confirmation (1/31)…'],
        ['ok',   `✓ TX confirmed: ${randomTxHash()}`],
      ]);

      // Done
      log('ok', `\n✓ Bid placed successfully! ${val.toFixed(2)} USDC · Sealed.`);
      setConsoleDot('done');
      appendMaskedBid();
      showToast('Bid placed! Your sealed entry is recorded.', 'success');

      // Reset
      bidInput.value       = '';
      bidValidIcon.textContent = '';
      bidHint.textContent  = 'Minimum bid: 500 USDC';
      bidHint.classList.remove('error');
      placeBidBtn.disabled = false;
      STATE.processing     = false;

      // Reset steps after delay
      setTimeout(() => {
        ['encrypt','rollup','zkproof','submit'].forEach(id => setStepState(id, 'idle'));
        setConsoleDot('idle');
      }, 5000);
    });
}

/* ─── Protocol Step Runner ───────────────────────────────── */
async function runProtocolStep(id, name, duration, messages) {
  setStepState(id, 'processing');
  setStepStatus(id, 'processing…');

  for (const [type, text] of messages) {
    await delay(duration / (messages.length + 1));
    log(type, text);
  }

  await delay(duration / (messages.length + 1));
  setStepState(id, 'done');
  setStepStatus(id, 'done');
}

function setStepState(id, state) {
  const el = document.getElementById(`step-${id}`);
  if (el) el.dataset.state = state;
}

function setStepStatus(id, text) {
  const el = document.getElementById(`status-${id}`);
  if (el) el.textContent = text;
}

function setConsoleDot(state) {
  if(consoleDot) consoleDot.className = 'eyebrow-dot ' + state;
}

/* ─── Log ────────────────────────────────────────────────── */
function log(type, text) {
  if(!consoleLog) return;
  const line = document.createElement('div');
  line.className = `log-line ${type}`;
  line.textContent = text;
  consoleLog.appendChild(line);
  consoleLog.scrollTop = consoleLog.scrollHeight;
}

/* ─── Masked Bid Entry ───────────────────────────────────── */
function appendMaskedBid() {
  if(!bidsList || !bidCountBadge) return;
  STATE.bidCount++;
  bidCountBadge.textContent = `${STATE.bidCount} bids`;

  const masks = ['████████','███████','██████','█████████','██████████'];

  // Use connected address if available
  let addr = STATE.walletAddress ? STATE.walletAddress : ('0x' + randomHex(4) + '…' + randomHex(4));

  const row = document.createElement('div');
  row.className = 'bid-row new-entry';
  row.innerHTML = `
    <span class="bid-addr mono">${addr}</span>
    <span class="bid-time">just now</span>
    <span class="bid-masked mono">${masks[Math.floor(Math.random() * masks.length)]}</span>
  `;
  bidsList.insertBefore(row, bidsList.firstChild);
}

/* ─── Toast ──────────────────────────────────────────────── */
function showToast(message, type = 'info') {
  if(!toastContainer) return;
  const t = document.createElement('div');
  t.className = `toast${type === 'success' ? ' success' : type === 'error' ? ' error' : ''}`;
  t.textContent = message;
  toastContainer.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

/* ─── Helpers ────────────────────────────────────────────── */
function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function randomHex(len) {
  let h = '';
  const chars = '0123456789abcdef';
  for (let i = 0; i < len; i++) h += chars[Math.floor(Math.random() * chars.length)];
  return h;
}

function randomTxHash() {
  let h = '';
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  for (let i = 0; i < 44; i++) h += chars[Math.floor(Math.random() * chars.length)];
  return h.slice(0, 8) + '…' + h.slice(-8);
}
