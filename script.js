class Calculator {
    constructor(previousOperandElement, currentOperandElement) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.clear();
    }

    clear() {
        this.expression = '';
        this.currentValue = '0';
        this.isError = false;
        this.shouldResetScreen = false;
        this.updateDisplay();
    }

    delete() {
        if (this.isError) {
            this.clear();
            return;
        }
        if (this.expression.length > 0) {
            this.expression = this.expression.slice(0, -1);
            this.updateDisplay();
        }
    }

    appendSymbol(symbol) {
        if (this.isError) this.clear();
        if (this.shouldResetScreen && !isNaN(symbol)) {
            this.expression = '';
            this.shouldResetScreen = false;
        } else {
            this.shouldResetScreen = false;
        }
        this.expression += symbol;
        this.updateDisplay();
    }

    compute() {
        if (this.isError) return;
        if (this.expression.trim() === '') return;

        try {
            // Replace symbols for evaluation
            let parseExpr = this.expression
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/−/g, '-')
                .replace(/π/g, 'Math.PI')
                .replace(/e/g, 'Math.E')
                .replace(/sin⁻¹\(/g, 'Math.asin(')
                .replace(/cos⁻¹\(/g, 'Math.acos(')
                .replace(/tan⁻¹\(/g, 'Math.atan(')
                .replace(/sin\(/g, 'Math.sin(')
                .replace(/cos\(/g, 'Math.cos(')
                .replace(/tan\(/g, 'Math.tan(')
                .replace(/lg\(/g, 'Math.log10(')
                .replace(/ln\(/g, 'Math.log(')
                .replace(/√x\(/g, 'Math.sqrt(');
            
            // Handle factorial (basic implementation using regex for simple numbers)
            parseExpr = parseExpr.replace(/(\d+)!/g, function(match, num) {
                let r = 1;
                for(let i = 1; i <= parseInt(num); i++) r *= i;
                return r;
            });

            // Handle power
            parseExpr = parseExpr.replace(/\^/g, '**');

            // Handle percent
            parseExpr = parseExpr.replace(/%/g, '/100');
            
            // Use Function for safe evaluation instead of eval() directly
            const result = new Function('return ' + parseExpr)();
            
            if (result === Infinity || isNaN(result)) {
                throw new Error("Math Error");
            }

            // Fix floating point precision
            const cleanResult = Math.round(result * 10000000000) / 10000000000;
            
            this.currentValue = cleanResult.toString();
            
            // Log to history
            addHistoryEntry(this.expression, this.currentValue);
            
            this.shouldResetScreen = true;
            this.isError = false;
        } catch (error) {
            this.currentValue = 'Error';
            this.isError = true;
        }
        this.updateDisplay();
    }

    liveCompute() {
        if (this.expression.trim() === '') return '';
        try {
            let parseExpr = this.expression
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/−/g, '-')
                .replace(/π/g, 'Math.PI')
                .replace(/e/g, 'Math.E')
                .replace(/sin⁻¹\(/g, 'Math.asin(')
                .replace(/cos⁻¹\(/g, 'Math.acos(')
                .replace(/tan⁻¹\(/g, 'Math.atan(')
                .replace(/sin\(/g, 'Math.sin(')
                .replace(/cos\(/g, 'Math.cos(')
                .replace(/tan\(/g, 'Math.tan(')
                .replace(/lg\(/g, 'Math.log10(')
                .replace(/ln\(/g, 'Math.log(')
                .replace(/√x\(/g, 'Math.sqrt(');
            
            parseExpr = parseExpr.replace(/(\d+)!/g, function(match, num) {
                let r = 1;
                for(let i = 1; i <= parseInt(num); i++) r *= i;
                return r;
            });
            parseExpr = parseExpr.replace(/\^/g, '**');
            parseExpr = parseExpr.replace(/%/g, '/100');
            
            const result = new Function('return ' + parseExpr)();
            if (result === Infinity || isNaN(result) || result === undefined || typeof result !== 'number') return '';
            
            const cleanResult = Math.round(result * 10000000000) / 10000000000;
            return cleanResult.toString();
        } catch (error) {
            return '';
        }
    }

    updateDisplay() {
        this.previousOperandElement.innerText = this.expression;
        
        let displayValue = this.currentValue;
        if (!this.shouldResetScreen && !this.isError && this.expression !== '') {
            const liveResult = this.liveCompute();
            if (liveResult !== '') {
                displayValue = liveResult;
            }
        } else if (this.expression === '' && !this.isError) {
            displayValue = '0';
        }
        
        this.currentOperandElement.innerText = displayValue;

        const displayEl = document.querySelector('.display');
        if (displayEl) {
            if (this.shouldResetScreen || this.expression === '') {
                displayEl.classList.remove('is-typing');
            } else {
                displayEl.classList.add('is-typing');
            }
        }
    }
}

const previousOperandElement = document.getElementById('previous-operand');
const currentOperandElement = document.getElementById('current-operand');
const calculator = new Calculator(previousOperandElement, currentOperandElement);



function addPulseEffect(button) {
    if (!button) return;
    button.classList.add('pulse');
    setTimeout(() => {
        button.classList.remove('pulse');
    }, 300);
}

// Map buttons to symbols
const buttonMapping = {
    'add': '+',
    'subtract': '−',
    'multiply': '×',
    'divide': '÷',
    'open-paren': '(',
    'close-paren': ')',
    'pi': 'π',
    'e': 'e',
    'percent': '%',
    'power': '^',
    'sqrt': '√x(',
    'ln': 'ln(',
    'log': 'lg(',
    'sin': 'sin(',
    'cos': 'cos(',
    'tan': 'tan(',
    'asin': 'sin⁻¹(',
    'acos': 'cos⁻¹(',
    'atan': 'tan⁻¹(',
    'factorial': '!',
    'inverse': '1/('
};

document.querySelectorAll('#calculator-view .btn-number').forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendSymbol(button.dataset.number);
        addPulseEffect(button);
    });
});

document.querySelectorAll('#calculator-view .func-btn, #calculator-view .btn-operator').forEach(button => {
    button.addEventListener('click', () => {
        const action = button.dataset.action;
        if (buttonMapping[action]) {
            calculator.appendSymbol(buttonMapping[action]);
        }
        addPulseEffect(button);
    });
});

document.getElementById('equals').addEventListener('click', () => {
    calculator.compute();
    addPulseEffect(document.getElementById('equals'));
});

document.getElementById('clear').addEventListener('click', () => {
    calculator.clear();
    addPulseEffect(document.getElementById('clear'));
});

document.getElementById('display-clear').addEventListener('click', () => {
    calculator.delete();
    addPulseEffect(document.getElementById('display-clear'));
});

document.getElementById('delete').addEventListener('click', () => {
    calculator.delete();
    addPulseEffect(document.getElementById('delete'));
});

// Keyboard Support
document.addEventListener('keydown', (e) => {
    // Prevent triggering calculator shortcuts if typing in an input field
    if (document.activeElement && document.activeElement.tagName === 'INPUT') {
        return;
    }
    // If programmer view is active, allow hex keys A-F
    const progView = document.getElementById('programmer-view');
    if (progView && progView.classList.contains('active')) {
        if (e.key.length === 1 && /[0-9a-fA-F]/.test(e.key)) {
            const btn = document.querySelector(`.prog-num-btn[data-number="${e.key.toUpperCase()}"], .hex-btn[data-number="${e.key.toUpperCase()}"]`);
            if (btn && !btn.disabled) {
                btn.click();
                addPulseEffect(btn);
            }
        }
        // Math Operators for Programmer Mode
        if (/[\+\-\*\/]/.test(e.key)) {
            let actionMap = { '+': 'add', '-': 'subtract', '*': 'multiply', '/': 'divide' };
            const btn = document.querySelector(`.btn-prog-math[data-action="${actionMap[e.key]}"]`);
            if (btn) {
                btn.click();
                addPulseEffect(btn);
            }
        }
        if (e.key === 'Backspace') {
            const delBtn = document.getElementById('prog-delete');
            if (delBtn) {
                delBtn.click();
                addPulseEffect(delBtn);
            }
        }
        if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            const eqBtn = document.getElementById('prog-equals');
            if (eqBtn) {
                eqBtn.click();
                addPulseEffect(eqBtn);
            }
        }
        return;
    }

    // Only process calculator keys if calculator view is active
    const calcView = document.getElementById('calculator-view');
    if (calcView && !calcView.classList.contains('active')) {
        return;
    }

    if (/[0-9\.\+\-\*\/\(\)\^%]/.test(e.key)) {
        let key = e.key;
        if (key === '*') key = '×';
        if (key === '-') key = '−';
        if (key === '/') key = '÷';
        calculator.appendSymbol(key);
    }
    if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculator.compute();
        addPulseEffect(document.getElementById('equals'));
    }
    if (e.key === 'Backspace') {
        calculator.delete();
        addPulseEffect(document.getElementById('delete'));
    }
    if (e.key === 'Escape') {
        calculator.clear();
        addPulseEffect(document.getElementById('clear'));
    }
});

// ---------------------------
// THEME SWITCHING LOGIC
// ---------------------------
const themeSelector = document.getElementById('theme-selector');
if (themeSelector) {
    // Load saved theme on startup
    const savedTheme = localStorage.getItem('smartCalcTheme');
    if (savedTheme) {
        themeSelector.value = savedTheme;
        document.body.className = '';
        if (savedTheme !== 'dark') {
            document.body.classList.add(`${savedTheme}-mode`);
        }
    }
    
    // Set initial text for status panel based on loaded theme
    window.addEventListener('DOMContentLoaded', () => {
        const statusTheme = document.getElementById('status-theme');
        if (statusTheme && themeSelector.selectedIndex >= 0) {
            statusTheme.innerText = themeSelector.options[themeSelector.selectedIndex].text;
        }
    });

    themeSelector.addEventListener('change', (e) => {
        const theme = e.target.value;
        localStorage.setItem('smartCalcTheme', theme);
        document.body.className = ''; // clear all themes
        if (theme !== 'dark') {
            document.body.classList.add(`${theme}-mode`);
        }
        const themeText = e.target.options[e.target.selectedIndex].text;
        const statusTheme = document.getElementById('status-theme');
        if (statusTheme) statusTheme.innerText = themeText;
        showToast(`Theme changed to ${themeText}`, '🎨');
    });
}

// ---------------------------
// TOAST NOTIFICATIONS
// ---------------------------
function showToast(message, icon = 'ℹ️') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">${icon}</span> <span>${message}</span>`;
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode === container) {
                container.removeChild(toast);
            }
        }, 400); // Wait for transition
    }, 3000);
}

// ---------------------------
// VOICE CALCULATOR (Web Speech API)
// ---------------------------
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let activeVoiceTarget = null; // 'calc' or 'conv'

    const voiceCalcBtn = document.getElementById('voice-calc-btn');
    const voiceConvBtn = document.getElementById('voice-conv-btn');

    if (voiceCalcBtn) {
        voiceCalcBtn.addEventListener('click', () => {
            activeVoiceTarget = 'calc';
            recognition.start();
            voiceCalcBtn.classList.add('recording');
            showToast('Listening... Speak a calculation', '🎤');
        });
    }

    if (voiceConvBtn) {
        voiceConvBtn.addEventListener('click', () => {
            activeVoiceTarget = 'conv';
            recognition.start();
            voiceConvBtn.classList.add('recording');
            showToast('Listening... Speak a number', '🎤');
        });
    }

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        
        if (activeVoiceTarget === 'calc') {
            // Very basic natural language parsing for calculator
            let parsed = transcript
                .replace(/to|too|two/g, '2')
                .replace(/tree|free/g, '3')
                .replace(/for|four/g, '4')
                .replace(/eight|ate/g, '8')
                .replace(/one|won/g, '1')
                .replace(/plus|and/g, '+')
                .replace(/minus|take away/g, '−')
                .replace(/times|multiplied by|x|into/g, '×')
                .replace(/divided by|over|by/g, '÷')
                .replace(/equals/g, '')
                .replace(/[^0-9\+\−\×\÷\.]/g, ''); // strip unknown words
            
            if (parsed && typeof calculator !== 'undefined') {
                calculator.clear();
                for (let char of parsed) {
                    calculator.appendSymbol(char);
                }
                calculator.compute();
                showToast(`Heard: ${transcript}`, '✅');
            } else {
                showToast("Couldn't understand calculation", '❌');
            }
        } else if (activeVoiceTarget === 'conv') {
            // Parse for a number
            const numMatch = transcript.match(/\d+(\.\d+)?/);
            if (numMatch) {
                const convertFromInput = document.getElementById('convert-from-input');
                if (convertFromInput) {
                    convertFromInput.value = numMatch[0];
                    // Trigger input event to calculate
                    convertFromInput.dispatchEvent(new Event('input'));
                    showToast(`Heard: ${numMatch[0]}`, '✅');
                }
            } else {
                showToast("Couldn't understand number", '❌');
            }
        }
    };

    recognition.onspeechend = () => {
        recognition.stop();
        if (voiceCalcBtn) voiceCalcBtn.classList.remove('recording');
        if (voiceConvBtn) voiceConvBtn.classList.remove('recording');
    };

    recognition.onerror = (event) => {
        showToast(`Microphone error: ${event.error}`, '⚠️');
        if (voiceCalcBtn) voiceCalcBtn.classList.remove('recording');
        if (voiceConvBtn) voiceConvBtn.classList.remove('recording');
    };
} else {
    // If not supported, hide the buttons or notify
    console.warn("Speech Recognition API not supported in this browser.");
    const voiceCalcBtn = document.getElementById('voice-calc-btn');
    const voiceConvBtn = document.getElementById('voice-conv-btn');
    if (voiceCalcBtn) voiceCalcBtn.style.display = 'none';
    if (voiceConvBtn) voiceConvBtn.style.display = 'none';
}

// ---------------------------
// HISTORY LOGIC
// ---------------------------
const historyToggleBtns = document.querySelectorAll('.history-toggle');
const closeHistoryBtn = document.getElementById('close-history');
const historySidebar = document.getElementById('history-sidebar');
const historyOverlay = document.getElementById('history-overlay');
const historyList = document.getElementById('history-list');
const historyViewList = document.getElementById('history-view-list');
const clearHistoryBtn = document.getElementById('clear-history');

let calculationHistory = [];
const savedHistory = localStorage.getItem('smartCalcHistory');
if (savedHistory) {
    try {
        calculationHistory = JSON.parse(savedHistory);
    } catch (e) {
        calculationHistory = [];
    }
}

function toggleHistory() {
    if (historySidebar) historySidebar.classList.toggle('open');
    if (historyOverlay) historyOverlay.classList.toggle('open');
}

historyToggleBtns.forEach(btn => btn.addEventListener('click', toggleHistory));
if (closeHistoryBtn) closeHistoryBtn.addEventListener('click', toggleHistory);
if (historyOverlay) historyOverlay.addEventListener('click', toggleHistory);

function addHistoryEntry(expression, result) {
    if (!expression || expression === '') return;
    calculationHistory.unshift({ expression, result });
    if (calculationHistory.length > 20) calculationHistory.pop(); // limit to 20 items
    localStorage.setItem('smartCalcHistory', JSON.stringify(calculationHistory));
    renderHistory();
    showToast('Calculation saved to history', '💾');
}
window.addHistoryEntry = addHistoryEntry;

function renderHistory() {
    const emptyHTML = '<div style="text-align:center; color:var(--text-secondary); margin-top:20px;">No history yet.</div>';
    
    if (historyList) {
        if (calculationHistory.length === 0) {
            historyList.innerHTML = emptyHTML;
        } else {
            historyList.innerHTML = '';
            calculationHistory.forEach((item) => {
                const itemEl = document.createElement('div');
                itemEl.className = 'history-item';
                itemEl.innerHTML = `
                    <div class="history-expr">${item.expression} =</div>
                    <div class="history-res">${item.result}</div>
                `;
                itemEl.addEventListener('click', () => {
                    if (typeof calculator !== 'undefined') {
                        calculator.expression = item.expression;
                        calculator.currentValue = item.result;
                        calculator.shouldResetScreen = true;
                        calculator.updateDisplay();
                        toggleHistory(); // Close panel on selection
                    }
                });
                historyList.appendChild(itemEl);
            });
        }
    }

    if (historyViewList) {
        if (calculationHistory.length === 0) {
            historyViewList.innerHTML = emptyHTML;
        } else {
            historyViewList.innerHTML = '';
            calculationHistory.forEach((item) => {
                const itemEl = document.createElement('div');
                itemEl.className = 'history-item';
                itemEl.innerHTML = `
                    <div class="history-expr">${item.expression} =</div>
                    <div class="history-res">${item.result}</div>
                `;
                itemEl.addEventListener('click', () => {
                    if (typeof calculator !== 'undefined') {
                        calculator.expression = item.expression;
                        calculator.currentValue = item.result;
                        calculator.shouldResetScreen = true;
                        calculator.updateDisplay();
                        
                        // Switch back to calculator view when history item clicked
                        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                        document.querySelector('[data-target="calculator-view"]').classList.add('active');
                        document.querySelectorAll('.view-section').forEach(view => {
                            view.style.display = 'none';
                            view.classList.remove('active');
                        });
                        const calcView = document.getElementById('calculator-view');
                        calcView.style.display = 'block';
                        calcView.classList.add('active');
                    }
                });
                historyViewList.appendChild(itemEl);
            });
        }
    }
}


const clearHistoryViewBtn = document.getElementById('clear-history-view');

function clearHistory() {
    calculationHistory = [];
    localStorage.removeItem('smartCalcHistory');
    renderHistory();
    showToast('History cleared', '🗑️');
}

if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', clearHistory);
}

