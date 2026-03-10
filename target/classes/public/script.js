const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

if (contactForm && formStatus) {
    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        formStatus.textContent = 'Sending...';
        formStatus.className = 'form-status';

        const formData = new FormData(contactForm);
        const params = new URLSearchParams();

        for (const [key, value] of formData.entries()) {
            params.append(key, String(value));
        }

        try {
            const response = await fetch('/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                },
                body: params.toString()
            });

            const payload = await response.json();
            if (!response.ok || !payload.ok) {
                throw new Error(payload.message || 'Something went wrong.');
            }

            formStatus.textContent = payload.message;
            formStatus.className = 'form-status success';
            contactForm.reset();
        } catch (error) {
            formStatus.textContent = error.message;
            formStatus.className = 'form-status error';
        }
    });
}
