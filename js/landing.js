document.addEventListener("DOMContentLoaded", function() {
    (function() {
        "use strict";
        const isTouchDevice = ('ontouchstart' in window || navigator.maxTouchPoints > 0);
        if (isTouchDevice) { document.body.classList.add('is-touch-device'); }
        
        const setViewportHeight = () => {
            if (window.visualViewport) {
                document.documentElement.style.setProperty('--viewport-height', `${window.visualViewport.height}px`);
            } else {
                document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
            }
        };
        setViewportHeight();
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', setViewportHeight);
        } else {
            window.addEventListener('resize', setViewportHeight);
        }

        const landingPage=document.getElementById("landingPage"),landingContent=document.getElementById("landingContent"),languageSelector=document.getElementById("languageSelector"),languageList=document.getElementById("languageList"),clickPrompt=document.getElementById("clickPrompt"),mainContent=document.getElementById("appContainer"),body=document.body,landingThemeToggle=document.getElementById("landingThemeToggle"),perspectiveWrapper = document.getElementById("landing-perspective-wrapper");const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;const animSpeedMultiplier = prefersReducedMotion ? 0 : 1;let landingLang=localStorage.getItem("converter_language_v10")?JSON.parse(localStorage.getItem("converter_language_v10")):"auto";if (landingLang === "auto") { const browserLang = navigator.language.toLowerCase(); if (browserLang.startsWith("zh-cn")) landingLang = "zh-CN"; else if (browserLang.startsWith("zh")) landingLang = "zh-TW"; else if (browserLang.startsWith("ja")) landingLang = "ja"; else if (browserLang.startsWith("ko")) landingLang = "ko"; else landingLang = "en"; } languageList.querySelectorAll("button").forEach(btn => { btn.classList.toggle('active', btn.dataset.lang === landingLang); }); const tempTranslations={ "zh-CN": {sub: "回合数 - 奖励换算器", prompt: "点击任意处继续", langTitle: "语言", fsMessage: "建议使用全屏模式开启", fsBtn: "以全屏模式进入"}, "zh-TW": {sub: "回合數 - 獎勵換算器", prompt: "點擊任意處繼續", langTitle: "語言", fsMessage: "建議使用全螢幕模式開啟", fsBtn: "以全螢幕模式進入"}, "en": {sub: "Wave - Reward Converter", prompt: "Click anywhere to continue", langTitle: "Language", fsMessage: "Fullscreen mode is recommended", fsBtn: "Enter Fullscreen"}, "ja": {sub: "ウェーブ数・報酬換算機", prompt: "クリックして続行", langTitle: "言語", fsMessage: "フルスクリーンモードを推奨", fsBtn: "フルスクリーンで開始"}, "ko": {sub: "웨이브 수 - 보상 변환기", prompt: "클릭하여 계속하기", langTitle: "언어", fsMessage: "전체 화면 모드를 권장합니다", fsBtn: "전체 화면으로 시작"} }; const updateLandingText = (lang) => { const tt=tempTranslations[lang]||tempTranslations.en; document.getElementById("landingTitle").querySelector(".sub").textContent=tt.sub; clickPrompt.textContent=tt.prompt; const langTitleNode = document.getElementById("languageTitle").childNodes[2]; if (langTitleNode && langTitleNode.nodeType === Node.TEXT_NODE) { langTitleNode.nodeValue = ` ${tt.langTitle}`; } const fsMsg = document.getElementById("fullscreenMessage"); if (fsMsg) fsMsg.textContent = tt.fsMessage; const fsBtn = document.getElementById("fullscreenBtn"); if(fsBtn) fsBtn.textContent = tt.fsBtn; }; updateLandingText(landingLang); let currentTheme = localStorage.getItem("converter_theme_v10") ? JSON.parse(localStorage.getItem("converter_theme_v10")) : "system"; const applyTheme = (themePreference, event = null) => { const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches; let finalTheme = themePreference; if (finalTheme === 'system') { finalTheme = systemPrefersDark ? 'dark' : 'light'; } const isDark = finalTheme === 'dark'; if (document.startViewTransition && event && !prefersReducedMotion) { const x = event.clientX; const y = event.clientY; const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)); const wasDark = body.classList.contains('dark-theme'); const transition = document.startViewTransition(() => { body.classList.remove('light-theme', 'dark-theme'); body.classList.add(isDark ? 'dark-theme' : 'light-theme'); }); transition.ready.then(() => { const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`]; document.documentElement.animate({ clipPath: !isDark ? clipPath : clipPath.reverse() }, { duration: 600, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', pseudoElement: !isDark ? '::view-transition-new(root)' : '::view-transition-old(root)' }); }); } else { body.classList.remove('light-theme', 'dark-theme'); body.classList.add(isDark ? 'dark-theme' : 'light-theme'); } landingThemeToggle.innerHTML = finalTheme === 'light' ? `<svg viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.03-.17.06-.33.1-.5H2v1zm18-.5c.04.17.07.33.1.5h2v-1h-2.1zM11 .55h2V3.5h-2V.55zm11 11.45V14h2.5v-2H22zm-11 8h2V23.5h-2V22zM3.5 18.09l1.41-1.41 1.06 1.06L4.56 19.15 3.5 18.09zm14.18-14.18 1.06-1.06 1.41 1.41-1.06 1.06-1.41-1.41zM4.56 4.85 3.5 5.91 4.56 7l1.06-1.06-1.06-1.06zM18.09 19.15l1.41 1.41 1.06-1.06-1.41-1.41-1.06 1.06z"></path></svg>` : `<svg viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"></path></svg>`; return finalTheme; }; applyTheme(currentTheme); landingThemeToggle.addEventListener('click', (e) => { e.stopPropagation(); const isLight = body.classList.contains('light-theme'); let nextThemePref; if (currentTheme === 'system') { nextThemePref = isLight ? 'dark' : 'light'; } else if (currentTheme === 'light') { nextThemePref = 'dark'; } else { nextThemePref = 'system'; } currentTheme = nextThemePref; applyTheme(currentTheme, e); localStorage.setItem("converter_theme_v10", JSON.stringify(currentTheme)); }); 
        gsap.to(landingPage,{autoAlpha:1, duration: 0.3 * animSpeedMultiplier}); 
        gsap.to(landingContent, {autoAlpha:1, y:0, duration: 0.4 * animSpeedMultiplier, ease:"power2.out", delay: 0.1 * animSpeedMultiplier});
        gsap.to(languageSelector, {autoAlpha:1, y: '+=0', duration: 0.4 * animSpeedMultiplier, ease:"power2.out", delay: 0.15 * animSpeedMultiplier});
        gsap.to(clickPrompt,{opacity:1, duration: 0.4 * animSpeedMultiplier, delay: 0.4 * animSpeedMultiplier}); 
        languageList.addEventListener("click", e => { if(e.target.tagName==="BUTTON"){ const lang = e.target.dataset.lang; languageList.querySelectorAll("button").forEach(b => {b.classList.toggle("active", b === e.target)}); landingLang = lang; localStorage.setItem("converter_language_v10", JSON.stringify(lang)); updateLandingText(lang); e.stopPropagation(); } }); 
        const mobileLangPopup = document.getElementById('mobileLangPopup'); mobileLangPopup.innerHTML = languageList.innerHTML; mobileLangPopup.addEventListener("click", e => { if(e.target.tagName==="BUTTON"){ const lang = e.target.dataset.lang; mobileLangPopup.querySelectorAll("button").forEach(b => b.classList.toggle("active", b.dataset.lang === lang)); landingLang = lang; localStorage.setItem("converter_language_v10", JSON.stringify(lang)); updateLandingText(lang); e.stopPropagation(); } }); document.getElementById('mobileLangToggle')?.addEventListener('click', (e) => { e.stopPropagation(); const isVisible = mobileLangPopup.classList.toggle('visible'); gsap.fromTo(mobileLangPopup, {scale: 0.9, autoAlpha: 0}, {scale: 1, autoAlpha: isVisible ? 1 : 0, duration: 0.2, ease: 'power2.out'}); }); document.addEventListener('click', (e) => { if (mobileLangPopup && mobileLangPopup.classList.contains('visible') && !mobileLangPopup.contains(e.target) && e.target !== document.getElementById('mobileLangToggle')) { mobileLangPopup.classList.remove('visible'); gsap.to(mobileLangPopup, {scale: 0.9, autoAlpha: 0, duration: 0.2}); } });
        
        const spotlightSolid = document.getElementById('spotlight-solid');
        const spotlightHollow = document.getElementById('spotlight-hollow');
        function handleMouseMove(e) {
            if (isTouchDevice) return;
            const { clientX, clientY } = e;
            gsap.to(spotlightSolid, { x: clientX, y: clientY, duration: 0.4, ease: 'power2.out', xPercent: -50, yPercent: -50 });
            gsap.to(spotlightHollow, { x: clientX, y: clientY, duration: 0.8, ease: 'power2.out', xPercent: -50, yPercent: -50 });
            
            if (prefersReducedMotion) return;
            const { innerWidth, innerHeight } = window;
            const x = (clientX - innerWidth / 2) / (innerWidth / 2);
            const y = (clientY - innerHeight / 2) / (innerHeight / 2);
            gsap.to(perspectiveWrapper, { duration: 0.5, rotateY: x * 2, rotateX: -y * 2, ease: 'power1.out' });
        }
        landingPage.addEventListener('mousemove', handleMouseMove);

        languageSelector.addEventListener('mouseover', () => { gsap.to([spotlightSolid, spotlightHollow], { scale: 0, duration: 0.3, ease: 'power2.inOut' }); });
        languageSelector.addEventListener('mouseout', () => { gsap.to([spotlightSolid, spotlightHollow], { scale: 1, duration: 0.3, ease: 'power2.inOut' }); });

        function enterApp() {
            landingPage.removeEventListener("click", dismissLanding); 
            landingPage.removeEventListener("mousemove", handleMouseMove);
            localStorage.setItem("converter_language_v10", JSON.stringify(landingLang)); 
            localStorage.setItem("converter_theme_v10", JSON.stringify(currentTheme)); 

            gsap.to([spotlightSolid, spotlightHollow], { 
                scale: 0, 
                duration: 0.3 * animSpeedMultiplier, 
                ease: "power2.in"
            });

            gsap.to([landingPage, document.getElementById('landingFooter')], { 
                autoAlpha: 0, 
                duration: 0.3 * animSpeedMultiplier, 
                ease: "power2.in",
                onComplete: () => {
                    landingPage.style.display="none";
                    mainContent.style.display="flex";
                    body.classList.add("app-loaded");
                    if (typeof window.initializeApp === "function") {
                        window.initializeApp();
                    } else {
                        document.body.innerHTML = "Error: App initialization failed.";
                    }
                }
            });
        }

        let mousedownTime = 0, mousedownDuration = 0;
        function dismissLanding(e){ 
            if (e.target.closest('#languageSelector, #mobileLangToggle, #mobileLangPopup, #landingThemeToggle, #fullscreenBtn') || (mousedownDuration > 200)) { 
                mousedownDuration = 0; return; 
            } 
            enterApp();
        }

        landingPage.addEventListener("mousedown", (e) => { 
            if (e.target.closest('#languageSelector, #mobileLangToggle, #mobileLangPopup, #landingThemeToggle, #fullscreenBtn')) return;
            mousedownTime = Date.now();
        });
        landingPage.addEventListener("mouseup", () => {
                if (mousedownTime > 0) mousedownDuration = Date.now() - mousedownTime;
                mousedownTime = 0;
        });
        
        const fsBtn = document.getElementById('fullscreenBtn');
        if (fsBtn) {
            fsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen().then(enterApp).catch(enterApp);
                } else {
                    enterApp();
                }
            });
        }

        landingPage.addEventListener("click", dismissLanding);
    })();
});
