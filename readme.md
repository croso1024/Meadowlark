## Readme.md 
此專案為跟隨 "網頁應用程式設計，使用Node和Express 2e" 書中的實做紀錄, 
依照書中的進度自行分出的幾個學習部份。




採用的方法是隨著章節推進不斷加入新內容 , 但Server的主程式meadlowlark則隨著進程不斷更新.



### meadowlark_project : 

    全書的第一部份，基本上就是最基本的Node.js與Express框架介紹，以及req,res物件和基本Unit test , integration test介紹.
    Follow 書中的主要章節一步步的擴張實做 ， 其中主程式與路由處理lib的版本直接使用編號搭配程式碼內註解說明。Views等則維持沿用

> 1.從最基本的Express基礎路由搭配Handlebars模板引擎,使用context物件作為模板引擎參數來渲染頁面
> 2.使用Jest,Puppeteer來做簡單的unit test , integration test
> 3.HTML的表單上傳與使用Fetch的JSON表單處理,檔案上傳等
> 4.學習Cookie,Session , 並使用Session搭配Boostrap實做使用者檔案上傳成功後的快閃訊息

### middleware_playground : 

    進一步去介紹express middleware的規則，並重作一個簡單的購物車頁面.
    透過middle ware操作Session來去儲存使用者放入購物車的內容

> 1.學習Express的Middleware function機制，同時使用middleware去操作session來完成一個在網頁中保存購物車狀態的功能。
> 2.另外基於Bootstrap去建構了網站的基本外觀 , 以及快閃訊息的樣式 , 透過middleware針對Session中的內容做檢查,並添加額外訊息至Session中的方式來達成快閃訊息的渲染. 

### email_service : 

    在註冊MSA的服務後，學習使用npm的nodemailer來發送文字/HTML email. 
    以及使用handlebars的模板來渲染HTML email並寄出

> 1.學習讓網頁能夠寄送email , 使用了npm的nodemailer以及SendGrid的API服務來發送信件 
> 2.透過Handlebars的模板渲染HTML email來寄送 , 並完成一個簡化的下訂單後網站發送確認信件的服務

### environment : 

    介紹在Node.js中進行組態切換的方式,但這章的重點我認為是嘗試使用叢集去並行運行多個後端主程式.
    並簡單說明的壓力測試的概念，使用artillery去產生virtual user對我們的叢集Server進行測試.


>1.跟隨書中介紹的生產環境考量，以log功能為例簡單完成在開發/生產環境下的log模式
>2.使用app cluster , 這是Node的特色，使得我們的應用可以透過簡單單一server的方式水平擴展
>3.使用cluster讓單一server在遇到無法處理的例外時保持服務 , 實現去偵測並關閉死掉的server ,然後重開新的server
>4.使用artillery去做壓力測試 , 讓我們的cluster去應對多個虛擬user的大量request

### meadowlark_mongodb & meadowlark_postgre : 

    開始慢慢將我們的網頁轉為旅遊網站. 
    並將DB與我們的應用連接,但也包含基本的node.js使用'fs'去操作local的檔案保存. 
    在此我們實現db的抽象層,並分別用mongodb/postgre去實做插入/查詢/更新資料的操作 ,
    並作為我們網站的旅遊商品資訊來源,並提供使用者訂閱相關旅遊資訊並保存在DB的功能.

>1. 擴展meadowlark中的檔案上傳功能，使用Node的檔案系統來建立與保存檔案
>2. 將我們App的資料庫層次抽象化，分別使用mongoDB與postgreSQL來實現資料庫CRUD的界面
>3. 使用MongoDB的ODM mongoose來定義資料Schema , 並實做抽象層中的取得資料與更新資料