if (clearHistoryViewBtn) {
    clearHistoryViewBtn.addEventListener('click', clearHistory);
}

function exportHistory() {
    if (calculationHistory.length === 0) {
        showToast('No history to export', '⚠️');
        return;
    }
    let content = "Smart Calculator History\n========================\n\n";
    calculationHistory.forEach(item => {
        content += `${item.expression} = ${item.result}\n`;
    });
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calculator_history.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast('History exported', '📥');
}

const exportMainBtn = document.getElementById('export-history-btn-main');
const exportSideBtn = document.getElementById('export-history-btn-side');
if (exportMainBtn) exportMainBtn.addEventListener('click', exportHistory);
if (exportSideBtn) exportSideBtn.addEventListener('click', exportHistory);

// Initial render
renderHistory();

// Mode Toggle Support
const modeToggleCheckbox = document.getElementById('mode-toggle-checkbox');
const calculatorContainer = document.querySelector('.calculator');
if (modeToggleCheckbox) {
    modeToggleCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            calculatorContainer.classList.add('scientific-mode');
        } else {
            calculatorContainer.classList.remove('scientific-mode');
        }
    });
}

// ---------------------------
// CONVERTER MODE LOGIC
// ---------------------------

const unitOptions = {
    speed: [
        { value: 'kmh', label: 'km/h' },
        { value: 'mph', label: 'mph' },
        { value: 'ms', label: 'm/s' }
    ],
    currency: [
        { value: 'usd', label: 'USD' },
        { value: 'inr', label: 'INR' }
    ],
    length: [
        { value: 'm', label: 'Meters' },
        { value: 'km', label: 'Kilometers' },
        { value: 'mi', label: 'Miles' },
        { value: 'ft', label: 'Feet' },
        { value: 'in', label: 'Inches' }
    ],
    weight: [
        { value: 'kg', label: 'Kilograms' },
        { value: 'g', label: 'Grams' },
        { value: 'lb', label: 'Pounds' },
        { value: 'oz', label: 'Ounces' }
    ],
    temperature: [
        { value: 'c', label: 'Celsius (°C)' },
        { value: 'f', label: 'Fahrenheit (°F)' },
        { value: 'k', label: 'Kelvin (K)' }
    ],
    area: [
        { value: 'sqm', label: 'Sq Meters' },
        { value: 'sqkm', label: 'Sq Kilometers' },
        { value: 'sqft', label: 'Sq Feet' },
        { value: 'ac', label: 'Acres' },
        { value: 'ha', label: 'Hectares' }
    ],
    volume: [
        { value: 'l', label: 'Liters' },
        { value: 'ml', label: 'Milliliters' },
        { value: 'gal', label: 'Gallons (US)' },
        { value: 'm3', label: 'Cubic Meters' }
    ],
    time: [
        { value: 's', label: 'Seconds' },
        { value: 'min', label: 'Minutes' },
        { value: 'h', label: 'Hours' },
        { value: 'd', label: 'Days' }
    ]
};

