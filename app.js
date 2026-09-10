(() => {
  "use strict";

  const forms = Array.from(document.querySelectorAll("[data-landing-form]"));
  const success = document.getElementById("success");
  const sticky = document.getElementById("sticky-cta");
  const hero = document.getElementById("lead-hero");
  const tabs = Array.from(document.querySelectorAll(".case-tab"));
  const panels = Array.from(document.querySelectorAll(".case-panel"));

  const utm = {};
  const params = new URLSearchParams(window.location.search);
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "yclid"].forEach((key) => {
    const val = params.get(key);
    if (val) utm[key] = val;
  });

  function normalizePhoneInput(raw) {
    const digits = String(raw || "").replace(/\D/g, "");
    if (!digits) return "";
    let d = digits;
    if (d.startsWith("8") && d.length === 11) d = "7" + d.slice(1);
    if (d.startsWith("9") && d.length === 10) d = "7" + d;
    if (d.length === 11 && d.startsWith("7")) {
      return `+7 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9, 11)}`;
    }
    return raw;
  }

  function showError(form, msg) {
    const el = form.querySelector("[data-form-error]");
    if (!el) return;
    el.textContent = msg;
    el.classList.remove("is-hidden");
  }

  function clearError(form) {
    const el = form.querySelector("[data-form-error]");
    if (!el) return;
    el.textContent = "";
    el.classList.add("is-hidden");
  }

  async function submitLead(payload) {
    // 1) Свой Python-сервер (локально / VPS / Render)
    try {
      const resp = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.ok) return data;
      }
    } catch (_err) {
      /* static host without API */
    }

    // 2) GitHub Pages / статика: заявка на почту (FormSubmit)
    const resp = await fetch("https://formsubmit.co/ajax/price@gazony.ru", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        _subject: "Заявка: озеленение · получить предложение",
        _template: "table",
        name: payload.name,
        phone: payload.phone,
        comment: payload.comment || "",
        landing_id: payload.landing_id,
        landing_url: payload.landing_url,
        utm: JSON.stringify(payload.utm || {}),
        source: payload.source,
      }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || data.success === "false" || data.success === false) {
      throw new Error(data.message || "Не удалось отправить заявку");
    }
    return { ok: true };
  }

  function activateCase(slug) {
    tabs.forEach((tab) => {
      const on = tab.dataset.case === slug;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
    panels.forEach((panel) => {
      const on = panel.dataset.case === slug;
      panel.classList.toggle("is-active", on);
      if (on) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "");
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activateCase(tab.dataset.case));
  });

  forms.forEach((form) => {
    const phone = form.querySelector('input[name="phone"]');
    if (phone) {
      phone.addEventListener("blur", () => {
        phone.value = normalizePhoneInput(phone.value);
      });
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearError(form);

      const nameInput = form.querySelector('input[name="name"]');
      const phoneInput = form.querySelector('input[name="phone"]');
      const commentInput = form.querySelector('input[name="comment"]');
      const consentInput = form.querySelector('input[name="consent"]');
      const btn = form.querySelector('button[type="submit"]');

      const name = (nameInput?.value || "").trim();
      const phoneVal = (phoneInput?.value || "").trim();
      const comment = (commentInput?.value || "").trim();
      const consent = Boolean(consentInput?.checked);

      if (!consent) {
        showError(form, "Нужно согласие на обработку данных");
        return;
      }
      if (name.length < 2) {
        showError(form, "Укажите имя");
        nameInput?.focus();
        return;
      }
      if (!phoneVal) {
        showError(form, "Укажите телефон");
        phoneInput?.focus();
        return;
      }

      const prev = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Отправляем…";

      const payload = {
        name,
        phone: phoneVal,
        comment: comment || null,
        consent,
        landing_id: "ozelenenie-season-end",
        landing_url: window.location.href.split("#")[0],
        page_path: window.location.pathname || "/",
        source: "yandex_direct",
        service_label: "Озеленение · получить предложение",
        area_label: "от 100 м²",
        utm,
        referrer: document.referrer || null,
      };

      try {
        await submitLead(payload);

        document.getElementById("why")?.classList.add("is-hidden");
        document.getElementById("cases")?.classList.add("is-hidden");
        document.getElementById("includes")?.classList.add("is-hidden");
        document.getElementById("how")?.classList.add("is-hidden");
        document.getElementById("doubts")?.classList.add("is-hidden");
        document.getElementById("lead-bottom")?.classList.add("is-hidden");
        hero?.classList.add("is-hidden");
        sticky?.classList.remove("is-visible");
        success?.classList.remove("is-hidden");
        success?.scrollIntoView({ behavior: "smooth", block: "start" });

        if (typeof window.ym === "function") {
          window.ym(0, "reachGoal", "lead_submit");
        }
      } catch (err) {
        showError(form, err.message || "Ошибка сети. Позвоните нам или попробуйте ещё раз.");
        btn.disabled = false;
        btn.textContent = prev;
      }
    });
  });

  if (sticky && hero) {
    const io = new IntersectionObserver(
      ([entry]) => {
        sticky.classList.toggle("is-visible", !entry.isIntersecting);
      },
      { threshold: 0.15 }
    );
    io.observe(hero);
  }
})();
