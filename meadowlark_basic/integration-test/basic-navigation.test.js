/*
    此為Ch.5 整合測試的內容，我們要進行的整合測試是在網頁中連接到令一個頁面這件事情。
    這其中包含了處理兩個Express路由 , 也處理HTML和DOM的互動.

    我們需要先安裝pupeteer用於整合測試 , portfinder則用於尋找沒被佔用的port , 
    接下來，整合測試的流程如下: 

    1. 找到一個沒有被使用的port開啟app server
    2. 啟動headless chrome (pupeteer) 瀏覽器打開一個網頁
    3. 前往app首頁
    4. 透過我們設定好的data-test-id ="about" ( html <a>的屬性) 去找到連結並按下
    5. 確認是否到達/about頁面

*/

const portfinder = require("portfinder") ; 
const pupeteer = require("puppeteer") ; 

const app = require("../meadowlark3.js") 

let server = null ; 
let port = null ; 

/*
    beforeEach和afterEach是Jest的功能 , 
    以下做的事情只是在每次測試開始前打開server , 以及測試完成後關閉 

    需要注意的是還有所謂的beforeAll , afterAll , 而我們現在只有一個測試所以其實沒啥差 ,但當測試多的時候
    Each : 在每一組測試都做一些前處理與後處理 , 確保環境是乾淨的
    All : 測試速度比較快 , 因為就是只做一次前處理與後處理

*/

beforeEach( async ()=> {
    port = await portfinder.getPortPromise()  ; 
    server = app.listen(port)  ; 
}) 

afterEach(
    () => {server.close()} 
)

test("Home page links to about page" , async ()=> {
    //  這邊在launch加入了{"headless":"new"}來處理實際執行時會跳出來的舊版本用法將要捨棄的警告
    const browser = await pupeteer.launch( {"headless":"new"} ) ; 
    const page = await browser.newPage() ; 

    await page.goto(`http://localhost:${port}`) 
    await Promise.all([
        page.waitForNavigation() , 
        page.click(`[data-test-id="about"]`) , 
    ])

    expect(page.url()).toBe(`http://localhost:${port}/about`) ; 
    await browser.close() ; 
})