const rates = {
    // Base units
    speed: { ms: 1, kmh: 3.6, mph: 2.23694 }, // Base m/s
    currency: { usd: 1, inr: 83.5 },          // Base USD
    length: { m: 1, km: 0.001, mi: 0.000621371, ft: 3.28084, in: 39.3701 }, // Base meters
    weight: { kg: 1, g: 1000, lb: 2.20462, oz: 35.274 },                    // Base kilograms
    area: { sqm: 1, sqkm: 1e-6, sqft: 10.7639, ac: 0.000247105, ha: 1e-4 }, // Base Sq Meters
    volume: { l: 1, ml: 1000, gal: 0.264172, m3: 0.001 },                   // Base Liters
    time: { s: 1, min: 1/60, h: 1/3600, d: 1/86400 }                        // Base Seconds
};

const converterType = document.getElementById('converter-type');
const convertFromInput = document.getElementById('convert-from-input');
const convertToInput = document.getElementById('convert-to-input');
const convertFromUnit = document.getElementById('convert-from-unit');
const convertToUnit = document.getElementById('convert-to-unit');

function populateUnits(type) {
    const optionsHTML = unitOptions[type].map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('');
    convertFromUnit.innerHTML = optionsHTML;
    convertToUnit.innerHTML = optionsHTML;
    
    // Set default selections
    if (type === 'speed') { convertFromUnit.value = 'kmh'; convertToUnit.value = 'mph'; }
    else if (type === 'currency') { convertFromUnit.value = 'usd'; convertToUnit.value = 'inr'; }
    else if (type === 'length') { convertFromUnit.value = 'km'; convertToUnit.value = 'm'; }
    else if (type === 'weight') { convertFromUnit.value = 'kg'; convertToUnit.value = 'lb'; }
    else if (type === 'temperature') { convertFromUnit.value = 'c'; convertToUnit.value = 'f'; }
    else if (type === 'area') { convertFromUnit.value = 'sqm'; convertToUnit.value = 'sqft'; }
    else if (type === 'volume') { convertFromUnit.value = 'l'; convertToUnit.value = 'gal'; }
    else if (type === 'time') { convertFromUnit.value = 'h'; convertToUnit.value = 'min'; }

    // Clear inputs on mode change
    convertFromInput.value = '';
    convertToInput.value = '';
}

