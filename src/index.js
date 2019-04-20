import "babel-polyfill";
import Chart from "chart.js";

const meteoURL = "xml.meteoservice.ru/export/gismeteo/point/140.xml";

async function parseData() {
  const response = await fetch(meteoURL);
  const xmlTest = await response.text();
  const parser = new DOMParser();
  const weatherData = parser.parseFromString(xmlTest, "text/xml");
  const hours = weatherData.querySelectorAll("FORECAST[hour]");
  const temperatures = weatherData.querySelectorAll("TEMPERATURE[max][min]");
  const heats = weatherData.querySelectorAll("HEAT[max][min]");
  const resultTemp = Object.create(null);
  const resultHeat = Object.create(null);
  for (let i = 0; i < hours.length; i++) {
    const HoursTag = hours[i];
    const hour = HoursTag.getAttribute("hour");

    const TemperaturesTag = temperatures[i];
    const temperatureMax = parseInt(TemperaturesTag.getAttribute("max"));
    const temperatureMin = parseInt(TemperaturesTag.getAttribute("min"));
    const temperature = temperatureMin + (temperatureMax - temperatureMin) / 2;

    const HeatsTag = heats[i];
    const heatMax = parseInt(HeatsTag.getAttribute("max"));
    const heatMin = parseInt(HeatsTag.getAttribute("min"));
    const heat = heatMin + (heatMax - heatMin) / 2;

    resultTemp[hour] = temperature;
    resultHeat[hour] = heat;
  }
  return [resultTemp, resultHeat];
}

const buttonBuild = document.getElementById("btn");
const canvasCtx = document.getElementById("out").getContext("2d");
buttonBuild.addEventListener("click", async function() {
  const weatherData = await parseData();
  const keysTemp = Object.keys(weatherData[0]);
  const keysHeat = Object.keys(weatherData[1]);
  const tempData = keysTemp.map(key => weatherData[0][key]);
  const heatData = keysHeat.map(key => weatherData[1][key]);

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
          data: tempData
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
