/* script.js — Promphuek Store */
/* Event binding, modal handling, form submit (Formspree), and bank details */

(function () {
  const orderModal = document.getElementById('orderModal');
  const bankModal  = document.getElementById('bankModal');
  const productInput = document.getElementById('productInput');
  const bankDetails  = document.getElementById('bankDetails');
  const copyAccBtn   = document.getElementById('copyAccBtn');
  const orderForm    = document.getElementById('order-form');
  const successEl    = document.getElementById('form-success');

  let currentAcc = '';

  /* --- Toast Function --- */
  function showToast(msg) {
    let toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = msg;
    document.body.appendChild(toast);

    // แสดงผล
    setTimeout(() => toast.classList.add("show"), 50);

    // ซ่อนอัตโนมัติ
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  }

  /* --- Helpers --- */
  const openModal = (modal) => {
    if (!modal) return;
    modal.setAttribute('aria-hidden','false');
    const focusable = modal.querySelector('button, [href], input, textarea, select');
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
        showToast("คัดลอกเลขบัญชีแล้ว: " + currentAcc);
      } catch (err) {
        showToast("❌ คัดลอกไม่สำเร็จ");
      }
    });
  }

  /* --- Order form submit (Formspree) --- */
  if (orderForm) {
    orderForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Simple validation
      const required = orderForm.querySelectorAll('[required]');
      for (const field of required) {
        if (!field.value || (field.type === 'email' && !field.value.includes('@'))) {
          field.focus();
          showToast("⚠️ กรุณากรอกข้อมูลให้ครบถ้วน");
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

          setTimeout(() => {
            if (successEl) successEl.hidden = true;
            closeModal(orderModal);
            showToast("✅ ส่งคำสั่งซื้อเรียบร้อย — รออีเมลตอบกลับ");
          }, 1400);
        } else {
          let msg = 'ไม่สามารถส่งฟอร์มได้';
          try {
            const data = await resp.json();
            if (data && data.error) msg = data.error;
          } catch(_) {}
          showToast("❌ เกิดข้อผิดพลาด: " + msg);
        }
      } catch (err) {
        console.error(err);
        showToast("❌ เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่");
      }
    });
  }
})();