if (converterType) {
    converterType.addEventListener('change', (e) => {
        populateUnits(e.target.value);
    });

    function calculateConversion(reverse = false) {
        const type = converterType.value;
        const fromVal = parseFloat(convertFromInput.value);
        const toVal = parseFloat(convertToInput.value);
        
        const fromUnit = convertFromUnit.value;
        const toUnit = convertToUnit.value;

        // Custom math for Temperature
        if (type === 'temperature') {
            if (!reverse) {
                if (isNaN(fromVal)) { convertToInput.value = ''; return; }
                let baseC = fromVal;
                if (fromUnit === 'f') baseC = (fromVal - 32) * 5/9;
                if (fromUnit === 'k') baseC = fromVal - 273.15;
                
                let result = baseC;
                if (toUnit === 'f') result = (baseC * 9/5) + 32;
                if (toUnit === 'k') result = baseC + 273.15;
                convertToInput.value = +result.toFixed(2);
            } else {
                if (isNaN(toVal)) { convertFromInput.value = ''; return; }
                let baseC = toVal;
                if (toUnit === 'f') baseC = (toVal - 32) * 5/9;
                if (toUnit === 'k') baseC = toVal - 273.15;
                
                let result = baseC;
                if (fromUnit === 'f') result = (baseC * 9/5) + 32;
                if (fromUnit === 'k') result = baseC + 273.15;
                convertFromInput.value = +result.toFixed(2);
            }
            return;
        }

        // Standard multiplicative math for everything else
        if (!reverse) {
            if (isNaN(fromVal)) { convertToInput.value = ''; return; }
            const baseVal = fromVal / rates[type][fromUnit];
            const result = baseVal * rates[type][toUnit];
            convertToInput.value = +result.toFixed(4);
        } else {
            if (isNaN(toVal)) { convertFromInput.value = ''; return; }
            const baseVal = toVal / rates[type][toUnit];
            const result = baseVal * rates[type][fromUnit];
            convertFromInput.value = +result.toFixed(4);
        }
    }

    // Track the last edited input to know which direction to convert when a unit changes
    let lastEditedInput = 'from';

    // Listeners for live updating
    convertFromInput.addEventListener('input', () => {
        lastEditedInput = 'from';
        calculateConversion(false);
    });
    convertToInput.addEventListener('input', () => {
        lastEditedInput = 'to';
        calculateConversion(true);
    });
    
    convertFromUnit.addEventListener('change', () => {
        calculateConversion(lastEditedInput === 'to');
    });
    convertToUnit.addEventListener('change', () => {
        calculateConversion(lastEditedInput === 'to');
    });

    // Listeners for history logging (fires on blur/enter)
    convertFromInput.addEventListener('change', () => {
        if (convertFromInput.value && convertToInput.value) {
            const expr = `${convertFromInput.value} ${convertFromUnit.options[convertFromUnit.selectedIndex].text}`;
            const res = `${convertToInput.value} ${convertToUnit.options[convertToUnit.selectedIndex].text}`;
            addHistoryEntry(expr, res);
        }
    });
    convertToInput.addEventListener('change', () => {
        if (convertFromInput.value && convertToInput.value) {
            const expr = `${convertToInput.value} ${convertToUnit.options[convertToUnit.selectedIndex].text}`;
            const res = `${convertFromInput.value} ${convertFromUnit.options[convertFromUnit.selectedIndex].text}`;
            addHistoryEntry(expr, res);
        }
    });

    // Initialize Converter
    populateUnits('speed');
}

