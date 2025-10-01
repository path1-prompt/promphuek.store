/* script.js — Promphuek Store */
/* Robust event binding, modal handling, form submit (Formspree), and bank details */

(function () {
  const orderModal = document.getElementById('orderModal');
  const bankModal  = document.getElementById('bankModal');
  const productInput = document.getElementById('productInput');
  const bankDetails  = document.getElementById('bankDetails');
  const copyAccBtn   = document.getElementById('copyAccBtn');
  const orderForm    = document.getElementById('order-form');
  const successEl    = document.getElementById('form-success');

  let currentAcc = '';

  /* --- Helpers --- */
  const openModal = (modal) => {
    if (!modal) return;
    modal.setAttribute('aria-hidden','false');
    // focus first focusable
    const focusable = modal.querySelector('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus();
  };
  const closeModal = (modal) => {
    if (!modal) return;
    modal.setAttribute('aria-hidden','true');
  };

  /* --- Open order form buttons --- */
  document.querySelectorAll('[data-order]').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-order') || '';
      if (productInput) productInput.value = name;
      openModal(orderModal);
    });
  });

  /* --- Close buttons for modals --- */
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal');
      closeModal(modal);
    });
  });

  /* --- Close modals on backdrop click --- */
  [orderModal, bankModal].forEach(modal => {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  /* --- ESC to close --- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(orderModal);
      closeModal(bankModal);
    }
  });

  /* --- Bank modal handling --- */
  document.querySelectorAll('[data-bank]').forEach(card => {
    card.addEventListener('click', () => {
      const bank = card.getAttribute('data-bank');
      if (bank === 'kbank') {
        bankDetails.innerHTML = `
          <h3>กสิกรไทย (KBank)</h3>
          <p><strong>เลขบัญชี:</strong> <span id="accNo">160-2-80805-6</span></p>
          <p><strong>ชื่อบัญชี:</strong> Promphuek Store (โยธาศักดิ์)</p>
          <p class="muted small">โอนแล้วอย่าลืมอัปโหลดสลิป แล้วกรอกฟอร์มสั่งซื้อ</p>
        `;
        currentAcc = '160-2-80805-6';
      } else {
        bankDetails.innerHTML = `
          <h3>กรุงไทย (Krungthai)</h3>
          <p><strong>เลขบัญชี:</strong> <span id="accNo">039-0-611506</span></p>
          <p><strong>ชื่อบัญชี:</strong> Promphuek Store (โยธาศักดิ์)</p>
          <p class="muted small">โอนแล้วอย่าลืมอัปโหลดสลิป แล้วกรอกฟอร์มสั่งซื้อ</p>
        `;
        currentAcc = '039-0-611506';
      }
      openModal(bankModal);
    });
  });

  /* --- Copy account button --- */
  if (copyAccBtn) {
    copyAccBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(currentAcc);
        alert('คัดลอกเลขบัญชีเรียบร้อย: ' + currentAcc);
      } catch (err) {
        const el = document.createElement('input');
        el.value = currentAcc;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        alert('คัดลอกเลขบัญชีเรียบร้อย: ' + currentAcc);
      }
    });
  }

  /* --- Order form submit (Formspree) --- */
  if (orderForm) {
    orderForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Simple front validation
      const required = orderForm.querySelectorAll('[required]');
      for (const field of required) {
        if (!field.value || (field.type === 'email' && !field.value.includes('@'))) {
          field.focus();
          alert('กรุณากรอกข้อมูลให้ครบถ้วน');
          return;
        }
      }

      const formData = new FormData(orderForm);

      try {
        const resp = await fetch(orderForm.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (resp.ok) {
          if (successEl) successEl.hidden = false;
          orderForm.reset();

          // ปิดโมดัลช้าๆ เพื่อให้เห็นข้อความสำเร็จ
          setTimeout(() => {
            if (successEl) successEl.hidden = true;
            closeModal(orderModal);
            alert('ส่งคำสั่งซื้อเรียบร้อย — กรุณารออีเมลตอบกลับจาก yotasak.2550@gmail.com');
          }, 1400);
        } else {
          let msg = 'ไม่สามารถส่งฟอร์มได้';
          try {
            const data = await resp.json();
            if (data && data.error) msg = data.error;
          } catch(_) {}
          alert('เกิดข้อผิดพลาด: ' + msg);
        }
      } catch (err) {
        console.error(err);
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่');
      }
    });
  }
})();