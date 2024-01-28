import {
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Divider,
    Button,
    Stack,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    LinearProgress
  } from "@suid/material"
  import { Config as Conn } from '../../backend/models/connections'
  import { createSignal, createUniqueId, onCleanup } from "solid-js"
  import { SamlLoginDestination } from "../../constants"

  export default function NdnTestbedSaml(props: {
    onAdd: (config: Conn) => void
  })
  {
    const [authWaiting, setAuthWaiting] = createSignal<boolean>(false);

    const basePath = location.origin  // === `${location.protocol}//${location.host}`
    const redirectTarget = `${basePath}/oidc-redirected.html`
    const channel = new BroadcastChannel('saml-response')

    channel.addEventListener("message", (event) => {
      if (authWaiting()) {
        setAuthWaiting(false);
        const data = event.data;
        const key = "SAMLResponse="
        var startIndex = data.indexOf(key);
        if (startIndex == -1) {
          alert('SAML assertion not found');
          return;
        }
        startIndex += key.length;
        var endIndex = data.indexOf('&', startIndex);
        if (endIndex == -1) endIndex = data.length;
        const samlResponse = data.substring(startIndex, endIndex);
        console.log(`start index: ${startIndex}, end index: ${endIndex}`);
        alert(`SAML response: ${samlResponse}`);
        console.log(`SAML response: ${samlResponse}`);
      }
    })

    const onClickAuth0 = () => {
        const queryStr = new URLSearchParams({
            SAMLRequest: btoa('<?xml version="1.0"?><samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" ID="' + Math.random().toString(36).substr(2) + '" Version="2.0" IssueInstant="' + new Date().toISOString() + '" ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Destination="' + SamlLoginDestination + '" AssertionConsumerServiceURL="' + basePath + '/saml-callback"><saml:Issuer xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">' + basePath + '</saml:Issuer><samlp:NameIDPolicy xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress" AllowCreate="true"/><samlp:RequestedAuthnContext xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" Comparison="exact"><saml:AuthnContextClassRef xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport</saml:AuthnContextClassRef></samlp:RequestedAuthnContext></samlp:AuthnRequest>'),
          }).toString()
        const url =  SamlLoginDestination + '?' + queryStr
        window.open(url)  // TODO: not working on Safari
        setAuthWaiting(true);
    }

    return <>
    <Dialog
        open={authWaiting()}
        onClose={() => {setAuthWaiting(false)}}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Waiting for SAML authentication"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <LinearProgress />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {setAuthWaiting(false)}}>Cancel</Button>
        </DialogActions>
      </Dialog>
    <Card>
    <CardHeader
      sx={{ textAlign: 'left' }}
      title="NDN Testbed with SAML"
      subheader="Service Provider will return authorization details to testbed"
    />
    <Divider />
    <CardContent>
      <Stack direction="column" spacing={2}>
        <Button onClick={onClickAuth0} variant="outlined" color="secondary" disabled={false}>
          Auth0
        </Button>
      </Stack>
    </CardContent>
    <Divider />
    <CardActions sx={{ justifyContent: 'flex-end' }}>
      <Button
        variant="text"
        color="primary"
        disabled
      >
        AUTO SAVE WHEN DONE
      </Button>
    </CardActions>
  </Card>
    </>
  }