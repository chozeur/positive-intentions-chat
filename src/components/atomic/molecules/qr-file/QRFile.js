import React, { useEffect, useState, useCallback, useMemo } from 'react';


import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import QRReader from "react-qr-scanner";
import Button from "@mui/material/Button";
import { makeStyles } from "@mui/styles";
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

const useStyles = makeStyles((theme) => ({
    qrcodeReader: {
      // height: '100vh',
      width: "100%",
      // top: 0,
      // left: 0,
      // position: 'absolute',
      zIndex: 10000,
    },
  }));

  function valuetext(value) {
    return `${value}°C`;
  }

const QRFile = () => {
    const { t } = useTranslation();

  const classes = useStyles();
    const [text, setText] = useState("");
    const [contactNamePreset, setContactNamePreset] = useState("");
    const storedConnectionId = useState("");
    const [scanning, setScanning] = useState(false);
    const [fileParts, setFileParts] = useState([]);
    const [selectedPart, setSelectedPart] = useState(0);
    const [partDensity, setPartDensity] = useState(100);
    const [isPlaying, setIsPlaying] = useState(false);
    const [timeoutInterval, setTimeoutInterval] = useState();

    const handleCopyConnectionIdToClipboard = () => {
        navigator.clipboard.writeText(
          `${window.location.origin}/#/login/${storedConnectionId}${contactNamePreset ? `/${contactNamePreset}` : ""}`,
        );
      };



  const handleScan = useMemo(() => (data) => {
    console.log('>>', !data?.text)
    if (!data?.text) return;
    console.log(data.text)
    setText(data.text);
  }, [text]);

  const handleError = (err) => {
    console.error(err);
  };



  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      // create base64 string

      const base64 = btoa(unescape(encodeURIComponent(e.target.result)));

      // create me the base64 string with like "data:image/png;base64,"
      // git generic for different filetypes automatically

      // const base64String = `data:image/png;base64,${base64}`;
      const base64String = `data:application/octet-stream;base64,${base64}`;


      const base64BackToString = atob(base64);
      setText(JSON.stringify({
        name: file.name,
        data: base64,
      }));

      // split base64 string into parts pf 100 characters
      const partSize = partDensity;
      const parts = [];
      for (let i = 0; i < base64.length; i += partSize) {
        parts.push(base64.substr(i, partSize));
      }
      setFileParts(parts);
    };
    reader.readAsText(file);
  }

  const handleDownloadFile = () => {
    const file = JSON.parse(text);
    const blob = new Blob([file.data], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
  }

  const recalculateFileParts = (newPartDensity) => {
    const partSize = newPartDensity;
    const parts = [];
    for (let i = 0; i < text.length; i += partSize) {
      parts.push(text.substr(i, partSize));
    }
    setFileParts(parts);
    setSelectedPart(0);
  }

  useEffect(() => {
    setTimeout(() => {
      if (isPlaying) {
        setSelectedPart(selectedPart + 1);
      }
    }, 1000);
  }, [isPlaying, selectedPart]);

  return (
    <div>
      <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              id="connectionId"
              label={t("components.connectToPeer.shareToConnect")}
              name="connectionId"
              value={text}
              onChange={(e) => setText(e.target.value || "")}
              autoComplete="off"
              InputProps={{

                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleCopyConnectionIdToClipboard}
                      edge="end"
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              id='load-file-button'
              variant="contained"
              component="label"
              fullWidth
            >
              Select File
              <input
                type="file"
                hidden
                onChange={handleFileSelect}
              />
            </Button>
            <Button
              id='load-file-button'
              variant="contained"
              component="label"
              fullWidth
              onClick={handleDownloadFile}
            >
              Download File
            </Button>
            
            <br />
            <br />
            <Typography gutterBottom>QR Density</Typography>
<Slider
        aria-label="part density"
        defaultValue={0}
        getAriaValueText={valuetext}
        step={1}
        marks
        min={0}
        max={100}
        value={partDensity}
        valueLabelDisplay="auto"
        onChange={(e, value) => setPartDensity(value) && recalculateFileParts(value)}
      />

{!scanning && (
                <div style={{ background: 'white', padding: 20 }}>
                    <QRCode
                      size={256}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      value={fileParts?.[selectedPart] || ""}
                      viewBox={`0 0 256 256`}
                    />
                    </div>
            )}


            {scanning && (
              <QRReader
                id={`qrcode-reader-${text}`}
                key={`qrcode-reader-${text}`}
                className={classes.qrcodeReader}
                onError={handleError}
                onScan={(data) => {
                  console.log(data)
                  data && setText(data.text);

                  // decode
                  try {

                    console.log(decodeURIComponent(escape(window.atob(data?.text))));
                  } catch (e) {
                    console.error(e);
                  }
                }}
                constraints={{
                  video: {
                    facingMode: "environment",
                  },
                }}
              />
            )}

<Button
              type="button"
              fullWidth
              variant="contained"
              onClick={() => setScanning(!scanning)}
              color={scanning ? "error" : "primary"}
            >
              {scanning
                ? t("components.connectToPeer.stopScanning")
                : t("components.connectToPeer.scanQr")}
            </Button>
            <br />
<br />
<Typography gutterBottom>Seek File Part</Typography>
<Slider
        aria-label="select part"
        defaultValue={0}
        getAriaValueText={valuetext}
        step={1}
        marks
        min={0}
        max={fileParts.length - 1}
        value={selectedPart}
        valueLabelDisplay="auto"
        onChange={(e, value) => setSelectedPart(value)}
      />

            <IconButton aria-label="delete" size="small" onClick={
              () => setSelectedPart(selectedPart - 1)
            
            }>
              <SkipPreviousIcon fontSize="inherit" />
            </IconButton>
            <IconButton
            aria-label="delete"
            size="large"
            // primary
            color="primary"
            onClick={() => setIsPlaying(!isPlaying)}
            >
              <PlayArrowIcon fontSize="inherit" />
            </IconButton>
            <IconButton aria-label="delete" size="small" onClick={
              () => setSelectedPart(selectedPart + 1)
            }>
              <SkipNextIcon fontSize="inherit" />
            </IconButton>
    </div>
  );
}

export default QRFile;