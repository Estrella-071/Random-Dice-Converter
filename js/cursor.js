document.addEventListener("DOMContentLoaded", function() {
    (function() { "use strict"; 
        const body=document.body; if(body.classList.contains('is-touch-device')){body.classList.add('native-cursor'); return;} const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; const animSpeedMultiplier = prefersReducedMotion ? 0 : 1; const CURSOR_DEFAULT_SIZE=16,CURSOR_BUTTON_SIZE=28,CURSOR_BUTTON_SCALE=1.1,CURSOR_INPUT_WIDTH=3,CURSOR_DISABLED_SCALE=.7; const ANIM_DURATION_NORMAL = 0.15 * animSpeedMultiplier, ANIM_DURATION_FAST = 0.08 * animSpeedMultiplier, TRANSITION_DURATION = 0.20 * animSpeedMultiplier; const EASE_STANDARD = "power1.out", EASE_BOUNCE = "back.out(1.2)", EASE_IN = "power1.in", EASE_ELASTIC_RECOVER = "elastic.out(1, 0.4)"; const SELECTION_BOX_PADDING_X=4,SELECTION_BOX_PADDING_Y=2; const DEFORM_STRETCH_FACTOR=.02, DEFORM_SQUISH_FACTOR=.015, MAX_STRETCH=1.6, MIN_SQUISH=.5; const DEFORM_ANIM_DURATION = 0.07 * animSpeedMultiplier, DEFORM_RECOVER_DURATION = 0.25 * animSpeedMultiplier; const CURSOR_MOVE_DURATION = 0.03 * animSpeedMultiplier, CURSOR_MOVE_EASE = "none"; const IDLE_TIME=1300,BREATHING_SCALE=1.06,BREATHING_DURATION=2.0; const SHADOW_BASE_BLUR=8, SHADOW_SPEED_BLUR_FACTOR=.1, SHADOW_SPEED_OFFSET_FACTOR=.12, SHADOW_MAX_OFFSET=5, SHADOW_MAX_BLUR_ADD=10; 
        const cursor=document.querySelector(".cursor"),cursorInner=document.querySelector(".cursor-inner"),selectionBox=document.querySelector(".selection-box"),selectionIndicator=document.querySelector(".selection-cursor-indicator");
        let cursorState="default",cursorLastClientX=0,cursorLastClientY=0,cursorCurrentAngle=0,cursorIsSelectingText=!1,cursorRafMoveId=null,cursorRafSelectId=null,cursorIsVisible=!1,cursorJustStartedSelection=!1,cursorRecoverTween=null,cursorIdleTimer=null,cursorBreathingTween=null;
        let isPanningChart = false; let cursorTargetHeight = 25; let contextMenuVisible = false;
        
        function getCurrentColorWithAlpha(varName, alpha){ try{ const colorStr = getComputedStyle(document.body).getPropertyValue(varName).trim(); if (colorStr.startsWith('hsl')) { const match = colorStr.match(/hsla?\(\s*(\d+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(?:\s*,\s*([\d.]+))?\s*\)/i); if(match) return `hsla(${match[1]}, ${match[2]}%, ${match[3]}%, ${alpha})`; } else if (colorStr.startsWith('rgb')) { const match = colorStr.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/i); if(match) return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`; } else if (colorStr.startsWith('#')) { let r = 0, g = 0, b = 0; if (colorStr.length === 4) { r = parseInt(colorStr[1] + colorStr[1], 16); g = parseInt(colorStr[2] + colorStr[2], 16); b = parseInt(colorStr[3] + colorStr[3], 16); } else if (colorStr.length === 7) { r = parseInt(colorStr[1] + colorStr[2], 16); g = parseInt(colorStr[3] + colorStr[4], 16); b = parseInt(colorStr[5] + colorStr[6], 16); } return `rgba(${r}, ${g}, ${b}, ${alpha})`; } }catch(e){ } const fallbackColor = varName === '--text-color' ? (body.classList.contains('light-theme') ? "51, 51, 51" : "230, 230, 230") : "52, 152, 219"; return `rgba(${fallbackColor}, ${alpha})`; }
        const getVarOpacity = (varName, fallback) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || fallback);
        const defaultShadowThemed = () => `0 0 ${SHADOW_BASE_BLUR}px ${getCurrentColorWithAlpha("--text-color", getVarOpacity("--cursor-shadow-opacity", 0.5))}`;

        function setCursorState(newState) {
            if (body.classList.contains('native-cursor')) return;
            if (newState === cursorState) return;
            
            const oldState = cursorState;
            cursorState = newState;
            
            gsap.killTweensOf(cursorInner, "width,height,scale,opacity,filter,boxShadow,transform,backgroundColor,borderRadius");
            if (cursorRecoverTween) { cursorRecoverTween.kill(); cursorRecoverTween = null; }
            cursorKillBreathing();
            
            cursor.className = `cursor cursor-state-${newState}`;

            let targetProps = {}; let ease = EASE_BOUNCE; let duration = TRANSITION_DURATION;

            if (newState === "textSelect") {
                cursorIsSelectingText = true;
                targetProps = { width: CURSOR_DEFAULT_SIZE, height: cursorTargetHeight, scaleX: CURSOR_INPUT_WIDTH / CURSOR_DEFAULT_SIZE, scaleY: 1, borderRadius: "1px" };
            } else {
                cursorIsSelectingText = false;
                switch (newState) {
                    case "link": case "button": targetProps = { width: CURSOR_BUTTON_SIZE, height: CURSOR_BUTTON_SIZE, scale: CURSOR_BUTTON_SCALE, borderRadius: "50%" }; break;
                    case "chartPanning": case "dragging": targetProps = { width: CURSOR_BUTTON_SIZE, height: CURSOR_BUTTON_SIZE, scale: CURSOR_BUTTON_SCALE * 0.9, borderRadius: "50%" }; ease = EASE_STANDARD; break;
                    case "input": case "text": targetProps = { width: CURSOR_INPUT_WIDTH, height: cursorTargetHeight, scale: 1, borderRadius: "1px" }; ease = EASE_STANDARD; break;
                    case "disabled": targetProps = { width: CURSOR_DEFAULT_SIZE, height: CURSOR_DEFAULT_SIZE, scale: CURSOR_DISABLED_SCALE, borderRadius: "50%" }; ease = "back.out(1)"; break;
                    default: targetProps = { width: CURSOR_DEFAULT_SIZE, height: CURSOR_DEFAULT_SIZE, scale: 1, borderRadius: "50%" }; cursorStartIdleTimer(); break;
                }
            }
            gsap.set(cursorInner, { transform: 'none', scaleX: 1, scaleY: 1, rotation: 0 });
            gsap.to(cursorInner, { ...targetProps, duration: duration, ease: ease, overwrite: true, transformOrigin: 'center center' });
        }
        
        function cursorShowCursor(){if(!cursorIsVisible && !body.classList.contains('native-cursor')){gsap.to(cursor,{autoAlpha:1, duration:ANIM_DURATION_NORMAL}); cursorIsVisible=true;}}
        function cursorShowSelectionBox(){if(body.classList.contains('native-cursor')) return; const borderColor = 'var(--selection-border)'; const bgColor = 'var(--selection-bg)'; gsap.to(selectionBox,{autoAlpha:1, borderColor:borderColor, backgroundColor: bgColor, duration:ANIM_DURATION_FAST});}
        function cursorHideSelectionBox(){if(body.classList.contains('native-cursor')) return; const borderColor = getCurrentColorWithAlpha("--primary-color", 0.15); gsap.to(selectionBox,{autoAlpha:0, borderColor:borderColor, backgroundColor: 'transparent', duration:ANIM_DURATION_FAST});}
        function cursorStartIdleTimer(){clearTimeout(cursorIdleTimer);cursorKillBreathing();if(cursorState==="default"&&!cursorIsSelectingText && !prefersReducedMotion && !body.classList.contains('native-cursor')){cursorIdleTimer=setTimeout(cursorStartBreathing,IDLE_TIME);}}
        function cursorStartBreathing(){if(cursorState==="default"&&!cursorIsSelectingText&&!cursorBreathingTween&&!cursorRecoverTween && !prefersReducedMotion && !body.classList.contains('native-cursor')){cursorBreathingTween=gsap.to(cursorInner,{scale:BREATHING_SCALE,duration:BREATHING_DURATION,ease:"sine.inOut",yoyo:true,repeat:-1});}}
        function cursorKillBreathing(){clearTimeout(cursorIdleTimer);if(cursorBreathingTween){cursorBreathingTween.kill();cursorBreathingTween=null;if(!body.classList.contains('native-cursor')){gsap.to(cursorInner,{scale:1,duration:ANIM_DURATION_FAST,overwrite:true});}}}

        gsap.set(cursorInner,{width:CURSOR_DEFAULT_SIZE,height:CURSOR_DEFAULT_SIZE,opacity:1,borderRadius:"50%",scale:1,transform:"none",filter:"blur(0px)",boxShadow:defaultShadowThemed(),backgroundColor:'white'});
        gsap.set(cursor,{xPercent:-50,yPercent:-50, autoAlpha: 0});
        gsap.set(selectionIndicator,{xPercent:-50,yPercent:-50,scale:1,autoAlpha:0});
        cursorStartIdleTimer();

        window.addEventListener("mousemove", e => { if (body.classList.contains('native-cursor')) return; cursorStartIdleTimer(); cursorShowCursor(); const clientX = e.clientX; const clientY = e.clientY; if(cursorRafMoveId) return; cursorRafMoveId = requestAnimationFrame(() => { gsap.to(cursor, { x: clientX, y: clientY, duration: CURSOR_MOVE_DURATION, ease: CURSOR_MOVE_EASE }); let dx = clientX - cursorLastClientX; let dy = clientY - cursorLastClientY; cursorLastClientX = clientX; cursorLastClientY = clientY; 
            if (cursorState === 'text' || cursorState === 'textSelect' || cursorState === 'input') {
                const el = document.elementFromPoint(clientX, clientY);
                if(el) {
                    const newHeight = Math.max(16, parseFloat(window.getComputedStyle(el).fontSize) * 1.4);
                    if (newHeight !== cursorTargetHeight) {
                        cursorTargetHeight = newHeight;
                        gsap.to(cursorInner, { height: cursorTargetHeight, duration: ANIM_DURATION_FAST, ease: EASE_STANDARD });
                    }
                }
            }
            if (cursorState === "default" && !cursorIsSelectingText && !prefersReducedMotion) {
                let speed = Math.min(Math.sqrt(dx * dx + dy * dy), 120);
                if (cursorRecoverTween) {
                    cursorRecoverTween.kill();
                    cursorRecoverTween = null;
                }
                cursorKillBreathing();
                if (speed > 1) {
                    cursorCurrentAngle = Math.atan2(dy, dx) * 180 / Math.PI;
                    let scaleX = Math.min(MAX_STRETCH, 1 + speed * DEFORM_STRETCH_FACTOR);
                    let scaleY = Math.max(MIN_SQUISH, 1 - speed * DEFORM_SQUISH_FACTOR);
                    gsap.to(cursorInner, { 
                        rotation: cursorCurrentAngle, 
                        scaleX: scaleX, 
                        scaleY: scaleY, 
                        duration: DEFORM_ANIM_DURATION, 
                        ease: EASE_STANDARD, 
                        overwrite: false 
                    });
                } else {
                    if (!cursorRecoverTween) { 
                        cursorRecoverTween = gsap.to(cursorInner, { 
                            scale: 1, 
                            rotation: 0, 
                            duration: DEFORM_RECOVER_DURATION, 
                            ease: EASE_ELASTIC_RECOVER, 
                            overwrite: false, 
                            onComplete: () => { cursorRecoverTween = null; cursorStartIdleTimer(); } 
                        }); 
                    }
                }
            }
            cursorRafMoveId = null;
        }); }, { passive: true });
        body.addEventListener("mouseout", e => { if (body.classList.contains('native-cursor')) return; if (!e.relatedTarget || !body.contains(e.relatedTarget)) { if (cursorRafMoveId) { cancelAnimationFrame(cursorRafMoveId); cursorRafMoveId = null; } if (cursorState === "default" && !cursorIsSelectingText && !prefersReducedMotion && !cursorRecoverTween) { cursorKillBreathing(); cursorRecoverTween = gsap.to(cursorInner, { transform: "none", boxShadow: defaultShadowThemed(), duration: DEFORM_RECOVER_DURATION, ease: EASE_ELASTIC_RECOVER, onComplete: () => { cursorRecoverTween = null; } }); } gsap.to(cursor, {autoAlpha: 0, duration: ANIM_DURATION_NORMAL}); cursorIsVisible = false; } });
        window.addEventListener("focus", () => { if ((cursorLastClientX > 0 || cursorLastClientY > 0) && !body.classList.contains('native-cursor')) { gsap.set(cursor, { x: cursorLastClientX, y: cursorLastClientY, autoAlpha: 1 }); cursorIsVisible = true; } });
        window.addEventListener("blur", () => { cursorKillBreathing(); });
        document.addEventListener("mousedown", e => { if (body.classList.contains('native-cursor')) return; if (cursorState === "disabled" || e.button === 2) return; cursorKillBreathing(); isPanningChart = e.target.closest('#chartPanelCanvas') !== null; if (isPanningChart) { setCursorState('chartPanning'); } cursorJustStartedSelection = true; setTimeout(() => { cursorJustStartedSelection = false; }, 150); if (!prefersReducedMotion) {
                const currentScale = gsap.getProperty(cursorInner, "scale");
                gsap.to(cursorInner, { 
                    scale: currentScale * 0.85, 
                    duration: ANIM_DURATION_FAST, 
                    ease: EASE_IN, 
                    overwrite: true 
                });
                let clickEffect = document.createElement("div"); clickEffect.classList.add("click-effect"); document.body.appendChild(clickEffect); gsap.set(clickEffect, { x: e.clientX, y: e.clientY }); gsap.to(clickEffect, { width: 70, height: 70, opacity: 0, duration: 0.55 * animSpeedMultiplier, ease: EASE_STANDARD, onComplete: () => clickEffect.remove() }); } });
        document.addEventListener("mouseup", e => { 
            if (body.classList.contains('native-cursor')) return; 
            if (isPanningChart) { isPanningChart = false; const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY); if (elementUnderCursor && elementUnderCursor.closest('#chartPanelCanvas')) { setCursorState('button'); } else { cursorRestoreCursorStateAfterSelection(); } } 
            if (!cursorJustStartedSelection) { const target = e.target; const isTextElement = target.closest("p, span, h1, h2, h3, h4, h5, h6, li, dt, dd, code, pre, label, input, textarea, .long-number, #resultOutput td:first-child span, #resultOutput td:nth-child(3) span:not(.reward-symbol)"); if (!isTextElement && gsap.getProperty(selectionBox, "opacity") > 0) { window.getSelection().removeAllRanges(); cursorHideSelectionBox(); cursorRestoreCursorStateAfterSelection(); } } 
            else { setTimeout(cursorUpdateSelectionBoxVisibility, 50); } 
            
            if (!prefersReducedMotion) {
                let targetScale = 1.0; 
                if (cursorState === "button" || cursorState === "link" || cursorState === "chartPanning") {
                    targetScale = CURSOR_BUTTON_SCALE;
                } else if (cursorState === "disabled") {
                    targetScale = CURSOR_DISABLED_SCALE;
                }

                gsap.to(cursorInner, {
                    scale: targetScale,
                    duration: ANIM_DURATION_NORMAL,
                    ease: EASE_BOUNCE, 
                    overwrite: true
                });
            }
            
            cursorStartIdleTimer(); 
        });
        body.addEventListener("mouseover", e => { if (body.classList.contains('native-cursor')) { setCursorState('default'); return; } if (isPanningChart) return; 
            if (window.getSelection().toString().length === 0) {
                    cursorIsSelectingText = false;
            }
            if ((cursorIsSelectingText && !cursorJustStartedSelection)) return;
            
            const target = e.target; let newState = "default"; cursorTargetHeight = 25;
            const isDisabled = target.closest("[disabled]");
            const isInteractiveButton = target.closest("button:not([disabled]), .mode-toggle:not([disabled]), .mode-select-btn, #settingsToggleGlobal, .back-button, .nav-item, .result-btn, .clear-single-input, #languageList button, .copy-icon, .input-action-btn, .reward-symbol, .result-item-btn, .resource-toggle label, #pan-thumb, .custom-select-trigger, .custom-option");
            const isLink = target.closest("a:not([disabled])");
            const isTextInputElement = target.closest('input.calc-input:not([disabled]), input[type="text"]:not([disabled]), input[type="number"]:not([disabled]), textarea:not([disabled])');
            const isChartCanvas = target.closest("#chartPanelCanvas, #chartZoomSlider");
            const isGeneralTextContent = target.closest("p:not(#calculationHint):not(#resultInteractionHint), span, h1, h2, h3, h4, h5, h6, li, dt, dd, code, pre, label, .long-number, .card-container");
            if (isDisabled) { newState = "disabled"; } else if (isChartCanvas || isInteractiveButton || isLink) { newState = "button"; } else if (isTextInputElement) { newState = (document.activeElement === isTextInputElement) ? "input" : "text"; cursorTargetHeight = Math.max(18, parseFloat(window.getComputedStyle(isTextInputElement).fontSize) * 1.5); } else if (isGeneralTextContent) { newState = "text"; cursorTargetHeight = Math.max(16, parseFloat(window.getComputedStyle(isGeneralTextContent).fontSize) * 1.4); }
            setCursorState(newState);
        });
        document.querySelectorAll("input:not([type='checkbox']), textarea").forEach(element => { element.addEventListener("focus", () => { if(body.classList.contains('native-cursor')) return; cursorKillBreathing(); setCursorState(element.hasAttribute("disabled") ? "disabled" : "input"); }); element.addEventListener("blur", (e) => { if(body.classList.contains('native-cursor')) return; cursorStartIdleTimer(); setTimeout(() => { const elementUnderCursor = document.elementFromPoint(cursorLastClientX, cursorLastClientY); if (!elementUnderCursor || elementUnderCursor !== element || cursorIsSelectingText) { if (!cursorIsSelectingText) { if (elementUnderCursor) { elementUnderCursor.dispatchEvent(new MouseEvent("mouseover", { view: window, bubbles: true, cancelable: true })); } else { setCursorState("default"); } } } else { if (!element.hasAttribute("disabled")) { setCursorState("text"); } } }, 10); }); });
        document.addEventListener("selectionchange", () => { if (body.classList.contains('native-cursor')) return; cursorKillBreathing(); if (cursorRafSelectId) cancelAnimationFrame(cursorRafSelectId); cursorRafSelectId = requestAnimationFrame(cursorUpdateSelectionBoxVisibility); });
        function cursorUpdateSelectionBoxVisibility() { if (body.classList.contains('native-cursor')) { cursorHideSelectionBox(); return; }; const selection = window.getSelection(); let hasVisibleSelection = false; if (selection && selection.type === "Range" && selection.rangeCount > 0) { const range = selection.getRangeAt(0); if (!range.collapsed && selection.toString().trim().length > 0) { const rects = range.getClientRects(); if (rects.length > 0) { hasVisibleSelection = true; let bounds = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity }; for (const rect of rects) { bounds.left = Math.min(bounds.left, rect.left); bounds.top = Math.min(bounds.top, rect.top); bounds.right = Math.max(bounds.right, rect.right); bounds.bottom = Math.max(bounds.bottom, rect.bottom); } let left = bounds.left; let top = bounds.top; let width = bounds.right - left; let height = bounds.bottom - top; cursorShowSelectionBox(); gsap.to(selectionBox, { left: left - SELECTION_BOX_PADDING_X, top: top - SELECTION_BOX_PADDING_Y, width: width + (2 * SELECTION_BOX_PADDING_X), height: height + (2 * SELECTION_BOX_PADDING_Y), duration: ANIM_DURATION_FAST, ease: EASE_STANDARD, onStart: () => { if (cursorState !== "textSelect") setCursorState("textSelect"); }, overwrite: true }); } } } if (!hasVisibleSelection) { cursorHideSelectionBox(); if (cursorIsSelectingText) { cursorRestoreCursorStateAfterSelection(); } } }
        function cursorRestoreCursorStateAfterSelection() { if (body.classList.contains('native-cursor') || isPanningChart) return; const elementUnderCursor = document.elementFromPoint(cursorLastClientX, cursorLastClientY); if (elementUnderCursor) { elementUnderCursor.dispatchEvent(new MouseEvent("mouseover", { bubbles: true, cancelable: true })); } else { setCursorState("default"); } }
        document.addEventListener("dragstart", () => setCursorState('dragging'));
        document.addEventListener("dragend", () => cursorRestoreCursorStateAfterSelection());
        document.addEventListener("contextmenu", () => { contextMenuVisible = true; gsap.to(cursor, { autoAlpha: 0, duration: 0.1 }); });
        document.addEventListener("click", () => { if(contextMenuVisible) { contextMenuVisible = false; gsap.to(cursor, { autoAlpha: 1, duration: 0.1 }); } });
        const themeObserver=new MutationObserver(mutations=>{ if (body.classList.contains('native-cursor')) return; for(let mutation of mutations){ if(mutation.type==="attributes"&&mutation.attributeName==="class"){ if (gsap.getProperty(selectionBox, "opacity") > 0) { const borderColor = getComputedStyle(document.body).getPropertyValue('--selection-border').trim(); const bgColor = getComputedStyle(document.body).getPropertyValue('--selection-bg').trim(); gsap.to(selectionBox, {borderColor: borderColor, backgroundColor: bgColor, duration: 0.2 * animSpeedMultiplier }); } } } });
        themeObserver.observe(document.body,{attributes:true});
        const cursorSettingObserver = new MutationObserver(mutations => { for (let mutation of mutations) { if (mutation.type === "attributes" && mutation.attributeName === "class") { if (body.classList.contains('native-cursor')) { gsap.set([cursor, selectionBox, selectionIndicator], { autoAlpha: 0 }); cursorKillBreathing(); if(cursorRecoverTween) cursorRecoverTween.kill(); gsap.set(cursorInner, { transform: "none" }); cursorIsVisible = false; } else { if (cursorLastClientX > 0 || cursorLastClientY > 0) { cursorShowCursor(); const elementUnderCursor = document.elementFromPoint(cursorLastClientX, cursorLastClientY); if(elementUnderCursor) { elementUnderCursor.dispatchEvent(new MouseEvent("mouseover", { bubbles: true, cancelable: true })); } else { setCursorState('default'); } } } } } });
        cursorSettingObserver.observe(body, { attributes: true });
    })();
});
