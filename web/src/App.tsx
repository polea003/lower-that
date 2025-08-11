import { useEffect, useRef, useState } from 'react'
import { 
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import StopCircleIcon from '@mui/icons-material/StopCircle'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { useColorScheme } from '@mui/material/styles';
import { analyzeImage, type AnalyzeResponse } from './api/client'

const WIDTH = 512
const HEIGHT = 288
const INTERVAL_MS = 5000

type LogEntry = {
  timestamp: string
  result: AnalyzeResponse
}

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [running, setRunning] = useState(false)
  const [contentDescription, setContentDescription] = useState(
    'sporting event or related broadcast pieces like interviews and analysis'
  )
  const [lastImageUrl, setLastImageUrl] = useState<string | null>(null)
  const [log, setLog] = useState<LogEntry[]>([])
  const [showLastCapture, setShowLastCapture] = useState(false)

  useEffect(() => {
    let stream: MediaStream | null = null
    let cancelled = false

    const init = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: WIDTH, height: HEIGHT },
          audio: false,
        })
        if (cancelled) return
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
      } catch (e) {
        console.error('Webcam init failed', e)
      }
    }
    init()

    return () => {
      cancelled = true
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  useEffect(() => {
    const tick = async () => {
      if (!running) return
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      canvas.width = WIDTH
      canvas.height = HEIGHT
      ctx.drawImage(video, 0, 0, WIDTH, HEIGHT)
      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/jpeg', 1.0)
      )
      if (!blob) return
      const dataUrl = await blobToDataUrl(blob)
      setLastImageUrl(dataUrl)

      try {
        const result = await analyzeImage(blob, { contentDescription })
        setLog((prev) => [
          { timestamp: new Date().toISOString(), result },
          ...prev,
        ].slice(0, 50))
      } catch (e) {
        setLog((prev) => [
          { timestamp: new Date().toISOString(), result: { tv_content_description: 'Error', should_mute_tv: false } },
          ...prev,
        ].slice(0, 50))
      }
    }

    const id = setInterval(tick, INTERVAL_MS)
    return () => clearInterval(id)
  }, [running, contentDescription])

  const { mode, setMode } = useColorScheme();
  if (!mode) {
    return null;
  }

  return (
    <Container maxWidth="lg" className="p-4">
      <Box className="mb-4" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">📺 Lower That</Typography>
        <IconButton
          aria-label="Toggle color mode"
          onClick={() => {
            mode === 'light' ? setMode('dark') : setMode('light')
          }}
        >
          {mode === 'dark' ? <DarkModeIcon /> : <LightModeIcon />}
        </IconButton>
      </Box>
      <Typography variant="body1" color="text.secondary" className="mb-4">
        Analyze webcam snapshots to detect on-screen content and automatically suggest muting your Samsung TV.
      </Typography>
      <div className="grid gap-4 md:grid-cols-2">
        <Stack spacing={2}>
          <Card>
            <CardHeader
              title="Webcam"
              subheader="Describe the content to watch for, then start capture (every 5s)."
            />
            <CardContent>
              <Box className="mb-2">
                <TextField
                  fullWidth
                  label="Preferred content description"
                  value={contentDescription}
                  onChange={(e) => setContentDescription(e.target.value)}
                  multiline
                  minRows={3}
                  helperText="What should the analyzer look for (e.g., sporting event, news ticker)?"
                />
              </Box>
              <Box className="mb-3">
                <Button
                  variant='contained'
                  color={running ? 'error' : 'primary'}
                  startIcon={running ? <StopCircleIcon /> : <CameraAltIcon />}
                  onClick={() => setRunning((r) => !r)}
                >
                  {running ? 'Stop' : 'Start'}
                </Button>
                <Typography variant="caption" color="text.secondary" className="ml-2">
                  Captures a frame every 5 seconds and sends it to the server for analysis.
                </Typography>
              </Box>
              <video ref={videoRef} className="w-full rounded" muted playsInline />
              <canvas ref={canvasRef} className="hidden" />
              <Box className="mt-3">
                <Button
                  variant="text"
                  onClick={() => setShowLastCapture((s) => !s)}
                >
                  {showLastCapture ? 'Hide last capture' : 'View last capture'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          {showLastCapture && (
            <Card>
              <CardHeader
                title="Last Capture"
                subheader="The most recent frame sent to the analyzer."
              />
              <CardContent>
                {lastImageUrl ? (
                  <img src={lastImageUrl} alt="Last capture" className="w-full rounded" />
                ) : (
                  <Typography variant="body2" color="text.secondary">No capture yet.</Typography>
                )}
              </CardContent>
            </Card>
          )}
        </Stack>

        <Paper className="p-3 h-full max-h-[70vh] overflow-y-auto">
          <Typography variant="h6" className="mb-2">Results Log</Typography>
          <Typography variant="body2" color="text.secondary" className="mb-2">
            Shows each analysis with a short description and whether the TV should be muted.
          </Typography>
          <Stack spacing={1}>
            {log.length === 0 && (
              <Typography variant="body2" color="text.secondary">No results yet.</Typography>
            )}
            {log.map((entry, idx) => (
              <Box key={idx} className="border rounded p-2">
                <Typography variant="caption" color="text.secondary">{new Date(entry.timestamp).toLocaleTimeString()}</Typography>
                <Typography variant="body2" className="mt-1">{entry.result.tv_content_description}</Typography>
                <Typography variant="body2" color={entry.result.should_mute_tv ? 'error' : 'success.main'}>
                  should_mute_tv: {String(entry.result.should_mute_tv)}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Paper>
      </div>
    </Container>
  )
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export default App
