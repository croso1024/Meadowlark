## Readme.md 
此專案為跟隨 "網頁應用程式設計，使用Node和Express 2e" 書中的實做紀錄, 
依照書中的進度自行分出的幾個學習部份。

採用的方法是隨著章節推進不斷加入新內容 , 但Server的主程式meadlowlark則隨著進程不斷更新.



### meadowlark_project : 

    全書的第一部份，基本上就是最基本的Node.js與Express框架介紹，以及req,res物件和基本Unit test , integration test介紹.
    Follow 書中的主要章節一步步的擴張實做 ， 其中主程式與路由處理lib的版本直接使用編號搭配程式碼內註解說明。Views等則維持沿用

>1. 從最基本的Express基礎路由搭配Handlebars模板引擎,使用context物件作為模板引擎參數來渲染頁面
>2. 使用Jest,Puppeteer來做簡單的unit test , integration test
>3. HTML的表單上傳與使用Fetch的JSON表單處理,檔案上傳等
>4. 學習Cookie,Session , 並使用Session搭配Boostrap實做使用者檔案上傳成功後的快閃訊息

### middleware_playground : 

    進一步去介紹express middleware的規則，並重作一個簡單的購物車頁面.
    透過middle ware操作Session來去儲存使用者放入購物車的內容

>1. 學習Express的Middleware function機制，同時使用middleware去操作session來完成一個在網頁中保存購物車狀態的功能。
>2. 另外基於Bootstrap去建構了網站的基本外觀 , 以及快閃訊息的樣式 , 透過middleware針對Session中的內容做檢查,並添加額外訊息至Session中的方式來達成快閃訊息的渲染. 

### email_service : 

    在註冊MSA的服務後，學習使用npm的nodemailer來發送文字/HTML email. 
    以及使用handlebars的模板來渲染HTML email並寄出

>1. 學習讓網頁能夠寄送email , 使用了npm的nodemailer以及SendGrid的API服務來發送信件 
>2. 透過Handlebars的模板渲染HTML email來寄送 , 並完成一個簡化的下訂單後網站發送確認信件的服務

### environment : 

    介紹在Node.js中進行組態切換的方式,但這章的重點我認為是嘗試使用叢集去並行運行多個後端主程式.
    並簡單說明的壓力測試的概念，使用artillery去產生virtual user對我們的叢集Server進行測試.

>1. 跟隨書中介紹的生產環境考量，以log功能為例簡單完成在開發/生產環境下的log模式
>2. 使用app cluster , 這是Node的特色，使得我們的應用可以透過簡單單一server的方式水平擴展
>3. 使用cluster讓單一server在遇到無法處理的例外時保持服務 , 實現去偵測並關閉死掉的server ,然後重開新的server
>4. 使用artillery去做壓力測試 , 讓我們的cluster去應對多個虛擬user的大量request

### meadowlark_mongodb & meadowlark_postgre : 

    份量比較大的一節，開始慢慢將我們的簡單旅遊網頁改以DB來提供資料. 
    但也包含基本的node.js使用'fs'去操作local的檔案保存. 
    在此我們實現db的抽象層,並分別用mongodb/postgre去實做插入/查詢/更新資料的操作 ,
    並作為我們網站的旅遊商品資訊來源,並提供使用者訂閱相關旅遊資訊並保存在DB的功能.
    並在最後一節實做一個簡單的幣值模式轉換，利用Redis來保存Session的快取進而完成記憶使用者幣值模式.

>1. 擴展meadowlark中的檔案上傳功能，使用Node的檔案系統來建立與保存檔案
>2. 將我們App的資料庫層次抽象化，分別使用mongoDB與postgreSQL來實現資料庫CRUD的界面
>3. 使用MongoDB的ODM mongoose來定義資料Schema , 並實做抽象層中的取得資料與更新資料
>4. 使用線上Postgre服務，連接與實現取資料和更新
>5. 使用線上Redis服務，將Session store以Redis進行保存，讓使用者選取的幣值模式能夠在即使Server重啟的情況下被記憶

### route : 

    介紹URL與路由的相關概念，並說明在Express的路由處理式中的一些常見用法與設計準則

>1. URL與SEO基本概念，在Express中組織路由式的基本準則
>2. 在一個路由中串連多個處理式作為篩選,驗證等簡單功能.
>3. 使用路由參數將URL作為處理式參數的一部份
>4. 自動算繪view的路由

### restapi :

    介紹REST API , 基於13章的網站版本加入四個REST API實做與簡易測試

>1. RESTful API概念介紹,Express設定CORS
>2. 製作RESTAPI的路由處理式，以及相應.test.js，接入主程式進行測試

### Single Paga Application : 

    介紹SPA架構與SSR的差異與優點，我們要在這一章使用React來建立UI,將Express單獨用來提供前一章所完成的REST API端點
    最後將前端部份打包,由Express統一提供我們的App

>1. React & React route , 建立主畫面以及Link
>2. 實做Vacations / vacation / notify 元件，透過fetch向Server取得資料/傳遞資料後進行渲染
>3. 透過build,將CRA開發Server打包起來放到我們的Express public , 透過static中介函式來傳遞前端包給client.

### meadowlark_security

    份量最大的一章，在這一節開始主要就是加入HTTPS以及身份授權的內容。
    前半部份在我們的Web中透過憑證來啟動HTTPS server,說明並防禦CSRF攻擊.
    後半大部分開始介紹身份驗證的相關內容，建立User的資料模型並在DB層加入對應新增,檢查操作。透過Passport套件走一次完整的Facebook,Google第三方驗證流程。
    
    說明三方CA簽章的流程並透過生成自己的cert去建立不受信任的HTTPS連線來測試。另一方面也應用了express的csrf套件在POST request中加入csrf token,去規避或著重新導向那些不帶token的可能非安全表單請求。

>1. HTTPS與三方CA簽署相關介紹，生成自己的key pair建立不受信任的HTTPS server
>2. CSRF攻擊,透過csurf middleware給使用者在request中帶csur token,並規避不帶token的POST request
>3. 身份驗證流程, 建立User資料模型與抽象層API
>4. 透過Passport套件，完成Facebook , Google第三方授權驗證登入流程
>5. 依據使用者屬性進行條件渲染

