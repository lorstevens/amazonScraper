const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const path = 'text.txt'

let run = async (error, data) => {
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


    $('.s-result-item').each(function (i, element) {
        if (error) {
            console.error(err)
        }
        else {

            let el = $(this);

            let id = $(this).attr('id')
          
            let rootRight = el.children()
                .children()
                .children()
                .children('.a-fixed-left-grid-col.a-col-right')
                .children('.a-row.a-spacing-small')

            //Find the titles
            let title = rootRight.find('div.a-row.a-spacing-none > a[title]')
                .text();

            // Find the authors
            let author = rootRight.find('div.a-row.a-spacing-none')
                .next()
                .children()
                .children('a')
                .text();

            //Find the price
            //Find the Whole Number
            let priceWhole = rootRight.next()
                .children('div > .a-column.a-span7')
                .children('.a-row.a-spacing-none')
                .children('a')
                .children('.a-color-base.sx-zero-spacing')
                .children('.sx-price')
                .children('span.sx-price-whole')
                .text()
                .trim();

            //Find the Decimal Number
            let priceDecimal = rootRight.next()
                .children('div > .a-column.a-span7')
                .children('.a-row.a-spacing-none')
                .children('a')
                .children('.a-color-base.sx-zero-spacing')
                .children('.sx-price')
                .children('.sx-price-fractional')
                .text()
                .trim();

            //Combine whole and decimal numbers
            let price = priceWhole + '.' + priceDecimal

            //Find the description
            let description = rootRight.next()
                .children('.a-column.a-span7')
                .children('.a-row.a-spacing-small')
                .children('span')
                .text();

            let date = rootRight.children()
                .first()
                .children('span.a-size-small.a-color-secondary')
                .text()
                

            let rootLeft = el.children()
                .children()
                .children()
                .children('.a-fixed-left-grid-col.a-col-left')

            //Find the Source URL
            let link = rootLeft.children()
                .children()
                .children('.a-link-normal.a-text-normal')
                .attr('href');

            //Find the image URL
            let imageUrl = rootLeft.children()
                .children()
                .children('.a-link-normal.a-text-normal')
                .children()
                .attr('src');

            //Push into the contentData Array
            if (title) {
                contentData.push({
                    product: {
                        id: id,
                        title: title,
                        description: description,
                        sourceUrl: link,
                        imageUrl: imageUrl,
                        price: price,
                        author: author,
                        date: date
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

