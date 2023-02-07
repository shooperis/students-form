let studentsData;
let studentToEditId = null;
const form = document.querySelector('#students-form');
const studentsList = document.querySelector('#students-list');

function studentsForm() {
  holdFormData();

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

    if (studentToEditId != null) {
      if (studentsData[studentToEditId]) {
        studentsData[studentToEditId] = entryDataObj;
        alert(`Student ${entryDataObj['first-name'].value} was edited!`, 'third');
      }
    } else {
      studentsData.push(entryDataObj);
      alert(`Student ${entryDataObj['first-name'].value} was added!`);
    }

    dbLocalStorage('set', studentsData);
    renderStudentsList(studentsData);
    thisForm.reset();
    scrollTo(studentsList.parentElement);
  });

  form.addEventListener('reset', function(event) {
    let thisForm = event.target;
    studentToEditId = null;
    localStorage.removeItem('formInputsObject');

    thisForm.querySelector('button[type="submit"]').innerText = 'Save';

    thisForm.querySelectorAll('input, .error-text').forEach(element => {
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

  form.querySelector('input[type="range"]').addEventListener('input', function(event) {
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

function renderStudentsList(filteredStudentsData = false) {
  studentsList.innerHTML = '';
  let studentsDataToRender = [];

  if (filteredStudentsData) {
    studentsDataToRender = filteredStudentsData;
  } else {
    if (!studentsData) {
      dbLocalStorage('get');
    }
    studentsDataToRender = studentsData;
  }

  if (studentsDataToRender.length) {
    studentsDataToRender.forEach((student, index) => {
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

          setDataToForm(entryId, entryValue);
        });

        studentToEditId = index;
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
    });
  } else {
    let noDataElement = document.createElement('div');
    noDataElement.classList.add('no-data');
    noDataElement.textContent = 'No students found';
    studentsList.prepend(noDataElement);
  }
}

function setDataToForm(entryId, entryValue) {
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
}

function scrollTo(element) {
  element.scrollIntoView({behavior: "smooth"});
}

function renderFiltersForm(studentsFilterFormSelector) {
  const studentsFilterForm = document.querySelector(studentsFilterFormSelector);
  let studentFormInputsArray = [];

  form.querySelectorAll('input').forEach(input => {
    let inputId = input.name;
    let inputName;

    if (!input.dataset.personalInfo) {
      if (input.type == 'radio' || input.type == 'checkbox') {
        inputName = input.parentNode.parentNode.querySelector('legend').textContent; 
      } else {
        inputName = input.closest('.input-group').querySelector('label').textContent;
      }
      studentFormInputsArray.push({'id': inputId, 'name': inputName});
    }
  });

  let studentFormInputsUniqueArray = studentFormInputsArray.filter((value, index) => {
    let _value = JSON.stringify(value);
    return index === studentFormInputsArray.findIndex(obj => {
      return JSON.stringify(obj) === _value;
    });
  });

  let studentsFilterFormSelect = studentsFilterForm.querySelector('#fields');
  studentFormInputsUniqueArray.forEach(element => {
    let optionElement = document.createElement('option');
    optionElement.value = element.id;
    optionElement.textContent = element.name;
    studentsFilterFormSelect.append(optionElement);
  });

  document.querySelector('#show-filters-button').addEventListener('click', function (event) {
    toggleFilter(event.target);
  });

  function toggleFilter(button) {
    button.classList.toggle('active');
    document.querySelector('#students-filter-wrapper').classList.toggle('hidden');
  }

  studentsFilterForm.addEventListener('submit', function(event) {
    event.preventDefault();
    let thisForm = event.target;
    let keywords = thisForm.keywords.value.toLowerCase();
    let field = thisForm.fields.value;

    if (field) {
      let filteredStudentsResult = studentsData.filter(student => {
        let studentFieldValue = student[field].value;
        let studentFieldValueType = typeof studentFieldValue;

        if (studentFieldValueType == 'object' || studentFieldValueType == 'array') {
          let studentFieldValueLowered = studentFieldValue.map(element => {
            return element.toLowerCase();
          });
          studentFieldValue = studentFieldValueLowered;
        } else {
          studentFieldValue = studentFieldValue.toLowerCase();
        }

        return studentFieldValue.includes(keywords);
      });

      renderStudentsList(filteredStudentsResult);
    } else {
      renderStudentsList(studentsData);
      toggleFilter(document.querySelector('#show-filters-button'));
      thisForm.reset();
    }

    scrollTo(studentsList.parentElement);
  });
}

function holdFormData() {
  formInputsObject = JSON.parse(localStorage.getItem('formInputsObject'));

  if (!formInputsObject) {
    formInputsObject = {};
  }

  Object.keys(formInputsObject).forEach(function (key) {
    let entryId = key;
    let entryValue = formInputsObject[key];
    setDataToForm(entryId, entryValue);
  });
  
  // Hold form inputs data
  form.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', (event) => {
      if (studentToEditId == null) {
        let inputName = event.target.name;
        let inputValue = event.target.value;
        let inputType = event.target.type;

        if(inputType == 'checkbox') {
          formInputsObject[inputName] = [];
          form.querySelectorAll(`input[name='${inputName}']:checked`).forEach(selectedCheckBoxes => {
            formInputsObject[inputName].push(selectedCheckBoxes.value);
          });
        } else {
          formInputsObject[inputName] = inputValue;
        }

        localStorage.setItem('formInputsObject', JSON.stringify(formInputsObject));
      }
    });
  });
}

renderStudentsList(studentsData);
studentsForm();
renderFiltersForm('#students-filter');