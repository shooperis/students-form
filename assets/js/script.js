function studentsForm(formSelector, listSelector) {
  let form = document.querySelector(formSelector);
  let studentsList = document.querySelector(listSelector);
  let rangeElement = document.querySelector('#it-skills');

  form.addEventListener('submit', function(event) {
    event.preventDefault();
    let studentInputs = form.querySelectorAll('input');

    if (formValidation(form)) {
      return;
    }

    let entryStr = '';
    let studentNames = [];
    let entryHasHiddenValues = false;

    studentInputs.forEach(input => {
      let entryName;
      let entryValue;

      if (input.type == 'radio' || input.type == 'checkbox') {
        if (input.checked == 1) {
          entryName = input.parentNode.parentNode.querySelector('legend').textContent;
          entryValue = input.value;
        }
      } else {
        if (input.value) {
          entryName = input.closest('.input-group').querySelector('label').textContent;
          entryValue = input.value;
        }
      }

      if (entryName && entryValue) {
        if (entryName == 'First name') {
          entryStr += `<h3>${entryValue}</h3>`;
          studentNames.push(entryValue);
        } else if (entryName == 'Last name') {
          entryStr += `<h4>${entryValue}</h4>`;
          studentNames.push(entryValue);
        } else if (entryName == 'Phone' || entryName == 'Email') {
          entryStr += `<p>${entryName}: <span class="personal-info" data-value="${entryValue}">***</span></p>`;
          entryHasHiddenValues = true;
        } else {
          entryStr += `<p>${entryName}: ${entryValue}</p>`;
        }
      }
    });

    if (entryStr) {
      let studentListElement = document.createElement('div');
      studentListElement.classList.add('student-item');
      studentListElement.innerHTML = entryStr;

      if (entryHasHiddenValues) {
        let hiddenInfoButton = document.createElement('button');
        hiddenInfoButton.classList.add('show-personal-info-button', 'btn', 'small-btn');
        hiddenInfoButton.textContent = 'Show personal info';
        studentListElement.append(hiddenInfoButton);

        hiddenInfoButton.addEventListener('click', function (event) {
          showStudentPersonalData(event.target);
        });
      }

      let deleteButton = document.createElement('button');
      deleteButton.classList.add('delete-button', 'btn', 'small-btn', 'secondary-btn');
      deleteButton.textContent = 'Delete this student';
      studentListElement.append(deleteButton);

      deleteButton.addEventListener('click', () => {
        studentListElement.remove();
        alert(`Student ${studentNames.join(' ')} was deleted!`, 'secondary');
      });

      studentsList.prepend(studentListElement);
      form.reset();
      alert(`Student ${studentNames.join(' ')} was added!`);

      if (studentsList.parentNode.classList.contains('hidden')) {
        studentsList.parentNode.classList.remove('hidden');
      }
    }
  });

  rangeElement.addEventListener('input', function(event) {
    showRangeValue(event.target.value, '#it-skills-value');
  });
}

function formValidation(form) {
  let validationError = false;
  let requiredInputs = form.querySelectorAll('[required]');
  let errorText = 'This field is required';

  requiredInputs.forEach(field => {
    let errorElement = field.parentNode.querySelector('.error-text');

    if (field.value) {
      field.classList.remove('error');
      if (errorElement) {
        errorElement.remove();
      }
    } else {
      field.classList.add('error');
      if (!errorElement) {
        let errorElement = document.createElement('span');
        errorElement.classList.add('error-text');
        errorElement.textContent = errorText;
        field.parentNode.insertBefore(errorElement, field.nextSibling);
      }
      validationError = true;
    }
  });

  return validationError;
}

function showRangeValue(value, rangeValueElementSelector) {
  let rangeValueElement = document.querySelector(rangeValueElementSelector);
  rangeValueElement.textContent = value;
}

function showStudentPersonalData(button) {
  className = 'showing-personal-info';
  studentEntryElement = button.parentElement;

  if (studentEntryElement.classList.contains(className)) {
    studentEntryElement.querySelectorAll('span.personal-info').forEach(element => {
      elementContentChanger(element);
    });
    button.textContent = 'Show personal info';
    studentEntryElement.classList.remove(className);
  } else {
    studentEntryElement.querySelectorAll('span.personal-info').forEach(element => {
      elementContentChanger(element);
    });
    button.textContent = 'Hide personal info';
    studentEntryElement.classList.add(className);
  }

  function elementContentChanger(element) {
    let alternativeValue = element.dataset.value;
    let value = element.textContent;

    if(alternativeValue && value) {
      element.dataset.value = value;
      element.textContent = alternativeValue;
    }
  }
}

function alert(text, styleClass) {
  let alertElement = document.createElement('span');
  if (styleClass) {
    alertElement.classList.add('alert', styleClass);
  } else {
    alertElement.classList.add('alert');
  }
  alertElement.textContent = text;
  document.body.append(alertElement);

  setTimeout(function() {
    alertElement.remove();
  }, 3000);
}

studentsForm('#students-form', '#students-list');




// PENKTA UŽDUOTIS (formos validacija naudojant JavaScript):
// 1. Priduodant formą (submit) patikrinti ar privalomi laukeliai nėra tušti.
// 2. Jeigu bent vienas privalomas formos laukelis yra tuščias:
//     2.1. Formos alert žinutėje reikia parašyti, jog ne visi laukeliai yra užpildyti. Šis tekstas turi būti raudonos spalvos.
//     2.2. Kiekvienas privalomas input laukelis, kuris nėra užpildytas:
//         2.2.1. Turi būti apvestas raudonu rėmeliu.
//         2.2.2. Šalia laukelio turi būti parašytas raudonas tekstas: „Šis laukelis yra privalomas".