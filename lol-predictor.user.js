// ==UserScript==
// @name         LoL Predictor
// @version      1.0
// @description  Naively calculate the probability of victory in a game of LoL
// @author       Matt
// @match        https://*.op.gg/statistics/champion/
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  function createChampionDropDown(champions, color) {
      let dropDown = document.createElement("select");
      dropDown.style.color = color;
      champions.forEach(champion => {
          let option = document.createElement("option");
          option.textContent = champion;
          option.style.color = color;
          dropDown.appendChild(option);
      })
      return dropDown;
  }

  function scan(scanButton) {
      scanButton.hidden = true;
      let tableRows = document.querySelectorAll("[role=row]");
      let parsedRows = toArray(tableRows).slice(1).map(parseRow);
      let champions = parsedRows.map(row => row.name).sort();
      let championData = dataToMap(parsedRows);

      let redDiv = document.createElement("div");
      let redDdls = [1, 2, 3, 4, 5].map(i => createChampionDropDown(champions, "red"));
      redDdls.forEach(ddl => redDiv.appendChild(ddl));

      let blueDiv = document.createElement("div");
      let blueDdls = [1, 2, 3, 4, 5].map(i => createChampionDropDown(champions, "blue"));
      blueDdls.forEach(ddl => blueDiv.appendChild(ddl));

      let predictionDiv = document.createElement("div");
      let predictionBox = document.createElement("input");
      predictionDiv.appendChild(predictionBox);
      predictionBox.setAttribute("readonly", true);

      document.body.prepend(redDiv);
      document.body.prepend(blueDiv);
      document.body.prepend(predictionDiv);
      blueDdls.concat(redDdls).forEach(ddl => {ddl.onchange = updatePrediction});

      updatePrediction();

      function updatePrediction() {
          let blueTeam = blueDdls.map(selectedText);
          let redTeam = redDdls.map(selectedText);
          let bluePrediction = predict(blueTeam, redTeam, championData);
          let redPrediction = 1 - bluePrediction;
          if (bluePrediction > redPrediction) {
              predictionBox.value = bluePrediction;
              predictionBox.style.color = "blue";
          } else if (redPrediction > bluePrediction) {
              predictionBox.value = redPrediction;
              predictionBox.style.color = "red";
          } else {
              predictionBox.value = redPrediction;
              predictionBox.style.color = "grey";
          }
      }
  }

  function selectedText(ddl) {
      return ddl.options[ddl.selectedIndex].innerText;
  }

  function toArray(iterable) {
      let array = [];
      var i;
      for (i = 0; i < iterable.length; i++) {
          array.push(iterable[i]);
      }
      return array;
  }

  // HTMLElement -> ParsedRow
  function parseRow(row) {
      let cells = row.getElementsByTagName("td");
      let rankCell = cells[0];
      let imageCell = cells[1];
      let nameCell = cells[2];
      let winRateCell = cells[3];
      let gamesCell = cells[4];
      let kdaCell = cells[5];
      let csCell = cells[6];
      let goldCell = cells[7];

      let name = nameCell.innerText;
      let winRate = winRateCell.getAttribute("data-value") / 100;
      let games = Number(gamesCell.innerText.replace(",", ""));
      return {name: name, winRate: winRate, games: games};
  }

  // List[ParsedRow] -> Map[String, Float]
  function dataToMap(tableData) {
      let map = {};
      tableData.forEach(parsedRow => { map[parsedRow.name] = parsedRow.winRate });
      return map;
  }

  // probability that team1 wins
  // List[String], List[String], Map[String, Float] -> Float
  function predict(team1, team2, data) {
      console.log(team1);
      console.log(team2);
      console.log(data);
      let team1Score = team1.map(name => data[name]).reduce((a, b) => a * b);
      let team2Score = team2.map(name => data[name]).reduce((a, b) => a * b);
      console.log(team1Score);
      console.log(team2Score);
      return team1Score / (team1Score + team2Score);
  }

  let startButton = document.createElement("button");
  startButton.onclick = () => scan(startButton);
  startButton.textContent = "Scan";
  document.body.prepend(startButton);


})();