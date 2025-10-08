// Contact Form Functionality for NIC Scanner Requests

// Initialize EmailJS
(function() {
    console.log('Initializing EmailJS...');
    try {
        emailjs.init('mh447BG7YXasimZK7');
        console.log('EmailJS initialized successfully with public key: mh447BG7YXasimZK7');
    } catch (error) {
        console.error('Failed to initialize EmailJS:', error);
    }
})();

// Form state management
let formData = {};
let isSubmitting = false;

// Open contact form modal
function openContactForm() {
    const modal = document.getElementById('contactFormModal');
    if (modal) {
        modal.classList.add('active');
        loadFormDraft();
    }
}

// Close contact form modal
function closeContactForm() {
    const modal = document.getElementById('contactFormModal');
    if (modal) {
        modal.classList.remove('active');
        if (!isSubmitting) {
            saveFormDraft();
        }
    }
}

// Save form data to localStorage as draft
function saveFormDraft() {
    const form = document.getElementById('scanRequestForm');
    if (!form) return;
    
    const draft = {};
    const inputs = form.querySelectorAll('input:not([type="radio"]), select, textarea');
    inputs.forEach(input => {
        if (input.name && input.name !== 'website') { // Exclude honeypot
            draft[input.name] = input.value;
        }
    });
    
    // Handle radio buttons
    const experienceRadio = form.querySelector('input[name="experience"]:checked');
    if (experienceRadio) {
        draft.experience = experienceRadio.value;
    }
    
    localStorage.setItem('nicScanRequestDraft', JSON.stringify(draft));
}

// Load form draft from localStorage
function loadFormDraft() {
    const draftString = localStorage.getItem('nicScanRequestDraft');
    if (!draftString) return;
    
    try {
        const draft = JSON.parse(draftString);
        const form = document.getElementById('scanRequestForm');
        if (!form) return;
        
        // Fill in the form fields
        Object.keys(draft).forEach(key => {
            if (key === 'experience') {
                const radio = form.querySelector(`input[name="experience"][value="${draft[key]}"]`);
                if (radio) radio.checked = true;
            } else {
                const field = form.querySelector(`[name="${key}"]`);
                if (field) field.value = draft[key];
            }
        });
    } catch (e) {
        console.error('Error loading form draft:', e);
    }
}

// Clear form draft
function clearFormDraft() {
    localStorage.removeItem('nicScanRequestDraft');
}

// Validate form
function validateForm(form) {
    const required = form.querySelectorAll('[required]');
    let isValid = true;
    
    required.forEach(field => {
        if (field.type === 'radio') {
            const radioGroup = form.querySelectorAll(`input[name="${field.name}"]`);
            const isChecked = Array.from(radioGroup).some(radio => radio.checked);
            if (!isChecked) {
                isValid = false;
                field.closest('.form-group').classList.add('error');
            }
        } else if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
        } else {
            field.classList.remove('error');
        }
    });
    
    // Check email format
    const emailField = form.querySelector('#email');
    if (emailField && emailField.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value)) {
            isValid = false;
            emailField.classList.add('error');
        }
    }
    
    // Check honeypot (anti-spam)
    const honeypot = form.querySelector('#website');
    if (honeypot && honeypot.value) {
        return false; // Bot detected
    }
    
    return isValid;
}

// Generate reference number
function generateReferenceNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `NIC-${year}${month}${day}-${random}`;
}

