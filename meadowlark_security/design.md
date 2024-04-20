## Ch.15 Rest API與JSON
    
    第15章開始，我們要開始將重心放到使用Express來提供API端點，基於13章實做的列出假期清單與訂閱淡季假期等開出對應API.
    這份文件主要是我們的簡單設計圖. 
    
    我們想要加入的功能主要為:
    - 索取可用假期列表
    - 透過sku索取指定假期資訊
    - 使用者訂閱特定假期，將該使用者加入該假期可用時的通知清單中 
    - 要求刪除特定假期，但不是直接將其刪除，而是加入一個待審核的列表讓administer去做複審

    而分別對應的API端點為

    - GET /api/vacation : 
        索取假期列表
    - GET /api/vacation/:sku 
        使用路由參數來挑選特定sku的行程
    - POST /api/vacation/:sku/notify-when-in-season :
        使用查詢字串去接收使用者email , 並把該使用者加入特定假期的訂閱列表
    - DELETE /api/vacation/:sku : 
        要求刪除特定假期,同時使用查詢字串去接收請求刪除者的email,reason
    
