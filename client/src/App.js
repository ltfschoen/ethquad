import React, { Component } from 'react';
import * as System from 'slate-react-system';
import { createPow } from "@textile/powergate-client";
import { Alert, Button, Container, Col, Row, Spinner } from "react-bootstrap";
import { toHexString } from './helpers';
import { Greeter } from './components/Greeter';
import './App.css';

class App extends Component {
  PowerGate = null;

  state = {
    hostnameAPIEthQuad: 'https://ethquad.herokuapp.com/',
    info: null,
    isLoading: false,
    // State keys to store in localStorage
    stateKeysForLocalStorage: ['token'],
    token: null,
    websiteIPFSHash: ''
  };

  componentDidMount = async () => {
    console.log('componentDidMount');
    this.setState({ isLoading: true }, 
      async () => {
        await this.hydrateStateWithLocalStorage();
        await this.handleCreateToken();
      })

    await this.getWebsiteIPFSHash();

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

  getWebsiteIPFSHash = async () => {
    const { hostnameAPIEthQuad } = this.state;
    console.log('getWebsiteIPFSHash');

    // Request from EthQuad API hosted on Heroku in production
    let hostname = process.env.NODE_ENV === 'production'
      ? hostnameAPIEthQuad
      : window.location.href;
    const url = new URL(`${hostname}api/getWebsiteIPFSHash`);

    this.setState({ isLoading: true });
    const response = await fetch(url, {
      method: 'GET',
    });
    this.setState({ isLoading: false });
    if (response.status !== 200) {
      this.setState({
        websiteIPFSHash: response.statusText,
      });
      return;
    };
    const json = await response.json();
    console.log('Response from handling request for Website IPFS Hash in json: ', json);
    this.setState({
      websiteIPFSHash: json.websiteIPFSHash,
    });
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

  // Store Website IPFS Hash on Filecoin
  // Reference: https://github.com/filecoin-project/slate/blob/main/pages/experiences/make-storage-deal.js
  handleCreateFilecoinStorageDeal = async () => {
    const { websiteIPFSHash } = this.state;
    console.log('handleCreateFilecoinStorageDeal');
    // FIXME - how to check if any cid's exist in FFS without having to use a
    // try/catch block so it doesn't crash with error
    // `Uncaught (in promise) Error: stored item not found` if no items exist?
    let showAll;
    try {
      // List cid infos for all data stored in the current FFS instance
      showAll = await this.PowerGate.ffs.showAll();
      console.log('Show all cid info');
      console.log('showAll: ', showAll);
    } catch (error) {
      // Store item may not have been found
      console.error('showAll error: ', error);
      console.log('Show all cid info failed store item not found');
    }

    // FIXME - how to check if a specific cid exists in FFS without having to use a
    // try/catch block so it doesn't crash with error if we try to remove it 
    // `Uncaught (in promise) Error: stored item not found` but when it doesn't exist?
    // Note that if we try using `ffs.get(cid)` and it doesn't exist then it also
    // crashes with that same error, so we need to use a try/catch block with that too.
    try {
      // Remove existing cid (if any) for the Website IPFS Hash from FFS storage
      const removed = await this.PowerGate.ffs.remove(websiteIPFSHash);
      console.log('removed', removed);
    } catch (error) {
      // Store item may not have been found
      console.error('remove error: ', error);
      console.log('Remove cid failed since it does not exist');
    }

    try {
      // Cache data in IPFS in preparation for storing data in FFS by calling pushConfig
      // e.g. cid: QmQbdEo1K15gHCrPz4jcLuL7hDLy5mJeFKE6mmKXXeUth4
      const { cid } = await this.PowerGate.ffs.addToHot(websiteIPFSHash);
      console.log('Cached cid data in IPFS in preparation for storing data in FFS');
      console.log('cid: ', cid);

      // FIXME - how to use FFS to check if a cid already exists before running
      // `ffs.pushConfig(cid)` without it crashing when we call `ffs.get(cid)`
      // but it doesn't exist (e.g. why not add a new FFS function `isCid`?)
      // It appears to be necessary to do this, otherwise if you try to call
      // `ffs.pushConfig(cid)` when the cid already exists, it crashes with
      // error `cid may have already been pinned, consider using override flag`
      // but where do we find out how to use the override flag?

      // Push a storage config for the specified cid
      const { jobId } = await this.PowerGate.ffs.pushConfig(cid);
      console.log('Pushing cached cid data from IPFS to FFS');
      console.log('jobId: ', jobId);

      const cancel = this.PowerGate.ffs.watchJobs((job) => {
        console.log('Job update: ', job);

        // FIXME - Save cid to state when get confirmation it is stored in FFS.
        // Buth how do we detect when it's been successfully stored to FFS Storage?

        // this.setState({
        //   cid,
        //   cidDataHexStr
        // });
      }, jobId);
      console.log('cancel: ', cancel);

      // FIXME - cidData (e.g. `42650d43746dd706dd531ca7bc36dacb0c4c0cc7ab6d69d9019299aa71c1f70156d7`)
      // does not match the cid value (e.g. the Website IPFS Address of
      // `QmUNQ3Rt1wbdUxynvDbaywxMDMerbWnZAZKZqnHB9wFW15`)

      // Show the data stored for the current cid
      const cidData = await this.PowerGate.ffs.get(cid);
      const cidDataHexStr = toHexString(cidData);
      console.log('Retrieved cached cid data from IPFS');
      console.log('cidData: ', cidDataHexStr);
    } catch (error) {
      console.error('error: ', error);
    }

    // FIXME - showAll is empty array even though cid has been created in cache using addToHot 
    try {
      // List cid infos for all data stored in the current FFS instance
      showAll = await this.PowerGate.ffs.showAll();
      console.log('Show all cid info');
      console.log('showAll: ', showAll);
    } catch (error) {
      // Store item may not have been found
      console.error('showAll error: ', error);
      console.log('Show all cid info failed store item not found');
    }
  }

  render() {
    const { info, isLoading, token, websiteIPFSHash } = this.state;
    return (
      <Container fluid className="App">
        <Row className="justify-content-md-center">
          <Col>
            <Greeter name='EthQuad'/>
            { websiteIPFSHash ? (
                <Alert variant="info">
                  Website IPFS Hash: { websiteIPFSHash }
                </Alert>
              ) : null
            }
            { token ? (
                <Row className="justify-content-md-center">
                  <Col xs={12} md={12}>
                    <Alert variant="info">
                      Token: { token }
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
        { websiteIPFSHash ? (
            <Row className="justify-content-md-center">
              <Col xs={12} md={12}>
                <Button
                  size='lg'
                  style={{backgroundColor: '#2935ff', fontSize: '0.75rem'}}
                  onClick={this.handleCreateFilecoinStorageDeal}
                >
                  Save Website IPFS Hash to Filecoin Storage
                </Button>
              </Col>
            </Row>
          ) : null
        }
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
