import React, { Component } from "react";
import Color from '../src/contracts/Color.json';
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { 
    account: '',
    contract: null,
    totalSupply: 0,
    colors: []    
   };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts()
      console.log ('account: ', accounts[0])
      this.setState({ account: accounts[0] })    
    
      // Get the contract instance.
      const networkId = await web3.eth.net.getId()
      const networkData = Color.networks[networkId]
      if(networkData) {
        const abi = Color.abi
        const address = networkData.address
        const contract = new web3.eth.Contract(abi, address)

        this.setState({ contract })
        const totalSupply = await contract.methods.totalSupply().call()
        this.setState({ totalSupply })
        // Load Colors
        for (var i = 1; i <= totalSupply; i++) {
          const color = await contract.methods.colors(i - 1).call()
          this.setState({
            colors: [...this.state.colors, color]
          })
        }
      } else {
        window.alert('Smart contract not deployed to detected network.')
      }
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  mint = (color) => {
    this.state.contract.methods.mint(color).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      console.log ('transaction receipt: ', receipt)
      this.setState({
        colors: [...this.state.colors, color]
      })
    })
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a className="navbar-brand col-sm-3 col-md-2 mr-0">
            Color Tokens
          </a> 
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small className="text-white"><span id="account">{this.state.account}</span></small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h1>Issue Token</h1>
                <form onSubmit={(event) => {
                  event.preventDefault()
                  const color = this.color.value
                  this.mint(color)
                }}>
                  <input
                    type='text'
                    className='form-control mb-1'
                    placeholder='e.g. #FFFFFF'
                    ref={(input) => { this.color = input }}
                  />
                  <input
                    type='submit'
                    className='btn btn-block btn-primary'
                    value='MINT'
                  />
                </form>
              </div>
            </main>
          </div>
          <hr/>
          <div className="row text-center">
            { this.state.colors.map((color, key) => {
              return(
                <div key={key} className="col-md-3 mb-3">
                  <div className="token" style={{ backgroundColor: color }}></div>
                  <div>{color}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
