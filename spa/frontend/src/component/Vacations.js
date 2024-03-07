/*
    見intro.md
*/
import React , {useState , useEffect, Fragment} from 'react'; 
import Vacation from './Vacation';

const Vacations = () =>{

    const [vacations , setVacations] = useState([]) ; 

    // 透過useEffect在元件掛載上去時去從後端去抓資料
    useEffect(
        ()=>{
            fetch('/api/vacations') 
            .then( res => res.json() ) 
            .then( resJson => {setVacations(resJson)}) 
        } , []
    ) 
    // return (
    //     <Fragment>
    //         <h2>Vacations List</h2>
    //         <hr></hr>
    //         <div className={'vacations'}>
    //             {
    //                 vacations.map(
    //                     (item) => (
    //                         <div key={item.sku}>
    //                             <h4>{item.name}</h4>
    //                             <p>{item.description}</p>
    //                             <span className={'price'}>{item.price}</span>
    //                         </div>
    //                     )
    //                 )
    //             }                
    //         </div>
    //     </Fragment>
    // )
        return (
        <Fragment>
            <h2>Vacations List</h2>
            <hr></hr>
            <div className={'vacations'}>
                {
                    vacations.map( vacation => <Vacation key={vacation.sku} vacation={vacation} /> )
                }                
            </div>
        </Fragment>
    )

}

export default Vacations ; 