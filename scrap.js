const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const { Parser } = require('json2csv');

const url = 'https://interviewmania.com/gk-general-knowledge/art-and-culture/1/1#';

axios.get(url).then(response => {
    const html = response.data;
    const $ = cheerio.load(html);
    const questions = [];
    // console.log(html);

$('ol[start] li div').each((index,element)=>{
    const question = $(element).text().trim();
    console.log(question)
    const options = [];
    const id = $('input[form-check-input]').attr('id')
     console.log(id)
    // $(element).find('span[style="color:#888;font-size:16px;"]').each((i, el) => {
    //     options.push($(el).text().trim());
    //   });
    //   console.log(options)
    

    
})
// const parser = new Parser();
    // const csv = parser.parse(questions);
    // fs.writeFileSync('data.csv', csv, 'utf-8');

}).catch(error => {
    console.log(error)
})