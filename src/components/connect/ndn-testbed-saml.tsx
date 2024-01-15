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

  export default function NdnTestbedSaml(props: {
    onAdd: (config: Conn) => void
  })
  {
    const [authWaiting, setAuthWaiting] = createSignal<boolean>(false);

    const basePath = location.origin  // === `${location.protocol}//${location.host}`
    const redirectTarget = `${basePath}/oidc-redirected.html`

    const onClickAuth0 = () => {
        const queryStr = new URLSearchParams({
            redirect_uri: redirectTarget
          }).toString()
        const url = 'http://localhost:1337/login?' + queryStr
        window.open(url)  // TODO: not working on Safari
        setAuthWaiting(true);
    }


    const checkSamlStatus = () => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "http://localhost:1337/whoami", true);
        xhr.withCredentials = true;
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                console.log(JSON.parse(xhr.responseText).user);
                alert(JSON.stringify(JSON.parse(xhr.responseText).user));
                setAuthWaiting(false);
            } else {
                console.log("Error");
            }
        };
        
        xhr.onerror = function () {
            console.log("Error");
        };
        
        xhr.send();    
    }

    setInterval(() => {if (authWaiting()) checkSamlStatus();}, 1000);

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