const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const { Parser } = require("json2csv");

const baseurl =
  "https://interviewmania.com/gk-general-knowledge/international-events/1/";
// "https://interviewmania.com/gk-general-knowledge/art-and-culture/1/1#";

async function scrapPage(pageNumber) {
  let url = `${baseurl}${pageNumber}`;
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const questions = [];

    // extracting questions
    $("ol[start] li div").each((index, element) => {
      const question = $(element).text().trim();
      questions.push({ id: index + 1, question, options: [], answers: [] });
    });

    // extract options

    $(".list-group-item .row").each((i, el) => {
      const options = [];
      $(el).each((I, El) => {
        const option = $(El).find("span").text().trim();
        options.push(option);
      });

      if (questions[i]) {
        questions[i].options = options;
      }
    });

    // extract answers

    $(".collapse h5").each((i, el) => {
      const answer = $(el).find("span").text();
      if (questions[i]) {
        questions[i].answers = answer;
      }
    });

    return questions;
  } catch (error) {
    console.log("error :", error.message);
  }
}

async function Pagination() {
  const allpage = [];
  let pageNumber = 1;
  for (let page = 1; ; pageNumber++) {
    console.log(`Scraping page ${pageNumber}`);
    const questions = await scrapPage(pageNumber);
    if (!questions || questions.length === 0) {
      console.log(`No more page ${pageNumber}. Stop.`);
      break;
    }
    allpage.push(...questions);
  }
  const parser = new Parser();
  const csv = parser.parse(allpage);
  fs.writeFileSync("data.csv", csv, "utf-8");
}

Pagination();