// Format form data for email
function formatEmailContent(data) {
    const referenceNumber = generateReferenceNumber();
    
    return {
        reference_number: referenceNumber,
        submission_date: new Date().toLocaleString(),
        
        // Contact Information
        name: data.name,
        email: data.email,
        phone: data.phone || 'Not provided',
        institution: data.institution,
        
        // Project Details
        project_title: data.projectTitle,
        principal_investigator: data.pi,
        participants: data.participants || 'Not specified',
        description: data.description,
        duration: data.duration,
        timeline: data.timeline || 'Not specified',
        
        // Additional Information
        irb_status: data.irbStatus,
        mri_experience: data.experience,
        special_requirements: data.requirements || 'None',
        
        // For the reply
        reply_to: data.email,
        from_name: data.name
    };
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    console.log('=== FORM SUBMISSION STARTED ===');

    const form = event.target;
    const submitBtn = document.getElementById('submitBtn');
    const submitBtnText = document.getElementById('submitBtnText');
    const submitBtnLoader = document.getElementById('submitBtnLoader');

    // Validate form
    console.log('Validating form...');
    if (!validateForm(form)) {
        console.error('Form validation failed');
        showToast('Please fill in all required fields correctly.', 'error');
        return;
    }
    console.log('Form validation passed');

    // Check if already submitting
    if (isSubmitting) {
        console.log('Already submitting, aborting duplicate submission');
        return;
    }

    isSubmitting = true;
    submitBtn.disabled = true;
    submitBtnText.style.display = 'none';
    submitBtnLoader.style.display = 'inline';

    // Collect form data
    console.log('Collecting form data...');
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
        if (key !== 'website') { // Exclude honeypot
            data[key] = value;
            console.log(`  ${key}: ${value}`);
        }
    });
    console.log('Form data collected:', data);

    try {
        // Format email content
        console.log('Formatting email content...');
        const emailParams = formatEmailContent(data);
        console.log('Email parameters prepared:', emailParams);

        // Check if EmailJS is initialized
        if (typeof emailjs === 'undefined') {
            throw new Error('EmailJS is not loaded. Please check your internet connection.');
        }

        console.log('Sending email via EmailJS...');
        console.log('  Service ID:', 'service_sayp5sn');
        console.log('  Template ID:', 'template_1f83ag8');

        // Send email using EmailJS
        const response = await emailjs.send(
            'service_sayp5sn',
            'template_1f83ag8',
            emailParams
        );

        console.log('EmailJS Response:', response);

        if (response.status === 200) {
            // Success
            console.log('Email sent successfully!');
            showToast(`Request submitted successfully! Reference: ${emailParams.reference_number}`, 'success');

            // Clear form and draft
            form.reset();
            clearFormDraft();

            // Close modal after delay
            setTimeout(() => {
                closeContactForm();
            }, 2000);
        } else {
            throw new Error(`EmailJS returned status: ${response.status}`);
        }
    } catch (error) {
        console.error('=== SUBMISSION ERROR ===');
        console.error('Error details:', error);
        console.error('Error message:', error.message || error.text || 'Unknown error');
        console.error('Error stack:', error.stack);

        // Provide more specific error messages
        let errorMessage = 'Failed to submit request. ';

        if (error.message && error.message.includes('EmailJS is not loaded')) {
            errorMessage += 'Email service is not loaded. Please refresh the page.';
        } else if (error.status === 412) {
            errorMessage += 'Email service configuration error. Please contact support.';
        } else if (error.status === 422) {
            errorMessage += 'Invalid email template configuration. Please contact support.';
        } else if (error.text && error.text.includes('The Public Key is invalid')) {
            errorMessage += 'Email service authentication failed. Please contact support.';
        } else if (!navigator.onLine) {
            errorMessage += 'No internet connection. Please check your network.';
        } else {
            errorMessage += 'Please try again or contact us directly.';
        }

        showToast(errorMessage, 'error');

        // Log to console for debugging
        console.error('Full error object:', error);
    } finally {
        isSubmitting = false;
        submitBtn.disabled = false;
        submitBtnText.style.display = 'inline';
        submitBtnLoader.style.display = 'none';
        console.log('=== FORM SUBMISSION COMPLETED ===');
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    // Use existing toast system if available
    if (typeof NeuroscapeApp !== 'undefined' && NeuroscapeApp.showToast) {
        NeuroscapeApp.showToast(message, type);
    } else {
        // Fallback to alert
        alert(message);
    }
}

// Initialize form handlers
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('scanRequestForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
        
        // Auto-save draft on input change
        form.addEventListener('input', () => {
            if (!isSubmitting) {
                saveFormDraft();
            }
        });
    }
    
    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('contactFormModal');
            if (modal && modal.classList.contains('active')) {
                closeContactForm();
            }
        }
    });
    
    // Close modal on background click
    const modal = document.getElementById('contactFormModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeContactForm();
            }
        });
    }
});

// TEST FUNCTION - Run this in browser console to test EmailJS configuration
window.testEmailJS = async function() {
    console.log('=== TESTING EMAILJS CONFIGURATION ===');

    // Check if EmailJS is loaded
    if (typeof emailjs === 'undefined') {
        console.error('❌ EmailJS library is not loaded');
        return false;
    }
    console.log('✅ EmailJS library is loaded');

    // Test with minimal data
    const testData = {
        reference_number: 'TEST-' + Date.now(),
        submission_date: new Date().toLocaleString(),
        name: 'Test User',
        email: 'test@example.com',
        phone: '555-0123',
        institution: 'Test Institution',
        project_title: 'Test Project',
        principal_investigator: 'Test PI',
        participants: '5',
        description: 'This is a test submission',
        duration: '1 hour',
        timeline: 'ASAP',
        irb_status: 'Approved',
        mri_experience: 'Yes',
        special_requirements: 'None',
        reply_to: 'test@example.com',
        from_name: 'Test User'
    };

    console.log('Sending test email with data:', testData);

    try {
        const response = await emailjs.send(
            'service_sayp5sn',
            'template_1f83ag8',
            testData
        );
        console.log('✅ Test email sent successfully!', response);
        console.log('Response status:', response.status);
        console.log('Response text:', response.text);
        return true;
    } catch (error) {
        console.error('❌ Failed to send test email');
        console.error('Error:', error);
        if (error.status) {
            console.error('Error Status:', error.status);
            console.error('Error Text:', error.text);

            // Provide specific error guidance
            if (error.status === 412) {
                console.error('→ This usually means the service ID is incorrect or the service is not active');
            } else if (error.status === 422) {
                console.error('→ This usually means the template ID is incorrect or template variables don\'t match');
            } else if (error.status === 401) {
                console.error('→ This usually means the public key is incorrect');
            }
        }
        return false;
    }
};

console.log('📧 EmailJS Test Function Available!');
console.log('Run "testEmailJS()" in the console to test your email configuration');