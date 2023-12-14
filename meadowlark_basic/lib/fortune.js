
const fortunes = [
    "test text1" , 
    "test text2" , 
    "test text3" , 
    "test text4" , 
    "test text5" , 
    "test text6" , 
]



exports.getFortune = () => {
    const idx = Math.floor(Math.random() * fortunes.length) ; 
    return fortunes[idx] ; 
}