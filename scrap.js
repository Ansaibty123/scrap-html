const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const { Parser } = require("json2csv");

const url =
  "https://interviewmania.com/gk-general-knowledge/art-and-culture/1/1#";

axios
  .get(url)
  .then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);
    const questions = [];
    // console.log(html);

    $("ol[start] li div").each((index, element) => {
      const question = $(element).text();
      questions.push({ id: index + 1, question, options: [] ,answers:[]})
      
    });
    
    $(".list-group-item").each((i, el) => {
        const options = [];
        $(el).find('.row').each((I,El) => {
          const option = $(El).find('span').text().trim();
          options.push(option);
        });
       
        if (questions[i]) {
          questions[i].options = options;
        }
      });
      $(".collapse").each((i, el) => {
        const answer = $(el).find("span").text();
        if (questions[i]) {
          questions[i].answers = answer;
        }
      });
      console.log(questions)

    const parser = new Parser();
    const csv = parser.parse(questions);
    fs.writeFileSync('data.csv', csv, 'utf-8');
  })
  .catch((error) => {
    console.log(error);
    
  });
