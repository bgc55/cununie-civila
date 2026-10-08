"use strict";

/* SLIDER — independent de formular */
(() => {
  const slider = document.getElementById("couple-slider");
  const viewport = document.getElementById("slider-viewport");
  const track = document.getElementById("slider-track");
  const previous = document.getElementById("slider-prev");
  const next = document.getElementById("slider-next");
  const dotsContainer = document.getElementById("slider-dots");

  if (
    !slider || !viewport || !track ||
    !previous || !next || !dotsContainer
  ) {
    return;
  }

  const slides = Array.from(track.children);
  if (!slides.length) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  let index = 0;
  let timer = null;
  let paused = reducedMotion.matches;
  let hovered = false;
  let focused = false;
  let visible = true;
  let gesture = null;

  const dots = slides.map((slide, slideIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute(
      "aria-label",
      `Arată fotografia ${slideIndex + 1}`
    );

    button.addEventListener("click", () => {
      showSlide(slideIndex);
      restartTimer();
    });

    return button;
  });

  dotsContainer.replaceChildren(...dots);

  function showSlide(newIndex) {
    index = (newIndex + slides.length) % slides.length;

    track.style.transform = `translateX(-${index * 100}%)`;

    slides.forEach((slide, slideIndex) => {
      slide.setAttribute(
        "aria-hidden",
        String(slideIndex !== index)
      );
    });

    dots.forEach((dot, dotIndex) => {
      if (dotIndex === index) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });
  }

  function restartTimer() {
    window.clearInterval(timer);
    timer = null;

    if (
      paused || hovered || focused || gesture ||
      !visible || document.hidden || slides.length < 2
    ) {
      return;
    }

    timer = window.setInterval(() => {
      showSlide(index + 1);
    }, 4000);
  }

  previous.addEventListener("click", () => {
    showSlide(index - 1);
    restartTimer();
  });

  next.addEventListener("click", () => {
    showSlide(index + 1);
    restartTimer();
  });

  slider.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "mouse") return;
    hovered = true;
    restartTimer();
  });

  slider.addEventListener("pointerleave", (event) => {
    if (event.pointerType !== "mouse") return;
    hovered = false;
    restartTimer();
  });

  slider.addEventListener("focusin", () => {
    focused = true;
    restartTimer();
  });

  slider.addEventListener("focusout", (event) => {
    focused = slider.contains(event.relatedTarget);
    restartTimer();
  });

  slider.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showSlide(index - 1);
      restartTimer();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      showSlide(index + 1);
      restartTimer();
    } else if (event.code === "Space" && event.target === viewport) {
      event.preventDefault();
      paused = !paused;
      restartTimer();
    }
  });

  /* Glisarea se aplică doar fotografiilor, nu săgeților. */
  viewport.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0 || gesture) return;

    gesture = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      differenceX: 0,
      horizontal: false
    };

    viewport.setPointerCapture(event.pointerId);
    restartTimer();
  });

  viewport.addEventListener("pointermove", (event) => {
    if (!gesture || event.pointerId !== gesture.id) return;

    const differenceX = event.clientX - gesture.x;
    const differenceY = event.clientY - gesture.y;

    if (!gesture.horizontal) {
      if (
        Math.abs(differenceX) < 10 ||
        Math.abs(differenceX) <= Math.abs(differenceY)
      ) {
        return;
      }

      gesture.horizontal = true;
      viewport.classList.add("is-dragging");
    }

    gesture.differenceX = differenceX;

    track.style.transform =
      `translateX(calc(-${index * 100}% + ${differenceX}px))`;
  });

  function finishGesture(event) {
    if (!gesture || event.pointerId !== gesture.id) return;

    const finished = gesture;
    gesture = null;

    viewport.classList.remove("is-dragging");

    if (viewport.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }

    const threshold = Math.min(80, viewport.clientWidth * 0.2);

    if (
      event.type === "pointerup" &&
      finished.horizontal &&
      Math.abs(finished.differenceX) > threshold
    ) {
      showSlide(index + (finished.differenceX < 0 ? 1 : -1));
    } else {
      showSlide(index);
    }

    restartTimer();
  }

  viewport.addEventListener("pointerup", finishGesture);
  viewport.addEventListener("pointercancel", finishGesture);
  viewport.addEventListener("lostpointercapture", finishGesture);

  window.addEventListener("resize", () => {
    if (gesture) {
      const pointerId = gesture.id;
      gesture = null;
      viewport.classList.remove("is-dragging");

      if (viewport.hasPointerCapture(pointerId)) {
        viewport.releasePointerCapture(pointerId);
      }
    }

    showSlide(index);
    restartTimer();
  });

  document.addEventListener("visibilitychange", restartTimer);

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      restartTimer();
    });

    observer.observe(slider);
  }

  function handleMotionChange(event) {
    if (event.matches) {
      paused = true;
      restartTimer();
    }
  }

  if (typeof reducedMotion.addEventListener === "function") {
    reducedMotion.addEventListener("change", handleMotionChange);
  }

  showSlide(0);
  restartTimer();
})();

