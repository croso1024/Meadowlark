import logo from './logo.svg';
import './App.css';

function App() {

  const value = Math.floor(Math.random()*6 + 1 ) 

  const color = ['r','g','b']  
  const colorList = color.map( (item ,id) =>  `${id} color : ${item} \n `  )

  // const colorList = [<li>{`$A color : B`}</li> ,<li>{`$A color : B`}</li> ,<li>{`$A color : B`}</li>  ]
  
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <ul>{colorList}
        </ul>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