// ---------------------------
// TAB SWITCHING LOGIC
// ---------------------------
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Update active class on tabs
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        // Hide all views and show target
        const targetId = e.target.dataset.target;
        document.querySelectorAll('.view-section').forEach(view => {
            view.style.display = 'none';
            view.classList.remove('active');
        });
        const targetView = document.getElementById(targetId);
        targetView.style.display = 'block';
        targetView.classList.add('active');

        const statusMode = document.getElementById('status-mode');
        if (statusMode) statusMode.innerText = e.target.innerText;
        showToast(`Switched to ${e.target.innerText}`, '🔄');
    });
});


// ---------------------------
// THEME-SPECIFIC LIVE BACKGROUND
// ---------------------------
const canvas = document.getElementById('live-bg');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function getTheme() {
        if (document.body.classList.contains('ocean-mode')) return 'ocean';
        if (document.body.classList.contains('forest-mode')) return 'forest';
        if (document.body.classList.contains('neon-mode')) return 'neon';
        if (document.body.classList.contains('sunset-mode')) return 'sunset';
        if (document.body.classList.contains('magma-mode')) return 'magma';
        if (document.body.classList.contains('amethyst-mode')) return 'amethyst';
        if (document.body.classList.contains('light-mode')) return 'light';
        return 'dark'; // default
    }

    class Particle {
        constructor(theme) {
            this.theme = theme;
            this.reset();
            // Scatter initial particles for continuous effect
            if (theme !== 'neon' && theme !== 'magma') {
                this.y = Math.random() * canvas.height;
            }
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + Math.random() * 100;
            this.size = Math.random() * 3 + 1;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.speedY = -(Math.random() * 1 + 0.5);
            this.speedX = Math.random() * 0.6 - 0.3;
            
            if (this.theme === 'dark' || this.theme === 'light') {
                this.size = Math.random() * 60 + 20;
                this.speedX = Math.random() * 0.6 - 0.3;
                this.speedY = Math.random() * 0.6 - 0.3;
                this.y = Math.random() * canvas.height;
                this.opacity = this.theme === 'light' ? (Math.random() * 0.1 + 0.05) : (Math.random() * 0.15 + 0.05);
            } else if (this.theme === 'ocean') {
                this.size = Math.random() * 12 + 4;
                this.speedY = -(Math.random() * 1.5 + 0.5);
                this.wobble = Math.random() * Math.PI * 2;
                this.wobbleSpeed = Math.random() * 0.04 + 0.02;
            } else if (this.theme === 'forest') {
                this.size = Math.random() * 3 + 1.5;
                this.speedY = -(Math.random() * 0.5 + 0.2);
                this.wobble = Math.random() * Math.PI * 2;
            } else if (this.theme === 'neon') {
                this.size = Math.random() * 30 + 10;
                this.y = -Math.random() * canvas.height;
                this.speedY = Math.random() * 6 + 4;
                this.speedX = 0;
                this.opacity = Math.random() * 0.6 + 0.2;
            } else if (this.theme === 'sunset') {
                this.size = Math.random() * 5 + 2;
                this.speedY = -(Math.random() * 1.5 + 0.5);
            } else if (this.theme === 'magma') {
                this.size = Math.random() * 3 + 1;
                this.speedY = -(Math.random() * 4 + 2);
                this.speedX = Math.random() * 2 - 1;
                this.opacity = Math.random() * 0.8 + 0.2;
            } else if (this.theme === 'amethyst') {
                this.size = Math.random() * 2.5 + 0.5;
                this.speedY = -(Math.random() * 0.3 + 0.1);
                this.speedX = Math.random() * 0.4 - 0.2;
                this.pulse = Math.random() * Math.PI;
                this.y = Math.random() * canvas.height;
            }
        }

        update() {
            if (this.theme === 'dark' || this.theme === 'light') {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < -this.size) this.x = canvas.width + this.size;
                if (this.x > canvas.width + this.size) this.x = -this.size;
                if (this.y < -this.size) this.y = canvas.height + this.size;
                if (this.y > canvas.height + this.size) this.y = -this.size;
                return;
            }

            this.x += this.speedX;
            this.y += this.speedY;

            if (this.theme === 'ocean') {
                this.wobble += this.wobbleSpeed;
                this.x += Math.sin(this.wobble) * 1.5;
                if (this.y < -this.size) this.reset();
            } else if (this.theme === 'forest') {
                this.wobble += 0.02;
                this.x += Math.sin(this.wobble) * 1;
                if (this.y < -this.size) this.reset();
            } else if (this.theme === 'neon') {
                if (this.y > canvas.height + this.size) this.reset();
            } else if (this.theme === 'sunset' || this.theme === 'magma') {
                if (this.y < -this.size) this.reset();
            } else if (this.theme === 'amethyst') {
                this.pulse += 0.03;
                this.opacity = (Math.sin(this.pulse) + 1) / 2 * 0.7 + 0.3;
                if (this.y < -this.size) this.reset();
            }
        }

        draw(ctx) {
            ctx.globalAlpha = this.opacity;
            ctx.beginPath();
            
            if (this.theme === 'dark' || this.theme === 'light') {
                ctx.fillStyle = this.theme === 'light' ? '#94a3b8' : '#ffffff';
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.theme === 'ocean') {
                ctx.strokeStyle = '#bae6fd';
                ctx.lineWidth = 1.5;
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.stroke();
            } else if (this.theme === 'forest') {
                ctx.fillStyle = '#fef08a';
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#fef08a';
            } else if (this.theme === 'neon') {
                ctx.fillStyle = '#06b6d4';
                ctx.fillRect(this.x, this.y, 2, this.size);
                ctx.shadowBlur = 5;
                ctx.shadowColor = '#06b6d4';
            } else if (this.theme === 'sunset') {
                ctx.fillStyle = '#fde047';
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#f97316';
            } else if (this.theme === 'magma') {
                ctx.fillStyle = '#fca5a5';
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 6;
                ctx.shadowColor = '#ef4444';
            } else if (this.theme === 'amethyst') {
                ctx.fillStyle = '#e9d5ff';
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#d8b4fe';
            }
            
            ctx.shadowBlur = 0; // reset
        }
    }

    function initParticles() {
        particles = [];
        const theme = getTheme();
        const count = window.innerWidth < 768 ? 25 : (theme === 'magma' ? 80 : (theme === 'neon' ? 100 : 45));
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(theme));
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw(ctx);
        }
        
        ctx.globalAlpha = 1.0;
        animationFrameId = requestAnimationFrame(animateParticles);
    }
    
    // Re-initialize when theme changes
    const themeSelector = document.getElementById('theme-selector');
    if (themeSelector) {
        themeSelector.addEventListener('change', () => {
            setTimeout(initParticles, 50); 
        });
    }

    initParticles();
    animateParticles();
}



