// Simulation disclaimer popup
(function () {
    function createDisclaimerModal() {
        let modal = document.getElementById('disclaimerModal');
        if (modal) return modal;

        modal = document.createElement('div');
        modal.id = 'disclaimerModal';
        modal.className = 'modal-overlay';
        modal.style.display = 'none';
        modal.style.zIndex = '3000';

        modal.innerHTML = `
            <div class="modal-popup" style="max-width: 560px;">
                <h3 style="margin-top: 0;">Simulation Disclaimer</h3>
                <p style="margin: 0 0 10px 0; line-height: 1.5;">
                    Simsta is a fictional simulation game.
                </p>
                <p style="margin: 0 0 16px 0; line-height: 1.5;">
                    It is not a real social media platform and does not create real followers, likes, views, money, or verification.
                </p>
                <button id="acknowledgeDisclaimerBtn" class="btn-save" style="width: 100%;">I Understand</button>
            </div>
        `;

        document.body.appendChild(modal);
        return modal;
    }

    function showDisclaimerModal() {
        const modal = createDisclaimerModal();
        const acknowledgeBtn = document.getElementById('acknowledgeDisclaimerBtn');

        if (acknowledgeBtn && !acknowledgeBtn.dataset.bound) {
            acknowledgeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
            acknowledgeBtn.dataset.bound = 'true';
        }

        modal.style.display = 'flex';
    }

    function initializeDisclaimerPopup() {
        showDisclaimerModal();
    }

    window.initializeDisclaimerPopup = initializeDisclaimerPopup;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeDisclaimerPopup);
    } else {
        initializeDisclaimerPopup();
    }
})();
