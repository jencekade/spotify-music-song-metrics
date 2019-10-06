// client-side js
// run by the browser each time your view template is loaded

let loudnessCtx = document.getElementById('canvas').getContext('2d');
let keyCtx = document.getElementById('canvas2').getContext('2d');
let tempoCtx = document.getElementById('canvas3').getContext('2d');

let searchForm = document.getElementById("search-form");
let currentTrack = document.getElementById("song-link");

// Chart.js configuration
const configureChart = (title, borderWidth, fill, stepped) => {
  return {
    type: 'scatter',
    data: {
      datasets: [{
        label: title,
        backgroundColor: '#1ED760',
        borderColor: '#1ED760',
        borderWidth: borderWidth,
        data: {},
        fill: fill,
        showLine: true,
        steppedLine: stepped
      }],
    },
    options: {
      title: {
        display: true,
        text: title
      },
      elements: {
        point: {
          radius: 0
        }
      }
    }
  }
}

function updateChartData(chart, data) {
  chart.data.datasets[0].data = data;
  chart.update();
}

// Configure and create charts
let loudnessChart = new Chart(loudnessCtx, configureChart("Loudness", 1, false, false));
let keyChart = new Chart(keyCtx, configureChart("Key", 1, true, "after"));
let tempoChart = new Chart(tempoCtx, configureChart("Tempo", 3, false, "after"));

// Handle search form submit
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let query = searchForm.elements[0].value;
  fetch(`/track?query=${query}`)
    .then(response => response.json())
    .then(json => {
      // Update track name and get audio analysis
      currentTrack.innerHTML = `Showing data for <a href="https://open.spotify.com/track/${json.id}" class="highlight" target="_blank">${json.name}</a>`;
      getAudioAnalysis(json.id);
    })
    .catch(error => console.error(error));
});

// Fetch audio analysis from our backend and update chart data
function getAudioAnalysis(id) {
  fetch(`/audio-analysis?id=${id}`)
    .then(response => response.json())
    .then(json => {
      window.analysis = json;
    
      // Log data so we can see the object
      console.group('%cAudio Analysis Data:', 'color: #F037A5; font-size: large');
      console.log(json);
      console.groupEnd();
    
      // Extract the data we want from the audio analysis and update chart data
      updateChartData(loudnessChart, json.segments.map(({ start: x, loudness_start: y }) => ({ x, y })))
      updateChartData(keyChart, json.sections.map(({ start: x, key: y }) => ({ x, y })))
      updateChartData(tempoChart, json.sections.map(({ start: x, tempo: y }) => ({ x, y })))
    })
    .catch(error => console.error(error));
}
