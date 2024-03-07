import React  from 'react' ; 
import NotifyWhenInSeason from './NotifyWhenInSeason';

const Vacation = ({vacation}) =>{

    return (
        <div key={vacation.sku}> 
            <h3>{vacation.name}</h3>
            <p>{vacation.description}</p>
            <span className="price"> {vacation.price} </span>
            {
                vacation.inSeason || 
                <div>
                    <p><i>This vacation is not currently in season.</i></p>
                    <NotifyWhenInSeason sku={vacation.sku} />
                </div>
            }
            <hr></hr>
        </div>
    )


}; 

export default Vacation; 