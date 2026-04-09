# ShadowBid — Zero-Knowledge Auctions

## Overview
A premium Web3 frontend for sealed-bid ZK auctions on Solana. Three-file static app (no build step).

## Design System
- **Background**: Rich obsidian `#050505` with cool-blue radial gradient overlays
- **Accent colors**: Sapphire `#2563eb` → Aquamarine `#06b6d4` (primary), Emerald `#10b981` (success), Amber `#f59e0b` (processing)
- **Typography**: Inter (UI), Space Grotesk (display/headings), IBM Plex Mono (terminal/data)
- **Animated canvas**: 28 slowly-drifting faint dashed lines in sapphire/aqua hues

## Architecture
- `index.html` — Full app structure (header, hero, auction card, bids list, console panel)
- `style.css`  — Complete design system (glassmorphism, animations, all components)
- `script.js`  — All interactivity (canvas, countdown, wallet, bid flow, ZK console)

## Features
- **Glassmorphic cards** with 4-layer box-shadow "Shadowfall" surface
- **Wallet connect/disconnect** with blinking green indicator + light-pulse sweep
- **Hero stats**: Volume, Sealed Bids, Privacy rate
- **Auction card**: SVG OTC block visualization with animated data-flow lines + breathing glow
- **Floor price reveal**: Layered blur shroud with tap-to-reveal
- **Real-time countdown** with gradient progress bar
- **Bid validation**: USDC prefix, shake animation on invalid input, inline ✓/✗
- **Primary button**: Sapphire→aqua gradient, ambient glow pulse, hover sheen sweep, physical press feel
- **Shadow Protocol Console**: 4-step state machine (ENCRYPT→ROLLUP→ZK PROOF→SUBMIT), CRT scanline overlay
- **Masked bids list**: Slide-up animation on new entry append
- **Toast notifications**: Slide-up with success/error variants

## Server
- Static server on port 80 via `static-web-server`
- No build step required — pure HTML/CSS/JS
