const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const path = 'text.txt'


async function run(error, data) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('http://amazon.com/');
    await page.type('#twotabsearchtextbox', 'hemingway')
    await page.click('input.nav-input')
    await page.waitForSelector('#resultsCol')
    await page.waitFor(2000);

    let result = await page.content();

    const $ = cheerio.load(result);
    let contentData = [];

    // s-access-detail-page 
    $('.s-result-item').each(function (i, element) {
        if (error) {
            console.error(err)
        }
        else {

            let el = $(this);

            let rootRight = el.children()
                .children()
                .children()
                .children('.a-fixed-left-grid-col.a-col-right')
                .children('.a-row.a-spacing-small')

            let title = rootRight.find('div.a-row.a-spacing-none > a[title]')
                .text();

            let author = rootRight.find('div.a-row.a-spacing-none')
                .next()
                .children()
                .text();

            let price = rootRight.next()
                .children('div > .a-column.a-span7')
                .children('.a-row.a-spacing-none')
                .children('a')
                .children('.a-color-base.sx-zero-spacing')
                .children('.sx-price')
                .first('span.sx-price-whole')
                .text()
                .trim();

            let description = rootRight.next()
                .children('.a-column.a-span7')
                .children('.a-row.a-spacing-small')
                .children('span')
                .text();

            let rootLeft = el.children()
                .children()
                .children()
                .children('.a-fixed-left-grid-col.a-col-left')

            let link = rootLeft.children()
                .children()
                .children('.a-link-normal.a-text-normal')
                .attr('href');

            let imageUrl = rootLeft.children()
                .children()
                .children('.a-link-normal.a-text-normal')
                .children()
                .attr('src');


            let productDimension;
            let weight;

            if (title) {
                contentData.push({
                    product: {
                        title: title,
                        description: description,
                        sourceUrl: link,
                        imageUrl: imageUrl,
                        price: price.replace(/\s+/g, ''),
                        author: author
                    }
                });
            }
        }
    });

    fs.writeFile(path, JSON.stringify(contentData, null, 4), function (err) {
        if (err) {
            return console.log(err);
        }
        console.log(contentData);
    });

    await browser.close();

}

run();

