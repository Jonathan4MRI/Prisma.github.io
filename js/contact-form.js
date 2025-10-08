// Contact Form Functionality for NIC Scanner Requests

// Initialize EmailJS
(function() {
    emailjs.init('mh447BG7YXasimZK7');
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
    
    const form = event.target;
    const submitBtn = document.getElementById('submitBtn');
    const submitBtnText = document.getElementById('submitBtnText');
    const submitBtnLoader = document.getElementById('submitBtnLoader');
    
    // Validate form
    if (!validateForm(form)) {
        showToast('Please fill in all required fields correctly.', 'error');
        return;
    }
    
    // Check if already submitting
    if (isSubmitting) return;
    
    isSubmitting = true;
    submitBtn.disabled = true;
    submitBtnText.style.display = 'none';
    submitBtnLoader.style.display = 'inline';
    
    // Collect form data
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
        if (key !== 'website') { // Exclude honeypot
            data[key] = value;
        }
    });
    
    try {
        // Format email content
        const emailParams = formatEmailContent(data);
        
        // Send email using EmailJS
        const response = await emailjs.send(
            'service_sayp5sn',
            'template_1f83ag8',
            emailParams
        );
        
        if (response.status === 200) {
            // Success
            showToast(`Request submitted successfully! Reference: ${emailParams.reference_number}`, 'success');
            
            // Clear form and draft
            form.reset();
            clearFormDraft();
            
            // Close modal after delay
            setTimeout(() => {
                closeContactForm();
            }, 2000);
        } else {
            throw new Error('Failed to send email');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        showToast('Failed to submit request. Please try again or contact us directly.', 'error');
    } finally {
        isSubmitting = false;
        submitBtn.disabled = false;
        submitBtnText.style.display = 'inline';
        submitBtnLoader.style.display = 'none';
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

// SETUP INSTRUCTIONS:
// 1. Sign up for a free EmailJS account at https://www.emailjs.com/
// 2. Create a new email service (Gmail, Outlook, etc.)
// 3. Create an email template with the variables used in formatEmailContent()
// 4. Replace 'YOUR_PUBLIC_KEY' in the init function with your Public Key
// 5. Replace 'YOUR_SERVICE_ID' with your Service ID
// 6. Replace 'YOUR_TEMPLATE_ID' with your Template ID
// 7. Update the email template to send to your desired email address