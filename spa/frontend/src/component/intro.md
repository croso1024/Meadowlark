這一章節的最終目的是要示範透過SPA架構建構前端，並與我們的Express後端進行索取資料渲染,
以及將資料推送到後端的流程.
大部分從後端拿資料的工作我們已經在ch15完成( 我們實做了四個操作假期資料庫的RESTAPI ).
這邊因為我已經有React底,就忽略書上對react的介紹


1. Vacations.js就是用來顯示假期資料的元件. 
   useState用來保存與更新取得的假期資料,並在元件一開始mount時用useEffect去抓資料,
   抓到的一個資料陣列會透過Vacation元件來進行顯示

2. Vacation.js則是用來顯示一個商品的詳細資訊,
   也包含當這個商品 inSeason = False時 , 利用NotifyWhenInSeason元件去提供
   使用者把該旅程加入訂閱通知.

3. NotifyWhenInSeason.js 提供一個按鈕與input欄位,讓使用者可以在指定的假期中填寫訂閱資料,
   並Call API端點將使用者資料加入DB.