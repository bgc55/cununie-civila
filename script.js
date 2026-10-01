document.addEventListener("DOMContentLoaded", () => {

  /* ========================================
     ELEMENTE
  ======================================== */

  const form = document.getElementById("rsvp-form");

  const adultCountInput = document.getElementById("adult-count");
  const decreaseButton = document.getElementById("decrease-adults");
  const increaseButton = document.getElementById("increase-adults");

  const adultNamesContainer = document.getElementById("adult-names");

  const childCountInput = document.getElementById("child-count");
  const messageInput = document.getElementById("message");

  const confirmButton = document.querySelector(".button-confirm");
  const declineButton = document.querySelector(".button-decline");

  const formMessage = document.getElementById("form-message");


  /* ========================================
     CONFIGURARE
  ======================================== */

  const MIN_ADULTS = 1;
  const MAX_ADULTS = 10;

  let adultCount = 1;


  /* ========================================
     CREEAZĂ CÂMP PENTRU UN ADULT
  ======================================== */

  function createAdultField(number) {

    const field = document.createElement("div");

    field.className = "form-field";
    field.dataset.adult = number;


    const label = document.createElement("label");

    label.htmlFor = `adult-${number}`;
    label.textContent = `Nume adult ${number} *`;


    const input = document.createElement("input");

    input.type = "text";
    input.id = `adult-${number}`;
    input.name = `adult_name_${number}`;

    input.placeholder = "Nume și prenume";

    input.maxLength = 100;
    input.required = true;

    input.autocomplete = "off";


    input.addEventListener(
      "input",
      updateFormState
    );


    field.appendChild(label);
    field.appendChild(input);


    return field;
  }


  /* ========================================
     ACTUALIZEAZĂ CONTORUL
  ======================================== */

  function updateCounter() {

    adultCountInput.value = adultCount;


    decreaseButton.disabled =
      adultCount <= MIN_ADULTS;


    increaseButton.disabled =
      adultCount >= MAX_ADULTS;

  }


  /* ========================================
     BUTON +
  ======================================== */

  increaseButton.addEventListener("click", () => {

    if (adultCount >= MAX_ADULTS) {
      return;
    }


    adultCount++;


    const newField =
      createAdultField(adultCount);


    adultNamesContainer.appendChild(newField);


    updateCounter();
    updateFormState();


    const newInput =
      document.getElementById(
        `adult-${adultCount}`
      );


    newInput.focus();

  });


  /* ========================================
     BUTON -
  ======================================== */

  decreaseButton.addEventListener("click", () => {

    if (adultCount <= MIN_ADULTS) {
      return;
    }


    const lastField =
      adultNamesContainer.querySelector(
        `[data-adult="${adultCount}"]`
      );


    if (lastField) {
      lastField.remove();
    }


    adultCount--;


    updateCounter();
    updateFormState();

  });


  /* ========================================
     VERIFICĂ NUMELE
  ======================================== */

  function allAdultNamesCompleted() {

    const inputs =
      adultNamesContainer.querySelectorAll(
        'input[type="text"]'
      );


    return Array
      .from(inputs)
      .every(
        input =>
          input.value.trim().length >= 2
      );

  }


  /* ========================================
     ACTUALIZEAZĂ BUTOANELE
  ======================================== */

  function updateFormState() {

    confirmButton.disabled =
      !allAdultNamesCompleted();


    /*
      Refuzul nu necesită completarea
      numelor participanților.
    */

    declineButton.disabled = false;

  }


  /* ========================================
     PRIMUL ADULT
  ======================================== */

  const firstAdultInput =
    document.getElementById("adult-1");


  if (firstAdultInput) {

    firstAdultInput.addEventListener(
      "input",
      updateFormState
    );

  }


  /* ========================================
     NUMĂR COPII
  ======================================== */

  childCountInput.addEventListener("input", () => {

    if (childCountInput.value === "") {
      return;
    }


    let value =
      parseInt(childCountInput.value, 10);


    if (
      Number.isNaN(value) ||
      value < 0
    ) {

      value = 0;

    }


    childCountInput.value = value;

  });


  /* ========================================
     CONFIRMARE PREZENȚĂ
  ======================================== */

  confirmButton.addEventListener("click", () => {

    if (!allAdultNamesCompleted()) {
      return;
    }


    const adultInputs =
      adultNamesContainer.querySelectorAll(
        'input[type="text"]'
      );


    const adults =
      Array
        .from(adultInputs)
        .map(
          input =>
            input.value.trim()
        );


    const response = {

      attendance: true,

      adultCount: adultCount,

      adults: adults,

      childCount:
        Number(childCountInput.value) || 0,

      message:
        messageInput.value.trim(),

      submittedAt:
        new Date().toISOString()

    };


    console.log(
      "CONFIRMARE:",
      response
    );


    formMessage.textContent =
      "Mulțumim! Confirmarea este pregătită pentru trimitere.";

  });


  /* ========================================
     NU POATE PARTICIPA
  ======================================== */

  declineButton.addEventListener("click", () => {

    const response = {

      attendance: false,

      message:
        messageInput.value.trim(),

      submittedAt:
        new Date().toISOString()

    };


    console.log(
      "NU PARTICIPĂ:",
      response
    );


    formMessage.textContent =
      "Mulțumim că ne-ai anunțat.";

  });


  /* ========================================
     PREVENIM TRIMITEREA REALĂ
     PÂNĂ AVEM BACKEND
  ======================================== */

  form.addEventListener("submit", (event) => {

    event.preventDefault();

  });


  /* ========================================
     STAREA INIȚIALĂ
  ======================================== */

  updateCounter();
  updateFormState();

});