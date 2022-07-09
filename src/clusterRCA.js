const fs = require("fs");
//const urls = require('../resources/UrlList.json')
const { Cluster } = require("puppeteer-cluster");
const { pupp } = require("puppeteer-core");

var urls = ["https://www.reclameaqui.com.br/empresa/grupo-recovery-renova-securitizadora-fidc-recovery-e-fidc-npl1/lista-reclamacoes/?pagina=385"];

function AddUrlList(){

    var url = "https://www.reclameaqui.com.br/empresa/grupo-recovery-renova-securitizadora-fidc-recovery-e-fidc-npl1/lista-reclamacoes/?pagina=";    
    i = 386;
    x = 1000
    while (i <= x){
        urls.push(url + i);
        i++
    }
}

AddUrlList();

(async () => {
    const cluster = await Cluster.launch({
      //concurrency: Cluster.CONCURRENCY_PAGE,
      pupp,
      executablePath: "C:\\Program Files\\Chromium\\chrome.exe",
      concurrency: Cluster.CONCURRENCY_PAGE,
      maxConcurrency: 5,
      //monitor: true,
      timeout:14000000,
      puppeteerOptions: {
          headless: false,
          defaultViewport: false,
          timeout:0,
          args:['--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-extensions',
              ],
          userDataDir: "./tmp",
      },
    });
  
    cluster.on("taskerror", (err, data) => {
      console.log(`Error crawling ${data}: ${err.message}`);
    });
  
    await cluster.task(async ({ page, data: url }) => {
      await page.goto(url, { waitUntil: 'load', timeout:0 });
  
      let c = 1;
      var numpageU = url.substr(url.indexOf("=") + 1,)
      
      await page.goto(url, { waitUntil: 'load', timeout:0});     
      await page.waitForTimeout(3000);
      const links = await page.$$eval('.sc-1sm4sxr-0.eFXbXn > div > a', el => el.map(link => link.href));

      const jsonData=[];    
      
      for (const link of links){

          await page.goto(link, { waitUntil: 'load', timeout:0});
          await page.waitForTimeout(2000);
          try {
              img = await page.evaluate((el) => el.querySelector(".lzlu7c-6.lzlu7c-7").innerText, null );
              } catch (error) {}

          const numpage = numpageU;
          const itempage = c;
          const pagelink = link;
          const title = await page.evaluate(() => { const el = document.querySelector('.lzlu7c-3.berwWw');
              if(!el) return null
              return el.innerText;
              });
          //const title = await page.$eval('.lzlu7c-3.berwWw', element => element.innerText);        
          const location = await page.$eval('.lzlu7c-6.lzlu7c-7', element => element.innerText);
          const dataInfo = await page.$eval('.lzlu7c-6.lzlu7c-8', element => element.innerText);
          const id = await page.$eval('.lzlu7c-12.joySdk', element => element.innerText);
          const status = await page.$eval('.sc-1a60wwz-1', element => element.innerText);
                      
          const data = {numpage, itempage, title, location, dataInfo, id, status, pagelink};
          jsonData.push(data)        
          c++
      }

      var jsonContent = JSON.stringify(jsonData, null, 2);
      fs.writeFile("./files/Pagina_"+ numpageU + ".json", jsonContent, function (err) {
          if (err) {
              console.log("An error occured while writing JSON Object to File.");
              return console.log(err);
          }   

          console.log("JSON file has been saved.");
      });
      
    });
  
    for (const url of urls) {
      await cluster.queue(url);
    }
  
    await cluster.idle();
    await cluster.close();
  })();