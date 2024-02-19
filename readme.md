## Readme.md 
此專案為跟隨 "網頁應用程式設計，使用Node和Express 2e" 書中的實做紀錄, 
採用的方法是隨著章節推進不斷加入新內容 , 但Server的主程式meadlowlark則隨著進程不斷更新.



### meadowlark_project : 

> Follow 書中的主要章節一步步的擴張實做 ， 其中主程式與路由處理lib的版本直接使用編號搭配程式碼內註解說明。Views等則維持沿用

### middleware_playground : 

> 1.學習Express的Middleware function機制，同時使用middleware去操作session來完成一個在網頁中保存購物車狀態的功能。
> 2.另外基於Bootstrap去建構了網站的基本外觀 , 以及快閃訊息的樣式 , 透過middleware針對Session中的內容做檢查,並添加額外訊息至Session中的方式來達成快閃訊息的渲染. 

### email_service : 

> 1.學習讓網頁能夠寄送email , 使用了npm的nodemailer以及SendGrid的API服務來發送信件 
> 2.透過Handlebars的模板渲染HTML email來寄送 , 並完成一個簡化的下訂單後網站發送確認信件的服務

### environment : 

>1.跟隨書中介紹的生產環境考量，以log功能為例簡單完成在開發/生產環境下的log模式
>2.使用app cluster , 這是Node的特色，使得我們的應用可以透過簡單單一server的方式水平擴展
>3.使用cluster讓單一server在遇到無法處理的例外時保持服務 , 實現去偵測並關閉死掉的server ,然後重開新的server
>4.使用artillery去做壓力測試 , 讓我們的cluster去應對多個虛擬user的大量request

### meadowlark_mongodb & meadowlark_postgre : 

>1. 擴展meadowlark中的檔案上傳功能，使用Node的檔案系統來建立與保存檔案
>2. 將我們App的資料庫層次抽象化，分別使用mongoDB與postgreSQL來實現資料庫CRUD的界面