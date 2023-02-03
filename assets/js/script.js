let studentsData;

function studentsForm(formSelector) {
  let form = document.querySelector(formSelector);
  let rangeElement = document.querySelector('#it-skills');

  form.addEventListener('submit', function(event) {
    event.preventDefault();
    let thisForm = event.target;
    let studentInputs = thisForm.querySelectorAll('input');

    if (formValidation(thisForm)) {
      return;
    }

    let entryDataObj = {};
    let personalInfoArray = [];

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

      if (input.dataset.personalInfo == 'true') {
        personalInfoArray.push(entryName);
      }

      if (entryName && entryValue) {
        //Does object key already exist
        if(entryDataObj[entryName]) {

          //Create array with old value
          if (!Array.isArray(entryDataObj[entryName])) {
            entryDataObj[entryName] = [entryDataObj[entryName]];
          }

          entryDataObj[entryName].push(entryValue);
        } else {
          entryDataObj[entryName] = entryValue;
        }
      }
    });

    if (personalInfoArray.length) {
      entryDataObj['settings-personal-info'] = personalInfoArray;
    }

    studentsData.push(entryDataObj);
    dbLocalStorage('set', studentsData);
    alert(`Student ${entryDataObj['First name']} was added!`);
    renderStudensList('#students-list');
    thisForm.reset();
  });

  rangeElement.addEventListener('input', function(event) {
    showRangeValue(event.target.value, '#it-skills-value');
  });
}

function formValidation(form) {
  let validationError = false;
  let requiredInputs = form.querySelectorAll('[required]');

  requiredInputs.forEach(field => {
    let errorElement = field.parentNode.querySelector('.error-text');
    let errorMessage = '';
    let fieldMinLength = field.dataset.vldtMinLength;
    let fieldMaxLength = field.dataset.vldtMaxLength;
    let fieldMinNumb = field.dataset.vldtMinNumb;
    let fieldMaxNumb = field.dataset.vldtMaxNumb;
    
    if (!field.value) {
      errorMessage = field.dataset.vldtMsgRequired;
    } else {

      if (fieldMinLength && field.value.length < fieldMinLength) {
        errorMessage = field.dataset.vldtMsgMinLength;
      }

      if (fieldMaxLength && field.value.length > fieldMaxLength) {
        errorMessage = field.dataset.vldtMsgMaxLength;
      }

      if (fieldMinNumb && Number(field.value) < fieldMinNumb) {
        errorMessage = field.dataset.vldtMsgMinNumb;
      }

      if (fieldMaxNumb && Number(field.value) > fieldMaxNumb) {
        errorMessage = field.dataset.vldtMsgMaxNumb;
      }

      if (field.type == 'email') {
        if (!field.value.includes('@') || !field.value.includes('.')) {
          errorMessage = field.dataset.vldtMsgEmail;
        }
      }
    }

    if (errorMessage) {
      field.classList.add('error');
      if (!errorElement) {
        let errorElement = document.createElement('span');
        errorElement.classList.add('error-text');
        errorElement.textContent = errorMessage;
        field.parentNode.insertBefore(errorElement, field.nextSibling);
      } else  {
        errorElement.textContent = errorMessage;
      }

      validationError = true;
    } else {
      field.classList.remove('error');
      if (errorElement) {
        errorElement.remove();
      }
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
  studentEntryElement = button.closest('.student-item');

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

function dbLocalStorage(action) {
  if (action == 'get') {
    studentsData = JSON.parse(localStorage.getItem('studentsData'));
    if (!studentsData) {
      studentsData = [];
      dbLocalStorage('set');
    }
  } else if (action == 'set') {
    localStorage.setItem('studentsData', JSON.stringify(studentsData));
  }
}

function renderStudensList(listSelector) {
  let studentsList = document.querySelector(listSelector);
  studentsList.innerHTML = '';

  if (!studentsData) {
    dbLocalStorage('get');
  }

  studentsData.forEach(student => {
    let entryHTML = '';
    let entryHasHiddenValues = false;
    let entryPersonalInfoSettingsArray = [];

    if (student['settings-personal-info']) {
      entryPersonalInfoSettingsArray = student['settings-personal-info'];
    }

    Object.keys(student).forEach(function (key) {
      let entryName = key;
      let entryValue = student[key];
      let entryType = typeof entryValue;

      if (entryType == 'object' || entryType == 'array') {
        // Remove personal info settings from showing
        if (entryName != 'settings-personal-info') {
          let listItems = entryValue.map(item => `<li>${item}</li>`).join('');
          entryHTML += `<p>${entryName}:<ul>${listItems}</ul></p>`;
        }
      } else {
        if (entryName == 'First name') {
          entryHTML += `<h3>${entryValue}</h3>`;
        } else if (entryName == 'Last name') {
          entryHTML += `<h4>${entryValue}</h4>`;
        } else if (entryPersonalInfoSettingsArray.includes(entryName)) {
          entryHTML += `<p>${entryName}: <span class="personal-info" data-value="${entryValue}">***</span></p>`;
          entryHasHiddenValues = true;
        } else {
          entryHTML += `<p>${entryName}: ${entryValue}</p>`;
        }
      }
    });

    let studentListElement = document.createElement('div');
    studentListElement.classList.add('student-item');
    studentListElement.innerHTML = `<div class='content'>${entryHTML}</div>`;

    let buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('buttons-wrapper');
    studentListElement.append(buttonsContainer);

    if (entryHasHiddenValues) {
      let hiddenInfoButton = document.createElement('button');
      hiddenInfoButton.classList.add('show-personal-info-button', 'btn', 'small-btn');
      hiddenInfoButton.textContent = 'Show personal info';
      buttonsContainer.append(hiddenInfoButton);

      hiddenInfoButton.addEventListener('click', function (event) {
        showStudentPersonalData(event.target);
      });
    }

    let deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-button', 'btn', 'small-btn', 'secondary-btn');
    deleteButton.textContent = 'Delete this student';
    buttonsContainer.append(deleteButton);

    deleteButton.addEventListener('click', () => {
      studentsData = studentsData.filter(entry => {
        return entry !== student;
      });
      dbLocalStorage('set');
      studentListElement.remove();
      alert(`Student ${student['First name']} was deleted!`, 'secondary');
    });

    studentsList.prepend(studentListElement);

    if (studentsList.parentNode.classList.contains('hidden')) {
      studentsList.parentNode.classList.remove('hidden');
    }
  });
}

renderStudensList('#students-list');
studentsForm('#students-form', '#students-list');