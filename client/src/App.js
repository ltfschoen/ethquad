import React, { Component } from 'react';
import * as System from 'slate-react-system';
import { createPow } from "@textile/powergate-client";
import { Alert, Container, Col, Row, Spinner } from "react-bootstrap";
import { Greeter } from './components/Greeter';
import './App.css';

class App extends Component {
  PowerGate = null;

  state = {
    info: null,
    isLoading: false,
    // State keys to store in localStorage
    stateKeysForLocalStorage: ['token'],
    token: null
  };

  componentDidMount = async () => {
    console.log('componentDidMount');
    this.setState({ isLoading: true }, 
      async () => {
        await this.hydrateStateWithLocalStorage();
        await this.handleCreateToken();
      });

    // Add event listener to save state to localStorage
    // when user leaves/refreshes the page
    window.addEventListener(
      "beforeunload",
      () => this.saveStateToLocalStorage()
    );
  }

  componentWillUnmount() {
    console.log('componentWillUnmount');
    window.removeEventListener(
      "beforeunload",
      () => this.saveStateToLocalStorage()
    );

    // Saves if component has a chance to unmount
    this.saveStateToLocalStorage();
  }

  // Requires PowerGate to be running locally.
  handleCreateToken = async () => {
    console.log('handleCreateToken');
    const { token } = this.state;
    let FFS;
    try {
      this.PowerGate = createPow({ host: 'http://0.0.0.0:6002' });
      FFS = await this.PowerGate.ffs.create();
    } catch(error) {
      console.error("Unable to connect to Powergate network");
      throw("Unable to connect to Powergate: ", error);
    }
    let tokenToUse;

    const createToken = async (ffs) => {
      tokenToUse = ffs.token ? ffs.token : null;
      console.log('Created token: ', tokenToUse);
      this.updateLocalStorage('token', tokenToUse);
      await this.PowerGate.setToken(tokenToUse);
    }
    if (token) {
      tokenToUse = token;
      console.log('Retrieved existing token: ', token);
      await this.PowerGate.setToken(tokenToUse);
      try {
        await this.PowerGate.ffs.info();
      } catch(error) {
        // If user restarts Powergate the `setToken` no longer exists
        // and it is necessary to create a new one.
        console.error('Unable to authenticate using set token due to network reset');
        createToken(FFS);
      }
    } else {
      createToken(FFS);
    }
    await this.handleRefresh();
    this.setState({ isLoading: false });
  }

  // Requires token and authentication.
  handleRefresh = async () => {
    console.log('handleRefresh');
    const { info } = await this.PowerGate.ffs.info();
    this.setState({
      info
    });
  };

  // Requires token and authentication.
  handleCreateAddress = async ({ name, type, makeDefault }) => {
    console.log('handleCreateAddress');
    await this.PowerGate.ffs.newAddr(
      name,
      type,
      makeDefault
    );
    this.handleRefresh();
  }

  hydrateStateWithLocalStorage = () => {
    console.log('hydrateStateWithLocalStorage');
    const { stateKeysForLocalStorage } = this.state;
    // For all items in state
    for (let key in this.state) {
      // If the key exists in localStorage
      if (stateKeysForLocalStorage.includes(key) && localStorage.hasOwnProperty(key)) {
        // Get the key's value from localStorage
        let value = localStorage.getItem(key);

        // Parse the localStorage string and setState
        try {
          value = JSON.parse(value);
          this.setState({ [key]: value });
        } catch (e) {
          // Handle empty string
          this.setState({ [key]: value });
        }
      }
    }
  }

  updateLocalStorage = (key, value) => {
    console.log('updateLocalStorage');
    // Update react state
    this.setState({ [key]: value });

    // Update localStorage
    localStorage.setItem(key, value);
  }

  saveStateToLocalStorage = () => {
    console.log('saveStateToLocalStorage');
    const { stateKeysForLocalStorage } = this.state;
    // For every item in React state
    for (let key in this.state) {
      if (stateKeysForLocalStorage.includes(key)) {
        // Save to localStorage
        localStorage.setItem(key, JSON.stringify(this.state[key]));
      }
    }
  }

  render() {
    const { info, isLoading, token } = this.state;
    return (
      <Container fluid className="App">
        <Row className="justify-content-md-center">
          <Col>
            <Greeter name='EthQuad'/>
            { token ? (
                <Row className="justify-content-md-center">
                  <Col xs={12} md={12}>
                    <Alert variant="info">
                      Token: {token}
                    </Alert>
                  </Col>
                </Row>
              ) : null
            }
            {
              isLoading ? (
                <Spinner animation="border" variant="primary" />
              ) : null
            }
          </Col>
        </Row>
        <Row className="justify-content-md-center">
          <Col xs={12} md={12}>
            { info ? (
                <System.FilecoinBalancesList
                  data={info.balancesList}
                />
              ) : null
            }
            <System.CreateFilecoinAddress
              onSubmit={this.handleCreateAddress}
            />
          </Col>
        </Row>
      </Container>
    );
  }
}

export default App;
