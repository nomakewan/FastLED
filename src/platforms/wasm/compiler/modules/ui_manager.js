
export class UiManager {
    constructor(uiControlsId) {
        this.uiElements = {};
        this.previousUiState = {};
        this.uiControlsId = uiControlsId;
    }

    processUiChanges(uiUpdateCallback) {
        const changes = {};
        let hasChanges = false;
        for (const id in this.uiElements) {
            const element = this.uiElements[id];
            let currentValue;
            if (element.type === 'checkbox') {
                currentValue = element.checked;
            } else if (element.type === 'submit') {
                let attr = element.getAttribute('data-pressed');
                currentValue = attr === 'true';
            } else if (element.type === 'number') {
                currentValue = parseFloat(element.value);
            } else {
                currentValue = parseFloat(element.value);
            }
            if (this.previousUiState[id] !== currentValue) {
                changes[id] = currentValue;
                hasChanges = true;
                this.previousUiState[id] = currentValue;
            }
        }
        if (hasChanges) {
            const data = JSON.stringify(changes);
            uiUpdateCallback(data);
        }
    }

    addUiElements(jsonData) {
        console.log("UI elements added:", jsonData);


        const uiControlsContainer = document.getElementById(this.uiControlsId) || this.createUiControlsContainer();

        let foundUi = false;
        jsonData.forEach(data => {
            console.log("data:", data);
            const group = data.group;
            const hasGroup = group !== "" && group !== undefined;
            if (hasGroup) {
                console.log(`Group ${group} found, for item ${data.name}`);
            }

            if (data.type === 'title') {
                this.setTitle(data);
                return; // Skip creating UI control for title
            }

            if (data.type === 'description') {
                this.setDescription(data);
                return; // Skip creating UI control for description
            }

            let control;
            if (data.type === 'slider') {
                control = this.createSlider(data);
            } else if (data.type === 'checkbox') {
                control = this.createCheckbox(data);
            } else if (data.type === 'button') {
                control = this.createButton(data);
            } else if (data.type === 'number') {
                control = this.createNumberField(data);
            }

            if (control) {
                foundUi = true;
                uiControlsContainer.appendChild(control);
                if (data.type === 'button') {
                    this.uiElements[data.id] = control.querySelector('button');
                } else {
                    this.uiElements[data.id] = control.querySelector('input');
                }
                this.previousUiState[data.id] = data.value;
            }
        });
        if (foundUi) {
            console.log("UI elements added, showing UI controls container");
            uiControlsContainer.classList.add('active');
        }
    }

    createUiControlsContainer() {
        const container = document.getElementById(this.uiControlsId);
        if (!container) {
            error('UI controls container not found in the HTML');
        }
        return container;
    }

    setTitle(titleData) {
        if (titleData && titleData.text) {
            document.title = titleData.text;
            const h1Element = document.querySelector('h1');
            if (h1Element) {
                h1Element.textContent = titleData.text;
            } else {
                console.warn("H1 element not found in document");
            }
        } else {
            console.warn("Invalid title data received:", titleData);
        }
    }

    setDescription(descData) {
        if (descData && descData.text) {
            // Create or find description element
            let descElement = document.querySelector('#fastled-description');
            if (!descElement) {
                descElement = document.createElement('div');
                descElement.id = 'fastled-description';
                // Insert after h1
                const h1Element = document.querySelector('h1');
                if (h1Element && h1Element.nextSibling) {
                    h1Element.parentNode.insertBefore(descElement, h1Element.nextSibling);
                } else {
                    console.warn("Could not find h1 element to insert description after");
                    document.body.insertBefore(descElement, document.body.firstChild);
                }
            }
            descElement.textContent = descData.text;
        } else {
            console.warn("Invalid description data received:", descData);
        }
    }

    createNumberField(element) {
        const controlDiv = document.createElement('div');
        controlDiv.className = 'ui-control';

        const label = document.createElement('label');
        label.textContent = element.name;
        label.htmlFor = `number-${element.id}`;

        const numberInput = document.createElement('input');
        numberInput.type = 'number';
        numberInput.id = `number-${element.id}`;
        numberInput.value = element.value;
        numberInput.min = element.min;
        numberInput.max = element.max;
        numberInput.step = (element.step !== undefined) ? element.step : 'any';

        controlDiv.appendChild(label);
        controlDiv.appendChild(numberInput);

        return controlDiv;
    }

    createSlider(element) {
        const controlDiv = document.createElement('div');
        controlDiv.className = 'ui-control';

        const labelValueContainer = document.createElement('div');
        labelValueContainer.style.display = 'flex';
        labelValueContainer.style.justifyContent = 'space-between';
        labelValueContainer.style.width = '100%';

        const label = document.createElement('label');
        label.textContent = element.name;
        label.htmlFor = `slider-${element.id}`;

        const valueDisplay = document.createElement('span');
        valueDisplay.textContent = element.value;

        labelValueContainer.appendChild(label);
        labelValueContainer.appendChild(valueDisplay);

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.id = `slider-${element.id}`;
        slider.min = Number.parseFloat(element.min);
        slider.max = Number.parseFloat(element.max);
        slider.value = Number.parseFloat(element.value);
        slider.step = Number.parseFloat(element.step);
        setTimeout(() => {
            // Sets the slider value, for some reason we have to do it
            // next frame.
            slider.value = Number.parseFloat(element.value);
            valueDisplay.textContent = slider.value;
        }, 0);


        slider.addEventListener('input', function () {
            valueDisplay.textContent = this.value;
        });

        controlDiv.appendChild(labelValueContainer);
        controlDiv.appendChild(slider);

        return controlDiv;
    }

    createCheckbox(element) {
        const controlDiv = document.createElement('div');
        controlDiv.className = 'ui-control';

        const label = document.createElement('label');
        label.textContent = element.name;
        label.htmlFor = `checkbox-${element.id}`;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `checkbox-${element.id}`;
        checkbox.checked = element.value;

        const flexContainer = document.createElement('div');
        flexContainer.style.display = 'flex';
        flexContainer.style.alignItems = 'center';
        flexContainer.style.justifyContent = 'space-between';

        flexContainer.appendChild(label);
        flexContainer.appendChild(checkbox);

        controlDiv.appendChild(flexContainer);

        return controlDiv;
    }

    createButton(element) {
        const controlDiv = document.createElement('div');
        controlDiv.className = 'ui-control';

        const button = document.createElement('button');
        button.textContent = element.name;
        button.id = `button-${element.id}`;
        button.setAttribute('data-pressed', 'false');

        button.addEventListener('mousedown', function () {
            this.setAttribute('data-pressed', 'true');
            this.classList.add('active');
        });

        button.addEventListener('mouseup', function () {
            this.setAttribute('data-pressed', 'false');
            this.classList.remove('active');
        });

        button.addEventListener('mouseleave', function () {
            this.setAttribute('data-pressed', 'false');
            this.classList.remove('active');
        });
        controlDiv.appendChild(button);
        return controlDiv;
    }
}