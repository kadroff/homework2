import "babel-polyfill";
import Chart from "chart.js";

const meteoURL = "xml.meteoservice.ru/export/gismeteo/point/140.xml";

async function loadCurrency() {
  const response = await fetch(meteoURL);
  const xmlTest = await response.text();
  const parser = new DOMParser();
  const currencyData = parser.parseFromString(xmlTest, "text/xml");
  const hours = currencyData.querySelectorAll("FORECAST[hour]");
  const temperatures = currencyData.querySelectorAll("TEMPERATURE[max][min]");
  const heats = currencyData.querySelectorAll("HEAT[max][min]");
  const resultTemp = Object.create(null);
  const resultHeat = Object.create(null);
  for (let i = 0; i < temperatures.length; i++) {
    const HoursTag = hours[i];

    const TemperaturesTag = temperatures[i];
    const temperatureMax = parseInt(TemperaturesTag.getAttribute("max"));
    const temperatureMin = parseInt(TemperaturesTag.getAttribute("min"));
    const temperature = temperatureMin + (temperatureMax - temperatureMin) / 2;

    const HeatsTag = heats[i];
    const heatMax = parseInt(HeatsTag.getAttribute("max"));
    const heatMin = parseInt(HeatsTag.getAttribute("min"));
    const heat = heatMin + (heatMax - heatMin) / 2;
    const hour = HoursTag.getAttribute("hour");

    resultTemp[hour] = temperature;
    resultHeat[hour] = heat;
  }
  return [resultTemp, resultHeat];
}

const buttonBuild = document.getElementById("btn");
const canvasCtx = document.getElementById("out").getContext("2d");
buttonBuild.addEventListener("click", async function() {
  const currencyData = await loadCurrency();
  const keysTemp = Object.keys(currencyData[0]);
  const keysHeat = Object.keys(currencyData[1]);
  const plotData = keysTemp.map(key => currencyData[0][key]);
  const heatData = keysHeat.map(key => currencyData[1][key]);

  const chartConfig = {
    type: "line",

    data: {
      labels: keysTemp,
      datasets: [
        {
          label: "Температура",
          fill: true,
          backgroundColor: "rgba(196, 93, 105, 0.3)",
          borderColor: "rgb(180, 0, 0)",
          data: plotData
        },
        {
          label: "Температура по ощущениям",
          fill: true,
          backgroundColor: "rgb(0, 255, 128, 0.3)",
          borderColor: "rgb(64, 255, 0)",
          data: heatData
        }
      ]
    },
    options: {
      scales: {
        xAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: "Время"
            }
          }
        ],
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: "Температура, °C"
            }
          }
        ]
      }
    }
  };

  if (window.chart) {
    chart.data.labels = chartConfig.data.labels;
    chart.data.datasets[0].data = chartConfig.data.datasets[0].data;
    chart.update({
      duration: 800,
      easing: "easeOutBounce"
    });
  } else {
    window.chart = new Chart(canvasCtx, chartConfig);
  }
});
