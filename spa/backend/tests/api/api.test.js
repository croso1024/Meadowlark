/*
    我們用來測試REST API的程式，雖然不太完整，但就是一個針對API測試的例子.
    我們定義_fetch , 讓我們可以給定HTTP method , 路徑以及內文的情況下觸發路由式進行測試
    並將結果以JSON格式回傳給客戶端. ( p.s這個fetch就是模仿從client發出的API請求 )

    最後就是四組針對我們要設計的REST API的簡單測試。
    在我們這個測試組合中有一些小缺陷:
    - 我們的測試是直接設定了API的port為3000 , 一個更穩定的測試組合可能可以去尋找可用的port,並在測試完成後關閉
    - 我們的API測試仰賴了已經存在於DB的資料 , (這樣也讓我可以嘗試把DB關掉後會怎樣) , 一個更加穩健的測試框架
      或許可以讓我們主動設定與重啟API內的初始資料. (例如一個script在測試執行前清空DB,並重新插入特定資料)
    

*/
const fetch = require('node-fetch')

const baseUrl = 'http://localhost:3000'

const _fetch = async (method, path, body) => {
  body = typeof body === 'string' ? body : JSON.stringify(body)
  const headers = { 'Content-Type': 'application/json' }
  const res = await fetch(baseUrl + path, { method, body, headers })
  // 如果回應碼不是200我們就丟error
  if(res.status < 200 || res.status > 299) throw new Error(`API returned status ${res.status}`)
  return res.json()
}

describe('API tests', () => {

// 第一個測試就是抓取所有假期，並確認至少要有一個假期 , 之後確認他是否有名稱與價格
  test('GET /api/vacations', async () => {
    const vacations = await _fetch('get', '/api/vacations')
    expect(vacations.length).not.toBe(0)
    const vacation0 = vacations[0]
    expect(vacation0.name).toMatch(/\w/)
    expect(typeof vacation0.price).toBe('number')
  })

// 第二個測試就是測試能否取得sku , 但因為我們沒有辦法直接抓測試資料，因此在這邊還是一樣先取得一個假期
// 接著再以第一個假期作為樣本進行測試
  test('GET /api/vacation/:sku', async() => {
    const vacations = await _fetch('get', '/api/vacations')
    expect(vacations.length).not.toBe(0)
    const vacation0 = vacations[0]
    const vacation = await _fetch('get', '/api/vacation/' + vacation0.sku)
    expect(vacation.name).toBe(vacation0.name)
  })

// 最後的兩個測試，涉及到對於資料的更動，以至於目前我們的API和測試框架還不足以驗證這兩個端點是否有正確運行
// 目前我們就是呼叫他們，並只要他們沒有return error我們就當他們ok.
// 但如果要讓這些測試更加穩健,可以再額外加入一些端點來確認動作 , 甚至開後門去檢查DB
  test('POST /api/vacation/:sku/notify-when-in-season', async() => {
    const vacations = await _fetch('get', '/api/vacations')
    expect(vacations.length).not.toBe(0)
    const vacation0 = vacations[0]
    // at this moment, all we can do is make sure the HTTP request is successful
    await _fetch('post', `/api/vacation/${vacation0.sku}/notify-when-in-season`,
      { email: 'test@meadowlarktravel.com' })
  })

  test('DELETE /api/vacation/:sku', async() => {
    const vacations = await _fetch('get', '/api/vacations')
    expect(vacations.length).not.toBe(0)
    const vacation0 = vacations[0]
    // at this moment, all we can do is make sure the HTTP request is successful
    await _fetch('delete', `/api/vacation/${vacation0.sku}` , { email:'test@test.com' , notes:"API test" })
  })

})