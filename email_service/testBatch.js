
const largeRecipientList = new Array(10).fill().map((_, idx) => `customer${idx}@nowhere.com`)
// largeRecipientList is an array of email addresses
const recipientLimit = 2

// 重新拆解書本範例的reduce , 第一個參數是目前為止累積的batches , 第二個則是下一筆收件人地址
function toBatch( batches , next  ){
    // 從目前累積的batches里取出最後一筆batch
    const lastBatch = batches[batches.length - 1]  
    // 當前batch還沒到達上限 , 添加
    if (lastBatch.length < recipientLimit) {
        lastBatch.push(next) 
    }
    // 當前batch滿了 , 把這筆資料放入下一個batch
    else {
        batches.push( [next] ) 
    }
    return batches 
}

// 透過reduce和上面的combine function來對寄件人地址進行分批, 初始的batches參數為 [[]]
const batches = largeRecipientList.reduce(
    toBatch , [[]]
)

console.log(batches) ; 

/*

[
  [ 'customer0@nowhere.com', 'customer1@nowhere.com' ],
  [ 'customer2@nowhere.com', 'customer3@nowhere.com' ],
  [ 'customer4@nowhere.com', 'customer5@nowhere.com' ],
  [ 'customer6@nowhere.com', 'customer7@nowhere.com' ],
  [ 'customer8@nowhere.com', 'customer9@nowhere.com' ]
]

*/