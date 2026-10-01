document.addEventListener("DOMContentLoaded", () => {

  /* =========================================
     CONFIGURARE SUPABASE
  ========================================= */

  const SUPABASE_URL =
    "https://vovuwsuviqeigkcklbjv.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_80Zh3VPXcPRlaZzMrQJF_w_x566T8Ux";


  /* =========================================
     ELEMENTELE FORMULARULUI
  ========================================= */

  const form =
    document.getElementById("rsvp-form");

  const adultCountInput =
    document.getElementById("adult-count");

  const adultNamesContainer =
    document.getElementById("adult-names");

  const decreaseAdultsButton =
    document.getElementById("decrease-adults");

  const increaseAdultsButton =
    document.getElementById("increase-adults");

  const childCountInput =
    document.getElementById("child-count");

  const messageInput =
    document.getElementById("message");

  const confirmButton =
    document.querySelector(".button-confirm");

  const declineButton =
    document.querySelector(".button-decline");

  const formMessage =
    document.getElementById("form-message");


  /* =========================================
     CONFIGURARE FORMULAR
  ========================================= */

  const MIN_ADULTS = 1;
  const MAX_ADULTS = 10;

  let adultCount = MIN_ADULTS;

  let isSubmitting = false;

  // Devine true DOAR după ce Supabase
  // confirmă salvarea răspunsului.
  let hasSubmitted = false;


  /* =========================================
     CREAREA CÂMPURILOR PENTRU ADULȚI
  ========================================= */

  function renderAdultFields() {

    const existingValues = Array.from(
      adultNamesContainer.querySelectorAll(
        'input[type="text"]'
      )
    ).map((input) => input.value);


    adultNamesContainer.innerHTML = "";


    for (let i = 1; i <= adultCount; i++) {

      const field =
        document.createElement("div");

      field.className = "form-field";


      const label =
        document.createElement("label");

      label.setAttribute(
        "for",
        `adult-${i}`
      );

      label.textContent =
        `Nume adult ${i} *`;


      const input =
        document.createElement("input");

      input.type = "text";

      input.id =
        `adult-${i}`;

      input.name =
        `adult_name_${i}`;

      input.placeholder =
        "Nume și prenume";

      input.maxLength = 100;

      input.required = true;


      if (existingValues[i - 1]) {

        input.value =
          existingValues[i - 1];

      }


      input.addEventListener(
        "input",
        updateFormState
      );


      field.appendChild(label);

      field.appendChild(input);

      adultNamesContainer.appendChild(
        field
      );
    }


    adultCountInput.value =
      adultCount;


    decreaseAdultsButton.disabled =
      adultCount <= MIN_ADULTS ||
      hasSubmitted;


    increaseAdultsButton.disabled =
      adultCount >= MAX_ADULTS ||
      hasSubmitted;


    updateFormState();
  }


  /* =========================================
     BUTONUL +
  ========================================= */

  increaseAdultsButton.addEventListener(
    "click",
    () => {

      if (
        adultCount >= MAX_ADULTS ||
        hasSubmitted ||
        isSubmitting
      ) {
        return;
      }


      adultCount++;

      renderAdultFields();
    }
  );


  /* =========================================
     BUTONUL -
  ========================================= */

  decreaseAdultsButton.addEventListener(
    "click",
    () => {

      if (
        adultCount <= MIN_ADULTS ||
        hasSubmitted ||
        isSubmitting
      ) {
        return;
      }


      adultCount--;

      renderAdultFields();
    }
  );


  /* =========================================
     CITIRE NUME ADULȚI
  ========================================= */

  function getAdultNames() {

    const inputs =
      adultNamesContainer.querySelectorAll(
        'input[type="text"]'
      );


    return Array.from(inputs).map(
      (input) => input.value.trim()
    );
  }


  /* =========================================
     VALIDARE NUME ADULȚI
  ========================================= */

  function adultNamesAreValid() {

    const names =
      getAdultNames();


    return (
      names.length === adultCount &&
      names.every(
        (name) => name.length > 0
      )
    );
  }


  /* =========================================
     STAREA BUTOANELOR
  ========================================= */

  function updateFormState() {

    const valid =
      adultNamesAreValid();


    confirmButton.disabled =
      !valid ||
      isSubmitting ||
      hasSubmitted;


    declineButton.disabled =
      !valid ||
      isSubmitting ||
      hasSubmitted;


    decreaseAdultsButton.disabled =
      adultCount <= MIN_ADULTS ||
      isSubmitting ||
      hasSubmitted;


    increaseAdultsButton.disabled =
      adultCount >= MAX_ADULTS ||
      isSubmitting ||
      hasSubmitted;
  }


  /* =========================================
     CITIRE NUMĂR COPII
  ========================================= */

  function getChildCount() {

    const value =
      parseInt(
        childCountInput.value,
        10
      );


    if (
      Number.isNaN(value) ||
      value < 0
    ) {

      return 0;

    }


    return value;
  }


  /* =========================================
     CONSTRUIREA RĂSPUNSULUI
  ========================================= */

  function buildResponse(attendance) {

    return {

      attendance: attendance,

      adult_count: adultCount,

      adults: getAdultNames(),

      child_count: getChildCount(),

      message:
        messageInput.value.trim()

    };
  }


  /* =========================================
     TRIMITERE CĂTRE SUPABASE
  ========================================= */

  async function sendToSupabase(response) {

    const request = await fetch(
      `${SUPABASE_URL}/rest/v1/rsvp`,
      {

        method: "POST",

        headers: {

          "Content-Type":
            "application/json",

          "apikey":
            SUPABASE_KEY,

          "Authorization":
            `Bearer ${SUPABASE_KEY}`,

          "Prefer":
            "return=minimal"
        },

        body:
          JSON.stringify(response)

      }
    );


    if (!request.ok) {

      let errorMessage =
        `Eroare Supabase: ${request.status}`;


      try {

        const error =
          await request.json();


        console.error(
          "Eroare Supabase:",
          error
        );


        if (error.message) {

          errorMessage =
            error.message;

        }

      } catch (error) {

        console.error(error);

      }


      throw new Error(
        errorMessage
      );
    }


    return true;
  }


  /* =========================================
     BLOCARE FORMULAR DUPĂ SUCCES
  ========================================= */

  function lockForm() {

    const inputs =
      form.querySelectorAll(
        "input, textarea"
      );


    inputs.forEach(
      (input) => {

        input.disabled = true;

      }
    );


    confirmButton.disabled = true;

    declineButton.disabled = true;

    increaseAdultsButton.disabled = true;

    decreaseAdultsButton.disabled = true;
  }


  /* =========================================
     TRIMITEREA RSVP-ULUI
  ========================================= */

  async function submitRSVP(attendance) {

    // Previne click dublu și retrimiterea
    if (
      isSubmitting ||
      hasSubmitted
    ) {
      return;
    }


    /* -------------------------
       VALIDARE NUME
    ------------------------- */

    if (!adultNamesAreValid()) {

      formMessage.textContent =
        "Te rugăm să completezi numele tuturor adulților.";

      return;
    }


    /* -------------------------
       VALIDARE COPII
    ------------------------- */

    if (
      childCountInput.value !== "" &&
      (
        Number.isNaN(
          Number(childCountInput.value)
        ) ||
        Number(childCountInput.value) < 0
      )
    ) {

      formMessage.textContent =
        "Numărul de copii nu este valid.";

      return;
    }


    const response =
      buildResponse(attendance);


    console.log(
      attendance
        ? "CONFIRMARE:"
        : "NU PARTICIPĂ:",
      response
    );


    /* -------------------------
       ÎNCEPE TRIMITEREA
    ------------------------- */

    isSubmitting = true;

    updateFormState();


    formMessage.textContent =
      "Se trimite răspunsul...";


    try {

      /* -------------------------
         SUPABASE
      ------------------------- */

      await sendToSupabase(
        response
      );


      /* -------------------------
         SUCCES
      ------------------------- */

      hasSubmitted = true;


      if (attendance) {

        formMessage.textContent =
          "Mulțumim! Prezența a fost confirmată. 🤍";

      } else {

        formMessage.textContent =
          "Mulțumim că ne-ai anunțat. 🤍";

      }


      console.log(
        "RSVP salvat cu succes în Supabase."
      );


      /* -------------------------
         BLOCĂM FORMULARUL
      ------------------------- */

      lockForm();


    } catch (error) {

      /* -------------------------
         EROARE
      ------------------------- */

      console.error(
        "Trimiterea RSVP a eșuat:",
        error
      );


      formMessage.textContent =
        "Răspunsul nu a putut fi trimis. Te rugăm să încerci din nou.";


    } finally {

      isSubmitting = false;


      // Reactivăm formularul doar dacă
      // NU s-a trimis cu succes.
      if (!hasSubmitted) {

        updateFormState();

      }
    }
  }


  /* =========================================
     CONFIRM PREZENȚA
  ========================================= */

  confirmButton.addEventListener(
    "click",
    async (event) => {

      event.preventDefault();

      await submitRSVP(true);

    }
  );


  /* =========================================
     NU POT PARTICIPA
  ========================================= */

  declineButton.addEventListener(
    "click",
    async (event) => {

      event.preventDefault();

      await submitRSVP(false);

    }
  );


  /* =========================================
     PREVENIM SUBMIT-UL STANDARD HTML
  ========================================= */

  form.addEventListener(
    "submit",
    (event) => {

      event.preventDefault();

    }
  );


  /* =========================================
     VALIDARE NUMĂR COPII
  ========================================= */

  childCountInput.addEventListener(
    "input",
    () => {

      if (
        childCountInput.value !== "" &&
        Number(childCountInput.value) < 0
      ) {

        childCountInput.value = 0;

      }

    }
  );


  /* =========================================
     PORNIRE
  ========================================= */

  renderAdultFields();

  updateFormState();

});