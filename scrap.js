const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const { Parser } = require("json2csv");

const baseurl = "https://interviewmania.com/gk-general-knowledge/international-events/1/";

async function scrapPage(pageNumber) {
  let url = `${baseurl}${pageNumber}`;
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const questions = [];

    // Extract questions
    $("ol[start] li div").each((index, element) => {
      const question = $(element).text().trim();
      const questionId = `${pageNumber}-${index + 1}`;
      questions.push({ id: questionId, question, options: [], answer: "", });
    });

    // Extract options
    $(".list-group-item .row").each((i, el) => {
      const options = [];
      $(el).find("span").each((I, El) => {
        const option = $(El).text().trim();
        options.push(option);
      });

      if (questions[i]) {
        questions[i].options = options;
      }
    });

    // Extract answers
    $(".collapse h5").each((i, el) => {
      const answer = $(el).find("span").text().trim();
      if (questions[i]) {
        questions[i].answer = answer;
      }
    });



    return questions;
  } catch (error) {
    console.log("error :", error.message);
  }
}

async function Pagination() {
  const allQuestions = [];
  let pageNumber = 1;
  while (true) {
    console.log(`Scraping page ${pageNumber}`);
    const questionScrap = await scrapPage(pageNumber);
    if (!questionScrap || questionScrap.length === 0) {
      console.log(`No more page ${pageNumber}. Stop.`);
      break;
    }

    allQuestions.push(...questionScrap);
    pageNumber++;
  }

  // Check for duplicates
  const uniqueQuestions = [];
  const questionSet = new Set();
  allQuestions.forEach(q => {
    if (!questionSet.has(q.question)) {
      questionSet.add(q.question);
      uniqueQuestions.push(q);
    }
  });

  // Find the maximum number of options
  const maxOptions = uniqueQuestions.reduce((max, q) => Math.max(max, q.options.length), 0);

  // Create dynamic fields for options
  const fields = ["id", "question", "answer", ];
  for (let i = 1; i <= maxOptions; i++) {
    fields.splice(2, 0, `option${i}`);
  }

  // Format each question to include separate columns for each option
  const formattedQuestions = uniqueQuestions.map((q) => {
    const formattedQuestion = {
      id: q.id,
      question: q.question,
      answer: q.answer,
  
    };

    // Assign options to their respective columns
    q.options.forEach((option, index) => {
      formattedQuestion[`option${index + 1}`] = option;
    });

    // Ensure all option columns are present
    for (let i = q.options.length + 1; i <= maxOptions; i++) {
      formattedQuestion[`option${i}`] = "";
    }

    return formattedQuestion;
  });

  const parser = new Parser({ fields });
  const csv = parser.parse(formattedQuestions);
  fs.writeFileSync("data.csv", csv, "utf-8");
}

Pagination();
