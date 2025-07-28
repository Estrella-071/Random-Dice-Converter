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

        const landingPage=document.getElementById("landingPage"),landingContent=document.getElementById("landingContent"),languageSelector=document.getElementById("languageSelector"),languageList=document.getElementById("languageList"),clickPrompt=document.getElementById("clickPrompt"),mainContent=document.getElementById("appContainer"),body=document.body,landingThemeToggle=document.getElementById("landingThemeToggle"),perspectiveWrapper = document.getElementById("landing-perspective-wrapper");const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;const animSpeedMultiplier = prefersReducedMotion ? 0 : 1;let landingLang=localStorage.getItem("converter_language_v10")?JSON.parse(localStorage.getItem("converter_language_v10")):"auto";if (landingLang === "auto") { const browserLang = navigator.language.toLowerCase(); if (browserLang.startsWith("zh-cn")) landingLang = "zh-CN"; else if (browserLang.startsWith("zh")) landingLang = "zh-TW"; else if (browserLang.startsWith("ja")) landingLang = "ja"; else if (browserLang.startsWith("ko")) landingLang = "ko"; else landingLang = "en"; } languageList.querySelectorAll("button").forEach(btn => { btn.classList.toggle('active', btn.dataset.lang === landingLang); }); const tempTranslations={ "zh-CN": {sub: "回合数 - 奖励换算器", prompt: "点击任意处继续", langTitle: "语言"}, "zh-TW": {sub: "回合數 - 獎勵換算器", prompt: "點擊任意處繼續", langTitle: "語言"}, "en": {sub: "Wave - Reward Converter", prompt: "Click anywhere to continue", langTitle: "Language"}, "ja": {sub: "ウェーブ数・報酬換算機", prompt: "クリックして続行", langTitle: "言語"}, "ko": {sub: "웨이브 수 - 보상 변환기", prompt: "클릭하여 계속하기", langTitle: "언어"} }; const tt=tempTranslations[landingLang]||tempTranslations.en; document.getElementById("landingTitle").querySelector(".sub").textContent=tt.sub; clickPrompt.textContent=tt.prompt; const langTitleNode = document.getElementById("languageTitle").childNodes[2]; if (langTitleNode && langTitleNode.nodeType === Node.TEXT_NODE) { langTitleNode.nodeValue = ` ${tt.langTitle}`; } let currentTheme = localStorage.getItem("converter_theme_v10") ? JSON.parse(localStorage.getItem("converter_theme_v10")) : "system"; const applyTheme = (themePreference) => { const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches; let finalTheme = themePreference; if (finalTheme === 'system') { finalTheme = systemPrefersDark ? 'dark' : 'light'; } body.classList.remove('light-theme', 'dark-theme'); body.classList.add(finalTheme === 'light' ? 'light-theme' : 'dark-theme'); landingThemeToggle.innerHTML = finalTheme === 'light' ? `<svg viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.03-.17.06-.33.1-.5H2v1zm18-.5c.04.17.07.33.1.5h2v-1h-2.1zM11 .55h2V3.5h-2V.55zm11 11.45V14h2.5v-2H22zm-11 8h2V23.5h-2V22zM3.5 18.09l1.41-1.41 1.06 1.06L4.56 19.15 3.5 18.09zm14.18-14.18 1.06-1.06 1.41 1.41-1.06 1.06-1.41-1.41zM4.56 4.85 3.5 5.91 4.56 7l1.06-1.06-1.06-1.06zM18.09 19.15l1.41 1.41 1.06-1.06-1.41-1.41-1.06 1.06z"></path></svg>` : `<svg viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"></path></svg>`; return finalTheme; }; applyTheme(currentTheme); landingThemeToggle.addEventListener('click', (e) => { e.stopPropagation(); const isLight = body.classList.contains('light-theme'); let nextThemePref; if (currentTheme === 'system') { nextThemePref = isLight ? 'dark' : 'light'; } else if (currentTheme === 'light') { nextThemePref = 'dark'; } else { nextThemePref = 'system'; } currentTheme = nextThemePref; applyTheme(currentTheme); localStorage.setItem("converter_theme_v10", JSON.stringify(currentTheme)); }); 
        gsap.to(landingPage,{autoAlpha:1, duration: 0.3 * animSpeedMultiplier}); 
        gsap.to(landingContent, {autoAlpha:1, y:0, duration: 0.4 * animSpeedMultiplier, ease:"power2.out", delay: 0.1 * animSpeedMultiplier});
        gsap.to(languageSelector, {autoAlpha:1, y: '+=0', duration: 0.4 * animSpeedMultiplier, ease:"power2.out", delay: 0.15 * animSpeedMultiplier});
        gsap.to(clickPrompt,{opacity:1, duration: 0.4 * animSpeedMultiplier, delay: 0.4 * animSpeedMultiplier}); 
        languageList.addEventListener("click", e => { if(e.target.tagName==="BUTTON"){ const lang = e.target.dataset.lang; languageList.querySelectorAll("button").forEach(b => {b.classList.toggle("active", b === e.target)}); landingLang = lang; localStorage.setItem("converter_language_v10", JSON.stringify(lang)); const newT = tempTranslations[lang]||tempTranslations.en; document.getElementById("landingTitle").querySelector(".sub").textContent=newT.sub; clickPrompt.textContent = newT.prompt; const newLangTitleNode = document.getElementById("languageTitle").childNodes[2]; if (newLangTitleNode && newLangTitleNode.nodeType === Node.TEXT_NODE) { newLangTitleNode.nodeValue = ` ${newT.langTitle}`; } e.stopPropagation(); } }); 
        
        function handleMouseMove(e) {
            if (isTouchDevice || prefersReducedMotion) return;
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            const x = (clientX - innerWidth / 2) / (innerWidth / 2);
            const y = (clientY - innerHeight / 2) / (innerHeight / 2);
            gsap.to(perspectiveWrapper, {
                duration: 0.5,
                rotateY: x * 2,
                rotateX: -y * 2,
                ease: 'power1.out'
            });
        }
        landingPage.addEventListener('mousemove', handleMouseMove);

        function dismissLanding(e){ if (e.target.closest('#languageSelector') || e.target.closest('#landingThemeToggle')) { return; } 
        landingPage.removeEventListener("click", dismissLanding); 
        landingPage.removeEventListener("mousemove", handleMouseMove);
        landingThemeToggle.style.display = 'none'; localStorage.setItem("converter_language_v10", JSON.stringify(landingLang)); localStorage.setItem("converter_theme_v10", JSON.stringify(currentTheme)); 
        gsap.to(landingPage, { autoAlpha: 0, duration: 0.25 * animSpeedMultiplier, ease: "power2.in", onComplete: () => { landingPage.style.display="none"; mainContent.style.display="flex"; body.classList.add("app-loaded"); if (typeof window.initializeApp === "function") { window.initializeApp(); } else { document.body.innerHTML = "Error: App initialization failed."; } }}); } 
        landingPage.addEventListener("click", dismissLanding);
    })();
});