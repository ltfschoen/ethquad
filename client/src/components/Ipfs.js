import React from 'react';
import { Alert, Container, Col, Row, Spinner } from "react-bootstrap";
import useIpfsFactory from '../hooks/useIpfsFactory';
import useIpfs from '../hooks/useIpfs';

// https://github.com/ipfs/js-ipfs/tree/master/examples/browser-create-react-app
const Ipfs = (props) => {
  const { cid } = props;
  console.log('Ipfs props: ', props);
  const { ipfs, ipfsInitError } = useIpfsFactory({ commands: ['id'] });
  console.log('ipfs: ', ipfs);
  const id = useIpfs(ipfs, 'id');
  // // https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#ipfslsipfspath
  const files = useIpfs(ipfs, 'ls', cid);
  console.log('files: ', JSON.stringify(files));

  // for await (const file of files) {
  //   console.log(file.path);
  // }

  return (
    <Container fluid>
      <Row className="justify-content-md-center">
        <Col>
          {ipfsInitError && (
            <div className='bg-yellow pa4 mw7 center mv4 white'>
              Error: {ipfsInitError.message || ipfsInitError}
            </div>
          )}
          {id && <IpfsId {...id} />}
        </Col>
      </Row>
    </Container>
  );
}

const IpfsId = (props) => {
  if (!props) return null
  return (
    <section>
      <h2>Connected to IPFS</h2><br />
      {/* <p className="media-body-description"></p> */}
      <div className='pa4'>
        {['id', 'agentVersion'].map((key) => (
          <div className='mb4' key={key}>
            <Alert variant="info">
              { key }: { props[key] }
            </Alert>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Ipfs;
