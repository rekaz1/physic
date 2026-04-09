document.addEventListener("DOMContentLoaded", function () {
    const unitConfigs = {
        speed: {
            units: {
                mps: { label: "м/с", toBase: 1 },
                kmh: { label: "км/ч", toBase: 1000 / 3600 },
                mph: { label: "mph", toBase: 1609.344 / 3600 },
                knot: { label: "kn", toBase: 1852 / 3600 },
                mach: { label: "M", toBase: 343 }
            },
            convert: convertByFactor
        },
        length: {
            units: {
                mm: { label: "мм", toBase: 0.001 },
                cm: { label: "см", toBase: 0.01 },
                m: { label: "м", toBase: 1 },
                km: { label: "км", toBase: 1000 },
                inch: { label: "in", toBase: 0.0254 }
            },
            convert: convertByFactor
        },
        mass: {
            units: {
                g: { label: "г", toBase: 0.001 },
                kg: { label: "кг", toBase: 1 },
                ton: { label: "т", toBase: 1000 },
                lb: { label: "lb", toBase: 0.45359237 },
                oz: { label: "oz", toBase: 0.028349523125 }
            },
            convert: convertByFactor
        },
        temperature: {
            units: {
                c: {
                    label: "°C",
                    toBase: function (value) { return value; },
                    fromBase: function (value) { return value; }
                },
                k: {
                    label: "K",
                    toBase: function (value) { return value - 273.15; },
                    fromBase: function (value) { return value + 273.15; }
                },
                f: {
                    label: "°F",
                    toBase: function (value) { return (value - 32) * 5 / 9; },
                    fromBase: function (value) { return value * 9 / 5 + 32; }
                },
                ra: {
                    label: "°R",
                    toBase: function (value) { return (value - 491.67) * 5 / 9; },
                    fromBase: function (value) { return (value + 273.15) * 9 / 5; }
                },
                re: {
                    label: "°Re",
                    toBase: function (value) { return value * 1.25; },
                    fromBase: function (value) { return value / 1.25; }
                }
            },
            convert: convertTemperature
        }
    };

    document.querySelectorAll(".tool-card[data-category]").forEach(function (card) {
        const category = card.dataset.category;
        const config = unitConfigs[category];
        const valueInput = card.querySelector('[data-role="value"]');
        const fromSelect = card.querySelector('[data-role="from"]');
        const toSelect = card.querySelector('[data-role="to"]');
        const convertButton = card.querySelector('[data-role="convert"]');
        const output = card.querySelector('[data-role="output"]');

        if (!config || !valueInput || !fromSelect || !toSelect || !convertButton || !output) {
            return;
        }

        const runConversion = function () {
            const numericValue = parseNumericInput(valueInput.value);

            if (numericValue === null) {
                output.textContent = "Введите корректное число. Можно использовать точку или запятую.";
                return;
            }

            const fromKey = fromSelect.value;
            const toKey = toSelect.value;
            const result = config.convert(numericValue, fromKey, toKey, config.units);

            output.textContent =
                numericValue + " " + config.units[fromKey].label +
                " = " + result + " " + config.units[toKey].label;
        };

        convertButton.addEventListener("click", runConversion);
        valueInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                runConversion();
            }
        });
    });

    const speedInput = document.getElementById("motion-speed");
    const timeInput = document.getElementById("motion-time");
    const distanceInput = document.getElementById("motion-distance");
    const motionOutput = document.getElementById("motion-output");
    const solveButton = document.getElementById("motion-solve");
    const clearButton = document.getElementById("motion-clear");

    if (speedInput && timeInput && distanceInput && motionOutput && solveButton && clearButton) {
        solveButton.addEventListener("click", function () {
            const values = {
                speed: parseNumericInput(speedInput.value),
                time: parseNumericInput(timeInput.value),
                distance: parseNumericInput(distanceInput.value)
            };

            const filled = {
                speed: values.speed !== null,
                time: values.time !== null,
                distance: values.distance !== null
            };

            const filledCount = Object.values(filled).filter(Boolean).length;

            if (filledCount !== 2) {
                motionOutput.textContent = "Нужно заполнить ровно два поля из трех.";
                return;
            }

            if (filled.speed && filled.time) {
                values.distance = roundValue(values.speed * values.time);
                distanceInput.value = values.distance;
                motionOutput.textContent = "Расстояние = " + values.distance + " км";
                return;
            }

            if (filled.distance && filled.time) {
                if (values.time === 0) {
                    motionOutput.textContent = "Время не должно быть равно нулю.";
                    return;
                }
                values.speed = roundValue(values.distance / values.time);
                speedInput.value = values.speed;
                motionOutput.textContent = "Скорость = " + values.speed + " км/ч";
                return;
            }

            if (filled.distance && filled.speed) {
                if (values.speed === 0) {
                    motionOutput.textContent = "Скорость не должна быть равна нулю.";
                    return;
                }
                values.time = roundValue(values.distance / values.speed);
                timeInput.value = values.time;
                motionOutput.textContent = "Время = " + values.time + " ч";
            }
        });

        clearButton.addEventListener("click", function () {
            speedInput.value = "";
            timeInput.value = "";
            distanceInput.value = "";
            motionOutput.textContent = "Программа вычислит третью величину по двум известным.";
        });
    }
});

function convertByFactor(value, fromKey, toKey, units) {
    const baseValue = value * units[fromKey].toBase;
    return roundValue(baseValue / units[toKey].toBase);
}

function convertTemperature(value, fromKey, toKey, units) {
    const celsius = units[fromKey].toBase(value);
    return roundValue(units[toKey].fromBase(celsius));
}

function parseNumericInput(value) {
    const normalized = String(value).trim().replace(",", ".");

    if (normalized === "") {
        return null;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
}

function roundValue(value) {
    return parseFloat(value.toFixed(5)).toString();
}
