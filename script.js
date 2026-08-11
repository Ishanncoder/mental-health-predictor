// Configuration
const API_BASE_URL = 'http://localhost:8000';

// DOM Elements
const form = document.getElementById('predictionForm');
const predictBtn = document.getElementById('predictBtn');
const loading = document.getElementById('loading');
const resultContainer = document.getElementById('resultContainer');
const scoreDisplay = document.getElementById('scoreDisplay');
const scoreInterpretation = document.getElementById('scoreInterpretation');
const scoreCircleFg = document.getElementById('scoreCircleFg');
const errorAlert = document.getElementById('errorAlert');
const tipsList = document.getElementById('tipsList');

// Validation rules
const validationRules = {
    age: (val) => val >= 10 && val <= 100,
    dailyUsage: (val) => val >= 0 && val <= 24,
    studyHours: (val) => val >= 0 && val <= 24,
    activity: (val) => val >= 0 && val <= 24,
    sleep: (val) => val >= 0 && val <= 24,
    unlocks: (val) => val >= 0
};

// Real-time validation
Object.keys(validationRules).forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
        field.addEventListener('blur', () => validateField(fieldId));
        field.addEventListener('change', () => validateField(fieldId));
    }
});

function validateField(fieldId) {
    const field = document.getElementById(fieldId);
    const formGroup = field.closest('.form-group');
    const value = field.value;

    if (!value) {
        formGroup.classList.add('error');
        return false;
    }

    const rule = validationRules[fieldId];
    if (rule && !rule(parseFloat(value))) {
        formGroup.classList.add('error');
        return false;
    }

    formGroup.classList.remove('error');
    return true;
}

function validateForm() {
    let isValid = true;
    const formGroups = form.querySelectorAll('.form-group');

    formGroups.forEach(group => {
        const input = group.querySelector('input, select');
        if (input) {
            const fieldId = input.id;
            if (!validateField(fieldId)) {
                isValid = false;
            }
        }
    });

    return isValid;
}

// Get wellness tips based on score
function getWellnessTips(score) {
    const tips = [];

    if (score < 0.4) {
        tips.push('📱 Try to reduce your daily social media usage');
        tips.push('😴 Ensure you get 7-8 hours of sleep daily');
        tips.push('🏃 Increase your physical activity to 1-2 hours');
        tips.push('📚 Dedicate more time to meaningful activities');
    } else if (score < 0.7) {
        tips.push('⚡ Maintain your current balanced lifestyle');
        tips.push('🎯 Consider limiting screen time before bed');
        tips.push('🧘 Practice mindfulness or meditation');
        tips.push('🌟 Keep up your physical activity routine');
    } else {
        tips.push('🎉 Great job maintaining excellent digital wellness!');
        tips.push('💪 Continue your current healthy habits');
        tips.push('🌱 Help others improve their digital wellness');
        tips.push('📈 Keep monitoring your wellness regularly');
    }

    return tips;
}

// Get interpretation
function getScoreInterpretation(score) {
    if (score >= 0.7) {
        return {
            text: '✨ Excellent! Your digital wellness is outstanding. Keep maintaining these healthy habits!',
            class: 'good'
        };
    } else if (score >= 0.4) {
        return {
            text: '⚠️ Moderate. Consider making some adjustments to improve your digital wellness.',
            class: 'moderate'
        };
    } else {
        return {
            text: '❗ Poor. Your digital wellness needs attention. Focus on the tips below!',
            class: 'poor'
        };
    }
}

// Animate score circle
function animateScoreCircle(score) {
    const circumference = 2 * Math.PI * 90; // radius is 90
    const offset = circumference - (score * circumference);
    
    scoreCircleFg.style.strokeDashoffset = offset;
}

// Form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) {
        showError('Please fill all fields correctly');
        return;
    }

    hideError();
    loading.style.display = 'block';
    resultContainer.classList.remove('show');
    predictBtn.disabled = true;

    try {
        const formData = {
            age: parseInt(document.getElementById('age').value),
            gender: document.getElementById('gender').value,
            country: document.getElementById('country').value,
            academic_level: document.getElementById('academicLevel').value,
            most_used_platform: document.getElementById('platform').value,
            purpose_of_use: document.getElementById('purpose').value,
            avg_daily_usage_hours: parseFloat(document.getElementById('dailyUsage').value),
            daily_unlocks: parseInt(document.getElementById('unlocks').value),
            study_hours: parseFloat(document.getElementById('studyHours').value),
            physical_activity_hours: parseFloat(document.getElementById('activity').value),
            sleep_hours_per_night: parseFloat(document.getElementById('sleep').value),
            stress_level: document.getElementById('stress').value
        };

        const response = await fetch(`${API_BASE_URL}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Error: ${response.status}`);
        }

        const result = await response.json();
        displayResult(result.predicted_mental_health_score);

    } catch (error) {
        console.error('Error:', error);
        showError(`Failed to get prediction: ${error.message}`);
    } finally {
        loading.style.display = 'none';
        predictBtn.disabled = false;
    }
});

function displayResult(score) {
    scoreDisplay.textContent = score.toFixed(2);
    
    const interpretation = getScoreInterpretation(score);
    scoreInterpretation.textContent = interpretation.text;
    scoreInterpretation.className = `interpretation ${interpretation.class}`;
    
    // Animate circle
    animateScoreCircle(score);
    
    // Get and display tips
    const tips = getWellnessTips(score);
    tipsList.innerHTML = tips.map(tip => `<li>${tip}</li>`).join('');
    
    resultContainer.classList.add('show');
    
    // Scroll to results
    setTimeout(() => {
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 300);
}

function showError(message) {
    errorAlert.textContent = message;
    errorAlert.classList.add('show');
}

function hideError() {
    errorAlert.classList.remove('show');
}

// Clear result when form is reset
document.getElementById('resetBtn').addEventListener('click', () => {
    resultContainer.classList.remove('show');
    hideError();
});

// SVG Gradient definition (add if needed)
const svgNS = "http://www.w3.org/2000/svg";
const svg = document.querySelector('.score-circle svg');
if (svg && !svg.querySelector('defs')) {
    const defs = document.createElementNS(svgNS, 'defs');
    const gradient = document.createElementNS(svgNS, 'linearGradient');
    gradient.setAttribute('id', 'gradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '100%');
    
    const stop1 = document.createElementNS(svgNS, 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('style', 'stop-color:#6366f1;stop-opacity:1');
    
    const stop2 = document.createElementNS(svgNS, 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('style', 'stop-color:#8b5cf6;stop-opacity:1');
    
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.insertBefore(defs, svg.firstChild);
}

// Focus effects
document.querySelectorAll('input, select').forEach(field => {
    field.addEventListener('focus', function() {
        this.closest('.form-group').style.transform = 'scale(1.02)';
    });
    
    field.addEventListener('blur', function() {
        this.closest('.form-group').style.transform = 'scale(1)';
    });
});

console.log('Mental Wellness Analyzer initialized! 🧠');