// ---------------------------
// LOADING SCREEN LOGIC
// ---------------------------
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 600);
        }, 600);
    }
});

// ---------------------------
// LIVE CLOCK LOGIC
// ---------------------------
function updateLiveClock() {
    const clockTime = document.getElementById('clock-time');
    const clockDate = document.getElementById('clock-date');
    if (!clockTime || !clockDate) return;

    const now = new Date();
    
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    
    const timeStr = `${hours}:${minutes}:${seconds} ${ampm}`;
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateStr = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    
    clockTime.innerText = timeStr;
    clockDate.innerText = dateStr;
}
setInterval(updateLiveClock, 1000);
updateLiveClock();

// ---------------------------
// ABOUT MODAL LOGIC
// ---------------------------
const aboutModal = document.getElementById('about-modal');
const headerAboutToggle = document.getElementById('header-about-toggle');
const closeAboutBtn = document.getElementById('close-about');

function toggleAboutModal() {
    if (aboutModal) {
        aboutModal.classList.toggle('active');
        if (aboutModal.classList.contains('active')) {
            showToast('Opened About section', 'ℹ️');
        }
    }
}

if (headerAboutToggle) {
    headerAboutToggle.addEventListener('click', toggleAboutModal);
}
if (closeAboutBtn) {
    closeAboutBtn.addEventListener('click', toggleAboutModal);
}
// Close on outside click
if (aboutModal) {
    aboutModal.addEventListener('click', (e) => {
        if (e.target === aboutModal) {
            toggleAboutModal();
        }
    });
}

