let binaryData = [];
let timeData = [];
let currentIndex = 0;
let intervalId = null;
let pskData = [];

// Inicialización de gráficos con Chart.js
const binaryCtx = document.getElementById("binaryChart").getContext("2d");
const binaryChart = new Chart(binaryCtx, {
  type: "line",
  data: {
    labels: timeData,
    datasets: [
      {
        label: "Valor Binario",
        data: binaryData,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
        stepped: true,
      },
    ],
  },
  options: {
    scales: {
      x: {
        title: { display: true, text: "Tiempo (s)" },
      },
      y: {
        min: 0,
        max: 1,
        ticks: { stepSize: 1 },
        title: { display: true, text: "Binario" },
      },
    },
  },
});

// Inicialización del gráfico de PSK
const pskCtx = document.getElementById("pskChart").getContext("2d");
const pskChart = new Chart(pskCtx, {
  type: "line",
  data: {
    labels: timeData,
    datasets: [
      {
        label: "Onda Portadora (sin modulación)",
        data: [],
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
      },
      {
        label: "Onda Modulada (PSK)",
        data: [],
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
      },
    ],
  },
  options: {
    scales: {
      x: {
        title: { display: true, text: "Tiempo (s)" },
      },
      y: {
        title: { display: true, text: "Amplitud" },
      },
    },
  },
});

// Inicialización del gráfico de 4PSK
const psk4Ctx = document.getElementById("psk4Chart").getContext("2d");
const psk4Chart = new Chart(psk4Ctx, {
  type: "line",
  data: {
    labels: timeData,
    datasets: [
      {
        label: "Onda Portadora (sin modulación)",
        data: [],
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
      },
      {
        label: "Onda Modulada (4PSK)",
        data: [],
        borderColor: "rgba(255, 205, 86, 1)",
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
      },
    ],
  },
  options: {
    scales: {
      x: {
        title: { display: true, text: "Tiempo (s)" },
      },
      y: {
        title: { display: true, text: "Amplitud" },
      },
    },
  },
});

// Inicialización del gráfico de 8PSK
const psk8Ctx = document.getElementById("psk8Chart").getContext("2d");
const psk8Chart = new Chart(psk8Ctx, {
  type: "line",
  data: {
    labels: timeData,
    datasets: [
      {
        label: "Onda Portadora (sin modulación)",
        data: [],
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
      },
      {
        label: "Onda Modulada (8PSK)",
        data: [],
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
      },
    ],
  },
  options: {
    scales: {
      x: {
        title: { display: true, text: "Tiempo (s)" },
      },
      y: {
        title: { display: true, text: "Amplitud" },
      },
    },
  },
});

// Función para convertir la palabra a binario
function wordToBinary(word) {
  return word
    .split("")
    .map((char) => {
      // Convierte cada carácter a su representación ASCII y luego a binario
      return char.charCodeAt(0).toString(2).padStart(8, "0");
    })
    .join("");
}

// Función para generar la onda portadora y la onda modulada PSK
function generatePSKData(binaryString, timeData) {
  const carrierFrequency = 2 * Math.PI; // Frecuencia de la onda portadora
  const timeStep = 0.01; // Incremento de tiempo para la señal
  let carrierWave = [];
  let pskWave = [];
  let psk4Wave = [];
  let psk8Wave = [];

  for (let t = 0; t <= timeData.length * 0.25; t += timeStep) {
    // Onda portadora sin modulación
    carrierWave.push(Math.sin(carrierFrequency * t));

    // Onda modulada PSK (cambia de fase si el bit es 1)
    let bitIndex = Math.floor(t / 0.25);
    let bit =
      bitIndex < binaryString.length ? parseInt(binaryString[bitIndex]) : 0;
    let phaseShift = bit === 1 ? Math.PI : 0; // Fase de 0 para '0' y de π para '1'
    pskWave.push(Math.sin(carrierFrequency * t + phaseShift));

    // Onda modulada 4PSK
    if (bitIndex < binaryString.length) {
      let symbol = parseInt(binaryString.substr(bitIndex * 2, 2), 2); // 2 bits por símbolo
      phaseShift = (symbol * Math.PI) / 2; // 0°, 90°, 180°, 270°
      psk4Wave.push(Math.sin(carrierFrequency * t + phaseShift));
    } else {
      psk4Wave.push(0); // Si no hay más símbolos, devuelve 0
    }

    // Onda modulada 8PSK
    if (bitIndex < binaryString.length) {
      let symbol = parseInt(binaryString.substr(bitIndex * 3, 3), 2); // 3 bits por símbolo
      phaseShift = (symbol * Math.PI) / 4; // 0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°
      psk8Wave.push(Math.sin(carrierFrequency * t + phaseShift));
    } else {
      psk8Wave.push(0); // Si no hay más símbolos, devuelve 0
    }
  }

  return { carrierWave, pskWave, psk4Wave, psk8Wave };
}

// Función para iniciar la visualización del gráfico
function startVisualization() {
  const word = document.getElementById("wordInput").value;
  if (word) {
    // Reinicia los datos
    binaryData.length = 0;
    timeData.length = 0;
    currentIndex = 0;
    clearInterval(intervalId);
    document.getElementById("binaryValues").innerHTML = ""; // Limpiar valores previos

    // Convierte la palabra a su representación binaria
    const binaryString = wordToBinary(word);

    // Mostrar la representación binaria en la página
    document.getElementById(
      "binaryValues"
    ).textContent = `Representación binaria: ${binaryString}`;

    // Generar datos para la onda modulada PSK, 4PSK y 8PSK
    const { carrierWave, pskWave, psk4Wave, psk8Wave } = generatePSKData(
      binaryString,
      binaryString.split("")
    );

    // Agregar los datos de la onda portadora y la modulación PSK al gráfico
    pskChart.data.labels = Array.from({ length: carrierWave.length }, (_, i) =>
      (i * 0.01).toFixed(2)
    );
    pskChart.data.datasets[0].data = carrierWave;
    pskChart.data.datasets[1].data = pskWave;
    pskChart.update();

    // Agregar los datos de la modulación 4PSK
    psk4Chart.data.labels = pskChart.data.labels; // Usar las mismas etiquetas de tiempo
    psk4Chart.data.datasets[0].data = carrierWave;
    psk4Chart.data.datasets[1].data = psk4Wave;
    psk4Chart.update();

    // Agregar los datos de la modulación 8PSK
    psk8Chart.data.labels = pskChart.data.labels; // Usar las mismas etiquetas de tiempo
    psk8Chart.data.datasets[0].data = carrierWave;
    psk8Chart.data.datasets[1].data = psk8Wave;
    psk8Chart.update();

    // Configura el intervalo para mostrar cada bit cada 0.25s en la gráfica binaria
    intervalId = setInterval(() => {
      if (currentIndex < binaryString.length) {
        const bit = parseInt(binaryString[currentIndex]);
        binaryData.push(bit);
        timeData.push((currentIndex * 0.25).toFixed(2));

        binaryChart.update(); // Actualiza el gráfico binario
        currentIndex++;
      } else {
        clearInterval(intervalId);
      }
    }, 250); // 0.25 segundos
  }
}
