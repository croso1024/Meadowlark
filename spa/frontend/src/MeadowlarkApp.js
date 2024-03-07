/*
    從Ch16開始，我們要使用React來建構SPA,並把Express作為提供API與資料的方式.
    而透過React元件來取代前面使用Handlebars在Server端進行render的工作.
    這章中我們只會有這個App檔與Vacation.js兩個主要的元件,因此一些簡單,用於測試的元件也就集成在這個檔案

    
    在前面handlebars的模板中，我們透過定義一個Layout檔作為web的主要風格模板, 並透過{{body}}等
    去加入在該layout模板下各自被渲染出來的網頁. 而這個{{body}}在中可以接近類比於使用一個元件並將其渲染.
    因此在這邊的MeadowlarkApp.js,就相當於handlebars.layout的角色,我們把 "其他元件視為要被計算與渲染的view模板".
    只不過資料的來源是從後端索取.

    談到資料的索取，在SPA裡我們仍然是透過URL路由來確認用戶正在看的是Web的哪個部份,只是路由改變UI的部份現在變成前端框架
    來完成,在這過程中如果需要用到後端的資料,則由前端負責發起request請求這些資料.
    我們在此要使用'react-router-dom' 這個常見的路由lib來配置路由 , 但書本上的資料是基於5.0.1的版本,而目前版本已經到達6.22
    因此這邊我就是爬官方doc並修改作者範例來適配6.x版本.
    透過react-router-dom我們就能夠作到類似在網站中透過路由進行導覽,""但實際上並沒有額外的client request,除非要索取資料""
    


*/
import './App.css';
import logo from './img/chicken.png' 
import { BrowserRouter as Router , Routes , Route , Link  } from 'react-router-dom' ; 
import Vacations from './component/Vacations';


function Home() {
    return (
        <div>
            <h2> This page is website Home page </h2>
            <ul>
                <li><p><Link to={'/about'}>Link to about page About</Link></p></li>
                
                {/* 
                    透過Link , 我們可以再不傳送新的request的情況下透過router去渲染新的頁面,但若用href,
                    browser仍會將這個視為需要導覽至一個新的頁面,進而發送request,而這就不是我們使用SPA的初衷
                    具體的差異透過下面的測試,使用Link完全不會有新的網絡流量,反之<a>則會去重新取得HTML , CSS
                */}
                <li><a href={'/'}>Home by 'a' tag</a></li>
                <li><Link to={'/'}>Home by ling component</Link></li>
                <li><Link to={'/vacations'}>Go to Vacations</Link></li>
            </ul>
        </div>
    )
};


function About() {
    
    return (
        <div>
            <i>comming soon</i>
            <Link to={'/'}>Go back to root</Link>
        </div>
    )
}
function NotFound (){
    return (<i>Not found</i>)
}

function App() {

  
  return (
    
    <div class="container">
        <header>
        <h1>Meadowlark Travel App</h1>
        <img src={logo} alt={'Meadowlark Travel Logo'} height={200} />
        </header>
        {/* 在此處加入元件，類比我在handlebars的layout中的 {{body}} 等等模板 */}
        <Router>
        <Routes >
            <Route path={"/"}  exact Component={Home} />
            <Route path={"/about"} exact Component={About} />
            <Route path={"/vacations"} exact Component={Vacations} />
            <Route Component={NotFound} />
        </Routes>
        </Router>    
    </div>
    
  );
}

export default App;