// ---------------------------
// PROFILE MODAL LOGIC
// ---------------------------
const profileModal = document.getElementById('profile-modal');
const headerProfileBtn = document.getElementById('header-profile-btn');
const closeProfileBtn = document.getElementById('close-profile');

function toggleProfileModal() {
    if (profileModal) {
        profileModal.classList.toggle('active');
        if (profileModal.classList.contains('active')) {
            showToast('Opened Profile', '👤');
        }
    }
}

if (headerProfileBtn) {
    headerProfileBtn.addEventListener('click', toggleProfileModal);
}
if (closeProfileBtn) {
    closeProfileBtn.addEventListener('click', toggleProfileModal);
}
// Close on outside click
if (profileModal) {
    profileModal.addEventListener('click', (e) => {
        if (e.target === profileModal) {
            toggleProfileModal();
        }
    });
}

// ---------------------------
// GRAPHING LOGIC
// ---------------------------
const plotBtn = document.getElementById('plot-btn');
const graphCanvas = document.getElementById('graph-canvas');
const graphEquation = document.getElementById('graph-equation');

if (plotBtn && graphCanvas && graphEquation) {
    const ctx = graphCanvas.getContext('2d');
    
    function drawGraph() {
        const width = graphCanvas.width;
        const height = graphCanvas.height;
        ctx.clearRect(0, 0, width, height);
        
        // Draw axes
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.strokeStyle = '#ccc';
        ctx.stroke();

        const equation = graphEquation.value || 'sin(x) * x';
        
        ctx.beginPath();
        ctx.strokeStyle = 'var(--accent-primary)';
        ctx.lineWidth = 2;
        
        let first = true;
        const scale = 20; // 20 pixels per unit
        
        let graphFunc;
        try {
            // Compile the function once, allowing 'x' as an argument
            graphFunc = new Function('x', 'with(Math) { return ' + equation + '}');
        } catch (e) {
            showToast('Invalid equation', '❌');
            return;
        }
        
        for (let px = 0; px < width; px++) {
            const x = (px - width / 2) / scale;
            try {
                const y = graphFunc(x);
                
                if (typeof y === 'number' && !isNaN(y) && Math.abs(y) < 1000) {
                    const py = height / 2 - (y * scale);
                    if (first) {
                        ctx.moveTo(px, py);
                        first = false;
                    } else {
                        ctx.lineTo(px, py);
                    }
                } else {
                    first = true;
                }
            } catch (e) {
                first = true;
            }
        }
        ctx.stroke();
        showToast('Graph plotted', '📈');
    }
    
    plotBtn.addEventListener('click', drawGraph);
    
    // Draw initial empty graph or default
    setTimeout(drawGraph, 500);
}

// ---------------------------
// VOICE CALCULATOR LOGIC
// ---------------------------
const voiceCalcBtn = document.getElementById('voice-calc-btn');
const voiceConvBtn = document.getElementById('voice-conv-btn');

function setupVoiceRecognition(btnElement, targetInputCallback) {
    if (!btnElement) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        btnElement.addEventListener('click', () => showToast('Voice not supported', '❌'));
        return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    
    btnElement.addEventListener('click', () => {
        btnElement.classList.add('recording');
        recognition.start();
        showToast('Listening...', '🎤');
    });
    
    recognition.onresult = function(event) {
        btnElement.classList.remove('recording');
        const transcript = event.results[0][0].transcript.toLowerCase();
        showToast(`Heard: ${transcript}`, '👂');
        
        let parsed = transcript
            .replace(/plus/g, '+')
            .replace(/minus/g, '−')
            .replace(/times/g, '×')
            .replace(/multiplied by/g, '×')
            .replace(/divided by/g, '÷')
            .replace(/over/g, '÷')
            .replace(/x/g, '×')
            .replace(/ /g, '');
            
        targetInputCallback(parsed);
    };
    
    recognition.onerror = function(event) {
        btnElement.classList.remove('recording');
        showToast('Voice Error', '❌');
    };
}

setupVoiceRecognition(voiceCalcBtn, (parsed) => {
    calculator.clear();
    for (const char of parsed) {
        calculator.appendSymbol(char);
    }
    setTimeout(() => calculator.compute(), 500);
});

if (typeof document.getElementById('convert-from-input') !== 'undefined') {
    setupVoiceRecognition(voiceConvBtn, (parsed) => {
        const num = parseFloat(parsed);
        if (!isNaN(num)) {
            const input = document.getElementById('convert-from-input');
            if(input) {
                input.value = num;
                input.dispatchEvent(new Event('input'));
            }
        }
    });
}

// ---------------------------
// PROGRAMMER MODE LOGIC
// ---------------------------
let currentProgBase = 'dec';
let currentProgValue = 0n;
let progPreviousValue = null;
let progPendingOperation = null;
let progIsNewValue = true;