/* FORMULAR ȘI SUPABASE */
(() => {
  const SUPABASE_URL =
    "https://vovuwsuviqeigkcklbjv.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_80Zh3VPXcPRlaZzMrQJF_w_x566T8Ux";

  const form = document.getElementById("rsvp-form");
  const countInput = document.getElementById("adult-count");
  const namesContainer = document.getElementById("adult-names");
  const decrease = document.getElementById("decrease-adults");
  const increase = document.getElementById("increase-adults");
  const childrenInput = document.getElementById("child-count");
  const messageInput = document.getElementById("message");
  const confirm = document.querySelector(".button-confirm");
  const decline = document.querySelector(".button-decline");
  const status = document.getElementById("form-message");

  if (
    !form || !countInput || !namesContainer ||
    !decrease || !increase || !childrenInput ||
    !messageInput || !confirm || !decline || !status
  ) {
    return;
  }

  let adultCount = 1;
  let submitting = false;
  let submitted = false;

  const savedNames = new Map();

  function getNames() {
    return Array.from(
      namesContainer.querySelectorAll("input")
    ).map((input) => input.value.trim());
  }

  function namesAreValid() {
    const names = getNames();

    return (
      names.length === adultCount &&
      names.every((name) => name.length > 0)
    );
  }

  function updateState() {
    const blocked = submitting || submitted;
    const valid = namesAreValid();

    confirm.disabled = !valid || blocked;
    decline.disabled = !valid || blocked;
    decrease.disabled = adultCount <= 1 || blocked;
    increase.disabled = adultCount >= 10 || blocked;
  }

  function renderNames() {
    namesContainer.querySelectorAll("input").forEach((input, index) => {
      savedNames.set(index + 1, input.value);
    });

    const fields = document.createDocumentFragment();

    for (let index = 1; index <= adultCount; index++) {
      const field = document.createElement("div");
      field.className = "form-field";

      const label = document.createElement("label");
      label.htmlFor = `adult-${index}`;
      label.textContent = `Nume adult ${index} *`;

      const input = document.createElement("input");
      input.type = "text";
      input.id = `adult-${index}`;
      input.name = `adult_name_${index}`;
      input.placeholder = "Nume și prenume";
      input.autocomplete = index === 1 ? "name" : "off";
      input.maxLength = 100;
      input.required = true;
      input.value = savedNames.get(index) || "";
      input.addEventListener("input", updateState);

      field.append(label, input);
      fields.append(field);
    }

    namesContainer.replaceChildren(fields);
    countInput.value = String(adultCount);
    updateState();
  }

  increase.addEventListener("click", () => {
    if (adultCount >= 10 || submitting || submitted) return;
    adultCount++;
    renderNames();
  });

  decrease.addEventListener("click", () => {
    if (adultCount <= 1 || submitting || submitted) return;
    adultCount--;
    renderNames();
  });

  function disableFields(disabled) {
    form.querySelectorAll("input, textarea").forEach((input) => {
      input.disabled = disabled;
    });
  }

  async function sendResponse(response) {
    const request = await fetch(`${SUPABASE_URL}/rest/v1/rsvp`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Prefer": "return=minimal"
      },

      body: JSON.stringify(response)
    });

    if (!request.ok) {
      let errorMessage = `Eroare Supabase: ${request.status}`;

      try {
        const error = await request.json();
        if (error.message) errorMessage = error.message;
      } catch {
        // Păstrăm statusul HTTP.
      }

      throw new Error(errorMessage);
    }
  }

  async function submitResponse(attendance) {
    if (submitting || submitted) return;

    if (!namesAreValid()) {
      status.textContent =
        "Te rugăm să completezi numele tuturor adulților.";
      return;
    }

    const childCount = childrenInput.value === ""
      ? 0
      : Number(childrenInput.value);

    if (!Number.isSafeInteger(childCount) || childCount < 0) {
      status.textContent =
        "Te rugăm să introduci un număr întreg de copii, minimum 0.";
      childrenInput.focus();
      return;
    }

    if (!form.reportValidity()) return;

    const response = {
      attendance,
      adult_count: adultCount,
      adults: getNames(),
      child_count: childCount,
      message: messageInput.value.trim()
    };

    submitting = true;
    disableFields(true);
    updateState();

    status.textContent = "Se trimite răspunsul...";

    try {
      await sendResponse(response);
      submitted = true;

      status.textContent = attendance
        ? "Mulțumim! Prezența a fost confirmată. 🤍"
        : "Mulțumim că ne-ai anunțat. 🤍";

    } catch (error) {
      console.error("Trimiterea RSVP a eșuat:", error);

      status.textContent =
        "Răspunsul nu a putut fi trimis. Te rugăm să încerci din nou.";

    } finally {
      submitting = false;

      if (!submitted) {
        disableFields(false);
      }

      updateState();
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (event.submitter?.value === "yes") {
      void submitResponse(true);
    } else if (event.submitter?.value === "no") {
      void submitResponse(false);
    }
  });

  renderNames();
})();