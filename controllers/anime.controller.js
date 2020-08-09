const url = require("../helpers/base-url");
const { default: Axios } = require("axios");
const cheerio = require("cheerio");
const errors = require("../helpers/errors");

class AnimeController {
  detailAnime = async (req, res) => {
    const id = req.params.id;
    const fullUrl = url.baseUrl + `anime/${id}`;
    // console.log(fullUrl);
    try {
      const response = await Axios.get(fullUrl);

      const $ = cheerio.load(response.data);
      const detailElement = $(".venser").find(".fotoanime");
      const epsElement = $("#_epslist").html();
      let object = {};
      let episode_list = [];
      object.thumb = detailElement.find("img").attr("src");
      object.anime_id = req.params.id
      let genre_name, genre_id, genre_link;
      let genreList = [];
      detailElement.find(".infozin").filter(function () {
        object.title = $(this)
          .find("p")
          .children()
          .eq(0)
          .text()
          .replace("Judul: ", "");
        object.japanase = $(this)
          .find("p")
          .children()
          .eq(1)
          .text()
          .replace("Japanese: ", "");
        object.score = $(this)
          .find("p")
          .children()
          .eq(2)
          .text()
          .replace("Skor: ", "");
        object.producer = $(this)
          .find("p")
          .children()
          .eq(3)
          .text()
          .replace("Produser:  ", "");
        object.type = $(this)
          .find("p")
          .children()
          .eq(4)
          .text()
          .replace("Tipe: ", "");
        object.status = $(this)
          .find("p")
          .children()
          .eq(5)
          .text()
          .replace("Status: ", "");
        object.total_episode = $(this)
          .find("p")
          .children()
          .eq(6)
          .text()
          .replace("Total Episode: ", "");
        object.duration = $(this)
          .find("p")
          .children()
          .eq(7)
          .text()
          .replace("Durasi: ", "");
        object.release_date = $(this)
          .find("p")
          .children()
          .eq(8)
          .text()
          .replace("Tanggal Rilis: ", "");
        object.studio = $(this)
          .find("p")
          .children()
          .eq(9)
          .text()
          .replace("Studio: ", "");
        $(this)
          .find("p")
          .children()
          .eq(10)
          .find("span > a")
          .each(function () {
            genre_name = $(this).text();
            genre_id = $(this)
              .attr("href")
              .replace("https://otakudesu.org/genres/", "");
            genre_link = $(this).attr("href");
            genreList.push({ genre_name, genre_id, genre_link });
            object.genre_list = genreList;
          });
      });

      const plainResponse = $(".venser").html();
      const startIndex = plainResponse.search(",id:");
      const id = plainResponse
        .substr(startIndex, 20)
        .split(" ")[1]
        .split("}")[0];
      const episodesResponse = await Axios.get(
        `https://otakudesu.org/wp-admin/admin-ajax.php?action=epslist&id=${id}`
      );
      const episodes$ = cheerio.load(episodesResponse.data);
      const episode_links = [];
      episodes$("body")
        .find("li")
        .each((i, elem) => {
          const $ = cheerio.load(elem);
          const episode = {
            eps_name: $("li").find("a").text().replace("\n", ""),
            eps_link: $("li").find("a").attr("href"),
            eps_id : $("li").find("a").attr("href").replace('https://otakudesu.org/','')
          };
          episode_links.push(episode);
        });
      object.episode_list = episode_links;

      const batchResponse = await Axios.get(
        `https://otakudesu.org/wp-admin/admin-ajax.php?action=batchlist&id=${id}`
      );
      const batch$ = cheerio.load(batchResponse.data);
      const batch_links = [];
      const emptyBatch= [
          {
              batch_name : 'masih kosong',
              batch_link : 'masih kosong',
              batch_id : 'masih kosong',
          }
      ]

      batch$("body")
        .find("li")
        .each((i, elem) => {
          const $ = cheerio.load(elem);
          const batch = {
            batch_name: $("li").find("a").text().replace("\n", ""),
            batch_link: $("li").find("a").attr("href"),
            batch_id: $("li").find("a").attr("href").replace('https://otakudesu.org/batch/',''),
          };
          batch_links.push(batch);
        });
      object.batch_link = batch_links.length === 0 ?emptyBatch : batch_links;

      //console.log(epsElement);
      res.json(object);
    } catch (err) {
      errors.requestFailed(req, res, err);
    }
  };
}

module.exports = new AnimeController();