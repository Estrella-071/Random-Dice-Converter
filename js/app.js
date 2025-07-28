document.addEventListener("DOMContentLoaded", function() {
    (function(){
        "use strict";
        
        const minorGridLines = {
            id: 'minorGridLines',
            beforeDraw(chart, args, options) {
                if (!chart.scales.x || !chart.scales.y) return;
                const { ctx, chartArea: { left, top, right, bottom }, scales: { x, y } } = chart;

                const gridColor = getComputedStyle(document.body).getPropertyValue('--table-border').trim();
                let minorGridColor;
                try {
                    if (gridColor.startsWith('hsl')) {
                            const match = gridColor.match(/hsla?\(\s*(\d+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(?:\s*,\s*([\d.]+))?\s*\)/i);
                            if (match) {
                            const h = match[1]; const s = match[2]; const l = match[3];
                            minorGridColor = `hsla(${h}, ${s}%, ${l}%, 0.4)`;
                            } else { minorGridColor = 'rgba(128, 128, 128, 0.15)'; }
                    } else { minorGridColor = 'rgba(128, 128, 128, 0.15)'; }
                } catch (e) { minorGridColor = 'rgba(128, 128, 128, 0.15)'; }

                ctx.save();
                ctx.strokeStyle = minorGridColor;
                ctx.lineWidth = 0.75;
                ctx.setLineDash([2, 4]);

                const majorYTicks = y.getTicks();
                if (majorYTicks.length > 1) {
                    for (let i = 0; i < majorYTicks.length - 1; i++) {
                        const y1 = y.getPixelForTick(i);
                        const y2 = y.getPixelForTick(i + 1);
                        const midY = y1 + (y2 - y1) / 2;
                        if(midY > top && midY < bottom) {
                                ctx.beginPath();
                                ctx.moveTo(left, midY);
                                ctx.lineTo(right, midY);
                                ctx.stroke();
                        }
                    }
                }

                const majorXTicks = x.getTicks();
                    if (majorXTicks.length > 1) {
                        for (let i = 0; i < majorXTicks.length - 1; i++) {
                        const x1 = x.getPixelForTick(i);
                        const x2 = x.getPixelForTick(i + 1);
                        const midX = x1 + (x2 - x1) / 2;
                        if(midX > left && midX < right) {
                                ctx.beginPath();
                                ctx.moveTo(midX, top);
                                ctx.lineTo(midX, bottom);
                                ctx.stroke();
                        }
                    }
                }
                ctx.restore();
            }
        };

        function registerChartPlugins() {
            if (typeof Chart !== 'undefined') {
                try {
                    if (typeof ChartDataLabels !== 'undefined' && !Chart.registry.plugins.get('datalabels')) Chart.register(ChartDataLabels);
                    if (typeof ChartAnnotation !== 'undefined' && !Chart.registry.plugins.get('annotation')) Chart.register(ChartAnnotation);
                    if (typeof ChartZoom !== 'undefined' && !Chart.registry.plugins.get('zoom')) Chart.register(ChartZoom);
                    if (!Chart.registry.plugins.get('minorGridLines')) Chart.register(minorGridLines);
                } catch (e) {
                }
            }
        }

        const APP_VERSION = "1.5.1"; 
        const LS_KEYS = { language: "converter_language_v10", theme: "converter_theme_v10", cursor: "converter_cursor_v10", lastRank: "converter_lastRank_v10", history: "converter_history_v10", mode: "converter_mode_v10"};
        const CONFIG = {
            chart: { maxWaves: 1600, safetyLimit: 10n**18n, plotLimit: Number.MAX_SAFE_INTEGER, yAxisInitialMax: 20000, minZoomRange: 16 },
            historyRecordsPerPage: 8, maxInputs: 8,
            animation: { durationShort: 0.2, durationNormal: 0.3, durationLong: 0.4, easeStandard: "power2.out", easeStrong: "expo.out", easeBounce: "back.out(1.4)", easeIn: "power2.in" }, 
            dust: { count: 80, countMobile: 40 },
            cardsPerBox: 40n,
        };
        const REWARDS = { 1:{c:14,r:4,h:2,l:0.01,g:320,d:3}, 2:{c:20,r:5,h:2,l:0.01,g:432,d:3}, 3:{c:25,r:6,h:3,l:0.01,g:544,d:3}, 4:{c:28,r:8,h:4,l:0.01,g:640,d:3}, 5:{c:33,r:9,h:4,l:0.01,g:736,d:3}, 6:{c:37,r:10,h:5,l:0.01,g:832,d:3}, 7:{c:42,r:11,h:5,l:0.01,g:925,d:3}, 8:{c:46,r:12,h:6,l:0.01,g:1024,d:3}, 9:{c:49,r:14,h:7,l:0.01,g:1120,d:3}, 10:{c:54,r:15,h:7,l:0.01,g:1312,d:3}, 11:{c:63,r:17,h:8,l:0.01,g:1408,d:3}, 12:{c:67,r:18,h:9,l:0.01,g:1504,d:3}, 13:{c:71,r:19,h:9,l:0.01,g:1594,d:3}, 14:{c:77,r:20,h:10,l:0.01,g:1687,d:3}, 15:{c:82,r:21,h:10,l:0.01,g:1775,d:3}, 16:{c:87,r:22,h:11,l:0.01,g:1866,d:3}, 17:{c:92,r:23,h:11,l:0.01,g:1951,d:3}, 18:{c:99,r:24,h:12,l:0.01,g:2044,d:3}, 19:{c:105,r:25,h:12,l:0.01,g:2133,d:3}, 20:{c:111,r:26,h:13,l:0.01,g:2222,d:3} };

        const translations = {
            "zh-TW": { clear: "清除", nav: { calculator: "換算器", common: "常用表", chartSection: "關係圖", history: "紀錄", back: "返回" }, calculator: { title: "卡片/回合數 換算器", modeW2C: "回合 ❯ 卡片", modeC2W: "卡片 ❯ 回合", modeG2W: "金幣/鑽石 ❯ 回合", inputLabel: "輸入{modeLabel}數:", inputLabelResource: "輸入資源數量:", gold: "金幣", diamond: "鑽石", calcBtn: "換算", copyItem: "複製此項", processItem: "查看過程", resultInteractionHint: "- 點擊卡片數查看卡片寶箱掉落換算。<br>- 拖曳一個結果至另一個結果上以計算區間。", invalidInput: "請輸入有效整數", copyText: "複製", copyAll: "複製全部", multiCopy: "多選複製", copySelected: "複製選取", placeholder: "點此輸入", maxValues: "最多 {max} 個數值", negativeInfo: "支援負數計算", modeSelectionHint: "選擇換算模式開始計算", resultPlaceholder: "換算結果:", addInput: "新增欄位", calculationHint: "- 按下<kbd>Enter</kbd>或任意空白處開始換算。<br>- 按下 <kbd>,</kbd> 或 <kbd>+</kbd> 可新增輸入框，上限8個。", fillEmpty: "請先填寫空白欄位", removeDuplicates: "存在重複的數值", addInputCommaHint: "或按 <kbd>,</kbd> 新增欄位", clearAll: "清除全部"}, common: { title: "常用換算表", w2c: "回合 → 卡片", c2w: "卡片 → 回合" }, chart: { title: "卡數 - 回合數關係圖", chartTypeLabel: "圖表類型:", optionLine: "折線圖", optionBar: "柱狀圖", xAxis: "回合數", yAxis: "卡片數", waveSuffix: "回合", clickPrompt: "點擊圖表查看數值", zoomIn: "放大", zoomOut: "縮小", resetZoom: "重設縮放" }, history: { title: "歷史紀錄", clearHistory: "清除紀錄", noRecord: "無紀錄" }, process: { title: "換算過程", stepTitle: "{modeTitle} | 輸入: {input}", w2cTitle: "回合(W) → 卡片(C)", c2wTitle: "卡片(C) → 回合(W)", g2wTitle: "資源 → 回合(W)", negTitle: "負數處理", negInfo: "輸入的負數將對應到其絕對值的負數結果，即 f(-x) = -f(x)。", w2cFormulaTitle: "公式", w2cSegmentTitle: "回合區間 = {start} ~ {end}", w2cFinalTotalLabel: "最終總計", g2wStep1Title: "資源 → 箱子數", g2wStep2Title: "箱子數 → 卡片數", g2wStep3Title: "卡片數 → 回合數", c2wSearchTitle: "二分搜尋法過程", c2wStep3Info: "『卡片 → 回合』二分搜尋", formula: "公式", calculation: "計算", finalResult: "最終結果", searchStep: "第 {n} 次猜測", guess: "猜測回合數", check: "驗算卡片數", adjustRange: "調整範圍", resourcePerBox: "每箱資源", newRange: "新範圍" }, range: { title: "區間計算結果", from: "從", to: "到", difference: "差值" }, tables: { w2c: { header1: "回合", header2: "卡片" }, c2w: { header1: "卡片", header2: "回合" }, history: { header1: "時間", header2: "模式", header3: "輸入", header4: "結果" } }, units: { waves: "回合", cards: "卡片", waveSingle: "回合", cardSingle: "卡", rank: "階" }, pagination: { prev: "上一頁", next: "下一頁", pageInfo: "{current}/{total}頁" }, language: "語言", settings: { title: "設定", language: "語言", theme: "主題", cursor: "游標樣式" }, autoSelectLanguage: "自動偵測", themeOptions: { system: "系統", light: "淺色", dark: "深色"}, cursorOptions: { custom: "自訂", native: "系統預設"}, reward: { title: "卡片獎勵詳情", selectRank: "選擇段位:", boxes: "箱子數", commonDice: "普通", rareDice: "稀有", heroDice: "英雄", legendaryDice: "傳說", gold: "金幣", diamonds: "鑽石", expected: "(期望)", clickHint: "點擊卡片數可查看獎勵詳情" }, longNum: { copy: "複製完整數字", choiceTitle: "選擇操作", choiceShowFull: "顯示完整數字", choiceShowReward: "獎勵詳情", fullValueTitle: "完整數值", fullNumberLabel: "完整數字" }, copied: "已複製", close: "關閉"},
            "en": { clear: "Clear", nav: { calculator: "Converter", common: "Tables", chartSection: "Chart", history: "History", back: "Back" }, calculator: { title: "Card / Wave Converter", modeW2C: "Waves ❯ Cards", modeC2W: "Cards ❯ Waves", modeG2W: "Coin/Diamond ❯ Waves", inputLabel: "Enter {modeLabel}:", inputLabelResource: "Enter Resource Amount:", gold: "Gold", diamond: "Diamond", calcBtn: "Calculate", copyItem: "Copy Item", processItem: "View Process", resultInteractionHint: "- Click card numbers for reward details.<br>- Drag a result onto another to calculate the range.", invalidInput: "Enter valid integers", copyText: "Copy", copyAll: "Copy All", multiCopy: "Multi-copy", copySelected: "Copy Selected", placeholder: "Enter number...", maxValues: "Max {max} values", negativeInfo: "Negative number calculation supported", modeSelectionHint: "Select a conversion mode to begin calculation", resultPlaceholder: "Result:", addInput: "Add Input", calculationHint: "- Press <kbd>Enter</kbd> or click empty space to calculate.<br>- Press <kbd>,</kbd> or <kbd>+</kbd> to add an input field (max 8).", fillEmpty: "Please fill empty fields first", removeDuplicates: "Please remove duplicate values", addInputCommaHint: "or press <kbd>,</kbd> to add input", clearAll: "Clear All"}, common: { title: "Common Conversions", w2c: "Waves → Cards", c2w: "Cards → Waves" }, chart: { title: "Cards vs. Waves", chartTypeLabel: "Chart Type:", optionLine: "Line", optionBar: "Bar", xAxis: "Waves", yAxis: "Cards", waveSuffix: "W", clickPrompt: "Click chart for values", zoomIn: "Zoom In", zoomOut: "Zoom Out", resetZoom: "Reset Zoom" }, history: { title: "History", clearHistory: "Clear History", noRecord: "No records" }, process: { title: "Calculation Process", stepTitle: "{modeTitle} | Input: {input}", w2cTitle: "Waves(W) → Cards(C)", c2wTitle: "Cards(C) → Waves(W)", g2wTitle: "Resource → Waves(W)", negTitle: "Negative Handling", negInfo: "A negative input corresponds to the negative result of its absolute value, i.e., f(-x) = -f(x).", w2cFormulaTitle: "Formula Principle", w2cSegmentTitle: "Wave Segment W = {start} to {end}", w2cFinalTotalLabel: "Final Total", g2wStep1Title: "Step 1: Resource → Boxes", g2wStep2Title: "Step 2: Boxes → Cards (C)", g2wStep3Title: "Step 3: Cards (C) → Waves (W)", c2wSearchTitle: "Binary Search Process", c2wStep3Info: "This step uses the same algorithm as 'Cards → Waves' to find the final wave number.", formula: "Formula", calculation: "Calculation", finalResult: "Final Result", searchStep: "Iteration {n}", guess: "Guess W", check: "Resulting C", adjustRange: "Adjust Range", resourcePerBox: "Resource per Box", newRange: "New Range" }, range: { title: "Range Calculation", from: "From", to: "To", difference: "Difference" }, tables: { w2c: { header1: "Waves", header2: "Cards" }, c2w: { header1: "Cards", header2: "Waves" }, history: { header1: "Time", header2: "Mode", header3: "Input", header4: "Result" } }, units: { waves: "Waves", cards: "Cards", waveSingle: "Wave", cardSingle: "Card", rank: "Rank" }, pagination: { prev: "Prev", next: "Next", pageInfo: "Page {current}/{total}" }, language: "Language", settings: { title: "Settings", language: "Language", theme: "Theme", cursor: "Cursor Style" }, autoSelectLanguage: "Auto-Detect", themeOptions: { system: "System", light: "Light", dark: "Dark"}, cursorOptions: { custom: "Custom", native: "System Default"}, reward: { title: "Card Reward Details", selectRank: "Select Rank:", boxes: "Boxes", commonDice: "Common", rareDice: "Rare", heroDice: "Hero", legendaryDice: "Legendary", gold: "Gold", diamonds: "Diamonds", expected: "(Exp.)", clickHint: "Click card number for details" }, longNum: { copy: "Copy Full Number", choiceTitle: "Select Action", choiceShowFull: "Show Full Number", choiceShowReward: "Reward Details", fullValueTitle: "Full Value", fullNumberLabel: "Full Number" }, copied: "Copied", close: "Close" },
            "zh-CN": { clear: "清除", nav: { calculator: "换算", common: "常用表", chartSection: "关系图", history: "历史", back: "返回" }, calculator: { title: "卡片/回合数 换算器", modeW2C: "回合 ❯ 卡片", modeC2W: "卡片 ❯ 回合", modeG2W: "金币/钻石 ❯ 回合", inputLabel: "输入{modeLabel}数:", inputLabelResource: "输入资源数量:", gold: "金币", diamond: "钻石", calcBtn: "换算", copyItem: "复制此项", processItem: "查看过程", resultInteractionHint: "- 点击卡片数查看卡片宝箱掉落换算。<br>- 拖动一个结果到另一个上以计算区间。", invalidInput: "请输入有效整数", copyText: "复制", copyAll: "复制全部", multiCopy: "多选复制", copySelected: "复制选取", placeholder: "点此输入", maxValues: "最多 {max} 个数值", negativeInfo: "支持负数计算", modeSelectionHint: "选择换算模式开始计算", resultPlaceholder: "换算结果:", addInput: "新增输入框", calculationHint: "- 按下<kbd>Enter</kbd>或任意空白处开始换算。<br>- 按下 <kbd>,</kbd> 或 <kbd>+</kbd> 可新增输入框，上限8个。", fillEmpty: "请先填写空白输入框", removeDuplicates: "存在重复的数值", addInputCommaHint: "或按 <kbd>,</kbd> 新增输入框", clearAll: "清除全部"}, common: { title: "常用换算表", w2c: "回合 → 卡片", c2w: "卡片 → 回合" }, chart: { title: "卡数 - 回合数关系图", chartTypeLabel: "图表类型:", optionLine: "折线图", optionBar: "柱状图", xAxis: "回合数", yAxis: "卡片数", waveSuffix: "回合", clickPrompt: "点击图表查看数值", zoomIn: "放大", zoomOut: "缩小", resetZoom: "重置缩放" }, history: { title: "历史记录", clearHistory: "清除历史", noRecord: "无记录" }, process: { title: "换算过程", stepTitle: "{modeTitle} | 输入: {input}", w2cTitle: "回合(W) → 卡片(C)", c2wTitle: "卡片(C) → 回合(W)", g2wTitle: "资源 → 回合(W)", negTitle: "负数处理", negInfo: "输入的负数将对应到其绝对值的负数结果，即 f(-x) = -f(x)。", w2cFormulaTitle: "公式", w2cSegmentTitle: "回合区间 = {start} ~ {end}", w2cFinalTotalLabel: "最终总计", g2wStep1Title: "资源 → 箱子数", g2wStep2Title: "箱子数 → 卡片数", g2wStep3Title: "卡片数 → 回合数", c2wSearchTitle: "二分查找法过程", c2wStep3Info: "“卡片 → 回合” 二分查找", formula: "公式", calculation: "计算", finalResult: "最终结果", searchStep: "第 {n} 次迭代", guess: "猜测回合数", check: "验算卡片数", adjustRange: "调整范围", resourcePerBox: "每箱资源", newRange: "新范围" }, range: { title: "区间计算结果", from: "从", to: "到", difference: "差值" }, tables: { w2c: { header1: "回合", header2: "卡片" }, c2w: { header1: "卡片", header2: "回合" }, history: { header1: "时间", header2: "模式", header3: "输入", header4: "结果" } }, units: { waves: "回合", cards: "卡片", waveSingle: "回合", cardSingle: "卡", rank: "阶" }, pagination: { prev: "上页", next: "下页", pageInfo: "{current}/{total}页" }, language: "语言", settings: { title: "设置", language: "语言", theme: "主题", cursor: "光标样式" }, autoSelectLanguage: "自动检测", themeOptions: { system: "系统", light: "浅色", dark: "深色" }, cursorOptions: { custom: "自定义", native: "系统默认" }, reward: { title: "卡片奖励详情", selectRank: "选择段位:", boxes: "箱子数", commonDice: "普通", rareDice: "稀有", heroDice: "英雄", legendaryDice: "传说", gold: "金币", diamonds: "钻石", expected: "(期望)", clickHint: "点击卡片数可查看奖励详情" }, longNum: { copy: "复制完整数字", choiceTitle: "选择操作", choiceShowFull: "显示完整数字", choiceShowReward: "奖励详情", fullValueTitle: "完整数值", fullNumberLabel: "完整数字" }, copied: "已复制", close: "关闭" }
        };

        const isTouchDevice = ('ontouchstart' in window || navigator.maxTouchPoints > 0);
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const animSpeedMultiplier = prefersReducedMotion ? 0 : 1;
        
        let currentLang = "zh-TW";
        let themePref = "dark";
        let cursorPref = "custom";
        let lastRank = "20";
        let mode = null;
        let historyData = [];
        let currentHistoryPage = 0;
        let isComposing = false;
        let activeSubView = null;
        let myChart = null;
        let originalChartData = [];
        let lastCalculatedInputString = null;
        let t = translations[currentLang];
        let currentCardsForModal = 0n;
        let isMultiCopyMode = false;

        const body = document.body;
        const dustCanvas = document.getElementById('dustCanvas');
        const appContainer = document.getElementById('appContainer');
        const topBar = document.getElementById('topBar');
        const btnW2C_top = document.getElementById('btnW2C_top');
        const btnC2W_top = document.getElementById('btnC2W_top');
        const btnG2W_top = document.getElementById('btnG2W_top');
        const mainView = document.getElementById('mainView');
        const modeSelectionView = document.getElementById('modeSelectionView');
        const modeSelectionHint = document.getElementById('modeSelectionHint');
        const btnW2C_main = document.getElementById('btnW2C_main');
        const btnC2W_main = document.getElementById('btnC2W_main');
        const btnG2W_main = document.getElementById('btnG2W_main');
        const calculatorView = document.getElementById('calculatorView');
        const calculatorFlexContainer = document.getElementById('calculatorFlexContainer');
        const calculatorContentWrapper = document.getElementById('calculatorContentWrapper');
        const inputContainerWrapper = document.getElementById('inputContainerWrapper');
        const inputLabel = document.getElementById('inputLabel');
        const inputContainer = document.getElementById('inputContainer');
        const resourceInputContainer = document.getElementById('resourceInputContainer');
        const resourceInput = document.getElementById('resourceInput');
        const resourceRankSelect = document.getElementById('resourceRankSelect');
        const resourceGoldRadio = document.getElementById('resourceGold');
        const addInputBtn = document.getElementById('addInputBtn');
        const calculateBtn = document.getElementById('calculateBtn');
        const clearAllInputsBtn = document.getElementById('clearAllInputsBtn');
        const calculationHint = document.getElementById('calculationHint');
        const resultsContainer = document.getElementById('resultsContainer');
        const multiCopyBtn = document.getElementById('multiCopyBtn');
        const resultOutput = document.getElementById('resultOutput');
        const resultInteractionHint = document.getElementById('resultInteractionHint');
        const sideNavBar = document.getElementById('sideNavBar');
        const navItems = document.querySelectorAll('.nav-item');
        const commonPanel = document.getElementById('commonPanel');
        const chartPanel = document.getElementById('chartPanel');
        const historyPanel = document.getElementById('historyPanel');
        const subViewPanels = document.querySelectorAll('.sub-view-panel');
        const backButtons = document.querySelectorAll('.back-button');
        const settingsToggleGlobal = document.getElementById("settingsToggleGlobal");
        const settingsPopupGlobal = document.getElementById("settingsPopupGlobal");
        const langSelectGlobal = document.getElementById("langSelectGlobal");
        const themeSelectGlobal = document.getElementById("themeSelectGlobal");
        const cursorSelectGlobal = document.getElementById("cursorSelectGlobal");
        const notificationGlobal = document.getElementById("notificationGlobal");
        const w2cTablePanelBody = document.getElementById("w2cTablePanel")?.querySelector("tbody");
        const c2wTablePanelBody = document.getElementById("c2wTablePanel")?.querySelector("tbody");
        const chartPanelCanvas = document.getElementById("chartPanelCanvas");
        const historyTablePanelBody = document.getElementById("historyTablePanel")?.querySelector("tbody");
        const historyPaginationPanel = document.getElementById("historyPaginationPanel");
        const clearHistoryPanelBtn = document.getElementById("clearHistoryPanel");
        
        const modalOverlays = document.querySelectorAll('.modal-overlay');
        const modalOverlayGlobal = document.getElementById("modalOverlayGlobal");
        const rewardModalGlobal = document.getElementById("rewardModalGlobal");
        const rankSelectGlobal = document.getElementById("rankSelectGlobal");
        const rewardDetailsGlobal = document.getElementById("rewardDetailsGlobal");
        const cardActionChoiceModalOverlay = document.getElementById("cardActionChoiceModalOverlay");
        const cardActionChoiceTitle = document.getElementById("cardActionChoiceTitle");
        const cardActionShowFullBtn = document.getElementById("cardActionShowFull");
        const cardActionShowRewardBtn = document.getElementById("cardActionShowReward");
        const longNumModalOverlay = document.getElementById('longNumModalOverlay');
        const longNumModal = document.getElementById('longNumModal');
        const longNumberDisplay = document.getElementById('longNumberDisplay');
        const processDetailsModalOverlay = document.getElementById('processDetailsModalOverlay');
        const processDetailsContent = document.querySelector('#processDetailsModal .modal-content-wrapper');
        const rangeResultModalOverlay = document.getElementById('rangeResultModalOverlay');
        const rangeResultTitle = document.getElementById('rangeResultTitle');
        const rangeResultContent = document.getElementById('rangeResultContent');

        let cardTooltip = null;
        let activeTooltipElement = null;
        let activeTooltipTarget = null;
        let cursorLastClientX = 0;
        let cursorLastClientY = 0;
        let chartUpdateRafId = null;

        function saveLS(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { } }
        function loadLS(key, defaultValue) { try { const val = localStorage.getItem(key); return val !== null ? JSON.parse(val) : defaultValue; } catch (e) { return defaultValue; } }
        
        function formatInputWithCommas(inputElement) {
            if (!inputElement) return;
            const originalValue = inputElement.value;
            const cursorPosition = inputElement.selectionStart;
            const valueWithoutCommas = originalValue.replace(/,/g, '');
            
            if (valueWithoutCommas.match(/[^\-0-9]/g)) {
                inputElement.value = valueWithoutCommas.replace(/[^\-0-9]/g, '');
                return;
            }

            if(valueWithoutCommas === '' || valueWithoutCommas === '-') {
                return;
            }

            try {
                const formattedValue = new Intl.NumberFormat(currentLang.replace('_', '-')).format(BigInt(valueWithoutCommas));
                
                if(originalValue !== formattedValue) {
                    const diff = formattedValue.length - originalValue.length;
                    inputElement.value = formattedValue;
                    const newCursorPosition = cursorPosition + diff;
                    if(cursorPosition !== null && document.activeElement === inputElement) {
                        inputElement.setSelectionRange(newCursorPosition, newCursorPosition);
                    }
                }
            } catch(e) {
            }
        }
        
        function getRawValue(inputElement) {
            return inputElement.value.replace(/,/g, '');
        }

        function formatBigIntWithCommas(bigintValue) {
            try {
                let num;
                if (typeof bigintValue !== 'bigint') {
                    num = BigInt(String(bigintValue).replace(/,/g, ''));
                } else {
                    num = bigintValue;
                }
                return new Intl.NumberFormat(currentLang.replace('_', '-')).format(num);
            } catch {
                return String(bigintValue);
            }
        }

        function formatLongNumber(numStr) {
            try {
                if (typeof numStr !== 'string') numStr = String(numStr);
                const isNegative = numStr.startsWith('-');
                const numPart = isNegative ? numStr.substring(1) : numStr;
                const limit = 10;
                if (numPart.length > limit) {
                    const len = numPart.length;
                    return (isNegative ? '-' : '') + numPart.substring(0, 4) + '…' + numPart.substring(len - 4);
                }
                return formatBigIntWithCommas(numStr);
            } catch (e) {
                return numStr || "";
            }
        }

        function replacer(key, value) {
            return typeof value === 'bigint' ? value.toString() : value;
        }

        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        function wavesToCards(waveInput) {
            const T = BigInt(waveInput);
            if (T <= 0n) return T === 0n ? 0n : -wavesToCards(-T);

            let cards = 0n;
            const ranges = [
                { start: 1n, end: 45n, cycle: [1n, 1n, 2n, 1n, 3n] },
                { start: 46n, end: 111n, cycle: [2n, 6n] },
                { start: 112n, end: 500n, cycle: [4n, 12n] },
                { start: 501n, end: 1000n, cycle: [6n, 18n] },
                { start: 1001n, end: 1500n, cycle: [8n, 24n] },
                { start: 1501n, cycle: [10n, 30n] }
            ];

            let lastWave = 0n;

            for (const range of ranges) {
                if (T > lastWave) {
                    const currentSegmentEnd = (range.end === undefined || T <= range.end) ? T : range.end;
                    const wavesInRange = currentSegmentEnd - lastWave;

                    if (wavesInRange <= 0n) {
                        if(range.end !== undefined) lastWave = range.end;
                        continue;
                    };
                    
                    const cycleSum = range.cycle.reduce((a, b) => a + b, 0n);
                    const cycleLen = BigInt(range.cycle.length);

                    const numCycles = (wavesInRange - 1n) / cycleLen;
                    cards += numCycles * cycleSum;

                    const remainder = (wavesInRange - 1n) % cycleLen;
                    for (let i = 0n; i < remainder + 1n; i++) {
                        cards += range.cycle[Number(i)];
                    }
                    
                    lastWave = currentSegmentEnd;
                    if (lastWave === T) break;
                }
            }
            return cards;
        }
        
        function cardsToWaves(cardInput) {
            try {
                const X = BigInt(cardInput);
                if (X <= 0n) {
                    if (X === 0n) return { wave: 0n, steps: [] };
                    const positiveResult = cardsToWaves(-X);
                    return typeof positiveResult.wave === 'bigint' ? { wave: -positiveResult.wave, steps: positiveResult.steps } : { wave: 0n, steps: [] };
                }
                let low = 1n;
                let high = 2n;
                let calculatedHigh = wavesToCards(high);
                let iterations = 0;
                const maxIterations = 100;
                while (calculatedHigh < X && iterations < maxIterations) {
                    low = high;
                    high = high * 2n;
                    if (high > CONFIG.chart.safetyLimit) {
                        high = CONFIG.chart.safetyLimit;
                        calculatedHigh = wavesToCards(high);
                        if (calculatedHigh < X) { return { wave: high, steps: [] }; }
                        break;
                    }
                    calculatedHigh = wavesToCards(high);
                    iterations++;
                }
                let result = high;
                iterations = 0;
                const maxBinaryIterations = 200;
                const searchSteps = [];
                let stepCount = 0;
                while (low <= high && iterations < maxBinaryIterations) {
                    stepCount++;
                    const mid = low + (high - low) / 2n;
                    if (mid === low && low < high) {
                        const cardsAtHigh = wavesToCards(high);
                        if(cardsAtHigh >= X) result = high; else result = high + 1n;
                        searchSteps.push({step: stepCount, guess: high, result: cardsAtHigh, low, high, isFinal: true});
                        break;
                    }
                    if (mid === 0n){
                        const cardsAtOne = wavesToCards(1n);
                        result = (cardsAtOne >= X) ? 1n : 2n;
                        searchSteps.push({step: stepCount, guess: 1n, result: cardsAtOne, low, high, isFinal: true});
                        break;
                    }
                    
                    const cardsAtMid = wavesToCards(mid);
                    searchSteps.push({step: stepCount, guess: mid, result: cardsAtMid, low, high, isFinal: false});

                    if (cardsAtMid >= X) {
                        result = mid;
                        high = mid - 1n;
                    } else {
                        low = mid + 1n;
                    }
                    iterations++; 
                }
                if (result < CONFIG.chart.safetyLimit && wavesToCards(result) < X) {
                    result += 1n;
                }
                
                const finalStep = searchSteps[searchSteps.length - 1];
                if(finalStep) finalStep.isFinal = true;

                return { wave: result, steps: searchSteps };
            } catch (e) {
                return { wave: 0n, steps: [] };
            }
        }
        
        function resourceToWaves(amount, type, rank) {
            try {
                const amountBig = BigInt(amount);
                if (amountBig <= 0n) return { wave: 0n, cards: 0n };

                const rankData = REWARDS[rank] || REWARDS[20];
                let resourcePerBox;
                if (type === 'gold') {
                    resourcePerBox = BigInt(rankData.g);
                } else {
                    resourcePerBox = BigInt(rankData.d);
                }

                if (resourcePerBox === 0n) return { wave: 0n, cards: 0n };

                const boxes = (amountBig + resourcePerBox - 1n) / resourcePerBox;
                const cards = boxes * CONFIG.cardsPerBox;
                const { wave } = cardsToWaves(cards);
                
                return { wave, cards };
            } catch (e) {
                return { wave: 0n, cards: 0n };
            }
        }

        function showNotification(message) {
            if (!notificationGlobal) return;
            notificationGlobal.textContent = message;
            gsap.killTweensOf(notificationGlobal);
            gsap.fromTo(notificationGlobal, 
                { autoAlpha: 0, y: 15 * animSpeedMultiplier, scale: 0.9 },
                { 
                    autoAlpha: 1, y: 0, scale: 1, 
                    duration: CONFIG.animation.durationNormal * animSpeedMultiplier, 
                    ease: CONFIG.animation.easeBounce, 
                    className: "+=visible",
                    onComplete: () => {
                        gsap.to(notificationGlobal, {
                            autoAlpha: 0, y: 10 * animSpeedMultiplier, scale: 0.9, 
                            delay: 2.5, 
                            duration: CONFIG.animation.durationNormal * animSpeedMultiplier, 
                            ease: CONFIG.animation.easeIn, 
                            className: "-=visible" 
                        });
                    }
                }
            );
        }

        function setAppLanguage(lang) {
            currentLang = lang;
            if (currentLang === 'auto') {
                const browserLang = navigator.language.toLowerCase();
                if (browserLang.startsWith("zh-cn")) currentLang = "zh-CN";
                else if (browserLang.startsWith("zh")) currentLang = "zh-TW";
                else if (browserLang.startsWith("ja")) currentLang = "ja";
                else if (browserLang.startsWith("ko")) currentLang = "ko";
                else currentLang = "en";
            }
            saveLS(LS_KEYS.language, lang);
            t = translations[currentLang] || translations["en"];
            if (langSelectGlobal) langSelectGlobal.value = lang;
            body.lang = currentLang.replace('_', '-');
            updateAllUItext();
        }

        function setAppTheme(themePreference) {
            themePref = themePreference;
            saveLS(LS_KEYS.theme, themePref);
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            let actualTheme = themePref;
            if (actualTheme === 'system') {
                actualTheme = systemPrefersDark ? 'dark' : 'light';
            }
            body.classList.remove('light-theme', 'dark-theme');
            body.classList.add(actualTheme === 'light' ? 'light-theme' : 'dark-theme');
            if (themeSelectGlobal) themeSelectGlobal.value = themePref;
            updateSettingsUI();
            if (myChart && activeSubView === 'chartPanel') {
                requestAnimationFrame(generateChartForPanel);
            }
            if(typeof updateDustColor === 'function') updateDustColor();
        }

        function setCursorPreference(preference) {
            cursorPref = preference;
            saveLS(LS_KEYS.cursor, cursorPref);
            if (cursorSelectGlobal) cursorSelectGlobal.value = preference;
            body.classList.toggle('native-cursor', cursorPref === 'native');
            updateSettingsUI();
        }
        
        function updateAllUItext() {
            if (!t) { return; }
            try {
                updateCommonText();
                updateCalculatorText();
                updateChartText();
                updateHistoryText();
                updateSettingsUI();
                updateModalText();
                updateOtherUIText();
                renderHistoryPanel();
                if (activeSubView === 'commonPanel') populateTablesForPanel();
                if (resultsContainer.classList.contains('visible-true')) {
                    updateResultTableContent();
                }
            } catch (e) { }
        }

        function updateCommonText() {
                modeSelectionHint.textContent = t.calculator.modeSelectionHint;
                btnW2C_main.textContent = t.calculator.modeW2C;
                btnC2W_main.textContent = t.calculator.modeC2W;
                btnG2W_main.textContent = t.calculator.modeG2W;
                btnW2C_top.textContent = t.calculator.modeW2C;
                btnC2W_top.textContent = t.calculator.modeC2W;
                btnG2W_top.textContent = t.calculator.modeG2W;
                
                sideNavBar.querySelector('.nav-item[data-target="calculator"] .item-label').textContent = t.nav.calculator;
                sideNavBar.querySelector('.nav-item[data-target="common"] .item-label').textContent = t.nav.common; 
                sideNavBar.querySelector('.nav-item[data-target="chart"] .item-label').textContent = t.nav.chartSection; 
                sideNavBar.querySelector('.nav-item[data-target="history"] .item-label').textContent = t.nav.history; 
                
                document.querySelector('#commonPanel h2').textContent = t.common.title;
                document.querySelector('#commonPanel .table-box:nth-of-type(1) h3').textContent = t.common.w2c;
                document.querySelector('#commonPanel .table-box:nth-of-type(2) h3').textContent = t.common.c2w;
                document.querySelector('#w2cTablePanel thead th:nth-child(1)').textContent = t.tables.w2c.header1;
                document.querySelector('#w2cTablePanel thead th:nth-child(2)').textContent = t.tables.w2c.header2;
                document.querySelector('#c2wTablePanel thead th:nth-child(1)').textContent = t.tables.c2w.header1;
                document.querySelector('#c2wTablePanel thead th:nth-child(2)').textContent = t.tables.c2w.header2;
                backButtons.forEach(btn => btn.setAttribute('aria-label', t.nav.back));
        }

        function updateCalculatorText() {
            updateInputLabel();
            if (calculateBtn) calculateBtn.textContent = t.calculator.calcBtn;
            if (multiCopyBtn) multiCopyBtn.querySelector('span').textContent = isMultiCopyMode ? t.calculator.copySelected : t.calculator.multiCopy;
            if (calculationHint) {
                calculationHint.innerHTML = t.calculator.calculationHint || '';
            }
            if (addInputBtn) addInputBtn.title = t.calculator.addInput;
            if (clearAllInputsBtn) clearAllInputsBtn.title = t.calculator.clearAll;
            const resultPlaceholder = resultOutput.querySelector('div[data-i18n="calculator.resultPlaceholder"]');
            if (resultPlaceholder) resultPlaceholder.textContent = t.calculator.resultPlaceholder;
            
            if (resultInteractionHint) {
                resultInteractionHint.innerHTML = t.calculator.resultInteractionHint;
            }

            inputContainer.querySelectorAll('.calc-input').forEach(input => {
                input.placeholder = t?.calculator?.placeholder || 'Enter...';
            });
            
            if (resourceInput) resourceInput.placeholder = t?.calculator?.placeholder || 'Enter...';
            const clearResourceBtn = resourceInput.parentElement?.querySelector('.clear-single-input');
            if (clearResourceBtn) clearResourceBtn.title = t?.clear || 'Clear';

            const goldLabel = document.querySelector('label[for="resourceGold"]');
            if(goldLabel) goldLabel.textContent = t.calculator.gold;
            const diamondLabel = document.querySelector('label[for="resourceDiamond"]');
            if(diamondLabel) diamondLabel.textContent = t.calculator.diamond;
            updateRewardRankOptions(resourceRankSelect);
        }

        function updateChartText() {
            if(!t.chart) return;
            document.querySelector('#chartPanel h2').textContent = t.chart.title;
            document.getElementById('chartZoomSlider')?.setAttribute('title', t.chart.zoomIn + '/' + t.chart.zoomOut);
            document.getElementById('pan-track')?.setAttribute('title', t.chart.xAxis);


            if (myChart?.options) {
                    myChart.options.scales.x.title.text = t.chart.xAxis;
                    myChart.options.scales.y.title.text = t.chart.yAxis;
                    const specialWaves = [45, 111, 501, 1001, 1501]; 
                    specialWaves.forEach(wave => {
                    const annotationName = `vline${wave}`;
                    if (myChart.options.plugins.annotation.annotations[annotationName]) {
                        myChart.options.plugins.annotation.annotations[annotationName].label.content = `${wave}${t.units.waveSingle}`;
                    }
                    });
                    updateCrosshairAnnotations(null, null, null); 
                    if (myChart.ctx && myChart.canvas.offsetParent) { myChart.update(prefersReducedMotion ? 'none' : 'default'); }
                }
        }

        function updateHistoryText() {
            if(!t.history || !t.tables.history) return;
            const clearBtn = document.querySelector('#clearHistoryPanel .text');
            if(clearBtn) clearBtn.textContent = t.history.clearHistory;
            document.querySelector('#historyPanel h2').textContent = t.history.title;
            document.querySelector('#historyTablePanel thead th:nth-child(1)').textContent = t.tables.history.header1;
            document.querySelector('#historyTablePanel thead th:nth-child(2)').textContent = t.tables.history.header2;
            document.querySelector('#historyTablePanel thead th:nth-child(3)').textContent = t.tables.history.header3;
            document.querySelector('#historyTablePanel thead th:nth-child(4)').textContent = t.tables.history.header4;
        }

        function updateSettingsUI() {
            if(!t.settings) return;
            const langLabel = document.querySelector("#settingsPopupGlobal label[for='langSelectGlobal']");
            if(langLabel) langLabel.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"></path></svg> ${t.settings.language}`;
            
            const currentActualTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
            const themeLabel = document.querySelector("#settingsPopupGlobal label[for='themeSelectGlobal']");
            if(themeLabel) themeLabel.innerHTML = (currentActualTheme === 'light' ? `<svg viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.03-.17.06-.33.1-.5H2v1zm18-.5c.04.17.07.33.1.5h2v-1h-2.1zM11 .55h2V3.5h-2V.55zm11 11.45V14h2.5v-2H22zm-11 8h2V23.5h-2V22zM3.5 18.09l1.41-1.41 1.06 1.06L4.56 19.15 3.5 18.09zm14.18-14.18 1.06-1.06 1.41 1.41-1.06 1.06-1.41-1.41zM4.56 4.85 3.5 5.91 4.56 7l1.06-1.06-1.06-1.06zM18.09 19.15l1.41 1.41 1.06-1.06-1.41-1.41-1.06 1.06z"></path></svg>` : `<svg viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"></path></svg>`) + ` ${t.settings.theme}`;
            
            langSelectGlobal.options[0].text = t.autoSelectLanguage;
            themeSelectGlobal.options[0].text = t.themeOptions.system;
            themeSelectGlobal.options[1].text = t.themeOptions.light;
            themeSelectGlobal.options[2].text = t.themeOptions.dark;

            const cursorLabel = document.querySelector("#settingsPopupGlobal label[for='cursorSelectGlobal']");
            if (cursorLabel) cursorLabel.innerHTML = `<svg viewBox="0 0 24 24"><path d="M13.64 21.97c-.31.03-.62.03-.93.03-.31 0-.62 0-.93-.03l-1.02-.1c-1.1-.1-2.13-.49-3.02-1.11-1.84-1.29-2.78-3.24-2.78-5.98V8.81c0-.47.27-.9.69-1.1l6.04-2.94c.39-.19.84-.19 1.23 0l6.04 2.94c.42.2.69.63.69 1.1v5.97c0 2.74-.94 4.69-2.78 5.98-.89.62-1.92 1.01-3.02 1.11l-1.02.1zM12 14c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path></svg> ${t.settings.cursor}`;
            cursorSelectGlobal.options[0].text = t.cursorOptions.custom;
            cursorSelectGlobal.options[1].text = t.cursorOptions.native;

            const settingsBtnText = document.querySelector("#settingsToggleGlobal .button-text");
            if(settingsBtnText) settingsBtnText.textContent = t.settings.title;
        }

        function updateModalText() {
            if(!t.reward) return;
            document.querySelector("#rewardModalGlobal h3").textContent = t.reward.title;
            document.querySelector("#rewardModalGlobal label[for='rankSelectGlobal']").textContent = t.reward.selectRank;
            updateRewardRankOptions(rankSelectGlobal); 
            if (modalOverlayGlobal.classList.contains('visible')) {
                updateRewardDetails(currentCardsForModal, rankSelectGlobal.value);
            }
            if (cardActionChoiceTitle) cardActionChoiceTitle.textContent = t.longNum.choiceTitle;
            if (cardActionShowFullBtn) cardActionShowFullBtn.textContent = t.longNum.choiceShowFull;
            if (cardActionShowRewardBtn) cardActionShowRewardBtn.textContent = t.longNum.choiceShowReward;
            if (longNumModal) {
                longNumModal.querySelector('h3').textContent = t.longNum.fullValueTitle;
                longNumModal.querySelector('.copy-icon').title = t.longNum.copy;
            }
            if (rangeResultTitle) rangeResultTitle.textContent = t.range.title;
        }

        function updateOtherUIText() {
                settingsToggleGlobal.title = t.settings.title;
                settingsToggleGlobal.setAttribute('aria-label', t.settings.title);
        }

        function updateResultTableContent() {
            try {
                const resultRows = resultOutput.querySelectorAll('tr');
                resultRows.forEach(row => {
                    const tds = row.querySelectorAll('td');
                    if (tds.length < 2) return;
                    
                    const actionsCell = row.querySelector('.result-actions-cell');

                    if (actionsCell) {
                        const actionsDiv = actionsCell.querySelector('.result-item-actions') || document.createElement('div');
                        actionsDiv.className = 'result-item-actions';
                        actionsDiv.innerHTML = `
                            <button class="result-item-btn copy-item-btn glow-on-hover" title="${t.calculator.copyItem}">
                                <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path></svg>
                            </button>
                            <button class="result-item-btn process-item-btn glow-on-hover" title="${t.calculator.processItem}">
                                <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path></svg>
                            </button>
                        `;
                        if (!actionsCell.contains(actionsDiv)) {
                            actionsCell.appendChild(actionsDiv);
                        }
                    }
                });
                updateCalculatorText();
            } catch (e) {
            }
        }

        function createCardSpan(valueStr, unit, isClickableForReward) { 
            try {
                const valueBigInt = BigInt(valueStr);
                const isNegative = valueBigInt < 0n;
                const formattedValue = formatBigIntWithCommas(valueStr);
                const isLong = valueStr.length > (valueStr.startsWith('-') ? 11 : 10);
                const displayValue = isLong ? formatLongNumber(valueStr) : formattedValue;
                            
                const mainElement = document.createElement('span');
                mainElement.className = 'card-container'; 
                mainElement.dataset.value = valueStr;
                if (isNegative) { mainElement.classList.add('negative-cards'); }
                            
                let numberPartHTML = isLong ? `<span class="long-number" data-full-number="${valueStr}">${displayValue}</span>` : displayValue;
                let innerHTML = `${numberPartHTML} ${unit}`;

                if (isClickableForReward && !isNegative) {
                    mainElement.dataset.rewardClickable = "true";
                    innerHTML += `<span class="reward-symbol" title="${t.reward.clickHint}"><svg viewBox="0 0 24 24"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"></path></svg></span>`;
                }
                mainElement.innerHTML = innerHTML;
                return mainElement.outerHTML; 
            } catch(e) {
                return `${valueStr || ""} ${unit}`;
            }
        }
        
        function setViewportHeight() {
            if (window.visualViewport) {
                document.documentElement.style.setProperty('--viewport-height', `${window.visualViewport.height}px`);
            } else {
                document.documentElement.style.setProperty('--viewport-height', '100vh');
            }
        }

        window.initializeApp = function() {
            if(typeof window.initializeAppCalled !== 'undefined') return;
            window.initializeAppCalled = true;

            try {
                setViewportHeight();
                if (window.visualViewport) {
                    window.visualViewport.addEventListener('resize', debounce(setViewportHeight, 50));
                } else {
                    window.addEventListener('resize', debounce(setViewportHeight, 100));
                }


                if (isTouchDevice) body.classList.add('is-touch-device');
                else body.classList.remove('is-touch-device');
                
                registerChartPlugins();
                
                const savedLangPref = loadLS(LS_KEYS.language, "auto");
                themePref = loadLS(LS_KEYS.theme, "system");
                cursorPref = loadLS(LS_KEYS.cursor, "custom");
                lastRank = loadLS(LS_KEYS.lastRank, "20");
                historyData = loadLS(LS_KEYS.history, []).sort((a, b) => b.timestamp - a.timestamp);
                
                setAppLanguage(savedLangPref);
                setAppTheme(themePref);
                setCursorPreference(cursorPref);
                
                populateTablesForPanel();
                renderHistoryPanel();
                
                mode = null;
                gsap.set(calculatorView, { autoAlpha: 0, display: 'none' });
                calculatorView.classList.remove('visible');
                gsap.set(topBar, { autoAlpha: 0, y: -25 * animSpeedMultiplier });
                topBar.classList.remove('visible');
                gsap.set(modeSelectionView, { autoAlpha: 1, scale: 1, display: 'flex' });
                modeSelectionView.classList.remove('hidden');
                
                resultsContainer.classList.remove('visible-true');
                resultsContainer.style.maxHeight = ''; // Remove max-height override

                gsap.to(modeSelectionView, { autoAlpha: 1, duration: CONFIG.animation.durationNormal * animSpeedMultiplier, delay: 0.1 * animSpeedMultiplier });
                gsap.fromTo(sideNavBar, { autoAlpha: 0, x: '50%' }, { autoAlpha: 1, x: 0, duration: CONFIG.animation.durationLong * animSpeedMultiplier, ease: CONFIG.animation.easeBounce, delay: 0.2 * animSpeedMultiplier, onStart: () => sideNavBar.classList.add('visible') });
                gsap.fromTo(settingsToggleGlobal, { autoAlpha: 0, y: -25 * animSpeedMultiplier }, { autoAlpha: 1, y: 0, duration: CONFIG.animation.durationLong * animSpeedMultiplier, ease: CONFIG.animation.easeBounce, delay: 0.3 * animSpeedMultiplier, onStart: () => settingsToggleGlobal.classList.add('visible') });
                
                attachGlobalListeners();
                attachCalculatorListeners();
                attachSubViewListeners();
                attachModalListeners();
                initDustBackground();
                createTooltips();
                
            } catch (error) {
                document.body.innerHTML = "App initialization error. Please refresh or contact support.";
            }
        };

        function switchMode(newMode) {
            if (newMode === mode && calculatorView.classList.contains('visible')) return;
            
            setInputState(true); 
            exitMultiCopyMode();
            const fromInitialSelection = !calculatorView.classList.contains('visible');
            mode = newMode;
            saveLS(LS_KEYS.mode, mode);
            
            btnW2C_main.classList.toggle("active", mode === "w2c");
            btnC2W_main.classList.toggle("active", mode === "c2w");
            btnG2W_main.classList.toggle("active", mode === "g2w");
            btnW2C_top.classList.toggle("active", mode === "w2c");
            btnC2W_top.classList.toggle("active", mode === "c2w");
            btnG2W_top.classList.toggle("active", mode === "g2w");
            
            updateInputLabel();
            
            if (mode === 'g2w') {
                gsap.set(inputContainer, { display: 'none' });
                gsap.set(resourceInputContainer, { display: 'flex' });
                gsap.set(addInputBtn, { display: 'none' });
                calculationHint.innerHTML = t.calculator.calculationHint.split('<br>')[0];
                
                resourceRankSelect.classList.toggle('visible', resourceGoldRadio.checked);
                
                const resourceElements = [resourceInputContainer.querySelector('.resource-toggle'), resourceInputContainer.querySelector('#resourceInputWrapper'), resourceRankSelect];
                const resourceWrapper = resourceInputContainer.querySelector('.input-wrapper');
                gsap.fromTo([resourceWrapper, ...resourceElements], 
                    { autoAlpha: 0, y: 15 * animSpeedMultiplier },
                    { autoAlpha: 1, y: 0, duration: CONFIG.animation.durationNormal * animSpeedMultiplier, stagger: 0.05 * animSpeedMultiplier, ease: CONFIG.animation.easeStandard }
                );

            } else {
                gsap.set(inputContainer, { display: 'flex' });
                gsap.set(resourceInputContainer, { display: 'none' });
                gsap.set(addInputBtn, { display: 'inline-flex' });
                calculationHint.innerHTML = t.calculator.calculationHint;
            }

            if (fromInitialSelection) {
                const animationDuration = 0.25;

                    gsap.to([modeSelectionHint, document.getElementById('modeSelectionButtonsWrapper')], {
                        scale: 0.9,
                        autoAlpha: 0,
                        y: -15 * animSpeedMultiplier,
                        duration: animationDuration * animSpeedMultiplier,
                        ease: 'power1.in',
                        onComplete: () => {
                            gsap.set(modeSelectionView, { display: 'none' });
                            modeSelectionView.classList.add('hidden');
                        }
                    });

                    gsap.set(calculatorView, { display: 'flex', autoAlpha: 0 });
                    calculatorView.classList.add('visible');

                    if (mode !== 'g2w') {
                        createInputBoxes(1);
                    }
                    clearResults(true);

                    gsap.to(calculatorView, {
                        autoAlpha: 1,
                        duration: (animationDuration + 0.1) * animSpeedMultiplier,
                        delay: 0.05 * animSpeedMultiplier,
                        ease: 'power1.out',
                        onComplete: () => {
                            let firstInput = (mode === 'g2w') ? resourceInput : inputContainer.querySelector('.calc-input');
                            if (firstInput && !isTouchDevice) {
                                setTimeout(() => firstInput.focus({ preventScroll: true }), 150);
                            }
                        }
                    });

                    gsap.fromTo(topBar, { autoAlpha: 0, y: -25 * animSpeedMultiplier }, {
                        autoAlpha: 1,
                        y: 0,
                        duration: (animationDuration + 0.1) * animSpeedMultiplier,
                        ease: CONFIG.animation.easeBounce,
                        delay: 0.05 * animSpeedMultiplier,
                        onStart: () => topBar.classList.add('visible')
                    });
            } else { 
                if (mode !== 'g2w') createInputBoxes(1);
                clearResults(true); 
            }
        }
        
        function setInputState(isFocused) {
            body.classList.remove('input-focused', 'results-focused');

            if (isFocused) {
                body.classList.add('input-focused');
                if (window.innerWidth <= 1024) {
                    if(resultsContainer.classList.contains('visible-true')) {
                            gsap.to(resultsContainer, { y: '100%', autoAlpha: 0, duration: 0.4, ease: 'power2.in' });
                    }
                    gsap.to(inputContainerWrapper, { y: '0%', autoAlpha: 1, scale: 1, duration: 0.4, ease: 'power2.out' });
                }
                gsap.to([inputContainerWrapper, resultsContainer], { minHeight: '', duration: 0.3 });
            } else { 
                body.classList.add('results-focused');
                if (window.innerWidth <= 1024) {
                    gsap.to(inputContainerWrapper, { y: '0', autoAlpha: 1, scale: 1, duration: 0.4, ease: 'power2.out' });
                    gsap.to(resultsContainer, { y: '0%', autoAlpha: 1, duration: 0.4, ease: 'power2.out' });
                }
                adjustContainerHeights();
            }
        }
        
        function adjustContainerHeights() {
            if (window.innerWidth <= 1024) {
                gsap.set([inputContainerWrapper, resultsContainer], { clearProps: "minHeight" });
                return;
            }

            gsap.set([inputContainerWrapper, resultsContainer], { clearProps: "minHeight" });
            
            requestAnimationFrame(() => {
                const inputHeight = inputContainerWrapper.offsetHeight;
                const resultHeight = resultsContainer.offsetHeight;
                
                if (resultHeight < inputHeight) {
                    gsap.to(resultsContainer, {
                        minHeight: inputHeight,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                } else {
                    gsap.to(inputContainerWrapper, {
                        minHeight: resultHeight,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                }
            });
        }

        const flipState = {};
        function recordInputPositions() {
            if (isTouchDevice || prefersReducedMotion) return;
            const inputs = Array.from(inputContainer.querySelectorAll('.input-wrapper'));
            inputs.forEach(el => {
                const id = el.dataset.id;
                if(id) flipState[id] = el.getBoundingClientRect();
            });
        }
        function playInputFlipAnimation() {
            if (isTouchDevice || prefersReducedMotion) return;
            const inputs = Array.from(inputContainer.querySelectorAll('.input-wrapper'));
            inputs.forEach(el => {
                const id = el.dataset.id;
                if(!id) return;
                const last = flipState[id];
                if (!last) return;
                const current = el.getBoundingClientRect();
                const deltaX = last.left - current.left;
                const deltaY = last.top - current.top;

                if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
                    gsap.fromTo(el,
                        { x: deltaX, y: deltaY },
                        { x: 0, y: 0, duration: CONFIG.animation.durationNormal, ease: CONFIG.animation.easeStandard, willChange: 'transform' }
                    );
                }
            });
        }

        function updateInputLabel() {
            if (!t || !inputLabel) return;
            let labelText;
            if (mode === 'g2w') {
                labelText = t.calculator.inputLabelResource;
            } else {
                const modeLabelText = mode === 'w2c' ? t.units.waves : t.units.cards;
                labelText = t.calculator.inputLabel.replace("{modeLabel}", modeLabelText);
            }
            inputLabel.textContent = labelText;
            
            if (calculatorView.classList.contains('visible')) {
                gsap.fromTo(inputLabel,
                    { autoAlpha: 0, y: -10 * animSpeedMultiplier },
                    { autoAlpha: 1, y: 0, duration: CONFIG.animation.durationNormal * animSpeedMultiplier, delay: 0.1 * animSpeedMultiplier, ease: CONFIG.animation.easeStandard }
                );
            } else {
                gsap.set(inputLabel, { autoAlpha: 1, y: 0 });
            }
        }
        
        function attachResizeListener(inputWrapper) {
            const input = inputWrapper.querySelector('.calc-input');
            if (!input) return;
            const resize = () => {
                recordInputPositions();
                const minWidth = 100;
                const maxWidth = 400;
                const rightPadding = 45; 
                const charWidth = 22;
                let newWidth;
        
                const isOnlyAndEmpty = inputContainer.children.length === 1 && getRawValue(input).trim() === '';
                
                if (isOnlyAndEmpty) {
                    newWidth = maxWidth;
                } else {
                    const contentLength = getRawValue(input).length;
                    const effectiveLength = contentLength === 0 ? 1 : contentLength;
                    newWidth = Math.max(minWidth, Math.min(maxWidth, ((effectiveLength + 2) * charWidth) + rightPadding));
                }
                inputWrapper.style.width = newWidth + 'px';
                requestAnimationFrame(playInputFlipAnimation);
            };
            input.addEventListener('input', resize);
            resize(); 
        }

        function createInputBoxes(count = 1) {
            gsap.killTweensOf(inputContainer.children);
            inputContainer.innerHTML = ''; 
            setInputState(true);
            
            const fragment = document.createDocumentFragment();
            for (let i = 0; i < count; i++) {
                fragment.appendChild(createInputFieldElement(i));
            }
            inputContainer.appendChild(fragment);
            updateInputLabel();
            
            const wrappers = Array.from(inputContainer.querySelectorAll(".input-wrapper"));
            wrappers.forEach(attachResizeListener);
            
            if (!isTouchDevice) inputContainer.offsetHeight;
            
            gsap.fromTo(wrappers,
                { autoAlpha: 0, y: 25 * animSpeedMultiplier, scale: 0.9 },
                { 
                    autoAlpha: 1, y: 0, scale: 1,
                    duration: CONFIG.animation.durationNormal * animSpeedMultiplier,
                    stagger: 0.08 * animSpeedMultiplier, ease: CONFIG.animation.easeBounce,
                    onComplete: () => {
                            if (wrappers.length === 1 && count === 1 && !isTouchDevice) {
                            const firstInput = wrappers[0].querySelector('.calc-input');
                            if (firstInput) setTimeout(() => firstInput.focus({ preventScroll: true }), 150);
                        }
                    }
                }
            );
        }

        function createInputFieldElement(index) { 
            const wrapper = document.createElement('div');
            wrapper.className = 'input-wrapper';
            wrapper.dataset.index = index;
            wrapper.dataset.id = `input-${Date.now()}-${Math.random()}`;

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'calc-input';
            input.placeholder = t?.calculator?.placeholder || 'Enter...';
            input.inputMode = 'decimal';
            input.pattern = "[0-9,]*";
            input.autocomplete = 'off';

            const clearBtn = document.createElement('button');
            clearBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>';
            clearBtn.className = 'clear-single-input';
            clearBtn.title = t?.clear || 'Clear';
            clearBtn.setAttribute('aria-label', t?.clear || 'Clear Input');
            clearBtn.tabIndex = -1;

            wrapper.appendChild(input);
            wrapper.appendChild(clearBtn);
            return wrapper;
        }

        function addInputFieldAndFocus() {
                if (inputContainer.children.length >= CONFIG.maxInputs) {
                    showNotification(t.calculator.maxValues.replace('{max}', CONFIG.maxInputs));
                    return false;
                }
                const currentInputs = Array.from(inputContainer.querySelectorAll('.calc-input'));
                const hasEmpty = currentInputs.some(inp => getRawValue(inp).trim() === '');
                if (hasEmpty) {
                    showNotification(t.calculator.fillEmpty);
                    return false;
                }
                const currentValues = currentInputs.map(inp => getRawValue(inp).trim()).filter(v => v !== '');
                const hasDuplicates = new Set(currentValues).size !== currentValues.length;
                if (hasDuplicates) {
                    showNotification(t.calculator.removeDuplicates);
                    return false;
                }
            
                recordInputPositions();
                
                const newIndex = inputContainer.children.length;
                const newWrapper = createInputFieldElement(newIndex);
                
                gsap.set(newWrapper, { opacity: 0 });
                
                inputContainer.appendChild(newWrapper);
                const newInp = newWrapper.querySelector('.calc-input');
                if (newInp) {
                setTimeout(() => newInp.focus({ preventScroll: true }), 0);
                }
                
                attachResizeListener(newWrapper);
                
                inputContainer.offsetHeight;
                
                playInputFlipAnimation();

                gsap.to(newWrapper, 
                    { 
                        opacity: 1,
                        duration: CONFIG.animation.durationNormal * animSpeedMultiplier,
                        ease: CONFIG.animation.easeStandard
                    }
                );
                return true;
        }

        function handleInputEvent(e) { 
            const input = e.target;
            if (!input.classList.contains('calc-input') || isComposing) return;
            formatInputWithCommas(input);
            const clearBtn = input.parentElement?.querySelector('.clear-single-input');
            if (clearBtn) clearBtn.style.display = input.value ? 'block' : 'none';
            input.classList.remove('error');
        }

        function handleKeyDownEvent(e) {
                const input = e.target;
                if (!input.classList.contains('calc-input')) return;
                if (e.key === 'Enter') {
                    e.preventDefault();
                    input.blur();
                    handleCalculationTrigger();
                } else if ((e.key === ',' || e.key === '+') && mode !== 'g2w') {
                    e.preventDefault();
                    addInputFieldAndFocus();
                }
        }

        function handleClearButtonEvent(e) { 
            const clearBtn = e.target.closest('.clear-single-input');
            if (!clearBtn) return;
            e.stopPropagation();
            const wrapper = clearBtn.closest('.input-wrapper');
            const input = wrapper?.querySelector('.calc-input');
            if (!wrapper || !input) return;
            
            recordInputPositions();
            const allWrappers = Array.from(inputContainer.children);
            if (allWrappers.length > 1) { 
                gsap.to(wrapper, {
                    height: 0, opacity: 0, scale: 0.5,
                    margin: 0, padding: 0,
                    duration: CONFIG.animation.durationShort * animSpeedMultiplier,
                    ease: CONFIG.animation.easeIn,
                    onComplete: () => {
                        wrapper.remove();
                        if (!isTouchDevice) inputContainer.offsetHeight;
                        playInputFlipAnimation();
                        handleCalculationTrigger();
                    }
                });
            } else { 
                    input.value = '';
                    clearBtn.style.display = 'none';
                    input.classList.remove('error');
                    if (!isTouchDevice) {
                        const firstInput = inputContainer.querySelector('.calc-input');
                        if (firstInput) setTimeout(() => firstInput.focus({ preventScroll: true }), 50);
                    }
                    clearResults(); 
                }
        }
        
        function handlePasteEvent(e) { 
            const input = e.target;
            if (!input.classList.contains('calc-input') || isComposing) return;
            e.preventDefault();
            const pasteData = (e.clipboardData || window.clipboardData).getData('text');
            const values = (mode === 'g2w') ? pasteData.match(/\d+/g) : pasteData.match(/-?\d+/g);
            if (!values || values.length === 0) return;
            
            if (mode === 'g2w') {
                input.value = values[0];
                input.dispatchEvent(new Event('input', { bubbles: true }));
                return;
            }

            const currentInputs = Array.from(inputContainer.querySelectorAll('.calc-input'));
            const focusedIndex = currentInputs.indexOf(input);
            let valsToDistribute = values.slice();
            
            for (let i = 0; i < valsToDistribute.length; i++) {
                const targetIndex = focusedIndex + i;
                if (targetIndex < currentInputs.length) {
                    currentInputs[targetIndex].value = valsToDistribute[i];
                    currentInputs[targetIndex].dispatchEvent(new Event('input', { bubbles: true }));
                } else {
                    if (inputContainer.children.length < CONFIG.maxInputs) {
                        const added = addInputFieldAndFocus();
                        if (added) {
                            setTimeout(() => {
                                const allInputsAfterAdd = inputContainer.querySelectorAll('.calc-input');
                                const newInput = allInputsAfterAdd[targetIndex];
                                if (newInput) {
                                    newInput.value = valsToDistribute[i];
                                    newInput.dispatchEvent(new Event('input', { bubbles: true }));
                                }
                            }, 50 + (CONFIG.animation.durationNormal * animSpeedMultiplier * 1000));
                        } else { break; }
                    } else {
                        showNotification(t.calculator.maxValues.replace('{max}', CONFIG.maxInputs) + " (Paste overflow)");
                        break;
                    }
                }
            }
        }

        function handleCalculationTrigger() {
            const results = performCalculation();
            if (results) {
                displayResults(results);
            }
        }
        
        function performResourceCalculation() {
            const val = getRawValue(resourceInput);
            lastCalculatedInputString = val;
            resourceInput.classList.remove('error');

            if (val === '' || !/^\d+$/.test(val)) {
                if(val !== '') resourceInput.classList.add('error');
                clearResults();
                return false;
            }
            
            const resourceType = document.querySelector('input[name="resourceType"]:checked').value;
            const rank = resourceRankSelect.value;
            
            const result = resourceToWaves(val, resourceType, rank);
            
            if (result) {
                const resultData = {
                    originalIndex: 0,
                    input: val,
                    inputType: resourceType,
                    inputRank: rank,
                    result: result.wave.toString(),
                    cards: result.cards.toString()
                };
                addHistoryRecord(Date.now(), 'g2w', val, result.wave.toString(), { type: resourceType, rank: rank, cards: result.cards.toString() });
                return [resultData];
            } else {
                clearResults();
                return false;
            }
        }

        function performCalculation() {
            if (isMultiCopyMode) return false;
            if (mode === 'g2w') {
                return performResourceCalculation();
            }
            const inputs = inputContainer.querySelectorAll('.calc-input');
            const currentInputString = Array.from(inputs)
                                            .map(input => getRawValue(input).trim())
                                            .join(',');

            if (currentInputString === lastCalculatedInputString && body.classList.contains('results-focused')) {
                return false; 
            }
            lastCalculatedInputString = currentInputString;
            let hasValidInput = false;
            let currentInputValues = [];
            inputs.forEach((input, index) => {
                const val = getRawValue(input).trim();
                input.classList.remove('error');
                if (val === '' || !/^-?\d+$/.test(val) || val === '-') {
                    if (val !== '' && val !== '-') input.classList.add('error');
                    currentInputValues.push({ value: null, originalIndex: index });
                } else {
                    hasValidInput = true;
                    currentInputValues.push({ value: val, originalIndex: index });
                }
            });
            
            if (!hasValidInput && currentInputValues.some(v => v.value === null) && inputs.length > 0 && Array.from(inputs).some(inp => getRawValue(inp).trim() !== '')) {
                showNotification(t.calculator.invalidInput);
                clearResults();
                return false;
            }
            
            const validInputsForCalc = currentInputValues.filter(v => v.value !== null);
            if (validInputsForCalc.length > 0) {
                const results = validInputsForCalc.map(inputObj => {
                    if (inputObj.value === null) return null;
                    try {
                        if (mode === "w2c") {
                            const resultBigInt = wavesToCards(inputObj.value);
                            return { originalIndex: inputObj.originalIndex, input: inputObj.value, result: resultBigInt.toString(), steps: [] };
                        } else {
                            const { wave, steps } = cardsToWaves(inputObj.value);
                            return { originalIndex: inputObj.originalIndex, input: inputObj.value, result: wave.toString(), steps: steps };
                        }
                    } catch (e) {
                        const inputField = Array.from(inputs)[inputObj.originalIndex];
                        if(inputField) inputField.classList.add('error');
                        return null;
                    }
                }).filter(r => r !== null);

                results.sort((a, b) => {
                    try {
                        const aVal = BigInt(a.input);
                        const bVal = BigInt(b.input);
                        if (aVal < bVal) return -1;
                        if (aVal > bVal) return 1;
                    } catch(e) { }
                    return 0;
                });
                
                if (results.length > 0) {
                    results.forEach(item => addHistoryRecord(Date.now(), mode, item.input, item.result));
                    return results;
                } else {
                    if (!inputs.every(inp => getRawValue(inp).trim() === '')) showNotification("Calculation error occurred.");
                    clearResults();
                    return false;
                }
            } else {
                clearResults();
                return false;
            }
        }
        
        function displayResults(resultsData) { 
            resultsContainer.classList.add('visible-true');
            multiCopyBtn.style.display = 'inline-flex';
            setInputState(false);
            exitMultiCopyMode();
            
            const tableBody = resultOutput.querySelector('tbody') || resultOutput.appendChild(document.createElement('table')).appendChild(document.createElement('tbody'));
            tableBody.innerHTML = '';
            
            const newRows = [];
            resultsData.forEach((item) => {
                const tr = document.createElement('tr');
                tr.draggable = !isTouchDevice && mode !== 'g2w';
                
                if (mode === 'g2w') {
                    const typeText = item.inputType === 'gold' ? t.calculator.gold : t.calculator.diamond;
                    const rankText = item.inputType === 'gold' ? ` (${t.units.rank} ${item.inputRank})` : '';
                    const inputHTML = `<span>${formatBigIntWithCommas(item.input)} ${typeText}${rankText}</span>`;
                    const outputHTML = `<span>${formatBigIntWithCommas(item.result)} ${t.units.waveSingle}</span> <br> <span style="font-size:0.85em; opacity: 0.8;">(${createCardSpan(item.cards, t.units.cardSingle, true)})</span>`;
                    
                    tr.dataset.inputValue = item.input;
                    tr.dataset.outputValue = item.result;
                    tr.dataset.inputType = item.inputType;
                    tr.dataset.inputRank = item.inputRank;
                    tr.dataset.outputCards = item.cards;
                    tr.dataset.steps = JSON.stringify(item, replacer);
                    
                    tr.innerHTML = `
                        <td class="result-input-cell" style="width: 40%;">${inputHTML}</td>
                        <td class="result-arrow-cell" style="width: 5%;">→</td>
                        <td class="result-output-cell" style="width: 40%;">${outputHTML}</td>
                        <td class="result-actions-cell" style="width: 15%;"></td>
                    `;
                } else {
                    const isCardOutput = mode === "w2c";
                    const isCardInput = mode === "c2w";
                    const inputUnit = isCardInput ? t.units.cardSingle : t.units.waveSingle;
                    const outputUnit = isCardOutput ? t.units.cardSingle : t.units.waveSingle;
                    const inputHTML = createCardSpan(item.input, inputUnit, isCardInput);
                    const outputHTML = createCardSpan(item.result, outputUnit, isCardOutput);
                    
                    tr.dataset.inputValue = item.input;
                    tr.dataset.outputValue = item.result;
                    tr.dataset.originalIndex = item.originalIndex;
                    if (item.steps) tr.dataset.steps = JSON.stringify(item.steps, replacer);

                    tr.innerHTML = `
                        <td class="result-input-cell">${inputHTML}</td>
                        <td class="result-arrow-cell">→</td>
                        <td class="result-output-cell">${outputHTML}</td>
                        <td class="result-actions-cell"></td>
                    `;
                }
                
                tableBody.appendChild(tr);
                newRows.push(tr);
            });

            requestAnimationFrame(() => {
                adjustContainerHeights();
            });
            
            gsap.from(newRows, {
                duration: CONFIG.animation.durationNormal * animSpeedMultiplier,
                opacity: 0,
                y: 15 * animSpeedMultiplier,
                stagger: 0.05 * animSpeedMultiplier,
                ease: "power2.out",
            });

            setTimeout(() => {
                attachResultInteractionListeners('#resultsContainer'); 
                updateResultTableContent();
            }, 10);
        }

        function clearResults(force = false) {
                if (!body.classList.contains('results-focused') && !force) return;
                
                setInputState(true);
                multiCopyBtn.style.display = 'none';
                exitMultiCopyMode();
                
                if (force) {
                    resultsContainer.classList.remove('visible-true');
                    resultOutput.innerHTML = `<div style="text-align: center; padding: 2rem 0; color: var(--text-muted-color);" data-i18n="calculator.resultPlaceholder">${t?.calculator?.resultPlaceholder || 'Results...'}</div>`;
                } else {
                    setTimeout(() => {
                        if (!resultsContainer.classList.contains('visible-true')) {
                            resultOutput.innerHTML = `<div style="text-align: center; padding: 2rem 0; color: var(--text-muted-color);" data-i18n="calculator.resultPlaceholder">${t?.calculator?.resultPlaceholder || 'Results...'}</div>`;
                        }
                    }, 500); 
                }
                resultsContainer.classList.remove('visible-true');

            if(resultInteractionHint) updateCalculatorText();
            inputContainer.querySelectorAll('.calc-input.error').forEach(input => input.classList.remove('error'));
            if(resourceInput) resourceInput.classList.remove('error');
                
            lastCalculatedInputString = null;
        }

        function updateProcessDetails(inputStr, steps = [], extraData = null) {
            if (!processDetailsContent) return;
            let html = '';
            try {
                const isResourceMode = (mode === 'g2w');
                if (!isResourceMode && !/^-?\d+$/.test(inputStr)) return;
                if (isResourceMode && !/^\d+$/.test(inputStr)) return;
        
                const inputBig = BigInt(inputStr);
                const isNegative = inputBig < 0n;
                const absInputBig = isNegative ? -inputBig : inputBig;
        
                const modeTitle = mode === "w2c" ? t.process.w2cTitle : (mode === "c2w" ? t.process.c2wTitle : t.process.g2wTitle);
                html = `<h3>${t.process.stepTitle.replace('{modeTitle}', modeTitle).replace('{input}', formatBigIntWithCommas(inputStr))}</h3>`;
        
                if (isNegative) {
                    html += `<div class="process-subtitle">${t.process.negTitle}</div><p>${t.process.negInfo}</p><hr>`;
                }
        
                if (absInputBig === 0n) {
                    html += `<dl><dt>${t.process.finalResult}</dt><dd class="highlight">0</dd></dl>`;
                } else if (mode === "w2c") {
                    const W_target = absInputBig;
                    html += `<div class="process-subtitle">${t.process.w2cFormulaTitle}</div>`;
                    html += `$$ C(W) = \\sum_{w=1}^{W} c(w) $$`;
                    
                    const ranges = [
                        { start: 1n, end: 45n, cycle: [1n, 1n, 2n, 1n, 3n] },
                        { start: 46n, end: 111n, cycle: [2n, 6n] },
                        { start: 112n, end: 500n, cycle: [4n, 12n] },
                        { start: 501n, end: 1000n, cycle: [6n, 18n] },
                        { start: 1001n, end: 1500n, cycle: [8n, 24n] },
                        { start: 1501n, cycle: [10n, 30n] }
                    ];

                    let totalCards = 0n;
                    let lastWave = 0n;
                    let sumParts = [];

                    for (const range of ranges) {
                        if (W_target <= lastWave) break;
                        const currentRangeEnd = (range.end === undefined || W_target < range.end) ? W_target : range.end;
                        const cardsInRange = wavesToCards(currentRangeEnd) - wavesToCards(lastWave);
                        html += `<hr>`;
                        html += `<div class="process-subtitle">${t.process.w2cSegmentTitle.replace('{start}', lastWave + 1n).replace('{end}', currentRangeEnd)}</div>`;
                        if (range.cycle.length === 5) { 
                            html += `<p>$$ c(w) \\text{ cycle: } [1, 1, 2, 1, 3] $$</p>`;
                        } else {
                            html += `<p>$$ c(w) = \\begin{cases} ${range.cycle[0]} & \\text{if } w \\text{ is odd} \\\\ ${range.cycle[1]} & \\text{if } w \\text{ is even} \\end{cases} $$</p>`;
                        }
                        html += `<p>$$ C_{${lastWave+1n} \\rightarrow ${currentRangeEnd}} = \\sum_{w=${lastWave+1n}}^{${currentRangeEnd}} c(w) = ${formatBigIntWithCommas(cardsInRange)} $$</p>`;
                        totalCards += cardsInRange;
                        sumParts.push(formatBigIntWithCommas(cardsInRange));
                        lastWave = currentRangeEnd;
                    }

                    html += `<hr><div class="process-subtitle">${t.process.w2cFinalTotalLabel}</div>`;
                    if (sumParts.length > 1) {
                        let alignString = `C(${W_target}) &= ${sumParts[0]}`;
                        for (let i = 1; i < sumParts.length; i++) {
                            alignString += ` \\\\ &+ ${sumParts[i]}`;
                        }
                        alignString += ` \\\\ &= \\color{var(--primary-color)}{${formatBigIntWithCommas(totalCards)}}`;
                        html += `<p>$$ \\begin{align*} ${alignString} \\end{align*} $$</p>`;
                    } else {
                        html += `<p>$$ C(${W_target}) = \\color{var(--primary-color)}{${formatBigIntWithCommas(totalCards)}} $$</p>`;
                    }
                
                } else if (mode === 'g2w') {
                        const { inputType, inputRank, cards, result } = JSON.parse(extraData);
                        const rankData = REWARDS[inputRank] || REWARDS[20];
                        const resourcePerBox = BigInt(inputType === 'gold' ? rankData.g : rankData.d);

                        html += `<div class="process-subtitle">${t.process.g2wStep1Title}</div>`;
                        html += `<p>${t.process.formula}: $$ \\text{${t.reward.boxes}} = \\lceil \\frac{\\text{${t.calculator[inputType]}}}{\\text{${t.process.resourcePerBox}}} \\rceil $$</p>`;
                        html += `<p>${t.process.calculation}: $$ \\lceil \\frac{${formatBigIntWithCommas(inputBig)}}{${formatBigIntWithCommas(resourcePerBox)}} \\rceil = ${formatBigIntWithCommas(BigInt(cards) / CONFIG.cardsPerBox)} $$</p>`;
                        html += `<hr>`;
                        html += `<div class="process-subtitle">${t.process.g2wStep2Title}</div>`;
                        html += `<p>${t.process.formula}: $$ C = \\text{${t.reward.boxes}} \\times ${CONFIG.cardsPerBox} $$</p>`;
                        html += `<p>${t.process.calculation}: $$ ${formatBigIntWithCommas(BigInt(cards) / CONFIG.cardsPerBox)} \\times ${CONFIG.cardsPerBox} = ${formatBigIntWithCommas(cards)} $$</p>`;
                        html += `<hr>`;
                        html += `<div class="process-subtitle">${t.process.g2wStep3Title}</div>`;
                        html += `<p>${t.process.c2wStep3Info}</p>`;
                        html += `<p>${t.process.finalResult}: $$ W(${formatBigIntWithCommas(cards)}) = \\color{var(--primary-color)}{${formatBigIntWithCommas(result)}} $$</p>`;

                } else { // C2W
                    html += `<div class="process-subtitle">${t.process.c2wSearchTitle}</div>`;
                    if (steps && steps.length > 0) {
                        steps.forEach(s => {
                            s.result = BigInt(s.result); s.low = BigInt(s.low); s.high = BigInt(s.high); s.guess = BigInt(s.guess);
                            const comparisonSymbol = s.result >= absInputBig ? '\\ge' : '<';
                            const resultColor = s.isFinal ? 'var(--primary-color)' : 'var(--text-color)';
                            const newRangeText = s.result >= absInputBig
                                ? `[${formatBigIntWithCommas(s.low)}, ${formatBigIntWithCommas(s.guess - 1n)}]`
                                : `[${formatBigIntWithCommas(s.guess + 1n)}, ${formatBigIntWithCommas(s.high)}]`;
                            
                            html += `<div style="border-left: 3px solid ${resultColor}; padding-left: 1rem; margin-bottom: 1.5rem;">`;
                            html += `<b>${t.process.searchStep.replace('{n}', s.step)}:</b>`;
                            html += `<dl><dt>${t.process.guess}</dt><dd>$$ W_{guess} = ${formatBigIntWithCommas(s.guess)} $$</dd>`;
                            html += `<dt>${t.process.check}</dt><dd>$$ C(W_{guess}) = ${formatBigIntWithCommas(s.result)} $$</dd>`;
                            html += `<dt>${t.process.adjustRange}</dt><dd>$$ ${formatBigIntWithCommas(s.result)} ${comparisonSymbol} C_{target} \\rightarrow \\text{${t.process.newRange}: } ${newRangeText} $$</dd></dl>`;
                            html += `</div>`;
                        });
                    }
                    const { wave: finalWave } = cardsToWaves(absInputBig);
                    html += `<hr><dl><dt>${t.process.finalResult}</dt><dd class="highlight">${formatBigIntWithCommas(finalWave)} ${t.units.waveSingle}</dd></dl>`;
                }
            } catch (err) {
                html = `<h3>Error</h3><p>An error occurred while generating the process details.</p>`;
            }
            
            processDetailsContent.innerHTML = html;
            if (window.MathJax && window.MathJax.typesetPromise) {
                    window.MathJax.typesetPromise([processDetailsContent]).catch(function (err) {
                    processDetailsContent.innerHTML += `<p style="color:var(--error-color)">Math formula rendering failed.</p>`;
                });
            }
        }

        function attachSubViewListeners() {
            navItems.forEach(item => {
                item.addEventListener('click', () => {
                    const target = item.dataset.target;
                    if (target === 'calculator') {
                        if(activeSubView) hideSubView(activeSubView);
                    } else {
                        const targetPanelId = target + 'Panel';
                        showSubView(targetPanelId);
                    }
                });
            });
            backButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const panel = button.closest('.sub-view-panel');
                    if (panel) hideSubView(panel.id);
                });
            });
            subViewPanels.forEach(panel => {
                let mouseDownOnBackdrop = false;
                panel.addEventListener('mousedown', e => {
                    if (!e.target.closest('.module')) {
                            const target = e.target;
                            mouseDownOnBackdrop = (target === panel || target.classList.contains('module-wrapper'));
                    } else {
                        mouseDownOnBackdrop = false;
                    }
                });
                panel.addEventListener('mouseup', e => {
                    if (mouseDownOnBackdrop) {
                        if (!e.target.closest('.module')) {
                            const target = e.target;
                            const mouseUpOnBackdrop = (target === panel || target.classList.contains('module-wrapper'));
                            if (mouseUpOnBackdrop && panel.classList.contains('visible')) {
                                hideSubView(panel.id);
                            }
                        }
                    }
                    mouseDownOnBackdrop = false;
                });
            });
        }
        
        function showSubView(panelId) {
            const panel = document.getElementById(panelId);
            if (!panel) return;
            if (activeSubView === panelId && panel.classList.contains('visible')) return;

            if (activeSubView && activeSubView !== panelId) {
                hideSubView(activeSubView, true);
            }
            activeSubView = panelId;
            panel.style.visibility = 'visible';
            panel.classList.add('visible');
            gsap.fromTo(panel, { autoAlpha: 0 }, { autoAlpha: 1, duration: CONFIG.animation.durationNormal * animSpeedMultiplier, ease: CONFIG.animation.easeStandard });
            
            updateSideNavActiveState();

            try {
                if (panelId === 'commonPanel') populateTablesForPanel();
                else if (panelId === 'chartPanel') requestAnimationFrame(() => setTimeout(() => { generateChartForPanel(); }, 50));
                else if (panelId === 'historyPanel') renderHistoryPanel();
            } catch (e) { }

            gsap.to([topBar, mainView, settingsToggleGlobal], {
                autoAlpha: prefersReducedMotion ? 1 : 0.3,
                duration: CONFIG.animation.durationShort * animSpeedMultiplier,
                pointerEvents: 'none',
                filter: prefersReducedMotion ? 'none' : 'blur(2px)',
                overwrite: true
            });
        }

        function hideSubView(panelId, immediate = false) {
            const panel = document.getElementById(panelId);
            if (!panel || !panel.classList.contains('visible')) return;

            const duration = immediate ? 0 : CONFIG.animation.durationNormal * animSpeedMultiplier;
            gsap.to(panel, {
                autoAlpha: 0,
                duration: duration,
                ease: CONFIG.animation.easeIn,
                onComplete: () => {
                    panel.classList.remove('visible');
                    if (!panel.classList.contains('visible')) { panel.style.visibility = 'hidden'; }
                }
            });

            if (activeSubView === panelId) activeSubView = null;
            
            updateSideNavActiveState();
            
            if (!activeSubView) {
                const restoreDelay = immediate ? 0 : duration * 0.5;
                gsap.to([topBar, mainView, settingsToggleGlobal], {
                    autoAlpha: 1,
                    duration: CONFIG.animation.durationShort * animSpeedMultiplier,
                    pointerEvents: 'auto',
                    filter: 'blur(0px)',
                    delay: restoreDelay,
                    overwrite: true
                });
            }
        }
        
        function populateTablesForPanel() {
            if (!w2cTablePanelBody || !c2wTablePanelBody) return;
            const w2cValues = [45n, 111n, 200n, 500n, 1000n, 1500n, 2000n, 5000n, 10000n];
            const c2wValues = [40n, 400n, 1000n, 4000n, 8000n, 16000n, 32000n, 100000n, 400000n];
            w2cTablePanelBody.innerHTML = "";
            c2wTablePanelBody.innerHTML = "";
            w2cValues.forEach(wave => {
                try {
                    const cards = wavesToCards(wave);
                    const tr = document.createElement("tr");
                    tr.innerHTML = `<td>${formatBigIntWithCommas(wave)} ${t.units.waveSingle}</td><td>${createCardSpan(cards.toString(), t.units.cardSingle, true)}</td>`;
                    w2cTablePanelBody.appendChild(tr);
                } catch(e) {}
            });
            c2wValues.forEach(cards => {
                try {
                    const { wave } = cardsToWaves(cards);
                    const tr = document.createElement("tr");
                    tr.innerHTML = `<td>${createCardSpan(cards.toString(), t.units.cardSingle, true)}</td><td>${formatBigIntWithCommas(wave)} ${t.units.waveSingle}</td>`;
                    c2wTablePanelBody.appendChild(tr);
                } catch(e) {}
            });
            attachResultInteractionListeners("#commonPanel");
        }
        
        function getPrettyTick(value) {
            if (value <= 0) return 1;
            const niceNumbers = [1, 2, 5, 10];
            const exponent = Math.floor(Math.log10(value));
            const powerOf10 = 10 ** exponent;
            const fraction = value / powerOf10;
            let niceFraction = niceNumbers[niceNumbers.length - 1];
            for (let n of niceNumbers) {
                if (fraction <= n) {
                    niceFraction = n;
                    break;
                }
            }
            return niceFraction * powerOf10;
        }

        function handleChartUpdate({ chart }) {
            if (!chart) return;
            
            updateYAxisRange(chart);
            updateChartSlidersState(chart); 
            
            chart.update('none');
        }

        function updateYAxisRange(chart) {
            if (!chart) return;
            const { min: xMin, max: xMax } = chart.scales.x;

            chart.options.scales.y.min = (xMin > 1) ? Number(wavesToCards(BigInt(Math.floor(xMin)))) : 0;
            chart.options.scales.y.max = Number(wavesToCards(BigInt(Math.ceil(xMax))));
        }

        function updateChartSlidersState(chart) {
            if (!chart) return;
            const zoomSlider = document.getElementById('chartZoomSlider');
            const panContainer = document.getElementById('chart-pan-container');
            const panThumb = document.getElementById('pan-thumb');
            const track = document.getElementById('pan-track');
            if (!zoomSlider || !panContainer || !panThumb || !track) return;

            const initialXRange = CONFIG.chart.maxWaves;
            const currentXRange = chart.scales.x.max - chart.scales.x.min;
            const currentXMin = chart.scales.x.min;
            
            const zoomLevel = initialXRange / currentXRange;
            zoomSlider.value = zoomLevel;
            
            const maxPanRange = initialXRange - currentXRange;
            if (maxPanRange > 1) {
                panContainer.style.display = 'block';
                const trackWidth = track.clientWidth;
                const thumbWidth = Math.max(20, (currentXRange / initialXRange) * trackWidth);
                const thumbPos = (currentXMin / maxPanRange) * (trackWidth - thumbWidth);
                
                gsap.set(panThumb, {
                    width: thumbWidth,
                    x: thumbPos
                });
                updatePanRuler(chart);
            } else {
                panContainer.style.display = 'none';
            }
        }
        
        function generateChartData(maxWaves) {
            if (originalChartData.length > 0) return originalChartData;

            const dataPoints = new Set();
            const keyPoints = [0, 1, 44, 45, 46, 110, 111, 112, 500, 501, 1000, 1001, 1500, 1501];
            keyPoints.forEach(p => {
                if (p <= maxWaves) dataPoints.add(p);
            });

            for (let p = 0; p <= maxWaves; p += 1) {
                    dataPoints.add(p);
            }
            
            const sortedPoints = Array.from(dataPoints).sort((a,b) => a-b);
            const finalData = [];
            for (let i = 0; i < sortedPoints.length; i++) {
                const p = sortedPoints[i];
                finalData.push({ x: p, y: Number(wavesToCards(BigInt(p))) });
            }
            originalChartData = finalData.sort((a,b) => a.x - b.x);
            return originalChartData;
        }
        
        function generateChartForPanel() {
            if (!chartPanelCanvas || !t) return;
            const chartAvailable = typeof Chart !== 'undefined' && Chart.registry.plugins.get('annotation') && Chart.registry.plugins.get('datalabels') && Chart.registry.plugins.get('zoom') && Chart.registry.plugins.get('minorGridLines');
            if (!chartAvailable) { return; }
            const ctx = chartPanelCanvas.getContext("2d"); if (!ctx) return;
            if (!chartPanelCanvas.offsetParent) { requestAnimationFrame(generateChartForPanel); return; }
            
            try {
                const maxWaves = CONFIG.chart.maxWaves;
                const fullData = generateChartData(maxWaves);
                
                if (myChart) { myChart.destroy(); myChart = null; }
                const isMobile = window.innerWidth <= 480;
                const axisColor = getComputedStyle(body).getPropertyValue('--text-muted-color').trim(); 
                const gridColor = getComputedStyle(body).getPropertyValue('--table-border').trim();
                const primaryColor = getComputedStyle(body).getPropertyValue('--primary-color').trim(); const primaryActiveColor = getComputedStyle(body).getPropertyValue('--primary-active').trim();
                const annotationColor = getComputedStyle(body).getPropertyValue('--error-color').trim();
                const glassBg = getComputedStyle(body).getPropertyValue('--glass-bg').trim(); const textColor = getComputedStyle(body).getPropertyValue('--text-color').trim();
                const annotationsConfig = {};
                const specialWaves = [45, 111, 501, 1001, 1501];
                specialWaves.forEach(wave => { if (wave <= maxWaves) { annotationsConfig[`vline${wave}`] = { type: 'line', scaleID: 'x', value: wave, borderColor: annotationColor, borderWidth: 1, borderDash: [6, 6], label: { display: true, content: `${wave}${t.units.waveSingle}`, position: 'start', backgroundColor: 'hsla(0, 0%, 15%, 0.75)', color: '#fff', font: { size: isMobile ? 8 : 10 }, padding: { top: 2, bottom: 2, left: 4, right: 4 }, borderRadius: 3, yAdjust: isMobile ? 12 : 5, pointerEvents: 'none' } }; } });
                annotationsConfig['crosshairY'] = { type: 'line', scaleID: 'x', display: false, borderColor: primaryActiveColor, borderWidth: 1.5, pointerEvents: 'none' };
                annotationsConfig['crosshairX'] = { type: 'line', scaleID: 'y', display: false, borderColor: primaryActiveColor, borderWidth: 1.5, pointerEvents: 'none' };
                annotationsConfig['crosshairLabel'] = { type: 'label', display: false, content: '', position: 'center', xValue: 0, yValue: 0, backgroundColor: glassBg, font: {size: isMobile ? 9 : 11}, color: textColor, padding: 6, borderRadius: 5, xAdjust: 10, yAdjust: -10, callout: { display: true, position: 'left', margin: 5 }, pointerEvents: 'none' };
                
                myChart = new Chart(ctx, { 
                    type: 'line', 
                    data: { datasets: [{ 
                        label: t.chart.yAxis, 
                        data: fullData, 
                        borderColor: primaryColor, 
                        pointRadius: 0, 
                        pointHoverRadius: 0,
                        pointHoverBackgroundColor: primaryActiveColor, 
                        pointHoverBorderColor: primaryActiveColor, 
                        fill: false, 
                        tension: 0, 
                        borderWidth: 2, 
                        stepped: false 
                    }] },
                    options: { 
                        responsive: true, 
                        maintainAspectRatio: false, 
                        animation: prefersReducedMotion ? false : { duration: 0 }, 
                        interaction: { mode: 'x', intersect: false }, 
                        plugins: { 
                            tooltip: { enabled: false }, 
                            legend: { display: false }, 
                            annotation: { annotations: annotationsConfig }, 
                            datalabels: { display: false },
                            minorGridLines: {},
                            zoom: { 
                                pan: { enabled: true, mode: 'x', onPan: handleChartUpdate },
                                zoom: { pinch: { enabled: true }, onZoom: handleChartUpdate } 
                            }
                        },
                        scales: { 
                            x: { 
                                type: "linear", 
                                title: { display: true, text: t.chart.xAxis, font: { size: isMobile ? 12 : 14, weight: 'bold' }, color: axisColor, padding: {top: 10} }, 
                                min: 0, 
                                max: maxWaves,
                                border: { display: true, color: axisColor, width: 2 },
                                ticks: { 
                                    color: axisColor,
                                    font: { size: isMobile ? 10 : 12 },
                                    autoSkip: true,
                                    maxTicksLimit: 15,
                                    callback: function(value) {
                                        if (value >= this.max) return '';
                                        return formatBigIntWithCommas(BigInt(Math.round(value)));
                                    }
                                }, 
                                grid: { display: true, color: gridColor, borderDash: [3, 3], lineWidth: 1.5 },
                            },
                            y: { 
                                type: 'linear', 
                                title: { display: true, text: t.chart.yAxis, font: { size: isMobile ? 12 : 14, weight: 'bold' }, color: axisColor, padding: {bottom: 10} }, 
                                min: 0, 
                                beginAtZero: true, 
                                max: CONFIG.chart.yAxisInitialMax, 
                                border: { display: true, color: axisColor, width: 2 },
                                ticks: { 
                                    color: axisColor, 
                                    font: { size: isMobile ? 10 : 12 },
                                    autoSkip: true,
                                    maxTicksLimit: 12,
                                    callback: function(value) {
                                        if (value >= this.max) return '';
                                        return formatBigIntWithCommas(BigInt(Math.round(value)));
                                    }
                                }, 
                                grid: { display: true, color: gridColor, borderDash: [3, 3], lineWidth: 1.5 } 
                            } 
                        }
                    }
                });
                attachChartControlListeners();
                setupChartHover();
                handleChartUpdate({ chart: myChart });
            } catch (e) {
                const container = chartPanelCanvas?.parentElement;
                if (container) container.innerHTML = `<p style='color: var(--error-color); text-align: center; padding: 2rem;'>Chart error: ${e.message}.</p>`;
                if (myChart) { myChart.destroy(); myChart = null; }
                return;
            }
        }
        
        function renderHistoryPanel() {
            if (!historyTablePanelBody || !historyPaginationPanel) return;
            historyTablePanelBody.innerHTML = "";
            if (historyData.length === 0) {
                historyTablePanelBody.innerHTML = `<tr><td colspan='4' style='text-align: center; padding: 2.5rem; color: var(--text-muted-color);'>${t.history.noRecord}</td></tr>`;
                historyPaginationPanel.innerHTML = "";
                return;
            }
            const startIndex = currentHistoryPage * CONFIG.historyRecordsPerPage;
            const endIndex = startIndex + CONFIG.historyRecordsPerPage;
            const pageData = historyData.slice(startIndex, endIndex);
            const fragment = document.createDocumentFragment();
            pageData.forEach(rec => {
                try {
                    const tr = document.createElement("tr");
                    const timeStr = new Date(rec.timestamp).toLocaleString(currentLang.replace('_','-'), { dateStyle: 'short', timeStyle: 'short'});
                    let modeText, inputTextHTML, resultTextHTML;

                    if (rec.mode === 'g2w' && rec.extra) {
                        modeText = t.calculator.modeG2W;
                        const typeText = rec.extra.type === 'gold' ? t.calculator.gold : t.calculator.diamond;
                        const rankText = rec.extra.type === 'gold' ? ` (${t.units.rank} ${rec.extra.rank})` : '';
                        inputTextHTML = `<span>${formatBigIntWithCommas(rec.input)} ${typeText}${rankText}</span>`;
                        resultTextHTML = `<span>${formatBigIntWithCommas(rec.result)} ${t.units.waveSingle}</span> <br> <span style="font-size:0.85em; opacity: 0.8;">(${createCardSpan(rec.extra.cards, t.units.cardSingle, true)})</span>`;
                    } else {
                        modeText = (rec.mode === "w2c") ? t.calculator.modeW2C : t.calculator.modeC2W;
                        const isCardOutput = rec.mode === "w2c";
                        const isCardInput = rec.mode === "c2w";
                        const inputUnit = isCardInput ? t.units.cardSingle : t.units.waveSingle;
                        const outputUnit = isCardOutput ? t.units.cardSingle : t.units.waveSingle;
                        inputTextHTML = createCardSpan(rec.input, inputUnit, isCardInput);
                        resultTextHTML = createCardSpan(rec.result, outputUnit, isCardOutput);
                    }
                    
                    tr.innerHTML = `
                        <td data-label="${t.tables.history.header1}">${timeStr}</td>
                        <td data-label="${t.tables.history.header2}">${modeText}</td>
                        <td data-label="${t.tables.history.header3}">${inputTextHTML}</td>
                        <td data-label="${t.tables.history.header4}">${resultTextHTML}</td>`;
                    fragment.appendChild(tr);
                } catch (e) {
                    const errTr = document.createElement("tr");
                    errTr.innerHTML = `<td colspan="4" style="color: var(--error-color);">Error loading record</td>`;
                    fragment.appendChild(errTr);
                }
            });
            historyTablePanelBody.appendChild(fragment);
            gsap.fromTo(historyTablePanelBody.querySelectorAll("tr"),
                { autoAlpha: 0, y: 10 * animSpeedMultiplier },
                { autoAlpha: 1, y: 0, duration: CONFIG.animation.durationNormal * animSpeedMultiplier, stagger: 0.05 * animSpeedMultiplier, ease: CONFIG.animation.easeStandard }
            );
            renderHistoryPaginationPanel();
            attachResultInteractionListeners('#historyPanel');
        }

        function addHistoryRecord(timestamp, modeUsed, inputStr, resultStr, extraData = null){
            if (!inputStr || (modeUsed !== 'g2w' && !/^-?\d+$/.test(inputStr)) || (modeUsed === 'g2w' && !/^\d+$/.test(inputStr))) return;
            const newRecord = { timestamp, mode: modeUsed, input: inputStr, result: resultStr, extra: extraData };
            
            if (historyData.length > 0 && JSON.stringify({m:historyData[0].mode, i:historyData[0].input}) === JSON.stringify({m:modeUsed, i:inputStr})) {
                historyData[0].timestamp = timestamp;
            } else {
                historyData.unshift(newRecord);
            }
            if(historyData.length > 100) historyData.pop();
            saveLS(LS_KEYS.history, historyData);
            currentHistoryPage = 0;
            if(activeSubView === 'historyPanel') renderHistoryPanel();
        }

        function attachGlobalListeners() {
            document.addEventListener('mousemove', (e) => {
                cursorLastClientX = e.clientX;
                cursorLastClientY = e.clientY;
            }, { passive: true });

            if(settingsToggleGlobal) {
                settingsToggleGlobal.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const isVisible = settingsPopupGlobal.classList.toggle("visible");
                    gsap.fromTo(settingsPopupGlobal,
                        { autoAlpha: isVisible ? 0 : 1, y: (isVisible ? -15 : 0) * animSpeedMultiplier, scale: isVisible ? 0.97 : 1 },
                        { autoAlpha: isVisible ? 1 : 0, y: 0, scale: 1, duration: CONFIG.animation.durationNormal * animSpeedMultiplier, ease: CONFIG.animation.easeBounce, overwrite: true }
                    );
                });
            }
            
            if(langSelectGlobal) langSelectGlobal.addEventListener('change', (e) => setAppLanguage(e.target.value));
            if(themeSelectGlobal) themeSelectGlobal.addEventListener('change', (e) => setAppTheme(e.target.value));
            if(cursorSelectGlobal) cursorSelectGlobal.addEventListener('change', (e) => setCursorPreference(e.target.value));

            document.addEventListener("click", (event) => {
                if (settingsPopupGlobal && settingsPopupGlobal.classList.contains("visible") && !settingsPopupGlobal.contains(event.target) && event.target !== settingsToggleGlobal && !settingsToggleGlobal.contains(event.target)) {
                    settingsPopupGlobal.classList.remove("visible");
                    gsap.to(settingsPopupGlobal, { autoAlpha: 0, y: -10 * animSpeedMultiplier, scale: 0.98, duration: CONFIG.animation.durationShort * animSpeedMultiplier, ease: CONFIG.animation.easeIn });
                }
                modalOverlays.forEach(overlay => {
                    if (overlay.classList.contains('visible') && event.target === overlay) {
                        hideModal(overlay);
                    }
                });
            });

            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
                if (themePref === 'system') setAppTheme('system');
            });
            
            if (clearHistoryPanelBtn) {
                clearHistoryPanelBtn.addEventListener('click', () => {
                    if (confirm((t?.history?.clearHistory || "Clear History") + "?")) {
                        historyData = [];
                        saveLS(LS_KEYS.history, historyData);
                        currentHistoryPage = 0;
                        renderHistoryPanel();
                    }
                });
            }
            
            document.addEventListener('keydown', (e) => {
                if ((e.key === ',' || e.key === '+') && calculatorView.classList.contains('visible') && !e.target.matches('input, textarea, select')) {
                    e.preventDefault();
                    if(mode !== 'g2w') addInputFieldAndFocus();
                }
                if (e.key === 'Escape') { 
                        if (isMultiCopyMode) {
                        exitMultiCopyMode();
                        return;
                        }
                        const visibleModal = document.querySelector('.modal-overlay.visible');
                        if (visibleModal) hideModal(visibleModal);
                        else if (activeSubView) hideSubView(activeSubView); 
                        else if (settingsPopupGlobal?.classList.contains("visible")) {
                            settingsPopupGlobal.classList.remove("visible");
                            gsap.to(settingsPopupGlobal, { autoAlpha: 0, y: -10*animSpeedMultiplier, scale: 0.98, duration: CONFIG.animation.durationShort * animSpeedMultiplier });
                        } 
                }
            });
        }
        
        function enterMultiCopyMode() {
            isMultiCopyMode = true;
            resultsContainer.classList.add('multi-copy-active');
            multiCopyBtn.classList.add('glow-active');
            multiCopyBtn.querySelector('span').textContent = t.calculator.copySelected;
            
            resultOutput.querySelectorAll('tr').forEach(row => {
                row.classList.add('selected');
            });
            resultOutput.addEventListener('click', handleMultiCopyItemClick);
        }

        function exitMultiCopyMode() {
            if (!isMultiCopyMode) return;
            isMultiCopyMode = false;
            resultsContainer.classList.remove('multi-copy-active');
            multiCopyBtn.classList.remove('glow-active');
            multiCopyBtn.querySelector('span').textContent = t.calculator.multiCopy;
            resultOutput.querySelectorAll('tr.selected').forEach(row => row.classList.remove('selected'));
            resultOutput.removeEventListener('click', handleMultiCopyItemClick);
        }

        function handleMultiCopyItemClick(e) {
            if (!isMultiCopyMode) return;
            const row = e.target.closest('tr');
            if (row) {
                e.preventDefault();
                e.stopPropagation();
                row.classList.toggle('selected');
            }
        }

        function performMultiCopy() {
            const selectedRows = resultOutput.querySelectorAll('tr.selected');
            if (selectedRows.length === 0) {
                showNotification("No items selected to copy.");
                return;
            }

            let textToCopy = '';
            selectedRows.forEach(row => {
                const inputVal = row.dataset.inputValue;
                const outputVal = row.dataset.outputValue;
                if(mode === 'g2w') {
                    const type = row.dataset.inputType === 'gold' ? t.calculator.gold : t.calculator.diamond;
                    const rank = row.dataset.inputRank;
                    const cards = row.dataset.outputCards;
                    const rankText = row.dataset.inputType === 'gold' ? ` (${t.units.rank} ${rank})` : '';
                    textToCopy += `${formatBigIntWithCommas(inputVal)} ${type}${rankText} → ${formatBigIntWithCommas(outputVal)} ${t.units.waveSingle} (${formatBigIntWithCommas(cards)} ${t.units.cardSingle})\n`;
                } else {
                    const inputUnit = mode === 'c2w' ? t.units.cards : t.units.waves;
                    const outputUnit = mode === 'w2c' ? t.units.cards : t.units.waves;
                    textToCopy += `${formatBigIntWithCommas(inputVal)} ${inputUnit} → ${formatBigIntWithCommas(outputVal)} ${outputUnit}\n`;
                }
            });
            navigator.clipboard.writeText(textToCopy.trim()).then(() => showNotification(t?.copied || 'Copied')).catch(err => ('Failed to copy selected results:', err));
            
            exitMultiCopyMode();
        }


    function attachCalculatorListeners() {
        btnW2C_main.addEventListener('click', () => switchMode('w2c'));
        btnC2W_main.addEventListener('click', () => switchMode('c2w'));
        btnG2W_main.addEventListener('click', () => switchMode('g2w'));
        btnW2C_top.addEventListener('click', () => switchMode('w2c'));
        btnC2W_top.addEventListener('click', () => switchMode('c2w'));
        btnG2W_top.addEventListener('click', () => switchMode('g2w'));
        
        if(addInputBtn) addInputBtn.addEventListener('click', addInputFieldAndFocus);
        if(calculateBtn) calculateBtn.addEventListener('click', handleCalculationTrigger);
        if (clearAllInputsBtn) {
            clearAllInputsBtn.addEventListener('click', () => {
                if (mode === 'g2w') {
                    resourceInput.value = '';
                    resourceInput.dispatchEvent(new Event('input', { bubbles: true }));
                } else {
                    createInputBoxes(1);
                }
                clearResults();
            });
        }
        if(multiCopyBtn) {
            multiCopyBtn.addEventListener('click', () => {
                if (isMultiCopyMode) {
                    performMultiCopy();
                } else {
                    enterMultiCopyMode();
                }
            });
        }
        
        inputContainer.addEventListener('input', handleInputEvent); 
        inputContainer.addEventListener('keydown', handleKeyDownEvent); 
        inputContainer.addEventListener('paste', handlePasteEvent); 
        inputContainer.addEventListener('click', handleClearButtonEvent);
        inputContainer.addEventListener('compositionstart', () => { isComposing = true; });
        inputContainer.addEventListener('compositionend', (e) => { isComposing = false; handleInputEvent(e); });
        
        inputContainerWrapper.addEventListener('click', (e) => {
            if (e.target.closest('button, input, .calc-input')) return;
            setInputState(true);
        });

        resultsContainer.addEventListener('click', (e) => {
            if (e.target.closest('button, .card-container, .long-number')) {
                return;
            }
            if (!isMultiCopyMode) {
                if(window.innerWidth > 1024) { setInputState(false); }
            }
        });

        resourceInput.addEventListener('input', handleInputEvent);
        resourceInput.addEventListener('keydown', handleKeyDownEvent);
        resourceInput.addEventListener('paste', handlePasteEvent);
        resourceInput.parentElement.querySelector('.clear-single-input').addEventListener('click', (e) => {
            e.stopPropagation();
            resourceInput.value = '';
            resourceInput.dispatchEvent(new Event('input', { bubbles: true }));
            resourceInput.classList.remove('error');
            clearResults();
        });
        document.querySelector('.resource-toggle').addEventListener('change', () => {
            resourceRankSelect.classList.toggle('visible', resourceGoldRadio.checked);
            if (resultsContainer.classList.contains('visible-true')) handleCalculationTrigger();
        });
        
        calculatorFlexContainer.addEventListener('click', (e) => {
                if(e.target === calculatorFlexContainer || e.target === calculatorContentWrapper) {
                    e.stopPropagation();
                    handleCalculationTrigger();
                }
        });

        resultOutput.addEventListener('dragstart', handleDragStart);
        resultOutput.addEventListener('dragover', handleDragOver);
        resultOutput.addEventListener('dragleave', handleDragLeave);
        resultOutput.addEventListener('drop', handleDrop);
    }

        function handleDragStart(e) {
            if (isTouchDevice || mode === 'g2w') return;
            const targetRow = e.target.closest('tr');
            if (!targetRow) return;
            
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', JSON.stringify({
                input: targetRow.dataset.inputValue,
                output: targetRow.dataset.outputValue,
                mode: mode
            }));
            
            setTimeout(() => targetRow.classList.add('dragging'), 0);
        }

        function handleDragOver(e) {
            if (isTouchDevice || mode === 'g2w') return;
            e.preventDefault();
            const targetRow = e.target.closest('tr');
            if (targetRow && !targetRow.classList.contains('dragging')) {
                targetRow.classList.add('drag-over');
            }
        }

        function handleDragLeave(e) {
            if (isTouchDevice || mode === 'g2w') return;
            const targetRow = e.target.closest('tr');
            if (targetRow) {
                targetRow.classList.remove('drag-over');
            }
        }

        function handleDrop(e) {
            if (isTouchDevice || mode === 'g2w') return;
            e.preventDefault();
            
            const draggedRow = resultOutput.querySelector('.dragging');
            if (draggedRow) draggedRow.classList.remove('dragging');
            
            const targetRow = e.target.closest('tr');
            if (targetRow) targetRow.classList.remove('drag-over');
            
            if (!targetRow || targetRow === draggedRow) return;
            
            try {
                const sourceData = JSON.parse(e.dataTransfer.getData('text/plain'));
                const targetData = {
                    input: targetRow.dataset.inputValue,
                    output: targetRow.dataset.outputValue,
                    mode: mode
                };
                
                if (sourceData.mode !== targetData.mode) return;
                
                const sourceInput = BigInt(sourceData.input);
                const targetInput = BigInt(targetData.input);
                const sourceOutput = BigInt(sourceData.output);
                const targetOutput = BigInt(targetData.output);

                const fromInput = sourceInput < targetInput ? sourceInput : targetInput;
                const toInput = sourceInput > targetInput ? sourceInput : targetInput;
                
                const inputDiff = toInput - fromInput;
                const outputDiff = (sourceOutput > targetOutput ? sourceOutput - targetOutput : targetOutput - sourceOutput);

                showRangeResultModal(fromInput, toInput, inputDiff, outputDiff, mode);
            } catch (err) {
                showNotification("Error during range calculation.");
            }
        }
        
        function showModal(overlay, onBeforeShow) {
            if (!overlay || overlay.classList.contains('visible')) return;
            hideFollowTooltip();
            if (onBeforeShow) onBeforeShow();
        
            const contentContainer = overlay.querySelector('.modal-content-container');
            
            gsap.to(overlay, { 
                autoAlpha: 1, 
                duration: CONFIG.animation.durationNormal * animSpeedMultiplier, 
                ease: "power1.inOut",
                onStart: () => {
                    overlay.classList.add('visible');
                }
            });
            
            gsap.fromTo(contentContainer,
                { autoAlpha: 0, scale: 0.95, y: -10 * animSpeedMultiplier },
                { 
                    autoAlpha: 1, 
                    scale: 1, 
                    y: 0,
                    duration: CONFIG.animation.durationLong * animSpeedMultiplier, 
                    ease: CONFIG.animation.easeBounce
                }
            );
        }

        function hideModal(overlay) {
                if (!overlay || !overlay.classList.contains('visible')) return;
                const content = overlay.querySelector('.modal-content-container');
                gsap.to(overlay, { 
                autoAlpha: 0, 
                duration: CONFIG.animation.durationNormal * animSpeedMultiplier,
                onComplete: () => {
                    overlay.classList.remove('visible');
                }
            });
            gsap.to(content, { autoAlpha: 0, scale: 0.95, duration: CONFIG.animation.durationShort * animSpeedMultiplier, ease: CONFIG.animation.easeIn });
        }
        
        function showRewardModal(valueStr, sourceElement = null) {
            try {
                currentCardsForModal = BigInt(valueStr);
                if (currentCardsForModal < 0n) { showNotification(t.calculator.negativeInfo); return; }
            } catch (e) { showNotification("Invalid card number."); return; }
            showModal(modalOverlayGlobal, () => {
                rankSelectGlobal.value = lastRank;
                updateRewardDetails(currentCardsForModal, lastRank);
            });
        }
        
        function showCardActionChoiceModal(valueStr, sourceElement = null) {
            showModal(cardActionChoiceModalOverlay, () => {
                const buttonsDiv = cardActionChoiceModalOverlay.querySelector('#cardActionChoiceButtons');
                if (buttonsDiv) {
                    buttonsDiv.innerHTML = '';
                    
                    const showFullBtn = document.createElement('button');
                    showFullBtn.id = 'cardActionShowFull';
                    showFullBtn.className = 'subtle-btn glow-on-hover';
                    showFullBtn.textContent = t.longNum.choiceShowFull;
                    showFullBtn.onclick = () => { hideModal(cardActionChoiceModalOverlay); showLongNumModal(valueStr); };
                    
                    const showRewardBtn = document.createElement('button');
                    showRewardBtn.id = 'cardActionShowReward';
                    showRewardBtn.className = 'subtle-btn glow-on-hover';
                    showRewardBtn.textContent = t.longNum.choiceShowReward;
                    showRewardBtn.onclick = () => { hideModal(cardActionChoiceModalOverlay); showRewardModal(valueStr); };

                    buttonsDiv.appendChild(showFullBtn);
                    buttonsDiv.appendChild(showRewardBtn);
                }
            });
        }
        
        function showLongNumModal(numStr, sourceElement = null) {
            showModal(longNumModalOverlay, () => {
                longNumberDisplay.textContent = formatBigIntWithCommas(numStr);
            });
        }

        function showProcessModal(inputStr, steps = [], sourceElement = null) {
            showModal(processDetailsModalOverlay, () => {
                const extraData = sourceElement?.closest('tr')?.dataset?.steps;
                updateProcessDetails(inputStr, steps, extraData);
            });
        }

        function showRangeResultModal(fromInput, toInput, inputDiff, outputDiff, calcMode) {
            showModal(rangeResultModalOverlay, () => {
                const isCardInput = calcMode === 'c2w';
                const inputUnit = isCardInput ? t.units.cards : t.units.waves;
                const outputUnit = isCardInput ? t.units.waves : t.units.cards;
                
                const inputDiffHTML = isCardInput
                    ? createCardSpan(inputDiff.toString(), t.units.cardSingle, true)
                    : `${formatBigIntWithCommas(inputDiff)} ${t.units.waveSingle}`;

                const outputDiffHTML = isCardInput 
                    ? `${formatBigIntWithCommas(outputDiff)} ${t.units.waveSingle}`
                    : createCardSpan(outputDiff.toString(), t.units.cardSingle, true);

                let html = `
                    <dl>
                        <dt>${t.range.from}</dt>
                        <dd>${formatBigIntWithCommas(fromInput)} ${isCardInput ? t.units.cardSingle : t.units.waveSingle}</dd>
                        <dt>${t.range.to}</dt>
                        <dd>${formatBigIntWithCommas(toInput)} ${isCardInput ? t.units.cardSingle : t.units.waveSingle}</dd>
                    </dl>
                    <hr>
                    <dl>
                        <dt>${inputUnit} ${t.range.difference}</dt>
                        <dd class="highlight">${inputDiffHTML}</dd>
                        <dt>${outputUnit} ${t.range.difference}</dt>
                        <dd class="highlight">${outputDiffHTML}</dd>
                    </dl>
                `;
                rangeResultContent.innerHTML = html;
                attachResultInteractionListeners('#rangeResultContent');
            });
        }

        function updateRewardDetails(cardsBigInt, rank) {
            if (!rewardDetailsGlobal || !t) return;
            try {
                if (cardsBigInt < 0n) {
                    rewardDetailsGlobal.innerHTML = `<p style='color: var(--error-color);'>${t.calculator.negativeInfo}</p>`;
                    return;
                }
                const boxes = cardsBigInt / CONFIG.cardsPerBox;
                const reward = REWARDS[rank] || REWARDS[20];
                if (!reward) {
                    rewardDetailsGlobal.innerHTML = "<p style='color: var(--error-color);'>Error: Missing rank data.</p>";
                    return;
                }
                const common = BigInt(reward.c) * boxes;
                const rare = BigInt(reward.r) * boxes;
                const hero = BigInt(reward.h) * boxes;
                const gold = BigInt(reward.g) * boxes;
                const diamonds = BigInt(reward.d) * boxes;
                const legendaryExpected = (reward.l * Number(boxes));
                const format = formatBigIntWithCommas;
                const rewardText = `
                    <dl><dt>${t.reward.boxes}</dt><dd>${format(boxes)}</dd></dl> <hr>
                    <dl>
                        <dt>${t.reward.commonDice}</dt><dd>${format(common)}</dd>
                        <dt>${t.reward.rareDice}</dt><dd>${format(rare)}</dd>
                        <dt>${t.reward.heroDice}</dt><dd>${format(hero)}</dd>
                        <dt>${t.reward.legendaryDice}</dt><dd>${legendaryExpected.toFixed(2)} ${t.reward.expected}</dd>
                    </dl> <hr>
                    <dl>
                        <dt>${t.reward.gold}</dt><dd>${format(gold)}</dd>
                        <dt>${t.reward.diamonds}</dt><dd>${format(diamonds)}</dd>
                    </dl>`;
                rewardDetailsGlobal.innerHTML = rewardText;
            } catch(e) {
                rewardDetailsGlobal.innerHTML = `<p style='color: var(--error-color);'>Calculation Error: ${e.message}</p>`;
            }
        }
        
        function attachModalListeners() {
            rankSelectGlobal?.addEventListener("change", function() {
                lastRank = this.value;
                saveLS(LS_KEYS.lastRank, lastRank);
                if (currentCardsForModal >= 0n) {
                    updateRewardDetails(currentCardsForModal, this.value);
                }
            });
            longNumModal.querySelector('.copy-icon').addEventListener('click', (e) => {
                    e.stopPropagation();
                    const fullNumber = longNumberDisplay.textContent;
                    navigator.clipboard.writeText(fullNumber.replace(/,/g, '')).then(() => showNotification(t?.copied || 'Copied')).catch(err => ('Failed to copy long number:', err));
                    hideModal(longNumModalOverlay);
            });
            modalOverlays.forEach(overlay => {
                const closeBtn = overlay.querySelector('.modal-close-btn');
                if (closeBtn) closeBtn.addEventListener('click', () => hideModal(overlay));
            });
        }
        
        function updateSideNavActiveState() {
            sideNavBar.querySelectorAll('.nav-item').forEach(item => {
                const target = item.dataset.target;
                const isActive = (target === 'calculator' && !activeSubView) || (activeSubView && target + 'Panel' === activeSubView);
                item.classList.toggle('active', isActive);
            });
        }

        function updateRewardRankOptions(selectElement) {
                if (!selectElement || !t || !t.units || !t.units.rank) return;
                const currentVal = selectElement.value || lastRank;
                selectElement.innerHTML = "";
                for (let i = 1; i <= 19; i++) {
                    const option = document.createElement("option");
                    option.value = i;
                    option.textContent = (currentLang === "en" ? `Rank ${i}` : `${i}${t.units.rank}`);
                    selectElement.appendChild(option);
                }
                const option20 = document.createElement("option");
                option20.value = "20";
                option20.textContent = (currentLang === "en" ? "Rank 20+" : `20+${t.units.rank}`);
                selectElement.appendChild(option20);
                selectElement.value = currentVal;
        }

        function attachResultInteractionListeners(containerSelector = 'body') {
            const container = document.querySelector(containerSelector); if (!container) return;
            container.removeEventListener('mouseover', handleResultMouseOver);
            container.removeEventListener('mouseout', handleResultMouseOut);
            container.removeEventListener('click', handleResultClick);
            container.addEventListener('mouseover', handleResultMouseOver);
            container.addEventListener('mouseout', handleResultMouseOut);
            container.addEventListener('click', handleResultClick);
        }

        function handleResultMouseOver(e) {
            if (isTouchDevice || isMultiCopyMode) return;
            const cardSpan = e.target.closest('.card-container[data-reward-clickable="true"]');
            const longNumSpan = e.target.closest('.long-number');

            if (cardSpan && cardSpan.dataset.value && cardTooltip) {
                try {
                    const cards = cardSpan.dataset.value;
                    const cardsBigInt = BigInt(cards);
                    const boxes = cardsBigInt / CONFIG.cardsPerBox;
                    const content = `<dl><dt>${t.units.cardSingle}</dt><dd>${formatBigIntWithCommas(cards)}</dd><dt>${t.reward.boxes}</dt><dd>${formatBigIntWithCommas(boxes)}</dd></dl><div class="hint">${t.reward.clickHint}</div>`;
                    showFollowTooltip(cardSpan, cardTooltip, content);
                } catch (err) { }
            } else if (longNumSpan && longNumSpan.dataset.fullNumber) {
                if (cardTooltip) {
                    const content = `<dl><dt>${t.longNum.fullNumberLabel}</dt><dd style="font-family:monospace;">${formatBigIntWithCommas(longNumSpan.dataset.fullNumber)}</dd></dl>`;
                    showFollowTooltip(longNumSpan, cardTooltip, content);
                }
            }
        }
        function handleResultMouseOut(e) {
            if (isTouchDevice || isMultiCopyMode) return;
            if (activeTooltipTarget) {
                const related = e.relatedTarget;
                const isLeavingTarget = !activeTooltipTarget.contains(related);
                const isLeavingTooltip = !activeTooltipElement || !activeTooltipElement.contains(related);
                if (isLeavingTarget && isLeavingTooltip) {
                    hideFollowTooltip();
                }
            }
        }
        function handleResultClick(e) {
            if (isMultiCopyMode) return;
            const cardContainer = e.target.closest('.card-container[data-reward-clickable="true"]');
            const longNumSpan = e.target.closest('.long-number');
            const sourceElement = cardContainer || longNumSpan;

            if (cardContainer && cardContainer.dataset.value) {
                e.stopPropagation();
                const valueStr = cardContainer.dataset.value;
                if (longNumSpan) {
                    showCardActionChoiceModal(valueStr, sourceElement);
                } else {
                    showRewardModal(valueStr, sourceElement);
                }
                return;
            } else if(longNumSpan && longNumSpan.dataset.fullNumber) {
                e.stopPropagation();
                showLongNumModal(longNumSpan.dataset.fullNumber, sourceElement);
                return;
            }


            const copyItemBtn = e.target.closest('.copy-item-btn');
            const processItemBtn = e.target.closest('.process-item-btn');
            if (copyItemBtn) {
                e.stopPropagation();
                const clickedRow = copyItemBtn.closest('tr');
                if (!clickedRow) return;
                const inputVal = clickedRow.dataset.inputValue;
                const outputVal = clickedRow.dataset.outputValue;
                const textToCopy = `${formatBigIntWithCommas(inputVal)} ${mode === 'w2c' ? t.units.waveSingle : t.units.cardSingle} → ${formatBigIntWithCommas(outputVal)} ${mode === 'w2c' ? t.units.cardSingle : t.units.waveSingle}`;
                navigator.clipboard.writeText(textToCopy).then(() => showNotification(t?.copied || 'Copied')).catch(err => ('Failed to copy item:', err));
            } else if (processItemBtn) {
                e.stopPropagation();
                const clickedRow = processItemBtn.closest('tr');
                if (!clickedRow) return;
                const inputVal = clickedRow.dataset.inputValue;
                const stepsData = clickedRow.dataset.steps ? JSON.parse(clickedRow.dataset.steps) : [];
                showProcessModal(inputVal, stepsData, processItemBtn);
            }
        }
        
        function renderHistoryPaginationPanel() {
            if (!historyPaginationPanel) return;
            historyPaginationPanel.innerHTML = "";
            const totalPages = Math.ceil(historyData.length / CONFIG.historyRecordsPerPage);
            if (totalPages <= 1) return;
            const createButton = (text, iconSVG, pageIndex, isDisabled = false) => {
                const button = document.createElement("button");
                button.classList.add('subtle-btn', 'glow-on-hover');
                button.innerHTML = `${iconSVG}<span class="text">${text}</span>`;
                button.disabled = isDisabled;
                if(!isDisabled) button.onclick = () => { currentHistoryPage = pageIndex; renderHistoryPanel(); };
                return button;
            };
            const prevSVG = '<svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg>';
            const nextSVG = '<svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg>';
            historyPaginationPanel.appendChild(createButton(t.pagination.prev, prevSVG, currentHistoryPage - 1, currentHistoryPage === 0));
            const pageInfo = document.createElement("span");
            pageInfo.textContent = t.pagination.pageInfo.replace("{current}", currentHistoryPage + 1).replace("{total}", totalPages);
            pageInfo.style.margin = '0 0.8rem';
            pageInfo.style.fontSize = '0.9em';
            pageInfo.style.color = 'var(--text-muted-color)';
            historyPaginationPanel.appendChild(pageInfo);
            historyPaginationPanel.appendChild(createButton(t.pagination.next, nextSVG, currentHistoryPage + 1, currentHistoryPage >= totalPages - 1));
        }
        
        function attachChartControlListeners() {
            if (!myChart) return;
            const zoomSlider = document.getElementById('chartZoomSlider');
            const panThumb = document.getElementById('pan-thumb');
            const track = document.getElementById('pan-track');
            const maxZoom = CONFIG.chart.maxWaves / CONFIG.chart.minZoomRange;
            zoomSlider.max = maxZoom;
            
            chartPanelCanvas.addEventListener('wheel', (event) => {
                if (!myChart) return;
                event.preventDefault();
                
                const zoomFactor = event.deltaY < 0 ? 0.97 : 1.03;
                const { min: currentXMin, max: currentXMax } = myChart.options.scales.x;
                let newRange = (currentXMax - currentXMin) * zoomFactor;

                if (newRange < CONFIG.chart.minZoomRange) {
                    newRange = CONFIG.chart.minZoomRange;
                }
                if (newRange > CONFIG.chart.maxWaves) {
                    newRange = CONFIG.chart.maxWaves;
                }
                
                myChart.options.scales.x.min = 0;
                myChart.options.scales.x.max = newRange;
                
                handleChartUpdate({chart: myChart});
            }, { passive: false });


            zoomSlider.oninput = () => {
                if (!myChart) return;
                const zoomLevel = parseFloat(zoomSlider.value);
                const newXRange = CONFIG.chart.maxWaves / zoomLevel;
                
                myChart.options.scales.x.min = 0;
                myChart.options.scales.x.max = Math.max(CONFIG.chart.minZoomRange, newXRange);
                
                handleChartUpdate({chart: myChart});
            };
            
            let isDragging = false;
            let dragStartX = 0;
            let initialThumbX = 0;

            const startDrag = (e) => {
                isDragging = true;
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                dragStartX = clientX;
                initialThumbX = panThumb.getBoundingClientRect().left - track.getBoundingClientRect().left;
                panThumb.style.cursor = 'grabbing';
                body.style.cursor = 'grabbing';
                document.addEventListener('mousemove', moveDrag);
                document.addEventListener('mouseup', endDrag);
                document.addEventListener('touchmove', moveDrag, { passive: false });
                document.addEventListener('touchend', endDrag);
                e.preventDefault();
            };

            const moveDrag = (e) => {
                if (!isDragging || !myChart) return;
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const dx = clientX - dragStartX;
                const trackWidth = track.clientWidth;
                const thumbWidth = panThumb.offsetWidth;
                const newThumbX = Math.max(0, Math.min(trackWidth - thumbWidth, initialThumbX + dx));
                const panRatio = newThumbX / (trackWidth - thumbWidth);
                
                const totalRange = CONFIG.chart.maxWaves;
                const visibleRange = myChart.scales.x.max - myChart.scales.x.min;
                const maxMin = totalRange - visibleRange;
                
                const newXMin = panRatio * maxMin;

                myChart.options.scales.x.min = Math.max(0, newXMin);
                myChart.options.scales.x.max = Math.min(CONFIG.chart.maxWaves, newXMin + visibleRange);
                
                handleChartUpdate({chart: myChart});
                e.preventDefault();
            };

            const endDrag = () => {
                if (isDragging) {
                    isDragging = false;
                    panThumb.style.cursor = 'grab';
                    body.style.cursor = '';
                    document.removeEventListener('mousemove', moveDrag);
                    document.removeEventListener('mouseup', endDrag);
                    document.removeEventListener('touchmove', moveDrag);
                    document.removeEventListener('touchend', endDrag);
                }
            };

            panThumb.addEventListener('mousedown', startDrag);
            panThumb.addEventListener('touchstart', startDrag, { passive: false });

        }

        function updatePanRuler(chart) {
            const rulerSvg = document.getElementById('pan-ruler-svg');
            const track = document.getElementById('pan-track');
            if (!rulerSvg || !track) return;

            const { min: viewMin, max: viewMax } = chart.scales.x;
            const viewRange = viewMax - viewMin;
            const trackWidth = track.clientWidth;
            
            rulerSvg.innerHTML = ''; 
            
            const step = getPrettyTick(viewRange / 10);
            const startTick = Math.ceil(viewMin / step) * step;

            for (let i = startTick; i <= viewMax; i += step) {
                if (i < viewMin) continue;

                const posPercent = (i - viewMin) / viewRange;
                const posPx = posPercent * trackWidth;
                
                const centerDist = Math.abs(posPx - trackWidth / 2);
                const focusFactor = Math.cos((centerDist / (trackWidth / 2)) * (Math.PI / 2));
                
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute('x1', posPx);
                line.setAttribute('y1', 0);
                line.setAttribute('x2', posPx);
                line.setAttribute('y2', 5 + focusFactor * 10);
                rulerSvg.appendChild(line);

                if (focusFactor > 0.5) { 
                    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    text.setAttribute('x', posPx);
                    text.setAttribute('y', 22);
                    text.textContent = formatBigIntWithCommas(BigInt(Math.round(i)));
                    rulerSvg.appendChild(text);
                }
            }
        }


        function setupChartHover() {
            if (!chartPanelCanvas || !myChart) return;
            const canvas = chartPanelCanvas;
            canvas.removeEventListener('mousemove', handleChartMouseMove);
            canvas.removeEventListener('mouseout', handleChartMouseOut);
            canvas.removeEventListener('mousedown', handleChartMouseDown);
            document.removeEventListener('mouseup', handleChartMouseUp);
            canvas.addEventListener('mousemove', handleChartMouseMove);
            canvas.addEventListener('mouseout', handleChartMouseOut);
            canvas.addEventListener('mousedown', handleChartMouseDown);
            document.addEventListener('mouseup', handleChartMouseUp);
        }

        function handleChartMouseDown(event){
            if(chartPanelCanvas?.parentElement) chartPanelCanvas.parentElement.classList.add('chart-panning');
        }

        function handleChartMouseUp(event){
            if (!chartPanelCanvas.contains(event.target)) {
                if (typeof cursorRestoreCursorStateAfterSelection === 'function') {
                    setTimeout(cursorRestoreCursorStateAfterSelection, 10);
                }
            }
            if(chartPanelCanvas?.parentElement) chartPanelCanvas.parentElement.classList.remove('chart-panning');
                if(myChart) {
                updateChartSlidersState(myChart);
            }
        }

        function handleChartMouseMove(event) {
            if (!myChart?.options?.plugins?.annotation || !t) return;
            
            cancelAnimationFrame(chartUpdateRafId);
            chartUpdateRafId = requestAnimationFrame(() => {
                const rect = event.target.getBoundingClientRect();
                const xPixel = event.clientX - rect.left;
                const yPixel = event.clientY - rect.top;
                try {
                    let waveValueRaw = myChart.scales.x.getValueForPixel(xPixel);
                    waveValueRaw = Math.max(myChart.scales.x.min ?? 0, Math.min(waveValueRaw, myChart.scales.x.max ?? CONFIG.chart.maxWaves));
                    if (waveValueRaw >= 0) {
                        const waveForCalc = Math.round(waveValueRaw);
                        const cardValueBigInt = wavesToCards(BigInt(waveForCalc));
                        let cardValueNumForPlot = Number(cardValueBigInt);
                        cardValueNumForPlot = Math.max(myChart.scales.y.min ?? 0, Math.min(cardValueNumForPlot, myChart.scales.y.max ?? CONFIG.chart.plotLimit));
                        updateCrosshairAnnotations(waveForCalc, cardValueNumForPlot, cardValueBigInt, xPixel, yPixel, rect);
                    } else {
                        updateCrosshairAnnotations(null, null, null);
                    }
                } catch (e) {
                    updateCrosshairAnnotations(null, null, null);
                }
            });
        }

        function handleChartMouseOut(event) {
            const relatedTarget = event.relatedTarget;
            const chartContainer = chartPanelCanvas.parentElement;
            if (!relatedTarget || (!chartContainer.contains(relatedTarget) && !relatedTarget.closest('.chart-zoom-buttons, #chart-pan-container'))) {
                cancelAnimationFrame(chartUpdateRafId);
                updateCrosshairAnnotations(null, null, null);
            }
        }

        function updateCrosshairAnnotations(x, yNumForPlot, cardBigInt, xPixel = null, yPixel = null, chartRect = null) {
            if (!myChart?.options?.plugins?.annotation) return;
            const annotations = myChart.options.plugins.annotation.annotations;
            let changed = false;
            if (x !== null && yNumForPlot !== null && cardBigInt !== null) {
                if (annotations['crosshairY'].value !== x || !annotations['crosshairY'].display) {
                    annotations['crosshairY'].value = x;
                    annotations['crosshairY'].display = true;
                    changed = true;
                }
                if (annotations['crosshairX'].value !== yNumForPlot || !annotations['crosshairX'].display) {
                    annotations['crosshairX'].value = yNumForPlot;
                    annotations['crosshairX'].display = true;
                    changed = true;
                }
                const displayWave = Math.round(x);
                const labelContent = `${displayWave} ${t.units.waveSingle}, ${formatBigIntWithCommas(cardBigInt)} ${t.units.cardSingle}`;
                let yAdjust = -15, xAdjust = 15, calloutPos = 'left';
                if(yPixel !== null && chartRect !== null) {
                    if (yPixel < chartRect.height * 0.2) yAdjust = 25;
                }
                if(xPixel !== null && chartRect !== null) {
                    if (xPixel > chartRect.width * 0.8) {
                        xAdjust = -15;
                        calloutPos = 'right';
                    }
                }
                if (annotations['crosshairLabel'].content !== labelContent || !annotations['crosshairLabel'].display || annotations['crosshairLabel'].yAdjust !== yAdjust || annotations['crosshairLabel'].xAdjust !== xAdjust) {
                    annotations['crosshairLabel'].xValue = x;
                    annotations['crosshairLabel'].yValue = yNumForPlot;
                    annotations['crosshairLabel'].content = labelContent;
                    annotations['crosshairLabel'].yAdjust = yAdjust;
                    annotations['crosshairLabel'].xAdjust = xAdjust;
                    annotations['crosshairLabel'].callout.position = calloutPos;
                    annotations['crosshairLabel'].display = true;
                    changed = true;
                }
            } else {
                if (annotations['crosshairY']?.display) { annotations['crosshairY'].display = false; changed = true; }
                if (annotations['crosshairX']?.display) { annotations['crosshairX'].display = false; changed = true; }
                if (annotations['crosshairLabel']?.display) { annotations['crosshairLabel'].display = false; changed = true; }
            }
            
            if (changed) {
                if (myChart && myChart.ctx && myChart.canvas.offsetParent) {
                    try { myChart.update('none'); } catch (e) {}
                }
            }
        }

        function createTooltips() {
            if (isTouchDevice || body.classList.contains('native-cursor')) return;
            if (!cardTooltip) {
                cardTooltip = document.createElement('div');
                cardTooltip.className = 'tooltip';
                cardTooltip.id = 'card-tooltip';
                cardTooltip.innerHTML = '<div class="tooltip-content"></div>';
                cardTooltip.style.pointerEvents = 'none';
                document.body.appendChild(cardTooltip);
            }
        }
        function updateTooltipPosition(event, tooltipElement) {
            if (!tooltipElement || !tooltipElement.classList.contains('visible')) return;
            const mouseX = event?.clientX ?? cursorLastClientX;
            const mouseY = event?.clientY ?? cursorLastClientY;
            const tooltipRect = tooltipElement.getBoundingClientRect();
            const offsetX = 15;
            const offsetY = 15;
            let left = mouseX + offsetX;
            let top = mouseY + offsetY;
            if (left + tooltipRect.width > window.innerWidth - 10) left = mouseX - tooltipRect.width - offsetX;
            if (top + tooltipRect.height > window.innerHeight - 10) top = mouseY - tooltipRect.height - offsetY;
            if (left < 10) left = 10;
            if (top < 10) top = 10;
            tooltipElement.style.left = `${left}px`;
            tooltipElement.style.top = `${top}px`;
        }
        const tooltipMouseMoveHandler = (e) => {
            cursorLastClientX = e.clientX;
            cursorLastClientY = e.clientY;
            if (activeTooltipElement) updateTooltipPosition(e, activeTooltipElement);
        };
        function showFollowTooltip(element, tooltipEl, contentHTML) {
            if (isTouchDevice || !tooltipEl || !element) return;
            if (activeTooltipElement === tooltipEl && activeTooltipTarget === element) return;
            hideFollowTooltip();
            const contentContainer = tooltipEl.querySelector('.tooltip-content');
            if (contentContainer) contentContainer.innerHTML = contentHTML;
            tooltipEl.style.opacity = 0;
            tooltipEl.classList.add('visible');
            activeTooltipElement = tooltipEl;
            activeTooltipTarget = element;
            const initialEvent = { clientX: cursorLastClientX, clientY: cursorLastClientY };
            updateTooltipPosition(initialEvent, tooltipEl);
            gsap.to(tooltipEl, { opacity: 1, duration: 0.1 * animSpeedMultiplier, delay: 0.02 });
            document.addEventListener('mousemove', tooltipMouseMoveHandler, { passive: true });
        }
        function hideFollowTooltip() {
                if (activeTooltipElement) {
                document.removeEventListener('mousemove', tooltipMouseMoveHandler);
                const elToHide = activeTooltipElement;
                activeTooltipElement = null;
                activeTooltipTarget = null;
                gsap.to(elToHide, {
                    opacity: 0, duration: 0.08 * animSpeedMultiplier,
                    onComplete: () => { if (!activeTooltipElement) elToHide.classList.remove('visible'); }
                });
                }
        }

        let dustCtx, dustW, dustH, dustParticles = [], dustAnimId = null;
        class DustParticle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * dustW;
                this.y = Math.random() * dustH;
                this.size = Math.random() * 2.2 + 0.8;
                this.speedX = (Math.random() - 0.5) * 0.05;
                this.speedY = -(Math.random() * 0.1 + 0.02);
                this.baseAlpha = Math.random() * 0.15 + 0.1;
                this.alpha = this.baseAlpha;
                this.alphaChange = (Math.random() * 0.0015) + 0.0003;
                this.life = 0;
                this.maxLife = Math.random() * 600 + 400;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.alpha += this.alphaChange;
                if (this.alpha > this.baseAlpha + 0.08 || this.alpha < this.baseAlpha - 0.04) {
                    this.alphaChange *= -1;
                    this.alpha = Math.max(0.02, Math.min(0.4, this.alpha));
                }
                
                if (this.y < -this.size) {
                    this.reset(); 
                    this.x = Math.random() * dustW; 
                    this.y = dustH + this.size; 
                    this.alpha = 0; 
                } else if (this.alpha < this.baseAlpha && this.y < dustH) {
                    this.alpha += 0.002;
                }
            }
            draw(ctx, color, shadowColor) {
                if (this.alpha <= 0.02) return;
                const glowAlpha = Math.max(0, (this.alpha - 0.1) * 0.8);
                if (glowAlpha > 0) {
                    ctx.shadowColor = shadowColor.replace(/[\d\.]+\)$/g, `${glowAlpha})`);
                    ctx.shadowBlur = 2 + this.size * 1.2;
                } else {
                    ctx.shadowBlur = 0;
                }
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
                ctx.fillStyle = color.replace(/[\d\.]+\)$/g, `${this.alpha})`);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
        function resizeDustCanvas() {
            if (!dustCanvas) return;
            dustW = dustCanvas.width = window.innerWidth;
            dustH = dustCanvas.height = window.innerHeight;
            initDustParticles();
        }
        function initDustParticles() {
            if (!dustW || !dustH) return;
            let count = window.innerWidth > 768 ? CONFIG.dust.count : CONFIG.dust.countMobile;
            dustParticles = [];
            for (let i = 0; i < count; i++) { dustParticles.push(new DustParticle()); }
        }
        function animateDust() {
            if (!dustCtx || !dustW || !dustH || !dustParticles.length) {
                dustAnimId = requestAnimationFrame(animateDust);
                return;
            };
            dustCtx.clearRect(0, 0, dustW, dustH);
            const dustColor = getComputedStyle(body).getPropertyValue('--dust-color').trim() || 'rgba(255,255,255,0.4)';
            const shadowColor = getComputedStyle(body).getPropertyValue('--dust-shadow-color').trim() || 'rgba(255,255,255,0.5)';
            dustParticles.forEach(p => { p.update(); p.draw(dustCtx, dustColor, shadowColor); });
            dustAnimId = requestAnimationFrame(animateDust);
        }
        function updateDustColor(){}
        function initDustBackground() {
            if (!dustCanvas) return;
            dustCtx = dustCanvas.getContext('2d');
            if (!dustCtx) return;
            resizeDustCanvas();
            window.addEventListener('resize', debounce(resizeDustCanvas, 300));
            if (dustAnimId) cancelAnimationFrame(dustAnimId);
            animateDust();
        }
    })();
});