const progDec = document.getElementById('prog-dec');
const progHex = document.getElementById('prog-hex');
const progOct = document.getElementById('prog-oct');
const progBin = document.getElementById('prog-bin');
const baseRows = document.querySelectorAll('.base-row');

function updateProgDisplay() {
    if (!progDec) return;
    
    // Display standard 64-bit signed for decimal
    let signedVal = BigInt.asIntN(64, currentProgValue);
    progDec.innerText = signedVal.toString(10);
    
    // Display 64-bit unsigned for hex, octal, binary
    let unsignedVal = BigInt.asUintN(64, currentProgValue);
    progHex.innerText = unsignedVal.toString(16).toUpperCase();
    progOct.innerText = unsignedVal.toString(8);
    progBin.innerText = unsignedVal.toString(2);
}

baseRows.forEach(row => {
    row.addEventListener('click', () => {
        baseRows.forEach(r => r.classList.remove('active'));
        row.classList.add('active');
        currentProgBase = row.dataset.base;
    });
});

document.querySelectorAll('.prog-num-btn, .hex-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const val = btn.dataset.number;
        let baseNum = 10;
        if (currentProgBase === 'hex') baseNum = 16;
        if (currentProgBase === 'oct') baseNum = 8;
        if (currentProgBase === 'bin') baseNum = 2;
        
        const isValid = (currentProgBase === 'bin' && (val === '0' || val === '1')) ||
                        (currentProgBase === 'oct' && /^[0-7]$/.test(val)) ||
                        (currentProgBase === 'dec' && /^[0-9]$/.test(val)) ||
                        (currentProgBase === 'hex');
                        
        if (isValid) {
            if (progIsNewValue) {
                currentProgValue = 0n;
                progIsNewValue = false;
            }
            let strVal = currentProgValue === 0n ? val : currentProgValue.toString(baseNum) + val;
            try {
                if(baseNum === 16) currentProgValue = BigInt('0x' + strVal);
                else if(baseNum === 8) currentProgValue = BigInt('0o' + strVal);
                else if(baseNum === 2) currentProgValue = BigInt('0b' + strVal);
                else currentProgValue = BigInt(strVal);
            } catch(e) {}
            updateProgDisplay();
        }
        if(typeof addPulseEffect === 'function') addPulseEffect(btn);
    });
});

function computeProgOperation(a, b, op) {
    switch (op) {
        case 'and': return a & b;
        case 'or': return a | b;
        case 'xor': return a ^ b;
        case 'lsh': return a << b;
        case 'rsh': return a >> b;
        case 'add': return a + b;
        case 'subtract': return a - b;
        case 'multiply': return a * b;
        case 'divide': return b !== 0n ? a / b : 0n;
        default: return b;
    }
}

document.querySelectorAll('.btn-prog-op, .btn-prog-math').forEach(btn => {
    btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        
        if (action === 'not') {
            currentProgValue = ~currentProgValue;
            updateProgDisplay();
            progIsNewValue = true;
            if(typeof addPulseEffect === 'function') addPulseEffect(btn);
            return;
        }

        if (progPreviousValue !== null && progPendingOperation && !progIsNewValue) {
            currentProgValue = computeProgOperation(progPreviousValue, currentProgValue, progPendingOperation);
            updateProgDisplay();
        }
        
        progPreviousValue = currentProgValue;
        progPendingOperation = action;
        progIsNewValue = true;
        
        if(typeof addPulseEffect === 'function') addPulseEffect(btn);
    });
});

const progEqualsBtn = document.getElementById('prog-equals');
if (progEqualsBtn) {
    progEqualsBtn.addEventListener('click', () => {
        if (progPreviousValue !== null && progPendingOperation) {
            currentProgValue = computeProgOperation(progPreviousValue, currentProgValue, progPendingOperation);
            updateProgDisplay();
            progPreviousValue = null;
            progPendingOperation = null;
            progIsNewValue = true;
        }
        if(typeof addPulseEffect === 'function') addPulseEffect(progEqualsBtn);
    });
}

// ---------------------------
// PWA SERVICE WORKER REGISTRATION
// ---------------------------
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => console.log('ServiceWorker registered'))
            .catch(err => console.log('ServiceWorker failed: ', err));
    });
}

const progClear = document.getElementById('prog-clear');
if (progClear) {
    progClear.addEventListener('click', () => {
        currentProgValue = 0n;
        progPreviousValue = null;
        progPendingOperation = null;
        progIsNewValue = true;
        updateProgDisplay();
        if(typeof addPulseEffect === 'function') addPulseEffect(progClear);
    });
}

const progDeleteBtn = document.getElementById('prog-delete');
if (progDeleteBtn) {
    progDeleteBtn.addEventListener('click', () => {
        if (progIsNewValue) return;
        
        let baseNum = 10;
        if (currentProgBase === 'hex') baseNum = 16;
        if (currentProgBase === 'oct') baseNum = 8;
        if (currentProgBase === 'bin') baseNum = 2;
        
        let strVal = currentProgValue.toString(baseNum);
        if (strVal.length > 1 && !(strVal.length === 2 && strVal.startsWith('-'))) {
            strVal = strVal.slice(0, -1);
        } else {
            strVal = '0';
            progIsNewValue = true;
        }
        
        try {
            if(baseNum === 16) currentProgValue = BigInt('0x' + strVal);
            else if(baseNum === 8) currentProgValue = BigInt('0o' + strVal);
            else if(baseNum === 2) currentProgValue = BigInt('0b' + strVal);
            else currentProgValue = BigInt(strVal);
        } catch(e) {}
        
        updateProgDisplay();
        if(typeof addPulseEffect === 'function') addPulseEffect(progDeleteBtn);
    });
}
