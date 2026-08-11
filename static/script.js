const API_BASE_URL = 'http://127.0.0.1:8000';

const form = document.getElementById('predictionForm');
const predictBtn = document.getElementById('predictBtn');
const loading = document.getElementById('loading');
const resultContainer = document.getElementById('resultContainer');
const scoreDisplay = document.getElementById('scoreDisplay');
const scoreInterpretation = document.getElementById('scoreInterpretation');
const errorAlert = document.getElementById('errorAlert');

// Field mapping for API
const fieldMapping = {
    age: 'age',
    gender: 'gender',
    country: 'country',
    academicLevel: 'academic_level',
    platform: 'most_used_platform',
    purpose: 'purpose_of_use',
    dailyUsage: 'avg_daily_usage_hours',
    unlocks: 'daily_unlocks',
    studyHours: 'study_hours',
    activity: 'physical_activity_hours',
    sleep: 'sleep_hours_per_night',
    stress: 'stress_level'
};

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

function getScoreInterpretation(score) {
    if (score >= 0.7) {
        return {
            text: '✨ Good - Your mental health appears to be in good shape!',
            class: 'good'
        };
    } else if (score >= 0.4) {
        return {
            text: '⚠️ Moderate - Consider taking steps to improve your digital wellness.',
            class: 'moderate'
        };
    } else {
        return {
            text: '❗ Poor - It would be beneficial to make some lifestyle changes.',
            class: 'poor'
        };
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) {
        showError('Please fix the validation errors above.');
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
    scoreInterpretation.className = `score-interpretation ${interpretation.class}`;
    
    resultContainer.classList.add('show');
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
