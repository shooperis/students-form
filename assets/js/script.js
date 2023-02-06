let studentsData;
const form = document.querySelector('#students-form');
const studentsList = document.querySelector('#students-list');

function studentsForm() {
  let rangeElement = document.querySelector('#it-skills');

  form.addEventListener('submit', function(event) {
    event.preventDefault();
    let thisForm = event.target;
    let studentInputs = thisForm.querySelectorAll('input');
    let formAction = form.getAttribute('data-action');

    if (formValidation(thisForm)) {
      return;
    }

    let entryDataObj = {};
    let personalInfoArray = [];

    studentInputs.forEach(input => {
      let entryId = input.name;
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
        personalInfoArray.push(entryId);
      }

      if (entryId && entryName && entryValue) {
        //Does object key already exist
        if(entryDataObj[entryId]) {

          //Create array with old value
          if (!Array.isArray(entryDataObj[entryId].value)) {
            entryDataObj[entryId] = {
              ['name']: entryName,
              ['value']: [entryDataObj[entryId].value]
            };
          }

          entryDataObj[entryId].value.push(entryValue);
        } else {
          entryDataObj[entryId] = {
            ['name']: entryName,
            ['value']: entryValue
          };
        }
      }
    });

    if (personalInfoArray.length) {
      entryDataObj['settings-personal-info'] = personalInfoArray;
    }

    if (formAction == 'edit') {
      let studentToEditId = form.getAttribute('data-edit-id');

      if (studentsData[studentToEditId]) {
        studentsData[studentToEditId] = entryDataObj;
        alert(`Student ${entryDataObj['first-name'].value} was edited!`, 'third');
      }
    } else {
      studentsData.push(entryDataObj);
      alert(`Student ${entryDataObj['first-name'].value} was added!`);
    }

    dbLocalStorage('set', studentsData);
    renderStudentsList();
    thisForm.reset();
    scrollTo(studentsList.parentElement);
  });

  form.addEventListener('reset', () => {
    form.removeAttribute('data-action');
    form.removeAttribute('data-edit-id');
    form.querySelector('button[type="submit"]').innerText = 'Save';

    form.querySelectorAll('input, .error-text').forEach(element => {
      if (element.classList.contains('error-text')) {
        element.remove();
      } else {
        element.classList.remove('error');
      }

      if (element.type == 'range') {
        showRangeValue(element.value, element);
      }
    });
  });

  rangeElement.addEventListener('input', function(event) {
    showRangeValue(event.target.value, event.target);
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

function showRangeValue(value, rangeElement) {
  rangeElement.parentElement.querySelector('output').textContent = value;
}

function showStudentPersonalData(button) {
  className = 'showing-personal-info';
  studentEntryElement = button.closest('.student-item');

  if (studentEntryElement.classList.contains(className)) {
    studentEntryElement.querySelectorAll('span.personal-info').forEach(element => {
      elementContentChanger(element);
    });
    button.textContent = 'Show personal info';
    button.classList.remove('active');
    studentEntryElement.classList.remove(className);
  } else {
    studentEntryElement.querySelectorAll('span.personal-info').forEach(element => {
      elementContentChanger(element);
    });
    button.textContent = 'Hide personal info';
    button.classList.add('active');
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

function renderStudentsList() {
  studentsList.innerHTML = '';

  if (!studentsData) {
    dbLocalStorage('get');
  }

  studentsData.forEach((student, index) => {
    let entryHTML = '';
    let entryHasHiddenValues = false;
    let entryPersonalInfoSettingsArray = [];

    if (student['settings-personal-info']) {
      entryPersonalInfoSettingsArray = student['settings-personal-info'];
    }

    Object.keys(student).forEach(function (key) {
      let entryId = key;
      let entryName = student[key].name;
      let entryValue = student[key].value;
      let entryType = typeof entryValue;

      if (entryName && entryValue) {
        if (entryType == 'object' || entryType == 'array') {
          // Remove personal info settings from showing
          if (entryName != 'settings-personal-info') {
            let listItems = entryValue.map(item => `<li>${item}</li>`).join('');
            entryHTML += `<p>${entryName}:<ul>${listItems}</ul></p>`;
          }
        } else {
          if (entryId == 'first-name') {
            entryHTML += `<h3>${entryValue}</h3>`;
          } else if (entryId == 'last-name') {
            entryHTML += `<h4>${entryValue}</h4>`;
          } else if (entryPersonalInfoSettingsArray.includes(entryId)) {
            entryHTML += `<p>${entryName}: <span class="personal-info" data-value="${entryValue}">***</span></p>`;
            entryHasHiddenValues = true;
          } else {
            entryHTML += `<p>${entryName}: ${entryValue}</p>`;
          }
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
      hiddenInfoButton.classList.add('show-personal-info-button', 'btn', 'small-btn', 'third-btn');
      hiddenInfoButton.textContent = 'Show personal info';
      buttonsContainer.append(hiddenInfoButton);

      hiddenInfoButton.addEventListener('click', function (event) {
        showStudentPersonalData(event.target);
      });
    }

    let editButton = document.createElement('button');
    editButton.classList.add('edit-button', 'btn', 'small-btn');
    editButton.textContent = 'Edit this student';
    buttonsContainer.append(editButton);

    editButton.addEventListener('click', () => {
      form.reset();

      Object.keys(student).forEach(function (key) {
        let entryId = key;
        let entryValue = student[key].value;

        form.querySelectorAll(`[name="${entryId}"]`).forEach(input => {
          if (input.type == 'checkbox' || input.type == 'radio') {
            if (entryValue.includes(input.value)) {
              input.checked = true;
            }
          } else {
            input.value = entryValue;

            if (input.type == 'range') {
              showRangeValue(entryValue, input);
            }
          }
        });
      });

      form.setAttribute('data-action', 'edit');
      form.setAttribute('data-edit-id', index);
      form.querySelector('button[type="submit"]').innerText = 'Save changes';

      scrollTo(form.parentElement);
    });

    let deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-button', 'btn', 'small-btn', 'secondary-btn');
    deleteButton.textContent = 'Delete this student';
    buttonsContainer.append(deleteButton);

    deleteButton.addEventListener('click', () => {
      studentsData.splice(index, 1);
      dbLocalStorage('set');
      studentListElement.remove();
      alert(`Student ${student['first-name'].value} was deleted!`, 'secondary');
    });

    studentsList.prepend(studentListElement);

    if (studentsList.parentNode.classList.contains('hidden')) {
      studentsList.parentNode.classList.remove('hidden');
    }
  });
}

function scrollTo(element) {
  element.scrollIntoView({behavior: "smooth"});
}

renderStudentsList();
studentsForm();