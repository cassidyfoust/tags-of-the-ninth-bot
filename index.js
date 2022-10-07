require("dotenv").config();

const { default: axios } = require("axios");
const { default: cheerio } = require("cheerio");

const twitter = require("twitter-lite");

const config = {
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
};

const client = new twitter(config);

async function getAllTags() {
  let maxPageNumber = await getMaxPageNumber();
  let pageNumber = Math.random() * maxPageNumber;
  pageNumber = Math.floor(pageNumber);
  const url = `https://archiveofourown.org/tags/search?commit=Search+Tags&page=${pageNumber}&tag_search%5Bcanonical%5D=&tag_search%5Bfandoms%5D=The+Locked+Tomb+Series+%7C+Gideon+the+Ninth+Series+-+Tamsyn+Muir&tag_search%5Bname%5D=&tag_search%5Bsort_column%5D=created_at&tag_search%5Bsort_direction%5D=asc&tag_search%5Btype%5D=Freeform`;
  const res = await axios.get(url);
  return res;
}

async function getMaxPageNumber() {
  const url = `https://archiveofourown.org/tags/search?commit=Search+Tags&page=1&tag_search%5Bcanonical%5D=&tag_search%5Bfandoms%5D=The+Locked+Tomb+Series+%7C+Gideon+the+Ninth+Series+-+Tamsyn+Muir&tag_search%5Bname%5D=&tag_search%5Bsort_column%5D=created_at&tag_search%5Bsort_direction%5D=asc&tag_search%5Btype%5D=Freeform`;
  const rawPages = await axios.get(url);
  let $ = cheerio.load(rawPages.data);
  let pageNumbers = $('ol[role="navigation"]')
    .find("li>")
    .toArray()
    .map((el) => $(el).text());
  return pageNumbers[pageNumbers.length - 2];
}

async function getTagOfTheHour() {
  const rawTags = await getAllTags();
  let $ = cheerio.load(rawTags.data);
  let tags = $('ol[class="tag index group"]')
    .find("li> span> a")
    .toArray()
    .map((el) => $(el).text());
  let tagOfTheHourIndex = Math.random() * (tags.length - 1);
  return tags[Math.floor(tagOfTheHourIndex)];
}

async function tweet() {
  const tagOfTheHour = await getTagOfTheHour();
  client
    .post("statuses/update", { status: tagOfTheHour })
    .then((result) => {
      console.log('You successfully tweeted this : "' + result.text + '"');
    })
    .catch(console.error);
}

tweet();
