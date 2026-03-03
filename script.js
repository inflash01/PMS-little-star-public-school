// Little Star Public School - Form Handling Script

document.addEventListener('DOMContentLoaded', function() {
    
    // Loader ko hide karna
    const loader = document.getElementById('loader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 1500);
    }
    const admissionForm = document.getElementById('admissionForm');
    const formSuccess = document.getElementById('formSuccess');
    
    if (admissionForm) {
        admissionForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(admissionForm);
            const data = {
                parentName: formData.get('parentName'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                childName: formData.get('childName'),
                classJoin: formData.get('classJoin'),
                message: formData.get('message')
            };
            
            // Get submit button
            const submitBtn = admissionForm.querySelector('.submit-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitBtn.disabled = true;
            
            try {
                const response = await fetch('/api/admission', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Show success message
                    admissionForm.style.display = 'none';
                    formSuccess.classList.add('show');
                    
                    // Scroll to success message
                    formSuccess.scrollIntoView({ behavior: 'smooth' });
                    
                    // Reset form after 5 seconds (optional)
                    setTimeout(() => {
                        admissionForm.reset();
                    }, 5000);
                } else {
                    alert(result.message || 'Something went wrong. Please try again.');
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Network error. Please check your connection and try again.');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Menu toggle functionality
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.getElementById('mainNav');
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
        });
    }
    
    // Scroll indicator
    const scrollIndicator = document.querySelector('.scroll-indicator');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            scrollIndicator.classList.add('visible');
        } else {
            scrollIndicator.classList.remove('visible');
        }
    });
    
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Animated counter for stats
    const counters = document.querySelectorAll('.number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000;
        const increment = target / (duration / 16);
        
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    });
});
