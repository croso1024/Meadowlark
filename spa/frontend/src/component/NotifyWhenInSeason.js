/*

    NotifyWhenInSeason.js 提供一個按鈕與input欄位,讓使用者可以在指定的假期中填寫訂閱資料,
    並Call API端點將使用者資料加入DB.

*/
import React , { useState } from 'react' ; 

const NotifyWhenInSeason = ({sku}) =>{

    // Mark up if the user already fill out the text block or not 
    const [registeredEmail , setRegisteredEmail ] = useState(null) ; 
    // for user fill out the text block
    const [email , setEmail ] = useState(''); 

    // if user already registered, change the UI ,  
    if (registeredEmail) {
       return ( <i>You will be notified at {registeredEmail} when
        this vacation is back in season!</i> ) 
    }

    const onSubmit = (e) =>{
        console.log("Submit trigger")
        fetch(`/api/vacation/${sku}/notify-when-in-season` , 
            {
                method:'POST' , 
                body: JSON.stringify({email}) , 
                headers : {'Content-Type':'application/json'} , 
            }
        )
        .then( 
                res => {
                    if (res.status < 200 || res.status > 299){
                        return alert("We had a problem processing this , please try again later...")
                    }
                    setRegisteredEmail(email);
                }
            )
        // block the default behavior 
        e.preventDefault() 
    }


    return (
        <form onSubmit={onSubmit}>
            <i>Notify me when this vacation is in season : </i>
            <input 
                type={'email'} 
                placeholder={'your email'} 
                value={email} 
                onChange={  
                    (event) => { setEmail(event.target.value) }
                }
            /> 
            <button type='submit'>OK</button>
        </form>
    )

}; 

export default NotifyWhenInSeason; 