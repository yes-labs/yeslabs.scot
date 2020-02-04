"use strict";

const $ = document.querySelector.bind(document);

const REPOS = ["yes-poster", "indy.chat", "yeslabs.scot"];
const ISSUES_URL = "https://api.github.com/repos/yes-labs/$REPO/issues";
const FIVE_MINUTES = 1000 * 60 * 5;

(async function setup() {
  for (const repo of REPOS) {
    let url = `https://api.github.com/repos/yes-labs/${repo}/issues`;
    let data = JSON.parse(await fetchCached(url));
    if ("message" in data) {
      $(`[data-repo="${repo}"] .issues`).innerHTML =
        `<li><a><h3>Error fetching issues from Github</h3>${data.message}</a></li>`;
    } else {
      let list = data.filter(isHelpWanted).map(createIssueListItem);
      $(`[data-repo="${repo}"] .issues`).innerHTML = list.join("");
    }
  }
})();

function isHelpWanted(issue) {
  return issue.labels.find(label => label.name === "help wanted");
}

async function fetchCached(url, expiry = FIVE_MINUTES) {
  let cache = JSON.parse(localStorage.getItem(url));
  if (cache && (Date.now() - expiry) < cache.time) {
    return cache.data;
  }
  let request = await fetch(url);
  let data = await request.text();
  localStorage.setItem(url, JSON.stringify({time: Date.now(), data}));
  return data;
}

function createIssueListItem(issue) {
  let labels = issue.labels.map(label =>
    `<span class="label" style="background: #${label.color}">
      ${label.name}
    </span>`
  ).join("");
  return `<li>
    <a href="${issue.html_url}">
      <h3>#${issue.number} - ${issue.title}</h3>
      ${labels}
    </a>
  </li>`
}
