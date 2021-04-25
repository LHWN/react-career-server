const { SignalCellularNoSimOutlined, LocalConvenienceStoreOutlined } = require('@material-ui/icons');
const axios = require('axios');
const cheerio = require('cheerio');

exports.crawlBlog = async (ctx) => {
  let htmlData = [];
  // axios 를 활용해서 AJAX로 HTML 문서를 가져온다.
  const getHTML = () => {
    try {
      return axios.get('https://blog.naver.com/PostList.nhn?blogId=wlsekffo1674&widgetTypeCall=true&directAccess=true');
    } catch (e) {
      console.error(e);
    }
  };

  let result = [];

  await getHTML()
    .then((html) => {
      const $ = cheerio.load(html.data);
      const $postList = $('div.se-section-documentTitle');

      // 데이터 추출
      $postList.each(function (i, el) {
        result[i] = {
          date: $(this).find('span.se_publishDate').text(),
          category: $(this).children('div.blog2_series').find('a').text(),
          title: $(this).children('div.pcol1').find('span').text(),
          url: $(this).children('div.blog2_post_function').find('a').attr('title'),
          profile: $(this).children('div.blog2_container').find('span.area_profile').find('img').attr('src'),
          author: $(this).children('div.blog2_container').find('span.nick').find('a').text()
        };
      });
      return result;
    })
    .then((res) => {
      console.log(result);
    });

  ctx.body = result;
};
