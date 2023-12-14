/*
    在進行測試的程式碼中，為了讓Jest能夠辨認哪些是測試，一般有兩種方式
    1. 建立 __test__ 資料夾,把測試用的code放在裡面 , 可以讓整個資料夾結構比較整齊
    2. 將檔案命名為 xxx.test.js , 可以幫助我們在編輯器有很多個標籤視窗時辨認 

    在書中的例子，我們採用兩種方式並行。
    這個檔案就是用來執行我們集成路由處理函式的handlers.js 
*/



// Step.1 匯入我們要進行測試的程式碼   
const handlers = require("../handlers") ; 


/* 
    Step.2 建立一個測試 , 每個測試都有個敘述名稱，告知我們正在測試的東西是什麼，
    在這邊就是home page renders , 確認首頁的渲染狀況  

    在此我們會需要有請求和回應物件來作為render()的參數，
    但因為我們在路由函式上其實不會使用到這兩個物件內的什麼內容，因此我們在此就可以簡單的使用空物件來做
    (但在實際用途上，我們可能就要去模擬req , res物件的內容)

    至於要注意的是回應物件 , 我們會需要他的render方法, 我們呼叫jest.fn() , 他是一個Jest方法
    會建立一個通用mock函式用來方便我們追蹤他的呼叫情況。

*/
test( "home page renders" , ()=> {
    const req = {} ; 
    const res = { render : jest.fn() } 
    handlers.home (req,res) ;  
    // 撰寫完呼叫測試後，最後核心的一步就是斷言(assertion) , 在下面的例子中,
    // 程式碼就是使用"home"作為參數呼叫物件的render方法 

    // Jest的mock函式會追蹤他被呼叫的次數, call[0][0]的第一個索引是"第幾次被呼叫" , 
    // 第二個索引則是"第幾個參數" .
    // 下面這一段就是在確認他被呼叫時的參數是"home" 
    expect( res.render.mock.calls[0][0]).toBe("home") 
});


test("about page render with fortune" , ()=> {
    const req = {} ;
    const res = {render : jest.fn()} ; 

    handlers.about(req,res) ; 

    expect( res.render.mock.calls.length ).toBe(1) ; 
    expect( res.render.mock.calls[0][0]).toBe("about") ; 
    expect( res.render.mock.calls[0][1]).toEqual(
        expect.objectContaining({fortune:expect.stringMatching(/\W/),})  
    )
} ) ;  


test("404 handler renders" , ()=>{

    const req = {} ; 
    const res = {render:jest.fn()} ; 
    handlers.notFound(req,res) ; 

    expect(res.render.mock.calls.length).toBe(1) ; 
    expect(res.render.mock.calls[0][0]).toBe("404")

})


test("500 handler renders" , ()=>{
    const err = new Error("Some error") ;  
    const req = {} ; 
    const res = {render:jest.fn()} ; 
    const next = jest.fn() ;

    handlers.serverError(err,req,res,next) ; 

    expect(res.render.mock.calls.length).toBe(1) ; 
    expect(res.render.mock.calls[0][0]).toBe("500")

})